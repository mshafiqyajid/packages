import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { useProgress } from "../useProgress";

export type ProgressBarSize = "sm" | "md" | "lg";
export type ProgressBarTone = "neutral" | "primary" | "success" | "warning" | "danger";

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
  /** Customize the value display. Receives percent (0-100) and the raw value. */
  formatValue?: (percent: number, value: number | undefined) => ReactNode;
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
      formatValue,
      className,
      ...rest
    },
    ref,
  ) {
    const { progressProps, percent, isIndeterminate } = useProgress({ value, min, max });

    const renderedValue =
      formatValue && !isIndeterminate
        ? formatValue(percent, value)
        : `${percent}%`;

    const filledSegments =
      segments && !isIndeterminate
        ? Math.round((percent / 100) * segments)
        : 0;

    return (
      <div
        ref={ref}
        className={["rprog-bar-root", className].filter(Boolean).join(" ")}
        data-size={size}
        data-tone={tone}
        data-rounded={rounded ? "true" : undefined}
        data-segmented={segments ? "true" : undefined}
      >
        {(label || showValue) && (
          <div className="rprog-bar-header">
            {label && <span className="rprog-bar-label">{label}</span>}
            {showValue && !isIndeterminate && (
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
          {segments && segments > 0 ? (
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
            <div
              className="rprog-bar-fill"
              data-indeterminate={isIndeterminate ? "true" : undefined}
              data-animated={animated ? "true" : undefined}
              style={isIndeterminate ? undefined : { width: `${percent}%` }}
            />
          )}
        </div>
      </div>
    );
  },
);
