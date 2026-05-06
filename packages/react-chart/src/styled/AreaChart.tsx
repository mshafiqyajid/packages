import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { useChart } from "../useChart";
import {
  type ChartAnnotation,
  type ChartGradient,
  type ChartReferenceLine,
  type ColorScheme,
  type DataPoint,
  type SeriesDataPoint,
  isSeriesData,
  resolveColor,
  scaleLinear,
} from "../chartUtils";

export type AreaChartTone = "neutral" | "primary";

export interface AreaChartHandle {
  exportSVG(): string;
  exportPNG(): Promise<Blob | null>;
}

export interface AreaChartProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "color" | "onCopy"> {
  data: DataPoint[] | SeriesDataPoint[];
  /** Chart width in px (also acts as the SVG viewBox unit). */
  width?: number;
  height?: number;
  smooth?: boolean;
  /** Solid fill colour or a gradient. Default: derives a soft alpha from the line stroke. */
  fill?: string | ChartGradient;
  /** Stack series areas. Default: false. */
  stacked?: boolean;
  /** Show the line stroke on top of the fill. Default: true. */
  showLine?: boolean;
  /** Animate the path on mount. Default: true. */
  animate?: boolean;
  /** Show data points as small dots. Default: false. */
  showDots?: boolean;
  /** Show grid lines. Default: true. */
  showGrid?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  /** Number of y-axis ticks. */
  yTicks?: number;
  /** Tooltip on hover with crosshair guide. Default: true. */
  showTooltip?: boolean;
  showLegend?: boolean;
  tone?: AreaChartTone;
  colorScheme?: ColorScheme;
  /** Per-series colour overrides keyed by series name. */
  colors?: Record<string, string>;
  /** Horizontal reference lines (targets / thresholds). */
  referenceLines?: ChartReferenceLine[];
  /** Vertical annotation guides at specific x labels/indices. */
  annotations?: ChartAnnotation[];
  /** Format the value displayed in the tooltip / labels. */
  formatValue?: (value: number) => ReactNode;
  /** Format x-axis labels. */
  formatLabel?: (label: string) => ReactNode;
  /** Hidden series ids (legend interactivity). When provided, takes precedence. */
  hiddenSeries?: string[];
  onHiddenSeriesChange?: (next: string[]) => void;
  className?: string;
  loading?: boolean;
  emptyText?: ReactNode;
}

interface ResolvedSeries {
  name: string;
  color: string;
  values: number[];
}

function AreaChartImpl(
  props: AreaChartProps,
  ref: React.Ref<AreaChartHandle>,
) {
  const {
    data,
    width = 600,
    height = 280,
    smooth = true,
    fill,
    stacked = false,
    showLine = true,
    animate = true,
    showDots = false,
    showGrid = true,
    showXAxis = true,
    showYAxis = true,
    yTicks = 5,
    showTooltip = true,
    showLegend,
    tone = "primary",
    colorScheme = "default",
    colors: colorOverrides,
    referenceLines,
    annotations,
    formatValue,
    formatLabel,
    hiddenSeries: hiddenSeriesProp,
    onHiddenSeriesChange,
    className,
    loading = false,
    emptyText = "No data",
    style,
    ...rest
  } = props;

  const padding = 40;
  const isSeries = isSeriesData(data);

  // Hidden series state
  const [internalHidden, setInternalHidden] = useState<string[]>([]);
  const hiddenSeries = hiddenSeriesProp ?? internalHidden;
  const setHidden = (next: string[]) => {
    if (hiddenSeriesProp === undefined) setInternalHidden(next);
    onHiddenSeriesChange?.(next);
  };
  const toggleSeries = (name: string) => {
    setHidden(hiddenSeries.includes(name) ? hiddenSeries.filter((n) => n !== name) : [...hiddenSeries, name]);
  };

  const labels = useMemo<string[]>(() => {
    if (data.length === 0) return [];
    if (isSeries) return (data as SeriesDataPoint[]).map((d) => d.label);
    return (data as DataPoint[]).map((d) => d.label);
  }, [data, isSeries]);

  // Build the canonical series list (single-series or multi-series).
  const series = useMemo<ResolvedSeries[]>(() => {
    if (data.length === 0) return [];
    if (isSeries) {
      const sd = data as SeriesDataPoint[];
      const names = sd[0]?.series.map((s) => s.name) ?? [];
      return names.map((name, idx) => {
        const provided = sd[0]?.series.find((s) => s.name === name)?.color;
        const color = colorOverrides?.[name] ?? resolveColor(provided, idx, colorOverrides ? undefined : undefined);
        const values = sd.map((d) => d.series.find((s) => s.name === name)?.values[0] ?? 0);
        return { name, color, values };
      });
    }
    const dp = data as DataPoint[];
    const fallback = tone === "primary" ? "#6366f1" : "#71717a";
    return [
      {
        name: "value",
        color: dp[0]?.color ?? colorOverrides?.value ?? fallback,
        values: dp.map((d) => d.value),
      },
    ];
  }, [data, isSeries, tone, colorOverrides]);

  const visibleSeries = series.filter((s) => !hiddenSeries.includes(s.name));

  // Compute scales. For stacked mode, sum across series at each x index.
  const { yMin, yMax } = useMemo(() => {
    if (visibleSeries.length === 0) return { yMin: 0, yMax: 1 };
    if (stacked) {
      const sums = labels.map((_, i) =>
        visibleSeries.reduce((s, ser) => s + (ser.values[i] ?? 0), 0),
      );
      return { yMin: Math.min(0, ...sums), yMax: Math.max(...sums, 1) };
    }
    const all = visibleSeries.flatMap((s) => s.values);
    return { yMin: Math.min(0, ...all), yMax: Math.max(...all, 1) };
  }, [visibleSeries, stacked, labels]);

  const plotWidth = width - padding * 2;
  const plotHeight = height - padding * 2;

  const xPos = (i: number) =>
    labels.length === 1
      ? padding + plotWidth / 2
      : padding + (i / (labels.length - 1)) * plotWidth;
  const yPos = (v: number) =>
    padding + scaleLinear(v, yMin, yMax, plotHeight, 0);

  // Build series points (with stacking offsets)
  const seriesPoints = useMemo(() => {
    const stack = labels.map(() => 0); // running total per x for stacked mode
    return visibleSeries.map((s) => {
      const top = labels.map((_, i) => {
        const v = s.values[i] ?? 0;
        const next = stacked ? stack[i]! + v : v;
        if (stacked) stack[i] = next;
        return { x: xPos(i), y: yPos(next), label: labels[i] ?? "", value: v };
      });
      // Bottom path for area: in stacked mode it's the previous stack, else baseline.
      const baseline = stacked
        ? labels.map((_, i) => ({
            x: xPos(i),
            y: yPos(stack[i]! - (s.values[i] ?? 0)),
          }))
        : labels.map((_, i) => ({ x: xPos(i), y: yPos(yMin) }));
      return { name: s.name, color: s.color, top, baseline };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleSeries, labels.length, stacked, yMin, yMax, plotWidth, plotHeight]);

  // Smooth path helper
  const buildLinePath = (pts: { x: number; y: number }[]): string => {
    if (pts.length === 0) return "";
    if (pts.length === 1) return `M ${pts[0]!.x} ${pts[0]!.y}`;
    if (!smooth) return `M ${pts.map((p) => `${p.x} ${p.y}`).join(" L ")}`;
    const d: string[] = [`M ${pts[0]!.x} ${pts[0]!.y}`];
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1]!;
      const curr = pts[i]!;
      const cpX = (prev.x + curr.x) / 2;
      d.push(`C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`);
    }
    return d.join(" ");
  };

  const buildAreaPath = (
    top: { x: number; y: number }[],
    bot: { x: number; y: number }[],
  ): string => {
    if (top.length === 0) return "";
    const linePath = buildLinePath(top);
    // Close down through the baseline in reverse.
    const reverse = [...bot].reverse();
    const close = reverse.map((p) => `L ${p.x} ${p.y}`).join(" ");
    return `${linePath} ${close} Z`;
  };

  // Crosshair / tooltip
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!showTooltip || labels.length === 0) return;
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const xRatio = (e.clientX - rect.left) / rect.width; // 0..1 across viewBox width
      const xPx = xRatio * width;
      // Find the nearest x-index
      let nearest = 0;
      let bestDist = Infinity;
      for (let i = 0; i < labels.length; i++) {
        const px = xPos(i);
        const dist = Math.abs(px - xPx);
        if (dist < bestDist) { bestDist = dist; nearest = i; }
      }
      setHoverIndex(nearest);
    },
    [labels.length, showTooltip, width],
  );
  const handlePointerLeave = () => setHoverIndex(null);

  // Imperative export
  useImperativeHandle(
    ref,
    () => ({
      exportSVG: () => svgRef.current?.outerHTML ?? "",
      exportPNG: () =>
        new Promise<Blob | null>((resolve) => {
          const svg = svgRef.current;
          if (!svg || typeof window === "undefined") return resolve(null);
          const xml = new XMLSerializer().serializeToString(svg);
          const blob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
          const url = URL.createObjectURL(blob);
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = width * 2;
            canvas.height = height * 2;
            const ctx = canvas.getContext("2d");
            if (!ctx) { URL.revokeObjectURL(url); return resolve(null); }
            ctx.scale(2, 2);
            ctx.drawImage(img, 0, 0, width, height);
            URL.revokeObjectURL(url);
            canvas.toBlob((b) => resolve(b), "image/png");
          };
          img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
          img.src = url;
        }),
    }),
    [width, height],
  );

  // Animate-on-mount: kick once after first paint.
  const [animated, setAnimated] = useState(!animate);
  useEffect(() => {
    if (!animate) return;
    const t = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(t);
  }, [animate]);

  // Pull useChart so that headless consumers see something useful (we don't
  // strictly need it for area, but it keeps the package's hook semantics consistent).
  void useChart({
    data: data as DataPoint[],
    type: "area",
    width,
    height,
    padding,
    smooth,
    stacked,
  });

  if (loading) {
    return (
      <div
        className={["rchart-area", "rchart-loading", className].filter(Boolean).join(" ")}
        style={style}
        {...rest}
      >
        <span className="rchart-skeleton" />
      </div>
    );
  }
  if (data.length === 0) {
    return (
      <div className={["rchart-area", className].filter(Boolean).join(" ")} style={style} {...rest}>
        <span className="rchart-empty">{emptyText}</span>
      </div>
    );
  }

  const wrapperStyle: CSSProperties = {
    ...style,
  };

  // y-axis ticks
  const ticks = useMemo(() => {
    const arr: number[] = [];
    const step = (yMax - yMin) / Math.max(1, yTicks - 1);
    for (let i = 0; i < yTicks; i++) arr.push(yMin + i * step);
    return arr;
  }, [yMin, yMax, yTicks]);

  // gradient ids must be unique per chart instance
  const gid = useId().replace(/[:]/g, "");
  const gradientFor = (color: string, idx: number): string =>
    typeof fill === "object" && fill
      ? `url(#${gid}-fg-${idx})`
      : typeof fill === "string"
      ? fill
      : `${color}33`; // ~20% alpha fallback

  return (
    <div
      className={["rchart-area", className].filter(Boolean).join(" ")}
      style={wrapperStyle}
      data-tone={tone}
      {...rest}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="rchart-svg"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        role="img"
      >
        <defs>
          {seriesPoints.map((sp, idx) => {
            if (typeof fill !== "object" || !fill) return null;
            return (
              <linearGradient
                key={sp.name}
                id={`${gid}-fg-${idx}`}
                x1="0"
                x2="0"
                y1="0"
                y2="1"
              >
                <stop offset="0%" stopColor={fill.from} stopOpacity={fill.fromOpacity ?? 1} />
                <stop offset="100%" stopColor={fill.to} stopOpacity={fill.toOpacity ?? 0} />
              </linearGradient>
            );
          })}
        </defs>

        {showGrid && (
          <g className="rchart-grid">
            {ticks.map((t, i) => (
              <line
                key={i}
                x1={padding}
                x2={width - padding}
                y1={yPos(t)}
                y2={yPos(t)}
              />
            ))}
          </g>
        )}

        {/* Reference lines */}
        {referenceLines?.map((ref, i) => {
          const y = yPos(ref.value);
          return (
            <g key={`ref-${i}`} className="rchart-ref-line">
              <line
                x1={padding}
                x2={width - padding}
                y1={y}
                y2={y}
                stroke={ref.color ?? "#dc2626"}
                strokeWidth={1}
                strokeDasharray={ref.dashed === false ? undefined : "4 4"}
              />
              {ref.label && (
                <text x={width - padding} y={y - 4} textAnchor="end" className="rchart-ref-label">
                  {ref.label}
                </text>
              )}
            </g>
          );
        })}

        {/* Annotations (vertical) */}
        {annotations?.map((a, i) => {
          const idx = typeof a.x === "number" ? a.x : labels.indexOf(a.x);
          if (idx < 0) return null;
          const x = xPos(idx);
          return (
            <g key={`anno-${i}`} className="rchart-annotation">
              <line
                x1={x}
                x2={x}
                y1={padding}
                y2={height - padding}
                stroke={a.color ?? "#6366f1"}
                strokeWidth={1}
                strokeDasharray="2 4"
              />
              {a.label && (
                <text x={x + 4} y={padding + 12} className="rchart-anno-label">
                  {a.label}
                </text>
              )}
            </g>
          );
        })}

        {/* Areas + lines */}
        {seriesPoints.map((sp, idx) => {
          const areaPath = buildAreaPath(sp.top, sp.baseline);
          const linePath = buildLinePath(sp.top);
          return (
            <g key={sp.name} className="rchart-area-series" data-series={sp.name}>
              <path
                className={[
                  "rchart-area-fill",
                  animate && !animated ? "rchart-area-fill--enter" : "",
                ].filter(Boolean).join(" ")}
                d={areaPath}
                fill={gradientFor(sp.color, idx)}
              />
              {showLine && (
                <path
                  className={[
                    "rchart-area-line",
                    animate ? "rchart-area-line--animated" : "",
                  ].filter(Boolean).join(" ")}
                  d={linePath}
                  fill="none"
                  stroke={sp.color}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              {showDots &&
                sp.top.map((p, i) => (
                  <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r={3}
                    fill="#fff"
                    stroke={sp.color}
                    strokeWidth={2}
                  />
                ))}
            </g>
          );
        })}

        {/* y-axis tick labels */}
        {showYAxis && (
          <g className="rchart-axis rchart-axis--y">
            {ticks.map((t, i) => (
              <text
                key={i}
                x={padding - 6}
                y={yPos(t) + 3}
                textAnchor="end"
              >
                {formatValue ? formatValue(t) : t}
              </text>
            ))}
          </g>
        )}

        {/* x-axis labels */}
        {showXAxis && (
          <g className="rchart-axis rchart-axis--x">
            {labels.map((label, i) => (
              <text
                key={i}
                x={xPos(i)}
                y={height - padding + 16}
                textAnchor="middle"
              >
                {formatLabel ? formatLabel(label) : label}
              </text>
            ))}
          </g>
        )}

        {/* Crosshair */}
        {showTooltip && hoverIndex !== null && (
          <g className="rchart-crosshair">
            <line
              x1={xPos(hoverIndex)}
              x2={xPos(hoverIndex)}
              y1={padding}
              y2={height - padding}
              stroke="currentColor"
              strokeOpacity={0.2}
              strokeWidth={1}
            />
            {seriesPoints.map((sp) => {
              const p = sp.top[hoverIndex];
              if (!p) return null;
              return (
                <circle
                  key={sp.name}
                  cx={p.x}
                  cy={p.y}
                  r={4}
                  fill={sp.color}
                  stroke="white"
                  strokeWidth={2}
                />
              );
            })}
          </g>
        )}
      </svg>

      {/* Tooltip box */}
      {showTooltip && hoverIndex !== null && (
        <div
          className="rchart-tooltip"
          style={{
            left: `${(xPos(hoverIndex) / width) * 100}%`,
          }}
        >
          <div className="rchart-tooltip-label">{labels[hoverIndex]}</div>
          {seriesPoints.map((sp) => {
            const p = sp.top[hoverIndex];
            if (!p) return null;
            return (
              <div key={sp.name} className="rchart-tooltip-row">
                <span className="rchart-tooltip-swatch" style={{ background: sp.color }} />
                <span className="rchart-tooltip-name">{sp.name}</span>
                <span className="rchart-tooltip-value">
                  {formatValue ? formatValue(p.value) : p.value}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      {(showLegend ?? series.length > 1) && (
        <div className="rchart-legend">
          {series.map((s) => {
            const isHidden = hiddenSeries.includes(s.name);
            return (
              <button
                key={s.name}
                type="button"
                className="rchart-legend-item"
                data-hidden={isHidden || undefined}
                onClick={() => toggleSeries(s.name)}
                aria-pressed={!isHidden}
              >
                <span className="rchart-legend-swatch" style={{ background: s.color }} />
                <span className="rchart-legend-label">{s.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export const AreaChart = forwardRef<AreaChartHandle, AreaChartProps>(AreaChartImpl);
AreaChart.displayName = "AreaChart";
