import React, { forwardRef, useMemo, useRef, useState } from "react";
import {
  computePieSlices,
  donutArcPath,
  arcPath,
  midAngle,
  polarToCartesian,
  resolveColor,
  getPalette,
} from "../chartUtils";
import type { DataPoint, ColorScheme } from "../chartUtils";
import {
  useResponsiveSize,
  isDataEmpty,
  type CommonChartProps,
  type TooltipPayload,
} from "./chartShared";

export interface PieChartProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onClick">,
    CommonChartProps {
  data: DataPoint[];
  size?: number;
  donut?: boolean;
  donutWidth?: number;
  showLabels?: boolean;
  showLegend?: boolean;
  animated?: boolean;
  colors?: string[];
  colorScheme?: ColorScheme;
  onClick?: (slice: DataPoint, index: number) => void;
  tooltip?: boolean;
  innerLabel?: string;
  hoverOffset?: number;
  selectedIndex?: number | null;
  onSelectedChange?: (index: number | null) => void;
  selectedOffset?: number;
}

export const PieChart = forwardRef<HTMLDivElement, PieChartProps>(
  function PieChart(
    {
      data,
      size: sizeProp = 300,
      donut = false,
      donutWidth = 60,
      showLabels = false,
      showLegend = false,
      animated = false,
      colors,
      colorScheme = "default",
      onClick,
      tooltip = true,
      innerLabel,
      hoverOffset = 0,
      selectedIndex,
      onSelectedChange,
      selectedOffset = 8,
      formatValue,
      formatLabel,
      renderTooltip,
      responsive = false,
      aspectRatio,
      minWidth = 200,
      minHeight = 200,
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
    const palette = useMemo(() => getPalette(colorScheme), [colorScheme]);
    const localRef = useRef<HTMLDivElement | null>(null);
    const setRefs = (el: HTMLDivElement | null) => {
      localRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
    };

    const { width: rWidth } = useResponsiveSize(
      localRef,
      responsive,
      sizeProp,
      sizeProp,
      aspectRatio ?? 1,
      minWidth,
      minHeight,
    );
    const sz = responsive ? rWidth : sizeProp;
    const cx = sz / 2;
    const cy = sz / 2;
    const outerR = sz / 2 - 12;
    const innerR = donut ? outerR - donutWidth : 0;

    const slices = useMemo(() => computePieSlices(data), [data]);

    const [tooltipState, setTooltipState] = useState<TooltipPayload & { x: number; y: number } | null>(null);
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);

    const empty = isDataEmpty(data);

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
          style={{ maxWidth: sz, ...style }}
          {...rest}
        >
          {loading ? (
            <div className="rchart-skeleton rchart-skeleton-circle" aria-busy="true" aria-label="Loading chart" />
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
      <div ref={setRefs} className={rootClass} style={{ maxWidth: sz, ...style }} {...rest}>
        <svg
          className="rchart-svg"
          viewBox={`0 0 ${sz} ${sz}`}
          aria-label="Pie chart"
          role="img"
          {...(responsive ? { preserveAspectRatio: "xMidYMid meet" } : {})}
        >
          {slices.map((slice, i) => {
            const dp = data[i];
            if (!dp) return null;
            const color =
              colors && colors.length > 0
                ? (colors[i % colors.length] ?? resolveColor(dp.color, i, palette))
                : resolveColor(dp.color, i, palette);
            const d = donut
              ? donutArcPath(cx, cy, outerR, innerR, slice.startAngle, slice.endAngle)
              : arcPath(cx, cy, outerR, slice.startAngle, slice.endAngle);

            const isHover = hoverIndex === i;
            const isSelected = selectedIndex === i;
            const offset = isSelected
              ? selectedOffset
              : isHover && hoverOffset > 0
                ? hoverOffset
                : 0;
            const transform = offset > 0
              ? (() => {
                  const mid = midAngle(slice.startAngle, slice.endAngle);
                  const rad = (mid * Math.PI) / 180;
                  const dx = Math.cos(rad) * offset;
                  const dy = Math.sin(rad) * offset;
                  return `translate(${dx} ${dy})`;
                })()
              : undefined;

            return (
              <path
                key={i}
                className="rchart-slice"
                data-selected={isSelected ? "true" : undefined}
                d={d}
                fill={color}
                transform={transform}
                style={{
                  ...(animated ? { animationDelay: `${i * 0.06}s`, opacity: 0 } : {}),
                  cursor: onClick || onSelectedChange ? "pointer" : undefined,
                  transition: "transform var(--rchart-transition)",
                }}
                onClick={
                  onClick || onSelectedChange
                    ? () => {
                        onClick?.(dp, i);
                        if (onSelectedChange) {
                          onSelectedChange(selectedIndex === i ? null : i);
                        }
                      }
                    : undefined
                }
                onMouseEnter={(e) => {
                  setHoverIndex(i);
                  if (!tooltip) return;
                  const rootEl = e.currentTarget.closest(".rchart-root") as HTMLElement | null;
                  if (!rootEl) return;
                  const rootRect = rootEl.getBoundingClientRect();
                  const elRect = e.currentTarget.getBoundingClientRect();
                  setTooltipState({
                    x: elRect.left - rootRect.left + elRect.width / 2,
                    y: elRect.top - rootRect.top,
                    label: dp.label,
                    value: dp.value,
                    color,
                    point: dp,
                    index: i,
                  });
                }}
                onMouseLeave={() => {
                  setHoverIndex(null);
                  if (tooltip) setTooltipState(null);
                }}
              />
            );
          })}

          {showLabels &&
            slices.map((slice, i) => {
              const mid = midAngle(slice.startAngle, slice.endAngle);
              const labelR = donut ? innerR + (outerR - innerR) / 2 : outerR * 0.65;
              const pos = polarToCartesian(cx, cy, labelR, mid);
              const label = slice.label;
              return (
                <text
                  key={i}
                  className="rchart-pie-label"
                  x={pos.x}
                  y={pos.y + 4}
                  textAnchor="middle"
                >
                  {formatLabel ? formatLabel(label, i) : label}
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
            {renderTooltip ? (
              renderTooltip({
                label: tooltipState.label,
                value: tooltipState.value,
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

        {showLegend && (
          <ul className="rchart-legend" aria-label="Legend">
            {data.map((d, i) => (
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
