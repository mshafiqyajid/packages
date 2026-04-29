import { forwardRef, type HTMLAttributes } from "react";
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
      className,
      ...rest
    },
    ref,
  ) {
    const { progressProps, percent, isIndeterminate } = useProgress({ value, min, max });

    return (
      <div
        ref={ref}
        className={["rprog-bar-root", className].filter(Boolean).join(" ")}
        data-size={size}
        data-tone={tone}
        data-rounded={rounded ? "true" : undefined}
      >
        {(label || showValue) && (
          <div className="rprog-bar-header">
            {label && <span className="rprog-bar-label">{label}</span>}
            {showValue && !isIndeterminate && (
              <span className="rprog-bar-value">{percent}%</span>
            )}
          </div>
        )}
        <div
          {...progressProps}
          {...rest}
          aria-label={label}
          className="rprog-bar-track"
        >
          <div
            className="rprog-bar-fill"
            data-indeterminate={isIndeterminate ? "true" : undefined}
            data-animated={animated ? "true" : undefined}
            style={isIndeterminate ? undefined : { width: `${percent}%` }}
          />
        </div>
      </div>
    );
  },
);
