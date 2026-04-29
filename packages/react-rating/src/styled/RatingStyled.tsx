import { type ReactNode, forwardRef } from "react";
import { Rating, type RatingProps } from "../Rating";

export type RatingSize = "sm" | "md" | "lg";
export type RatingTone = "neutral" | "primary" | "success" | "warning" | "danger";

export interface RatingStyledProps
  extends Omit<RatingProps, "children" | "renderIcon"> {
  size?: RatingSize;
  /** Color tone for the filled portion. Defaults to `"warning"` (golden star). */
  tone?: RatingTone;
  /** Show a numeric badge after the stars (e.g. "3.5"). Default: false. */
  showValue?: boolean;
  /** Override the value display formatter. */
  formatValue?: (value: number, count: number) => ReactNode;
  /** Label rendered before the stars. */
  label?: ReactNode;
  /** Hint text below. */
  hint?: ReactNode;
}

export const RatingStyled = forwardRef<HTMLDivElement, RatingStyledProps>(
  function RatingStyled(
    {
      size = "md",
      tone = "warning",
      showValue = false,
      formatValue,
      label,
      hint,
      icon,
      className,
      ...rest
    },
    ref,
  ) {
    const wrapperClass = ["rrt-wrap", className].filter(Boolean).join(" ");
    const display =
      formatValue ?? ((v: number) => v.toFixed(rest.allowHalf === false ? 0 : 1));
    const valueForDisplay =
      rest.value !== undefined ? rest.value : rest.defaultValue ?? 0;

    return (
      <div className={wrapperClass}>
        {label ? <span className="rrt-label">{label}</span> : null}
        <div className="rrt-row">
          <Rating
            ref={ref}
            data-size={size}
            data-tone={tone}
            icon={icon}
            {...rest}
          />
          {showValue ? (
            <span className="rrt-value">
              {display(valueForDisplay, rest.count ?? 5)}
            </span>
          ) : null}
        </div>
        {hint ? <span className="rrt-hint">{hint}</span> : null}
      </div>
    );
  },
);
