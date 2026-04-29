import React, { forwardRef, useMemo } from "react";
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

export interface LineChartProps extends React.HTMLAttributes<HTMLDivElement> {
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
}

const PADDING = 48;
const GRID_LINES = 5;

function buildSeriesLines(
  seriesData: SeriesDataPoint[],
  width: number,
  height: number,
  smooth: boolean,
): Array<{ path: string; color: string; name: string }> {
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
    const color =
      seriesData[0]?.series.find((s) => s.name === name)?.color ??
      DEFAULT_PALETTE[si % DEFAULT_PALETTE.length] ??
      "#6366f1";
    const pathStr = smooth ? pointsToSmoothPath(points) : `M ${pointsToPolyline(points).replace(/ /g, " L ")}`;

    return { path: pathStr, color, name };
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
      className,
      style,
      ...rest
    },
    ref,
  ) {
    const isSeries = isSeriesData(data);

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
          lines: buildSeriesLines(sd, width, height, smooth),
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

      const color =
        tone === "primary" ? "var(--rchart-primary)" : "var(--rchart-neutral)";

      const gv = Array.from({ length: GRID_LINES + 1 }, (_, i) =>
        scaleLinear(i / GRID_LINES, 0, 1, minVal, maxVal),
      );

      return {
        flatData: fd,
        lines: [{ path: pathStr, color, name: "" }],
        gridValues: gv,
        labels: fd.map((d) => d.label),
      };
    }, [data, width, height, smooth, tone, isSeries]);

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
            computeLinePoints(flatData, width, height, PADDING).map((pt, i) => (
              <circle
                key={i}
                className="rchart-dot"
                cx={pt.x}
                cy={pt.y}
                r={4}
                fill={resolveColor(flatData[i]?.color, i)}
                style={animated ? { animationDelay: `${0.6 + i * 0.05}s`, opacity: 0 } : undefined}
              >
                <title>{`${flatData[i]?.label}: ${flatData[i]?.value}`}</title>
              </circle>
            ))}

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
                const color = resolveColor(s.color, si);
                return (
                  <circle
                    key={`${di}-${si}`}
                    className="rchart-dot"
                    cx={x}
                    cy={y}
                    r={4}
                    fill={color}
                  >
                    <title>{`${s.name}: ${val}`}</title>
                  </circle>
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
        </svg>

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
