import React, { forwardRef, useMemo, useState } from "react";
import {
  computeLinePoints,
  pointsToPolyline,
  pointsToSmoothPath,
  scaleLinear,
  resolveColor,
  isSeriesData,
  DEFAULT_PALETTE,
} from "../chartUtils";
import type { DataPoint, SeriesDataPoint } from "../chartUtils";

export type LineChartTone = "neutral" | "primary";

export interface LineChartProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onClick"> {
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
  area?: boolean;
  onClick?: (point: DataPoint, index: number) => void;
  xLabel?: string;
  yLabel?: string;
  tooltip?: boolean;
}

const PADDING = 48;
const GRID_LINES = 5;

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
  smooth: boolean,
  colors?: string[],
): Array<{ path: string; color: string; name: string; points: Array<{ x: number; y: number }> }> {
  const allValues = seriesData.flatMap((d) => d.series.flatMap((s) => s.values));
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const plotW = width - PADDING * 2;
  const plotH = height - PADDING * 2;
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
        x: PADDING + (labelCount === 1 ? plotW / 2 : (i / (labelCount - 1)) * plotW),
        y: PADDING + scaleLinear(val, minVal, maxVal, plotH, 0),
      };
    });
    const resolvedColor =
      (colors && colors.length > 0 ? colors[si % colors.length] : undefined) ??
      seriesData[0]?.series.find((s) => s.name === name)?.color ??
      DEFAULT_PALETTE[si % DEFAULT_PALETTE.length] ??
      "#6366f1";
    const pathStr = smooth ? pointsToSmoothPath(points) : `M ${pointsToPolyline(points).replace(/ /g, " L ")}`;

    return { path: pathStr, color: resolvedColor, name, points };
  });
}

export const LineChart = forwardRef<HTMLDivElement, LineChartProps>(
  function LineChart(
    {
      data,
      width = 600,
      height = 300,
      showGrid = false,
      showDots = true,
      showLabels = false,
      showLegend = false,
      smooth = false,
      tone = "neutral",
      animated = false,
      colors,
      area = false,
      onClick,
      xLabel,
      yLabel,
      tooltip = true,
      className,
      style,
      ...rest
    },
    ref,
  ) {
    const isSeries = isSeriesData(data);

    const [tooltipState, setTooltipState] = useState<{
      x: number;
      y: number;
      label: string;
      value: number | string;
    } | null>(null);

    const { flatData, lines, gridValues, labels } = useMemo(() => {
      const plotH = height - PADDING * 2;
      const plotW = width - PADDING * 2;

      if (isSeries) {
        const sd = data as SeriesDataPoint[];
        const allValues = sd.flatMap((d) => d.series.flatMap((s) => s.values));
        const minVal = Math.min(...allValues);
        const maxVal = Math.max(...allValues);
        const gv = Array.from({ length: GRID_LINES + 1 }, (_, i) =>
          scaleLinear(i / GRID_LINES, 0, 1, minVal, maxVal),
        );
        const lbls = sd.map((d) => d.label);
        return {
          flatData: [] as DataPoint[],
          lines: buildSeriesLines(sd, width, height, smooth, colors),
          gridValues: gv,
          labels: lbls,
        };
      }

      const fd = data as DataPoint[];
      const values = fd.map((d) => d.value);
      const minVal = fd.length > 0 ? Math.min(...values) : 0;
      const maxVal = fd.length > 0 ? Math.max(...values) : 0;

      const pts = computeLinePoints(fd, width, height, PADDING);
      const pathStr = smooth
        ? pointsToSmoothPath(pts)
        : pts.length > 0
          ? "M " + pts.map((p) => `${p.x} ${p.y}`).join(" L ")
          : "";

      const resolvedColor =
        colors && colors.length > 0
          ? (colors[0] ?? (tone === "primary" ? "var(--rchart-primary)" : "var(--rchart-neutral)"))
          : tone === "primary"
            ? "var(--rchart-primary)"
            : "var(--rchart-neutral)";

      const gv = Array.from({ length: GRID_LINES + 1 }, (_, i) =>
        scaleLinear(i / GRID_LINES, 0, 1, minVal, maxVal),
      );

      return {
        flatData: fd,
        lines: [{ path: pathStr, color: resolvedColor, name: "", points: pts }],
        gridValues: gv,
        labels: fd.map((d) => d.label),
      };
    }, [data, width, height, smooth, tone, isSeries, colors]);

    const plotH = height - PADDING * 2;
    const plotW = width - PADDING * 2;

    const rootClass = [
      "rchart-root",
      animated ? "rchart-animated" : "",
      className ?? "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div ref={ref} className={rootClass} style={style} {...rest}>
        <svg
          className="rchart-svg"
          viewBox={`0 0 ${width} ${height}`}
          aria-label="Line chart"
          role="img"
        >
          {showGrid &&
            Array.from({ length: GRID_LINES + 1 }, (_, i) => {
              const y = PADDING + (i / GRID_LINES) * plotH;
              return (
                <line
                  key={i}
                  className="rchart-grid-line"
                  x1={PADDING}
                  y1={y}
                  x2={PADDING + plotW}
                  y2={y}
                />
              );
            })}

          {showGrid &&
            labels.map((_, i) => {
              const x =
                PADDING +
                (labels.length === 1 ? plotW / 2 : (i / (labels.length - 1)) * plotW);
              return (
                <line
                  key={i}
                  className="rchart-grid-line"
                  x1={x}
                  y1={PADDING}
                  x2={x}
                  y2={PADDING + plotH}
                />
              );
            })}

          {area &&
            lines.map((line, li) => {
              if (!line.path || line.points.length < 2) return null;
              const areaPath = buildAreaPath(line.path, line.points, PADDING + plotH);
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
                style={
                  animated
                    ? { animationDelay: `${li * 0.1}s` }
                    : undefined
                }
              />
            ) : null,
          )}

          {showDots && !isSeries &&
            computeLinePoints(flatData, width, height, PADDING).map((pt, i) => {
              const dp = flatData[i];
              const dotColor =
                colors && colors.length > 0
                  ? (colors[0] ?? resolveColor(dp?.color, i))
                  : resolveColor(dp?.color, i);
              return (
                <circle
                  key={i}
                  className="rchart-dot"
                  cx={pt.x}
                  cy={pt.y}
                  r={4}
                  fill={dotColor}
                  style={{
                    ...(animated ? { animationDelay: `${0.6 + i * 0.05}s`, opacity: 0 } : {}),
                    cursor: onClick ? "pointer" : undefined,
                  }}
                  onClick={onClick && dp ? () => onClick(dp, i) : undefined}
                  onMouseEnter={
                    tooltip && dp
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
                const allValues = (data as SeriesDataPoint[]).flatMap((x) =>
                  x.series.flatMap((ss) => ss.values),
                );
                const minVal = Math.min(...allValues);
                const maxVal = Math.max(...allValues);
                const labelCount = (data as SeriesDataPoint[]).length;
                const x =
                  PADDING +
                  (labelCount === 1 ? plotW / 2 : (di / (labelCount - 1)) * plotW);
                const val = s.values[0] ?? 0;
                const y = PADDING + scaleLinear(val, minVal, maxVal, plotH, 0);
                const color =
                  colors && colors.length > 0
                    ? (colors[si % colors.length] ?? resolveColor(s.color, si))
                    : resolveColor(s.color, si);
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
                              label: s.name ? `${d.label} — ${s.name}` : d.label,
                              value: val,
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
            labels.map((label, i) => {
              const x =
                PADDING +
                (labels.length === 1 ? plotW / 2 : (i / (labels.length - 1)) * plotW);
              return (
                <text
                  key={i}
                  className="rchart-axis-label"
                  x={x}
                  y={PADDING + plotH + 18}
                  textAnchor="middle"
                >
                  {label}
                </text>
              );
            })}

          {showLabels &&
            gridValues.map((val, i) => {
              const y = PADDING + ((GRID_LINES - i) / GRID_LINES) * plotH;
              return (
                <text
                  key={i}
                  className="rchart-axis-label"
                  x={PADDING - 8}
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
            <span className="rchart-tooltip-label">{tooltipState.label}</span>
            <span className="rchart-tooltip-value">{tooltipState.value}</span>
          </div>
        )}

        {showLegend && isSeries && (
          <ul className="rchart-legend" aria-label="Legend">
            {(data as SeriesDataPoint[])[0]?.series.map((s, i) => (
              <li key={i} className="rchart-legend-item">
                <span
                  className="rchart-legend-swatch"
                  style={{ background: resolveColor(s.color, i) }}
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
                  style={{ background: resolveColor(d.color, i) }}
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
