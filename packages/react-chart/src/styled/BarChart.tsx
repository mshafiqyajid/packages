import React, { forwardRef, useMemo, useRef, useState } from "react";
import {
  scaleLinear,
  resolveColor,
  isSeriesData,
  resolveDomain,
  getPalette,
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

export interface BarChartProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onClick">,
    CommonChartProps {
  data: DataPoint[] | SeriesDataPoint[];
  width?: number;
  height?: number;
  direction?: "vertical" | "horizontal";
  stacked?: boolean;
  gap?: number;
  radius?: number;
  showValues?: boolean;
  animated?: boolean;
  colors?: string[];
  colorScheme?: ColorScheme;
  onClick?: (point: DataPoint, index: number) => void;
  xLabel?: string;
  yLabel?: string;
  tooltip?: boolean;
  domain?: ChartDomain;
  yTicks?: number | number[];
  xTicks?: number | string[];
}

const BASE_PADDING = 48;
const DEFAULT_GRID_LINES = 5;

function roundedRect(
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  direction: "vertical" | "horizontal",
): string {
  if (w <= 0 || h <= 0) return "";
  const cr = Math.min(r, w / 2, h / 2);
  if (cr <= 0) return `M ${x} ${y} H ${x + w} V ${y + h} H ${x} Z`;

  if (direction === "vertical") {
    return [
      `M ${x + cr} ${y}`,
      `H ${x + w - cr}`,
      `Q ${x + w} ${y} ${x + w} ${y + cr}`,
      `V ${y + h}`,
      `H ${x}`,
      `V ${y + cr}`,
      `Q ${x} ${y} ${x + cr} ${y}`,
      "Z",
    ].join(" ");
  }

  return [
    `M ${x} ${y + cr}`,
    `Q ${x} ${y} ${x + cr} ${y}`,
    `H ${x + w - cr}`,
    `Q ${x + w} ${y} ${x + w} ${y + cr}`,
    `V ${y + h - cr}`,
    `Q ${x + w} ${y + h} ${x + w - cr} ${y + h}`,
    `H ${x + cr}`,
    `Q ${x} ${y + h} ${x} ${y + h - cr}`,
    "Z",
  ].join(" ");
}

export const BarChart = forwardRef<HTMLDivElement, BarChartProps>(
  function BarChart(
    {
      data,
      width: widthProp = 600,
      height: heightProp = 300,
      direction = "vertical",
      stacked = false,
      gap = 4,
      radius = 3,
      showValues = false,
      animated = false,
      colors,
      colorScheme = "default",
      onClick,
      xLabel,
      yLabel,
      tooltip = true,
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

    const xLabelPad = xLabel ? 16 : 0;
    const yLabelPad = yLabel ? 16 : 0;
    const PADDING = BASE_PADDING + Math.max(xLabelPad, yLabelPad);

    const empty = isDataEmpty(data as unknown[]);

    const { bars, gridValues } = useMemo(() => {
      const plotW = width - PADDING * 2;
      const plotH = height - PADDING * 2;

      if (!isSeries) {
        const fd = data as DataPoint[];
        const values = fd.map((d) => d.value);
        const dMax = values.length > 0 ? Math.max(...values) : 1;
        const dMin = 0;
        const resolved = resolveDomain(dMin, dMax, domain);
        const slotW = plotW / Math.max(1, fd.length);

        const bs = fd.map((d, i) => {
          const color =
            colors && colors.length > 0
              ? (colors[i % colors.length] ?? resolveColor(d.color, i, palette))
              : resolveColor(d.color, i, palette);
          if (direction === "vertical") {
            const barW = slotW - gap * 2;
            const barH = scaleLinear(d.value, resolved.min, resolved.max, 0, plotH);
            const x = PADDING + i * slotW + gap;
            const y = PADDING + plotH - barH;
            return { x, y, w: barW, h: barH, color, label: d.label, value: d.value, dataPoint: d, seriesName: undefined as string | undefined };
          }
          const barH = (plotH / Math.max(1, fd.length)) - gap * 2;
          const barW = scaleLinear(d.value, resolved.min, resolved.max, 0, plotW);
          const x = PADDING;
          const y = PADDING + i * (plotH / Math.max(1, fd.length)) + gap;
          return { x, y, w: barW, h: barH, color, label: d.label, value: d.value, dataPoint: d, seriesName: undefined as string | undefined };
        });

        const ticks = Array.isArray(yTicks)
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

        return { bars: bs, gridValues: ticks };
      }

      const sd = data as SeriesDataPoint[];
      const seriesNames: string[] = [];
      sd.forEach((d) => d.series.forEach((s) => {
        if (!seriesNames.includes(s.name)) seriesNames.push(s.name);
      }));

      if (stacked) {
        const dMax = Math.max(
          ...sd.map((d) => d.series.reduce((s, e) => s + (e.values[0] ?? 0), 0)),
        );
        const resolved = resolveDomain(0, dMax, domain);

        const bs = sd.flatMap((d, di) => {
          const slotW = plotW / sd.length;
          let accumH = 0;
          return d.series.map((s, si) => {
            const val = s.values[0] ?? 0;
            const color =
              colors && colors.length > 0
                ? (colors[si % colors.length] ?? resolveColor(s.color, si, palette))
                : resolveColor(s.color, si, palette);
            if (direction === "vertical") {
              const barW = slotW - gap * 2;
              const barH = scaleLinear(val, 0, resolved.max, 0, plotH);
              const x = PADDING + di * slotW + gap;
              const y = PADDING + plotH - accumH - barH;
              accumH += barH;
              return { x, y, w: barW, h: barH, color, label: d.label, value: val, dataPoint: { label: d.label, value: val }, seriesName: s.name };
            }
            const barH2 = plotH / sd.length - gap * 2;
            const barW = scaleLinear(val, 0, resolved.max, 0, plotW);
            const x = PADDING + accumH;
            const y = PADDING + di * (plotH / sd.length) + gap;
            accumH += barW;
            return { x, y, w: barW, h: barH2, color, label: d.label, value: val, dataPoint: { label: d.label, value: val }, seriesName: s.name };
          });
        });

        const ticks = Array.isArray(yTicks)
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

        return { bars: bs, gridValues: ticks };
      }

      const dMax = Math.max(
        ...sd.flatMap((d) => d.series.map((s) => s.values[0] ?? 0)),
      );
      const resolved = resolveDomain(0, dMax, domain);
      const groupSlotW = plotW / sd.length;
      const barSlotW = groupSlotW / Math.max(1, seriesNames.length);

      const bs = sd.flatMap((d, di) =>
        seriesNames.map((name, si) => {
          const entry = d.series.find((s) => s.name === name);
          const val = entry ? (entry.values[0] ?? 0) : 0;
          const color =
            colors && colors.length > 0
              ? (colors[si % colors.length] ?? resolveColor(entry?.color, si, palette))
              : resolveColor(entry?.color, si, palette);
          if (direction === "vertical") {
            const barW = barSlotW - gap;
            const barH = scaleLinear(val, 0, resolved.max, 0, plotH);
            const x = PADDING + di * groupSlotW + si * barSlotW + gap / 2;
            const y = PADDING + plotH - barH;
            return { x, y, w: barW, h: barH, color, label: d.label, value: val, dataPoint: { label: d.label, value: val }, seriesName: name };
          }
          const barH2 = (plotH / sd.length) / seriesNames.length - gap;
          const barW = scaleLinear(val, 0, resolved.max, 0, plotW);
          const x = PADDING;
          const y =
            PADDING + di * (plotH / sd.length) + si * ((plotH / sd.length) / seriesNames.length) + gap / 2;
          return { x, y, w: barW, h: barH2, color, label: d.label, value: val, dataPoint: { label: d.label, value: val }, seriesName: name };
        }),
      );

      const ticks = Array.isArray(yTicks)
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

      return { bars: bs, gridValues: ticks };
    }, [data, width, height, direction, stacked, gap, isSeries, colors, palette, PADDING, domain, yTicks]);

    const labels = useMemo(() => {
      if (Array.isArray(xTicks)) return xTicks;
      if (isSeries) return (data as SeriesDataPoint[]).map((d) => d.label);
      return (data as DataPoint[]).map((d) => d.label);
    }, [data, isSeries, xTicks]);

    const plotW = width - PADDING * 2;
    const plotH = height - PADDING * 2;

    const rootClass = [
      "rchart-root",
      animated ? "rchart-animated" : "",
      className ?? "",
    ]
      .filter(Boolean)
      .join(" ");

    if (loading || error || empty) {
      return (
        <div ref={setRefs} className={rootClass} style={style} {...rest}>
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
      <div ref={setRefs} className={rootClass} style={style} {...rest}>
        <svg
          className="rchart-svg"
          viewBox={`0 0 ${width} ${height}`}
          aria-label="Bar chart"
          role="img"
          {...(responsive ? { preserveAspectRatio: "xMidYMid meet" } : {})}
        >
          <line
            className="rchart-grid-line"
            x1={PADDING}
            y1={PADDING + plotH}
            x2={PADDING + plotW}
            y2={PADDING + plotH}
          />
          <line
            className="rchart-grid-line"
            x1={PADDING}
            y1={PADDING}
            x2={PADDING}
            y2={PADDING + plotH}
          />

          {gridValues.length > 0 &&
            gridValues.map((val, i) => {
              const t = (val - gridValues[0]!) / (gridValues[gridValues.length - 1]! - gridValues[0]! || 1);
              const y = PADDING + (1 - t) * plotH;
              return (
                <text
                  key={`yt-${i}`}
                  className="rchart-axis-label"
                  x={PADDING - 8}
                  y={y + 4}
                  textAnchor="end"
                >
                  {Number.isInteger(val) ? val : val.toFixed(1)}
                </text>
              );
            })}

          {bars.map((bar, i) => {
            const d = roundedRect(bar.x, bar.y, bar.w, bar.h, radius, direction);
            if (!d) return null;
            return (
              <path
                key={i}
                className={[
                  "rchart-bar",
                  animated
                    ? direction === "vertical"
                      ? "rchart-bar-animated-v"
                      : "rchart-bar-animated-h"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                d={d}
                fill={bar.color}
                style={{
                  ...(animated ? { animationDelay: `${i * 0.04}s` } : {}),
                  cursor: onClick ? "pointer" : undefined,
                }}
                onClick={onClick ? () => onClick(bar.dataPoint, i) : undefined}
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
                          label: bar.label,
                          value: bar.value,
                          series: bar.seriesName,
                          color: bar.color,
                          point: bar.dataPoint,
                          index: i,
                        });
                      }
                    : undefined
                }
                onMouseLeave={tooltip ? () => setTooltipState(null) : undefined}
              />
            );
          })}

          {showValues &&
            bars.map((bar, i) => {
              if (bar.w <= 0 || bar.h <= 0) return null;
              const valueDisplay = formatValue
                ? formatValue(bar.value, bar.dataPoint, i)
                : bar.value;
              if (direction === "vertical") {
                return (
                  <text
                    key={i}
                    className="rchart-bar-value"
                    x={bar.x + bar.w / 2}
                    y={bar.y - 4}
                    textAnchor="middle"
                  >
                    {valueDisplay}
                  </text>
                );
              }
              return (
                <text
                  key={i}
                  className="rchart-bar-value"
                  x={bar.x + bar.w + 4}
                  y={bar.y + bar.h / 2 + 4}
                  textAnchor="start"
                >
                  {valueDisplay}
                </text>
              );
            })}

          {labels.map((label, i) => {
            if (direction === "vertical") {
              const slotW = plotW / Math.max(1, labels.length);
              const x = PADDING + i * slotW + slotW / 2;
              return (
                <text
                  key={i}
                  className="rchart-axis-label"
                  x={x}
                  y={PADDING + plotH + 18}
                  textAnchor="middle"
                >
                  {formatLabel ? formatLabel(label, i) : label}
                </text>
              );
            }
            const slotH = plotH / Math.max(1, labels.length);
            const y = PADDING + i * slotH + slotH / 2 + 4;
            return (
              <text
                key={i}
                className="rchart-axis-label"
                x={PADDING - 8}
                y={y}
                textAnchor="end"
              >
                {formatLabel ? formatLabel(label, i) : label}
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
      </div>
    );
  },
);
