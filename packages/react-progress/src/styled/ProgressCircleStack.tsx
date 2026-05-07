import { forwardRef, type HTMLAttributes } from "react";
import { ProgressCircle, type ProgressCircleTone } from "./ProgressCircle";

export type { ProgressCircleTone as ProgressTone };

export interface ProgressRingItem {
  value: number;
  tone?: ProgressCircleTone;
  label?: string;
}

export interface ProgressCircleStackProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  rings: ProgressRingItem[];
  /** Outer diameter in px. Default 120. */
  size?: number;
  /** Pixel gap between rings. Default 6. */
  gap?: number;
  /** Show a legend list beside the rings. Default true when any ring has a label. */
  showLegend?: boolean;
}

const DEFAULT_SIZE = 120;
const DEFAULT_GAP = 6;

/** Tone → CSS variable mapping for the legend dot colour. */
function toneToVar(tone?: ProgressCircleTone): string {
  const map: Record<string, string> = {
    primary: "var(--rprog-primary)",
    success: "var(--rprog-success)",
    warning: "var(--rprog-warning)",
    danger: "var(--rprog-danger)",
    neutral: "var(--rprog-neutral)",
  };
  return map[tone ?? "primary"] ?? map.primary!;
}

export const ProgressCircleStack = forwardRef<HTMLDivElement, ProgressCircleStackProps>(
  function ProgressCircleStack(
    { rings, size = DEFAULT_SIZE, gap = DEFAULT_GAP, showLegend, className, style, ...rest },
    ref,
  ) {
    const clamped = rings.slice(0, 4);
    const strokeWidth = Math.max(4, Math.round(size * 0.08));
    const hasLabels = clamped.some((r) => r.label);
    const displayLegend = showLegend ?? hasLabels;

    return (
      <div
        ref={ref}
        className={["rprog-stack-wrap", className].filter(Boolean).join(" ")}
        style={{ display: "inline-flex", alignItems: "center", gap: 16, ...style }}
        {...rest}
      >
        {/* Concentric ring container */}
        <div
          className="rprog-stack"
          style={{ position: "relative", width: size, height: size, flexShrink: 0 }}
        >
          {clamped.map((ring, i) => {
            const ringSize = size - i * (strokeWidth + gap) * 2;
            return (
              <ProgressCircle
                key={i}
                value={ring.value}
                tone={ring.tone}
                size={ringSize}
                strokeWidth={strokeWidth}
                /* Labels are handled by the legend — don't double-render inside the SVG */
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  animationDelay: `${i * 120}ms`,
                }}
              />
            );
          })}
        </div>

        {/* Legend */}
        {displayLegend && (
          <ul className="rprog-stack-legend" style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
            {clamped.map((ring, i) => (
              <li key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.78rem", color: "var(--rprog-fg-muted, #6b7280)" }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: toneToVar(ring.tone), flexShrink: 0 }} />
                <span>{ring.label ?? `Ring ${i + 1}`}</span>
                <span style={{ marginLeft: "auto", fontWeight: 600, color: "var(--rprog-fg, #111827)", paddingLeft: 8 }}>{ring.value}%</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  },
);
