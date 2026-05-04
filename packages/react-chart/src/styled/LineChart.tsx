import React, { forwardRef, useMemo, useRef, useState } from "react";
import {
  pointsToSmoothPath,
  scaleLinear,
  resolveColor,
  isSeriesData,
  resolveDomain,
  getPalette,
  DEFAULT_PALETTE,
} from "../chartUtils";
import type {
  DataPoint,
  SeriesDataPoint,
  ChartDomain,
  ColorScheme,
} from "../chartUtils";
import {
  useResponsiveSize,
  isDataEmpty,
  type CommonChartProps,
  type TooltipPayload,
} from "./chartShared";

export type LineChartTone = "neutral" | "primary";
export type LineChartVariant = "default" | "sparkline";

export interface LineChartProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onClick">,
    CommonChartProps {
  data: DataPoint[] | SeriesDataPoint[];
  width?: number;
  height?: number;
  showGrid?: boolean;
  showDots?: boolean;
  showLabels?: boolean;
  showLegend?: boolean;
  smooth?: boolean;
  tone?: LineChartTone;
  animated?: boolean;
  colors?: string[];
  colorScheme?: ColorScheme;
  area?: boolean;
  onClick?: (point: DataPoint, index: number) => void;
  xLabel?: string;
  yLabel?: string;
  tooltip?: boolean;
  variant?: LineChartVariant;
  domain?: ChartDomain;
  yTicks?: number | number[];
  xTicks?: number | string[];
}

const BASE_PADDING = 48;
const SPARKLINE_PADDING = 4;
const DEFAULT_GRID_LINES = 5;

function buildAreaPath(linePath: string, points: Array<{ x: number; y: number }>, plotBottom: number): string {
  if (points.length < 2) return "";
  const lastPt = points[points.length - 1]!;
  const firstPt = points[0]!;
  return `${linePath} L ${lastPt.x} ${plotBottom} L ${firstPt.x} ${plotBottom} Z`;
}

function buildSeriesLines(
  seriesData: SeriesDataPoint[],
  width: number,
  height: number,
  padding: number,
  smooth: boolean,
  minVal: number,
  maxVal: number,
  palette: string[],
  colors?: string[],
): Array<{ path: string; color: string; name: string; points: Array<{ x: number; y: number }> }> {
  const plotW = width - padding * 2;
  const plotH = height - padding * 2;
  const labelCount = seriesData.length;

  const seriesNames: string[] = [];
  seriesData.forEach((d) => {
    d.series.forEach((s) => {
      if (!seriesNames.includes(s.name)) seriesNames.push(s.name);
    });
  });

  return seriesNames.map((name, si) => {
    const points = seriesData.map((d, i) => {
      const entry = d.series.find((s) => s.name === name);
      const val = entry ? (entry.values[0] ?? 0) : 0;
      return {
        x: padding + (labelCount === 1 ? plotW / 2 : (i / (labelCount - 1)) * plotW),
        y: padding + scaleLinear(val, minVal, maxVal, plotH, 0),
      };
    });
    const seriesColor = seriesData[0]?.series.find((s) => s.name === name)?.color;
    const resolvedColor =
      (colors && colors.length > 0 ? colors[si % colors.length] : undefined) ??
      seriesColor ??
      palette[si % palette.length] ??
      DEFAULT_PALETTE[si % DEFAULT_PALETTE.length] ??
      "#6366f1";
    const pathStr = smooth ? pointsToSmoothPath(points) : pointsToLinePath(points);
    return { path: pathStr, color: resolvedColor, name, points };
  });
}

function pointsToLinePath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return "";
  return "M " + points.map((p) => `${p.x} ${p.y}`).join(" L ");
}

export const LineChart = forwardRef<HTMLDivElement, LineChartProps>(
  function LineChart(
    {
      data,
      width: widthProp = 600,
      height: heightProp = 300,
      showGrid: showGridProp,
      showDots: showDotsProp,
      showLabels: showLabelsProp,
      showLegend: showLegendProp,
      smooth = false,
      tone = "neutral",
      animated = false,
      colors,
      colorScheme = "default",
      area = false,
      onClick,
      xLabel,
      yLabel,
      tooltip: tooltipProp,
      variant = "default",
      domain,
      yTicks,
      xTicks,
      formatValue,
      formatLabel,
      renderTooltip,
      responsive = false,
      aspectRatio,
      minWidth = 200,
      minHeight = 100,
      loading = false,
      emptyText,
      errorText,
      error = false,
      className,
      style,
      ...rest
    },
    ref,
  ) {
    const isSparkline = variant === "sparkline";
    const showGrid = showGridProp ?? (isSparkline ? false : false);
    const showDots = showDotsProp ?? !isSparkline;
    const showLabels = showLabelsProp ?? !isSparkline;
    const showLegend = showLegendProp ?? !isSparkline;
    const tooltip = tooltipProp ?? !isSparkline;
    const padding = isSparkline ? SPARKLINE_PADDING : BASE_PADDING;

    const isSeries = isSeriesData(data);
    const palette = useMemo(() => getPalette(colorScheme), [colorScheme]);
    const localRef = useRef<HTMLDivElement | null>(null);
    const setRefs = (el: HTMLDivElement | null) => {
      localRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
    };

    const { width, height } = useResponsiveSize(
      localRef,
      responsive,
      widthProp,
      heightProp,
      aspectRatio,
      minWidth,
      minHeight,
    );

    const [tooltipState, setTooltipState] = useState<TooltipPayload & { x: number; y: number } | null>(null);

    const empty = isDataEmpty(data as unknown[]);

    const { lines, gridValues, gridTicks, labels, dataMin, dataMax } = useMemo(() => {
      const plotH = height - padding * 2;
      const plotW = width - padding * 2;

      if (isSeries) {
        const sd = data as SeriesDataPoint[];
        const allValues = sd.flatMap((d) => d.series.flatMap((s) => s.values));
        const dMin = allValues.length > 0 ? Math.min(...allValues) : 0;
        const dMax = allValues.length > 0 ? Math.max(...allValues) : 0;
        const resolved = resolveDomain(dMin, dMax, domain);

        const computedTicks = Array.isArray(yTicks)
          ? yTicks
          : resolved.ticks ??
            Array.from({ length: (typeof yTicks === "number" ? yTicks : DEFAULT_GRID_LINES) + 1 }, (_, i) =>
              scaleLinear(
                i / (typeof yTicks === "number" ? yTicks : DEFAULT_GRID_LINES),
                0,
                1,
                resolved.min,
                resolved.max,
              ),
            );

        return {
          lines: buildSeriesLines(sd, width, height, padding, smooth, resolved.min, resolved.max, palette, colors),
          gridValues: computedTicks,
          gridTicks: computedTicks.length - 1,
          labels: sd.map((d) => d.label),
          dataMin: resolved.min,
          dataMax: resolved.max,
        };
      }

      const fd = data as DataPoint[];
      const values = fd.map((d) => d.value);
      const dMin = fd.length > 0 ? Math.min(...values) : 0;
      const dMax = fd.length > 0 ? Math.max(...values) : 0;
      const resolved = resolveDomain(dMin, dMax, domain);

      const pts = fd.map((d, i) => ({
        x: padding + (fd.length === 1 ? plotW / 2 : (i / (fd.length - 1)) * plotW),
        y: padding + scaleLinear(d.value, resolved.min, resolved.max, plotH, 0),
      }));
      const pathStr = smooth ? pointsToSmoothPath(pts) : pointsToLinePath(pts);
      const resolvedColor =
        colors && colors.length > 0
          ? (colors[0] ?? (tone === "primary" ? "var(--rchart-primary)" : "var(--rchart-neutral)"))
          : tone === "primary"
            ? "var(--rchart-primary)"
            : "var(--rchart-neutral)";

      const computedTicks = Array.isArray(yTicks)
        ? yTicks
        : resolved.ticks ??
          Array.from({ length: (typeof yTicks === "number" ? yTicks : DEFAULT_GRID_LINES) + 1 }, (_, i) =>
            scaleLinear(
              i / (typeof yTicks === "number" ? yTicks : DEFAULT_GRID_LINES),
              0,
              1,
              resolved.min,
              resolved.max,
            ),
          );

      return {
        lines: [{ path: pathStr, color: resolvedColor, name: "", points: pts }],
        gridValues: computedTicks,
        gridTicks: computedTicks.length - 1,
        labels: fd.map((d) => d.label),
        dataMin: resolved.min,
        dataMax: resolved.max,
      };
    }, [data, width, height, smooth, tone, isSeries, colors, domain, yTicks, palette, padding]);

    const plotH = height - padding * 2;
    const plotW = width - padding * 2;

    const xTickLabels = useMemo<string[]>(() => {
      if (Array.isArray(xTicks)) return xTicks;
      return labels;
    }, [xTicks, labels]);

    const rootClass = [
      "rchart-root",
      animated ? "rchart-animated" : "",
      className ?? "",
    ]
      .filter(Boolean)
      .join(" ");

    if (loading || error || empty) {
      return (
        <div
          ref={setRefs}
          className={rootClass}
          style={style}
          data-variant={variant}
          {...rest}
        >
          {loading ? (
            <div className="rchart-skeleton" aria-busy="true" aria-label="Loading chart" />
          ) : error ? (
            <div className="rchart-error" role="alert">
              {errorText ?? "Failed to load chart"}
            </div>
          ) : (
            <div className="rchart-empty" aria-label="No chart data">
              {emptyText ?? "No data"}
            </div>
          )}
        </div>
      );
    }

    return (
      <div ref={setRefs} className={rootClass} style={style} data-variant={variant} {...rest}>
        <svg
          className="rchart-svg"
          viewBox={`0 0 ${width} ${height}`}
          aria-label="Line chart"
          role="img"
          {...(responsive ? { preserveAspectRatio: "xMidYMid meet" } : {})}
        >
          {showGrid &&
            Array.from({ length: gridTicks + 1 }, (_, i) => {
              const y = padding + (i / gridTicks) * plotH;
              return (
                <line
                  key={i}
                  className="rchart-grid-line"
                  x1={padding}
                  y1={y}
                  x2={padding + plotW}
                  y2={y}
                />
              );
            })}

          {showGrid &&
            xTickLabels.map((_, i) => {
              const x =
                padding +
                (xTickLabels.length === 1 ? plotW / 2 : (i / (xTickLabels.length - 1)) * plotW);
              return (
                <line
                  key={i}
                  className="rchart-grid-line"
                  x1={x}
                  y1={padding}
                  x2={x}
                  y2={padding + plotH}
                />
              );
            })}

          {area &&
            lines.map((line, li) => {
              if (!line.path || line.points.length < 2) return null;
              const areaPath = buildAreaPath(line.path, line.points, padding + plotH);
              return (
                <path
                  key={`area-${li}`}
                  className="rchart-line-area"
                  d={areaPath}
                  fill={line.color}
                  fillOpacity={0.12}
                  stroke="none"
                />
              );
            })}

          {lines.map((line, li) =>
            line.path ? (
              <path
                key={li}
                className="rchart-line"
                d={line.path}
                stroke={line.color}
                pathLength={animated ? 1 : undefined}
                style={animated ? { animationDelay: `${li * 0.1}s` } : undefined}
              />
            ) : null,
          )}

          {showDots && !isSeries &&
            (data as DataPoint[]).map((dp, i) => {
              const fd = data as DataPoint[];
              const x =
                padding + (fd.length === 1 ? plotW / 2 : (i / (fd.length - 1)) * plotW);
              const y = padding + scaleLinear(dp.value, dataMin, dataMax, plotH, 0);
              const dotColor =
                colors && colors.length > 0
                  ? (colors[0] ?? resolveColor(dp.color, i, palette))
                  : resolveColor(dp.color, i, palette);
              return (
                <circle
                  key={i}
                  className="rchart-dot"
                  cx={x}
                  cy={y}
                  r={4}
                  fill={dotColor}
                  style={{
                    ...(animated ? { animationDelay: `${0.6 + i * 0.05}s`, opacity: 0 } : {}),
                    cursor: onClick ? "pointer" : undefined,
                  }}
                  onClick={onClick ? () => onClick(dp, i) : undefined}
                  onMouseEnter={
                    tooltip
                      ? (e) => {
                          const rootEl = e.currentTarget.closest(".rchart-root") as HTMLElement | null;
                          if (!rootEl) return;
                          const rootRect = rootEl.getBoundingClientRect();
                          const elRect = e.currentTarget.getBoundingClientRect();
                          setTooltipState({
                            x: elRect.left - rootRect.left + elRect.width / 2,
                            y: elRect.top - rootRect.top,
                            label: dp.label,
                            value: dp.value,
                            color: dotColor,
                            point: dp,
                            index: i,
                          });
                        }
                      : undefined
                  }
                  onMouseLeave={tooltip ? () => setTooltipState(null) : undefined}
                />
              );
            })}

          {showDots && isSeries &&
            (data as SeriesDataPoint[]).flatMap((d, di) =>
              d.series.map((s, si) => {
                const sd = data as SeriesDataPoint[];
                const allValues = sd.flatMap((x) => x.series.flatMap((ss) => ss.values));
                const minVal = Math.min(...allValues);
                const maxVal = Math.max(...allValues);
                const labelCount = sd.length;
                const x =
                  padding +
                  (labelCount === 1 ? plotW / 2 : (di / (labelCount - 1)) * plotW);
                const val = s.values[0] ?? 0;
                const y = padding + scaleLinear(val, minVal, maxVal, plotH, 0);
                const color =
                  colors && colors.length > 0
                    ? (colors[si % colors.length] ?? resolveColor(s.color, si, palette))
                    : resolveColor(s.color, si, palette);
                const dp: DataPoint = { label: d.label, value: val, color: s.color };
                return (
                  <circle
                    key={`${di}-${si}`}
                    className="rchart-dot"
                    cx={x}
                    cy={y}
                    r={4}
                    fill={color}
                    style={{ cursor: onClick ? "pointer" : undefined }}
                    onClick={onClick ? () => onClick(dp, di) : undefined}
                    onMouseEnter={
                      tooltip
                        ? (e) => {
                            const rootEl = e.currentTarget.closest(".rchart-root") as HTMLElement | null;
                            if (!rootEl) return;
                            const rootRect = rootEl.getBoundingClientRect();
                            const elRect = e.currentTarget.getBoundingClientRect();
                            setTooltipState({
                              x: elRect.left - rootRect.left + elRect.width / 2,
                              y: elRect.top - rootRect.top,
                              label: d.label,
                              value: val,
                              series: s.name,
                              color,
                              point: dp,
                              index: di,
                            });
                          }
                        : undefined
                    }
                    onMouseLeave={tooltip ? () => setTooltipState(null) : undefined}
                  />
                );
              }),
            )}

          {showLabels &&
            xTickLabels.map((label, i) => {
              const x =
                padding +
                (xTickLabels.length === 1 ? plotW / 2 : (i / (xTickLabels.length - 1)) * plotW);
              return (
                <text
                  key={i}
                  className="rchart-axis-label"
                  x={x}
                  y={padding + plotH + 18}
                  textAnchor="middle"
                >
                  {formatLabel ? formatLabel(label, i) : label}
                </text>
              );
            })}

          {showLabels &&
            gridValues.map((val, i) => {
              const y = padding + ((gridTicks - i) / gridTicks) * plotH;
              return (
                <text
                  key={i}
                  className="rchart-axis-label"
                  x={padding - 8}
                  y={y + 4}
                  textAnchor="end"
                >
                  {Number.isInteger(val) ? val : val.toFixed(1)}
                </text>
              );
            })}

          {xLabel && (
            <text
              x={width / 2}
              y={height - 4}
              textAnchor="middle"
              className="rchart-axis-label"
            >
              {xLabel}
            </text>
          )}

          {yLabel && (
            <text
              x={12}
              y={height / 2}
              textAnchor="middle"
              className="rchart-axis-label"
              transform={`rotate(-90,12,${height / 2})`}
            >
              {yLabel}
            </text>
          )}
        </svg>
        {tooltipState && (
          <div
            className="rchart-tooltip"
            style={{
              position: "absolute",
              left: tooltipState.x,
              top: tooltipState.y - 8,
              transform: "translate(-50%, -100%)",
              pointerEvents: "none",
            }}
          >
            {renderTooltip ? (
              renderTooltip({
                label: tooltipState.label,
                value: tooltipState.value,
                series: tooltipState.series,
                color: tooltipState.color,
                point: tooltipState.point,
                index: tooltipState.index,
              })
            ) : (
              <>
                <span className="rchart-tooltip-label">
                  {formatLabel
                    ? formatLabel(tooltipState.label, tooltipState.index)
                    : tooltipState.label}
                </span>
                <span className="rchart-tooltip-value">
                  {formatValue
                    ? formatValue(tooltipState.value, tooltipState.point, tooltipState.index)
                    : tooltipState.value}
                </span>
              </>
            )}
          </div>
        )}

        {showLegend && isSeries && (
          <ul className="rchart-legend" aria-label="Legend">
            {(data as SeriesDataPoint[])[0]?.series.map((s, i) => (
              <li key={i} className="rchart-legend-item">
                <span
                  className="rchart-legend-swatch"
                  style={{ background: resolveColor(s.color, i, palette) }}
                />
                {s.name}
              </li>
            ))}
          </ul>
        )}

        {showLegend && !isSeries && (
          <ul className="rchart-legend" aria-label="Legend">
            {(data as DataPoint[]).map((d, i) => (
              <li key={i} className="rchart-legend-item">
                <span
                  className="rchart-legend-swatch"
                  style={{ background: resolveColor(d.color, i, palette) }}
                />
                {d.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  },
);
