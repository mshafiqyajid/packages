import {
  forwardRef,
  useId,
  useRef,
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type FocusEventHandler,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useNumberInput, type UseNumberInputOptions } from "../useNumberInput";

export type NumberInputSize = "sm" | "md" | "lg";
export type NumberInputTone = "neutral" | "primary" | "success" | "danger";
export type NumberInputFormat = "decimal" | "currency" | "percent";

export interface NumberInputStyledProps extends UseNumberInputOptions {
  size?: NumberInputSize;
  tone?: NumberInputTone;
  format?: NumberInputFormat;
  currency?: string;
  locale?: string;
  placeholder?: string;
  label?: string;
  hint?: string;
  error?: string;
  invalid?: boolean;
  required?: boolean;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  name?: string;
  autoFocus?: boolean;
  showStepper?: boolean;
  prefix?: string;
  suffix?: string;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  onFocus?: FocusEventHandler<HTMLInputElement>;
  /**
   * When true the label becomes a drag handle: drag left to decrease, right
   * to increase by `step` per `scrubPixels` pixels.
   */
  scrubable?: boolean;
  /**
   * Pixels of horizontal drag needed to change by one `step`. Default 4.
   */
  scrubPixels?: number;
}

function formatValue(
  value: number | undefined,
  format: NumberInputFormat,
  locale: string,
  currency: string | undefined,
  precision: number | undefined,
): string {
  if (value === undefined) return "";

  if (format === "currency") {
    if (!currency) return value !== undefined ? String(value) : "";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: precision ?? 2,
      maximumFractionDigits: precision ?? 2,
    }).format(value);
  }

  if (format === "percent") {
    return new Intl.NumberFormat(locale, {
      style: "percent",
      minimumFractionDigits: precision ?? 0,
      maximumFractionDigits: precision ?? 0,
    }).format(value / 100);
  }

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: precision ?? 0,
    maximumFractionDigits: precision ?? precision ?? 20,
  }).format(value);
}

export const NumberInputStyled = forwardRef<
  HTMLInputElement,
  NumberInputStyledProps
>(function NumberInputStyled(
  {
    size = "md",
    tone = "neutral",
    format = "decimal",
    currency,
    locale = "en-US",
    placeholder,
    label,
    hint,
    error,
    invalid: invalidProp,
    required,
    className,
    style,
    id: idProp,
    name,
    autoFocus,
    value,
    defaultValue,
    onChange,
    min,
    max,
    step = 1,
    bigStep,
    largeStep,
    precision,
    disabled = false,
    readOnly = false,
    clampOnBlur,
    showStepper = true,
    prefix,
    suffix,
    onBlur: onBlurProp,
    onFocus: onFocusProp,
    repeat,
    scrubable = false,
    scrubPixels = 4,
  },
  ref,
) {
  const autoId = useId();
  const inputId = idProp ?? autoId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;

  const {
    inputProps,
    incrementProps,
    decrementProps,
    clampedValue,
    handleBlur: hookHandleBlur,
    stepDir,
    increment,
    decrement,
  } = useNumberInput({
    value,
    defaultValue,
    onChange,
    min,
    max,
    step,
    bigStep,
    largeStep,
    precision,
    disabled,
    readOnly,
    clampOnBlur,
    repeat,
  });

  const isFormatted = format !== "decimal";
  const displayValue = isFormatted
    ? formatValue(clampedValue, format, locale, currency, precision)
    : inputProps.value;

  const inputRef = useRef<HTMLInputElement>(null);
  const isFocused = useRef(false);

  const handleFocus = useCallback<FocusEventHandler<HTMLInputElement>>((e) => {
    isFocused.current = true;
    onFocusProp?.(e);
  }, [onFocusProp]);

  const handleBlur = useCallback<FocusEventHandler<HTMLInputElement>>((e) => {
    isFocused.current = false;
    hookHandleBlur();
    onBlurProp?.(e);
  }, [hookHandleBlur, onBlurProp]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      inputProps.onChange(e);
    },
    [inputProps],
  );

  const resolvedValue = isFormatted && !isFocused.current
    ? displayValue
    : inputProps.value;

  const hasError = Boolean(error);
  const isInvalid = hasError || invalidProp === true;
  const activeTone = isInvalid ? "danger" : tone;

  // Digit scroll animation direction — reset after animation plays
  const [animDir, setAnimDir] = useState<"up" | "down" | null>(null);
  const animTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (stepDir === null) return;
    if (animTimerRef.current) clearTimeout(animTimerRef.current);
    setAnimDir(stepDir);
    animTimerRef.current = setTimeout(() => setAnimDir(null), 200);
    return () => {
      if (animTimerRef.current) clearTimeout(animTimerRef.current);
    };
  }, [stepDir, clampedValue]);

  // Scrub — horizontal pointer drag on the label
  const scrubAccumRef = useRef<number>(0);
  const scrubActiveRef = useRef<boolean>(false);

  const handleLabelPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLLabelElement>) => {
      if (!scrubable || disabled || readOnly) return;
      e.preventDefault();
      scrubAccumRef.current = 0;
      scrubActiveRef.current = true;
      const el = e.currentTarget as HTMLLabelElement;
      if (typeof el.setPointerCapture === "function") {
        el.setPointerCapture(e.pointerId);
      }
    },
    [scrubable, disabled, readOnly],
  );

  const handleLabelPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLLabelElement>) => {
      if (!scrubActiveRef.current) return;
      scrubAccumRef.current += e.movementX;
      const steps = Math.trunc(scrubAccumRef.current / scrubPixels);
      if (steps !== 0) {
        scrubAccumRef.current -= steps * scrubPixels;
        if (steps > 0) {
          for (let i = 0; i < steps; i++) increment();
        } else {
          for (let i = 0; i < -steps; i++) decrement();
        }
      }
    },
    [scrubPixels, increment, decrement],
  );

  const handleLabelPointerUp = useCallback(
    (e: ReactPointerEvent<HTMLLabelElement>) => {
      if (!scrubActiveRef.current) return;
      scrubActiveRef.current = false;
      scrubAccumRef.current = 0;
      const el = e.currentTarget as HTMLLabelElement;
      if (typeof el.releasePointerCapture === "function") {
        el.releasePointerCapture(e.pointerId);
      }
    },
    [],
  );

  return (
    <div
      className={[
        "rni-root",
        `rni-root--${size}`,
        disabled ? "rni-root--disabled" : "",
        readOnly ? "rni-root--readonly" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      data-tone={activeTone}
      data-size={size}
      data-disabled={disabled ? "true" : undefined}
      data-readonly={readOnly ? "true" : undefined}
      data-invalid={isInvalid ? "true" : undefined}
    >
      {label && (
        <label
          htmlFor={inputId}
          className={["rni-label", scrubable ? "rni-label--scrubable" : ""].filter(Boolean).join(" ")}
          onPointerDown={scrubable ? handleLabelPointerDown : undefined}
          onPointerMove={scrubable ? handleLabelPointerMove : undefined}
          onPointerUp={scrubable ? handleLabelPointerUp : undefined}
          onPointerCancel={scrubable ? handleLabelPointerUp : undefined}
        >
          {label}
        </label>
      )}

      <div className="rni-control" data-dir={animDir ?? undefined}>
        {showStepper !== false && (
          <button
            type="button"
            className="rni-btn rni-btn--decrement"
            {...decrementProps}
            aria-label="Decrement"
          >
            <span aria-hidden="true">−</span>
          </button>
        )}

        {prefix && (
          <span className="rni-adornment rni-adornment--prefix" aria-hidden="true">
            {prefix}
          </span>
        )}

        <input
          ref={(el) => {
            (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
            if (typeof ref === "function") ref(el);
            else if (ref)
              (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
          }}
          id={inputId}
          name={name}
          type="text"
          required={required}
          autoFocus={autoFocus}
          className="rni-input"
          placeholder={placeholder}
          {...inputProps}
          value={resolvedValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          aria-describedby={
            [hint ? hintId : "", error ? errorId : ""]
              .filter(Boolean)
              .join(" ") || undefined
          }
          aria-invalid={isInvalid ? "true" : undefined}
          aria-required={required ? "true" : undefined}
        />

        {suffix && (
          <span className="rni-adornment rni-adornment--suffix" aria-hidden="true">
            {suffix}
          </span>
        )}

        {showStepper !== false && (
          <button
            type="button"
            className="rni-btn rni-btn--increment"
            {...incrementProps}
            aria-label="Increment"
          >
            <span aria-hidden="true">+</span>
          </button>
        )}
      </div>

      {hint && !error && (
        <span id={hintId} className="rni-hint">
          {hint}
        </span>
      )}
      {error && (
        <span id={errorId} className="rni-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
});
