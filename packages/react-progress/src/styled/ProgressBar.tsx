import { forwardRef, type HTMLAttributes, type ReactNode, useEffect, useRef, useState } from "react";
import { useProgress } from "../useProgress";

function useAnimatedNumber(target: number, duration = 300): number {
  const [displayed, setDisplayed] = useState(target);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(target);

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      setDisplayed(target);
      return;
    }

    const from = fromRef.current;
    if (from === target) return;

    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    startRef.current = null;

    function tick(now: number) {
      if (startRef.current === null) startRef.current = now;
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(from + (target - from) * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
        rafRef.current = null;
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return displayed;
}

export type ProgressBarSize = "sm" | "md" | "lg";
export type ProgressBarTone = "neutral" | "primary" | "success" | "warning" | "danger";

export interface ProgressSectionItem {
  value: number;
  tone?: ProgressBarTone;
  label?: string;
}

export interface ProgressBarProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  value?: number;
  min?: number;
  max?: number;
  size?: ProgressBarSize;
  tone?: ProgressBarTone;
  label?: string;
  showValue?: boolean;
  animated?: boolean;
  rounded?: boolean;
  /** Render the bar as N discrete segments instead of a continuous fill. */
  segments?: number;
  /**
   * Render the bar as coloured proportional sections.
   * When set, `value` is ignored. Each item fills proportionally to
   * its `value` relative to `max`.
   */
  sections?: ProgressSectionItem[];
  /**
   * Ghost fill behind the active fill — buffered-range pattern.
   * CSS class `rprog-buffer`.
   */
  bufferValue?: number;
  /** Customize the value display. Receives percent (0-100) and the raw value. */
  formatValue?: (percent: number, value: number | undefined) => ReactNode;
  /**
   * Smoothly animate the displayed number when `value` changes.
   * Default: `true`. Set to `false` to disable. Ignored when `formatValue` is provided
   * or `prefers-reduced-motion` is active.
   */
  animateValue?: boolean;
}

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  function ProgressBar(
    {
      value,
      min = 0,
      max = 100,
      size = "md",
      tone = "neutral",
      label,
      showValue = false,
      animated = false,
      rounded = true,
      segments,
      sections,
      bufferValue,
      formatValue,
      animateValue = true,
      className,
      ...rest
    },
    ref,
  ) {
    const { progressProps, percent, isIndeterminate } = useProgress({ value, min, max });

    const displayedPercent = useAnimatedNumber(
      isIndeterminate ? 0 : percent,
      300,
    );

    const renderedValue =
      formatValue && !isIndeterminate
        ? formatValue(percent, value)
        : animateValue
          ? `${displayedPercent}%`
          : `${percent}%`;

    const filledSegments =
      segments && !isIndeterminate
        ? Math.round((percent / 100) * segments)
        : 0;

    const hasSections = Array.isArray(sections) && sections.length > 0;
    const bufferPercent =
      !hasSections && bufferValue !== undefined
        ? Math.min(100, Math.max(0, Math.round(((Math.min(Math.max(bufferValue, min), max) - min) / (max - min)) * 100)))
        : undefined;

    const totalSectionValue = hasSections
      ? sections!.reduce((sum, s) => sum + s.value, 0)
      : 0;

    return (
      <div
        ref={ref}
        className={["rprog-bar-root", className].filter(Boolean).join(" ")}
        data-size={size}
        data-tone={tone}
        data-rounded={rounded ? "true" : undefined}
        data-segmented={segments ? "true" : undefined}
        data-sections={hasSections ? "true" : undefined}
      >
        {(label || showValue) && (
          <div className="rprog-bar-header">
            {label && <span className="rprog-bar-label">{label}</span>}
            {showValue && !isIndeterminate && !hasSections && (
              <span className="rprog-bar-value">{renderedValue}</span>
            )}
          </div>
        )}
        <div
          {...progressProps}
          {...rest}
          aria-label={label}
          className="rprog-bar-track"
        >
          {hasSections ? (
            sections!.map((section, i) => {
              const widthPct = totalSectionValue > 0
                ? (section.value / totalSectionValue) * 100
                : 0;
              return (
                <div
                  key={i}
                  className="rprog-segment"
                  data-tone={section.tone ?? tone}
                  aria-label={section.label}
                  style={{
                    width: `${widthPct}%`,
                    animationDelay: `${i * 80}ms`,
                  }}
                >
                  <div className="rprog-segment-fill" />
                </div>
              );
            })
          ) : segments && segments > 0 ? (
            Array.from({ length: segments }, (_, i) => (
              <span
                key={i}
                className="rprog-bar-segment"
                data-filled={i < filledSegments ? "true" : undefined}
                data-animated={animated ? "true" : undefined}
                aria-hidden="true"
              />
            ))
          ) : (
            <>
              {bufferPercent !== undefined && (
                <div
                  className="rprog-buffer"
                  aria-hidden="true"
                  style={{ width: `${bufferPercent}%` }}
                />
              )}
              <div
                className="rprog-bar-fill"
                data-indeterminate={isIndeterminate ? "true" : undefined}
                data-animated={animated ? "true" : undefined}
                style={isIndeterminate ? undefined : { width: `${percent}%` }}
              />
            </>
          )}
        </div>
      </div>
    );
  },
);
