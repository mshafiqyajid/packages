import React, { forwardRef, useMemo } from "react";
import {
  computePieSlices,
  donutArcPath,
  arcPath,
  midAngle,
  polarToCartesian,
  resolveColor,
} from "../chartUtils";
import type { DataPoint } from "../chartUtils";

export interface PieChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: DataPoint[];
  size?: number;
  donut?: boolean;
  donutWidth?: number;
  showLabels?: boolean;
  showLegend?: boolean;
  animated?: boolean;
}

export const PieChart = forwardRef<HTMLDivElement, PieChartProps>(
  function PieChart(
    {
      data,
      size = 300,
      donut = false,
      donutWidth = 60,
      showLabels = false,
      showLegend = false,
      animated = false,
      className,
      style,
      ...rest
    },
    ref,
  ) {
    const cx = size / 2;
    const cy = size / 2;
    const outerR = size / 2 - 12;
    const innerR = donut ? outerR - donutWidth : 0;

    const slices = useMemo(() => computePieSlices(data), [data]);

    const rootClass = [
      "rchart-root",
      animated ? "rchart-animated" : "",
      className ?? "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div ref={ref} className={rootClass} style={{ maxWidth: size, ...style }} {...rest}>
        <svg
          className="rchart-svg"
          viewBox={`0 0 ${size} ${size}`}
          aria-label="Pie chart"
          role="img"
        >
          {slices.map((slice, i) => {
            const color = resolveColor(data[i]?.color, i);
            const d = donut
              ? donutArcPath(cx, cy, outerR, innerR, slice.startAngle, slice.endAngle)
              : arcPath(cx, cy, outerR, slice.startAngle, slice.endAngle);
            return (
              <path
                key={i}
                className="rchart-slice"
                d={d}
                fill={color}
                style={animated ? { animationDelay: `${i * 0.06}s`, opacity: 0 } : undefined}
              >
                <title>{`${slice.label}: ${slice.value}`}</title>
              </path>
            );
          })}

          {showLabels &&
            slices.map((slice, i) => {
              const mid = midAngle(slice.startAngle, slice.endAngle);
              const labelR = donut ? innerR + (outerR - innerR) / 2 : outerR * 0.65;
              const pos = polarToCartesian(cx, cy, labelR, mid);
              return (
                <text
                  key={i}
                  className="rchart-pie-label"
                  x={pos.x}
                  y={pos.y + 4}
                  textAnchor="middle"
                >
                  {slice.label}
                </text>
              );
            })}
        </svg>

        {showLegend && (
          <ul className="rchart-legend" aria-label="Legend">
            {data.map((d, i) => (
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
