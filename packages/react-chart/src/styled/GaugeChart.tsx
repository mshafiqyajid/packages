import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { polarToCartesian } from "../chartUtils";

export interface GaugeChartHandle {
  exportSVG(): string;
  exportPNG(): Promise<Blob | null>;
}

export interface GaugeThreshold {
  /** Value at which this threshold colour starts (inclusive). */
  from: number;
  color: string;
  /** Optional label rendered when the gauge value lands inside this threshold. */
  label?: string;
}

export interface GaugeChartProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "color" | "onCopy"> {
  value: number;
  /** Gauge minimum. Default: 0. */
  min?: number;
  /** Gauge maximum. Default: 100. */
  max?: number;
  /** Outer SVG side. Default: 240. */
  size?: number;
  /** Arc thickness in px. Default: 18. */
  thickness?: number;
  /** Sweep angle in degrees (180 = semicircle, 270 = three-quarter, 360 = full circle). Default: 220. */
  sweep?: number;
  /**
   * Visual variant.
   * - `"arc"` — partial arc, sweep-controlled (default).
   * - `"ring"` — full circle (sweep is forced to 360).
   * - `"linear"` — horizontal bar with markers, ignores `sweep`.
   */
  variant?: "arc" | "ring" | "linear";
  /** Single fill color (overridden by `thresholds`). */
  color?: string;
  /** Threshold-based colouring. The first entry whose `from` ≤ value wins. */
  thresholds?: GaugeThreshold[];
  /** Render major tick marks along the arc. Default: true. */
  showTicks?: boolean;
  /** Number of major ticks (inclusive of both ends). Default: 5. */
  tickCount?: number;
  /** Show the centered numeric value. Default: true. */
  showValue?: boolean;
  /** Format the centered value. */
  formatValue?: (value: number) => ReactNode;
  /** Optional label rendered below the value. */
  label?: ReactNode;
  /** Background track colour. Default: var(--rchart-track, #e5e7eb). */
  trackColor?: string;
  className?: string;
}

function GaugeChartImpl(
  props: GaugeChartProps,
  ref: React.Ref<GaugeChartHandle>,
) {
  const {
    value,
    min = 0,
    max = 100,
    size = 240,
    thickness = 18,
    sweep: sweepProp = 220,
    variant = "arc",
    color: colorProp,
    thresholds,
    showTicks = true,
    tickCount = 5,
    showValue = true,
    formatValue,
    label,
    trackColor,
    className,
    style,
    ...rest
  } = props;

  const sweep = variant === "ring" ? 360 : sweepProp;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - thickness / 2 - 4; // small safety inset
  // Position the sweep symmetrically across the vertical axis. 0° = right
  // per polarToCartesian, so a sweep of 220° starts at 160° and ends at 380°.
  const sweepStart = 180 + (180 - sweep) / 2;
  const sweepEnd = sweepStart + sweep;

  const clamped = Math.max(min, Math.min(max, value));
  const valueAngle = sweepStart + ((clamped - min) / (max - min)) * sweep;

  // Resolve color (threshold or fallback)
  const activeThreshold = useMemo(() => {
    if (!thresholds || thresholds.length === 0) return null;
    const sorted = [...thresholds].sort((a, b) => a.from - b.from);
    let active = sorted[0]!;
    for (const t of sorted) {
      if (clamped >= t.from) active = t;
    }
    return active;
  }, [thresholds, clamped]);

  const fillColor = activeThreshold?.color ?? colorProp ?? "#6366f1";

  const arcPath = (a1: number, a2: number): string => {
    const p1 = polarToCartesian(cx, cy, r, a1);
    const p2 = polarToCartesian(cx, cy, r, a2);
    const largeArc = a2 - a1 > 180 ? 1 : 0;
    return `M ${p1.x} ${p1.y} A ${r} ${r} 0 ${largeArc} 1 ${p2.x} ${p2.y}`;
  };

  // Tick marks
  const tickAngles = useMemo(() => {
    const out: number[] = [];
    for (let i = 0; i < tickCount; i++) {
      out.push(sweepStart + (i / (tickCount - 1)) * sweep);
    }
    return out;
  }, [tickCount, sweepStart, sweep]);

  const svgRef = useRef<SVGSVGElement>(null);
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
            canvas.width = size * 2;
            canvas.height = size * 2;
            const ctx = canvas.getContext("2d");
            if (!ctx) { URL.revokeObjectURL(url); return resolve(null); }
            ctx.scale(2, 2);
            ctx.drawImage(img, 0, 0, size, size);
            URL.revokeObjectURL(url);
            canvas.toBlob((b) => resolve(b), "image/png");
          };
          img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
          img.src = url;
        }),
    }),
    [size],
  );

  const wrapperStyle: CSSProperties = { ...style };

  // Linear variant — horizontal bar with markers; ignore sweep / arc math.
  if (variant === "linear") {
    const linW = size;
    const linH = thickness * 1.6;
    const fillRatio = (clamped - min) / (max - min);
    return (
      <div
        className={["rchart-gauge", "rchart-gauge--linear", className].filter(Boolean).join(" ")}
        style={wrapperStyle}
        role="meter"
        aria-valuenow={clamped}
        aria-valuemin={min}
        aria-valuemax={max}
        {...rest}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${linW} ${linH + 24}`}
          className="rchart-svg"
        >
          <rect
            x={0}
            y={0}
            width={linW}
            height={linH}
            rx={linH / 2}
            ry={linH / 2}
            fill={trackColor ?? "var(--rchart-track, #e5e7eb)"}
          />
          <rect
            x={0}
            y={0}
            width={linW * fillRatio}
            height={linH}
            rx={linH / 2}
            ry={linH / 2}
            fill={fillColor}
          />
          {showTicks &&
            Array.from({ length: tickCount }).map((_, i) => (
              <line
                key={i}
                x1={(i / (tickCount - 1)) * linW}
                x2={(i / (tickCount - 1)) * linW}
                y1={0}
                y2={linH}
                stroke="white"
                strokeOpacity={0.4}
                strokeWidth={1}
              />
            ))}
          {showValue && (
            <text
              x={linW / 2}
              y={linH + 18}
              textAnchor="middle"
              fontSize={size * 0.07}
              fontWeight={600}
              fill="currentColor"
            >
              {formatValue ? formatValue(clamped) : Math.round(clamped)}
              {(activeThreshold?.label || label) && (
                <tspan opacity={0.6} fontWeight={400}>
                  {" — "}
                  {activeThreshold?.label ?? label}
                </tspan>
              )}
            </text>
          )}
        </svg>
      </div>
    );
  }

  return (
    <div
      className={["rchart-gauge", className].filter(Boolean).join(" ")}
      style={wrapperStyle}
      role="meter"
      aria-valuenow={clamped}
      aria-valuemin={min}
      aria-valuemax={max}
      {...rest}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${size} ${size}`}
        className="rchart-svg"
      >
        {/* Background track */}
        <path
          d={arcPath(sweepStart, sweepEnd)}
          fill="none"
          stroke={trackColor ?? "var(--rchart-track, #e5e7eb)"}
          strokeWidth={thickness}
          strokeLinecap="round"
        />
        {/* Filled value arc */}
        <path
          className="rchart-gauge-fill"
          d={arcPath(sweepStart, valueAngle)}
          fill="none"
          stroke={fillColor}
          strokeWidth={thickness}
          strokeLinecap="round"
        />
        {/* Tick marks */}
        {showTicks &&
          tickAngles.map((a, i) => {
            const inner = polarToCartesian(cx, cy, r - thickness / 2 - 4, a);
            const outer = polarToCartesian(cx, cy, r + thickness / 2 + 4, a);
            return (
              <line
                key={i}
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke="currentColor"
                strokeOpacity={0.25}
                strokeWidth={1}
              />
            );
          })}
        {/* Centered value */}
        {showValue && (
          <g className="rchart-gauge-readout">
            <text
              x={cx}
              y={cy + (sweep === 360 ? 0 : 8)}
              textAnchor="middle"
              fontSize={size * 0.18}
              fontWeight={700}
              fill="currentColor"
            >
              {formatValue ? formatValue(clamped) : Math.round(clamped)}
            </text>
            {(activeThreshold?.label || label) && (
              <text
                x={cx}
                y={cy + size * 0.16}
                textAnchor="middle"
                fontSize={size * 0.06}
                fill="currentColor"
                opacity={0.6}
              >
                {activeThreshold?.label ?? label}
              </text>
            )}
          </g>
        )}
      </svg>
    </div>
  );
}

export const GaugeChart = forwardRef<GaugeChartHandle, GaugeChartProps>(GaugeChartImpl);
GaugeChart.displayName = "GaugeChart";
