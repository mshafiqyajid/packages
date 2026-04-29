import React, { forwardRef, useMemo } from "react";
import {
  scaleLinear,
  resolveColor,
  isSeriesData,
} from "../chartUtils";
import type { DataPoint, SeriesDataPoint } from "../chartUtils";

export interface BarChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: DataPoint[] | SeriesDataPoint[];
  width?: number;
  height?: number;
  direction?: "vertical" | "horizontal";
  stacked?: boolean;
  gap?: number;
  radius?: number;
  showValues?: boolean;
  animated?: boolean;
}

const PADDING = 48;

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
      width = 600,
      height = 300,
      direction = "vertical",
      stacked = false,
      gap = 4,
      radius = 3,
      showValues = false,
      animated = false,
      className,
      style,
      ...rest
    },
    ref,
  ) {
    const isSeries = isSeriesData(data);

    const bars = useMemo(() => {
      const plotW = width - PADDING * 2;
      const plotH = height - PADDING * 2;

      if (!isSeries) {
        const fd = data as DataPoint[];
        const values = fd.map((d) => d.value);
        const maxVal = values.length > 0 ? Math.max(...values) : 1;
        const minVal = 0;
        const slotW = plotW / fd.length;

        return fd.map((d, i) => {
          const color = resolveColor(d.color, i);
          if (direction === "vertical") {
            const barW = slotW - gap * 2;
            const barH = scaleLinear(d.value, minVal, maxVal, 0, plotH);
            const x = PADDING + i * slotW + gap;
            const y = PADDING + plotH - barH;
            return { x, y, w: barW, h: barH, color, label: d.label, value: d.value };
          } else {
            const barH = (plotH / fd.length) - gap * 2;
            const barW = scaleLinear(d.value, minVal, maxVal, 0, plotW);
            const x = PADDING;
            const y = PADDING + i * (plotH / fd.length) + gap;
            return { x, y, w: barW, h: barH, color, label: d.label, value: d.value };
          }
        });
      }

      const sd = data as SeriesDataPoint[];
      const seriesNames: string[] = [];
      sd.forEach((d) => d.series.forEach((s) => {
        if (!seriesNames.includes(s.name)) seriesNames.push(s.name);
      }));

      if (stacked) {
        const maxStackedVal = Math.max(
          ...sd.map((d) => d.series.reduce((s, e) => s + (e.values[0] ?? 0), 0)),
        );

        return sd.flatMap((d, di) => {
          const slotW = plotW / sd.length;
          let accumH = 0;

          return d.series.map((s, si) => {
            const val = s.values[0] ?? 0;
            const color = resolveColor(s.color, si);
            if (direction === "vertical") {
              const barW = slotW - gap * 2;
              const barH = scaleLinear(val, 0, maxStackedVal, 0, plotH);
              const x = PADDING + di * slotW + gap;
              const y = PADDING + plotH - accumH - barH;
              accumH += barH;
              return { x, y, w: barW, h: barH, color, label: d.label, value: val };
            } else {
              const barH2 = plotH / sd.length - gap * 2;
              const barW = scaleLinear(val, 0, maxStackedVal, 0, plotW);
              const x = PADDING + accumH;
              const y = PADDING + di * (plotH / sd.length) + gap;
              accumH += barW;
              return { x, y, w: barW, h: barH2, color, label: d.label, value: val };
            }
          });
        });
      }

      const maxGroupVal = Math.max(
        ...sd.flatMap((d) => d.series.map((s) => s.values[0] ?? 0)),
      );
      const groupSlotW = plotW / sd.length;
      const barSlotW = groupSlotW / seriesNames.length;

      return sd.flatMap((d, di) =>
        seriesNames.map((name, si) => {
          const entry = d.series.find((s) => s.name === name);
          const val = entry ? (entry.values[0] ?? 0) : 0;
          const color = resolveColor(entry?.color, si);
          if (direction === "vertical") {
            const barW = barSlotW - gap;
            const barH = scaleLinear(val, 0, maxGroupVal, 0, plotH);
            const x = PADDING + di * groupSlotW + si * barSlotW + gap / 2;
            const y = PADDING + plotH - barH;
            return { x, y, w: barW, h: barH, color, label: d.label, value: val };
          } else {
            const barH2 = (plotH / sd.length) / seriesNames.length - gap;
            const barW = scaleLinear(val, 0, maxGroupVal, 0, plotW);
            const x = PADDING;
            const y =
              PADDING + di * (plotH / sd.length) + si * ((plotH / sd.length) / seriesNames.length) + gap / 2;
            return { x, y, w: barW, h: barH2, color, label: d.label, value: val };
          }
        }),
      );
    }, [data, width, height, direction, stacked, gap, isSeries]);

    const labels = useMemo(() => {
      if (isSeries) return (data as SeriesDataPoint[]).map((d) => d.label);
      return (data as DataPoint[]).map((d) => d.label);
    }, [data, isSeries]);

    const plotW = width - PADDING * 2;
    const plotH = height - PADDING * 2;

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
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          aria-label="Bar chart"
          role="img"
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
                style={animated ? { animationDelay: `${i * 0.04}s` } : undefined}
              >
                <title>{`${bar.label}: ${bar.value}`}</title>
              </path>
            );
          })}

          {showValues &&
            bars.map((bar, i) => {
              if (bar.w <= 0 || bar.h <= 0) return null;
              if (direction === "vertical") {
                return (
                  <text
                    key={i}
                    className="rchart-bar-value"
                    x={bar.x + bar.w / 2}
                    y={bar.y - 4}
                    textAnchor="middle"
                  >
                    {bar.value}
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
                  {bar.value}
                </text>
              );
            })}

          {labels.map((label, i) => {
            if (direction === "vertical") {
              const slotW = plotW / labels.length;
              const x = PADDING + i * slotW + slotW / 2;
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
            }
            const slotH = plotH / labels.length;
            const y = PADDING + i * slotH + slotH / 2 + 4;
            return (
              <text
                key={i}
                className="rchart-axis-label"
                x={PADDING - 8}
                y={y}
                textAnchor="end"
              >
                {label}
              </text>
            );
          })}
        </svg>
      </div>
    );
  },
);
