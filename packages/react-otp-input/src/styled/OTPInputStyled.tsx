import { type ReactNode, forwardRef, useId } from "react";
import { OTPInput, type OTPInputProps } from "../OTPInput";

export type OTPVariant = "solid" | "outline" | "underline";
export type OTPSize = "sm" | "md" | "lg";
export type OTPTone = "neutral" | "primary" | "success" | "danger";

export interface OTPInputStyledProps
  extends Omit<OTPInputProps, "renderSlot" | "children" | "inputProps"> {
  variant?: OTPVariant;
  size?: OTPSize;
  tone?: OTPTone;
  /** Mask each character (like a password). Default: false. */
  mask?: boolean;
  /** Visual character to show when masking. Default: "•". */
  maskChar?: string;
  /** Insert a separator after every N slots (e.g. 3 → "123-456"). */
  groupSize?: number;
  /** Element to render as separator when `groupSize` is set. */
  separator?: ReactNode;
  /** Label above the inputs. */
  label?: ReactNode;
  /** Helper / hint text below. */
  hint?: ReactNode;
  /** Error text — flips tone to danger and sets aria-invalid. */
  error?: ReactNode;
}

const DEFAULT_SEPARATOR = (
  <span className="rotp-sep" aria-hidden="true">
    –
  </span>
);

export const OTPInputStyled = forwardRef<HTMLDivElement, OTPInputStyledProps>(
  function OTPInputStyled(
    {
      variant = "solid",
      size = "md",
      tone = "neutral",
      mask = false,
      maskChar = "•",
      groupSize,
      separator = DEFAULT_SEPARATOR,
      label,
      hint,
      error,
      className,
      ...rest
    },
    ref,
  ) {
    const effectiveTone: OTPTone = error ? "danger" : tone;
    const wrapperClassName = ["rotp-root", className].filter(Boolean).join(" ");
    const labelId = useId();
    const hintId = useId();
    const errorId = useId();
    const describedBy = error ? errorId : hint ? hintId : undefined;

    return (
      <div className={wrapperClassName}>
        {label ? (
          <span className="rotp-label" id={labelId}>
            {label}
          </span>
        ) : null}
        <OTPInput
          ref={ref}
          {...rest}
          className="rotp-group"
          data-variant={variant}
          data-size={size}
          data-tone={effectiveTone}
          aria-invalid={error ? true : undefined}
          aria-labelledby={label ? labelId : undefined}
          aria-describedby={describedBy}
          renderSlot={(slot) => {
            const display = mask && slot.char !== "" ? maskChar : slot.char;
            const showSeparator =
              groupSize !== undefined &&
              slot.index > 0 &&
              slot.index % groupSize === 0;
            return (
              <>
                {showSeparator ? separator : null}
                <input
                  {...slot.inputProps}
                  className="rotp-slot"
                  data-active={slot.isActive ? "true" : undefined}
                  data-filled={slot.char ? "true" : undefined}
                  value={display}
                />
              </>
            );
          }}
        />
        {error ? (
          <p className="rotp-error" id={errorId} role="alert">
            {error}
          </p>
        ) : hint ? (
          <p className="rotp-hint" id={hintId}>
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);
