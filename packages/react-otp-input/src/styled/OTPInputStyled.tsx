import { type ReactNode, forwardRef, useId, useState } from "react";
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
  /** Mark as invalid without showing inline error text. */
  invalid?: boolean;
  /** Mark every slot as required for form submission. */
  required?: boolean;
  /** Form name. When set, a hidden input carries the joined OTP value. */
  name?: string;
  /** Override the wrapper id (used for label association). */
  id?: string;
  style?: React.CSSProperties;
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
      invalid: invalidProp,
      required,
      name,
      id: idProp,
      className,
      style,
      onChange,
      ...rest
    },
    ref,
  ) {
    const autoId = useId();
    const baseId = idProp ?? autoId;
    const isInvalid = Boolean(error) || invalidProp === true;
    const effectiveTone: OTPTone = isInvalid ? "danger" : tone;
    const wrapperClassName = ["rotp-root", className].filter(Boolean).join(" ");
    const labelId = `${baseId}-label`;
    const hintId = `${baseId}-hint`;
    const errorId = `${baseId}-error`;
    const describedBy = error ? errorId : hint ? hintId : undefined;

    // Mirror the live value so the hidden input stays in sync (works in both
    // controlled and uncontrolled modes).
    const initialValue = rest.value ?? rest.defaultValue ?? "";
    const [liveValue, setLiveValue] = useState<string>(initialValue);

    const currentValue = rest.value !== undefined ? rest.value : liveValue;

    return (
      <div className={wrapperClassName} style={style} id={baseId} data-invalid={isInvalid ? "true" : undefined}>
        {label ? (
          <span className="rotp-label" id={labelId}>
            {label}
          </span>
        ) : null}
        <OTPInput
          ref={ref}
          {...rest}
          onChange={(next) => {
            setLiveValue(next);
            onChange?.(next);
          }}
          className="rotp-group"
          data-variant={variant}
          data-size={size}
          data-tone={effectiveTone}
          data-invalid={isInvalid ? "true" : undefined}
          aria-invalid={isInvalid ? true : undefined}
          aria-required={required ? true : undefined}
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
        {name ? (
          <input
            type="hidden"
            name={name}
            value={currentValue}
            required={required}
            readOnly
          />
        ) : null}
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
