import React, { forwardRef, useMemo, useState } from "react";
import {
  computePieSlices,
  donutArcPath,
  arcPath,
  midAngle,
  polarToCartesian,
  resolveColor,
} from "../chartUtils";
import type { DataPoint } from "../chartUtils";

export interface PieChartProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onClick"> {
  data: DataPoint[];
  size?: number;
  donut?: boolean;
  donutWidth?: number;
  showLabels?: boolean;
  showLegend?: boolean;
  animated?: boolean;
  onClick?: (slice: DataPoint, index: number) => void;
  tooltip?: boolean;
  innerLabel?: string;
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
      onClick,
      tooltip = true,
      innerLabel,
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

    const [tooltipState, setTooltipState] = useState<{
      x: number;
      y: number;
      label: string;
      value: number | string;
    } | null>(null);

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
            const dp = data[i];
            return (
              <path
                key={i}
                className="rchart-slice"
                d={d}
                fill={color}
                style={{
                  ...(animated ? { animationDelay: `${i * 0.06}s`, opacity: 0 } : {}),
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

          {donut && innerLabel && (
            <text
              x={cx}
              y={cy}
              textAnchor="middle"
              dominantBaseline="middle"
              className="rchart-inner-label"
            >
              {innerLabel}
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
