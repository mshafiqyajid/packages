import { type ReactNode, forwardRef, useId, useRef, useState } from "react";
import { OTPInput, type OTPInputProps } from "../OTPInput";

export type OTPVariant = "solid" | "outline" | "underline";
export type OTPSize = "sm" | "md" | "lg";
export type OTPTone = "neutral" | "primary" | "success" | "danger";
export type OTPMaskMode = "always" | "after-blur" | "after-complete";

export interface OTPInputStyledProps
  extends Omit<OTPInputProps, "renderSlot" | "children" | "inputProps"> {
  variant?: OTPVariant;
  size?: OTPSize;
  tone?: OTPTone;
  /**
   * Masking behaviour.
   * - `true` / `false` — legacy boolean (always mask / never mask).
   * - `"always"` — mask every filled cell at all times.
   * - `"after-blur"` — mask once the whole group loses focus.
   * - `"after-complete"` — mask once all cells are filled.
   * Default: no masking.
   */
  mask?: boolean | OTPMaskMode;
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

    const initialValue = rest.value ?? rest.defaultValue ?? "";
    const [liveValue, setLiveValue] = useState<string>(initialValue);
    const currentValue = rest.value !== undefined ? rest.value : liveValue;

    const length = rest.length ?? 6;
    const isComplete = currentValue.length === length;

    // Track whether the whole group has focus for after-blur masking.
    const [groupFocused, setGroupFocused] = useState(false);
    const focusCountRef = useRef(0);

    // Resolve mask mode to a boolean per-cell decision.
    function shouldMaskCell(char: string): boolean {
      if (!char) return false;
      if (mask === false || mask === undefined) return false;
      if (mask === true || mask === "always") return true;
      if (mask === "after-complete") return isComplete;
      if (mask === "after-blur") return !groupFocused;
      return false;
    }

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
            const masked = shouldMaskCell(slot.char);
            const display = masked ? maskChar : slot.char;
            const showSeparator =
              groupSize !== undefined &&
              slot.index > 0 &&
              slot.index % groupSize === 0;
            return (
              <>
                {showSeparator ? separator : null}
                <input
                  {...slot.inputProps}
                  className={["rotp-slot", masked ? "rotp-cell--masked" : ""].filter(Boolean).join(" ")}
                  data-active={slot.isActive ? "true" : undefined}
                  data-filled={slot.char ? "true" : undefined}
                  value={display}
                  onFocus={(e) => {
                    focusCountRef.current += 1;
                    setGroupFocused(true);
                    slot.inputProps.onFocus?.(e);
                  }}
                  onBlur={(e) => {
                    focusCountRef.current -= 1;
                    // Use a microtask so the next input's onFocus fires first
                    // before we decide the group lost focus.
                    queueMicrotask(() => {
                      if (focusCountRef.current === 0) setGroupFocused(false);
                    });
                    slot.inputProps.onBlur?.(e);
                  }}
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
