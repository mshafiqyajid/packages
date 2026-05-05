import { type ReactNode, forwardRef, useId } from "react";
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
  /** Error text — flips tone to danger and sets aria-invalid + data-invalid. */
  error?: ReactNode;
  /** Force the invalid state without inline error text. */
  invalid?: boolean;
  /** Mark as required for form submission. */
  required?: boolean;
  /** Form name. When set, a hidden input carries the current numeric value. */
  name?: string;
  /** Override the wrapper id (used for label association). */
  id?: string;
}

export const RatingStyled = forwardRef<HTMLDivElement, RatingStyledProps>(
  function RatingStyled(
    {
      size = "md",
      tone: toneProp = "warning",
      showValue = false,
      formatValue,
      label,
      hint,
      error,
      invalid: invalidProp,
      required,
      name,
      id: idProp,
      icon,
      className,
      ...rest
    },
    ref,
  ) {
    const autoId = useId();
    const baseId = idProp ?? autoId;
    const labelId = `${baseId}-label`;
    const hintId = hint ? `${baseId}-hint` : undefined;
    const errorId = error ? `${baseId}-error` : undefined;
    const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

    const isInvalid = Boolean(error) || invalidProp === true;
    const tone: RatingTone = isInvalid ? "danger" : toneProp;

    const wrapperClass = ["rrt-wrap", className].filter(Boolean).join(" ");
    const display =
      formatValue ?? ((v: number) => v.toFixed(rest.allowHalf === false ? 0 : 1));
    const valueForDisplay =
      rest.value !== undefined ? rest.value : rest.defaultValue ?? 0;

    return (
      <div
        className={wrapperClass}
        id={baseId}
        data-invalid={isInvalid ? "true" : undefined}
      >
        {label ? (
          <span className="rrt-label" id={labelId}>
            {label}
          </span>
        ) : null}
        <div className="rrt-row">
          <Rating
            ref={ref}
            data-size={size}
            data-tone={tone}
            data-invalid={isInvalid ? "true" : undefined}
            aria-invalid={isInvalid ? true : undefined}
            aria-required={required ? true : undefined}
            aria-labelledby={label ? labelId : undefined}
            aria-describedby={describedBy}
            icon={icon}
            {...rest}
          />
          {showValue ? (
            <span className="rrt-value">
              {display(valueForDisplay, rest.count ?? 5)}
            </span>
          ) : null}
        </div>
        {name ? (
          <input
            type="hidden"
            name={name}
            value={String(valueForDisplay)}
            required={required}
            readOnly
          />
        ) : null}
        {error ? (
          <span className="rrt-error" id={errorId} role="alert">
            {error}
          </span>
        ) : hint ? (
          <span className="rrt-hint" id={hintId}>
            {hint}
          </span>
        ) : null}
      </div>
    );
  },
);
