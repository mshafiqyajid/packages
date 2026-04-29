import { forwardRef, useId, useRef, useCallback, type ChangeEvent } from "react";
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
  className?: string;
  id?: string;
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
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency ?? "USD",
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
    className,
    id: idProp,
    value,
    defaultValue,
    onChange,
    min,
    max,
    step = 1,
    precision,
    disabled = false,
    readOnly = false,
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
  } = useNumberInput({
    value,
    defaultValue,
    onChange,
    min,
    max,
    step,
    precision,
    disabled,
    readOnly,
  });

  const isFormatted = format !== "decimal";
  const displayValue = isFormatted
    ? formatValue(clampedValue, format, locale, currency, precision)
    : inputProps.value;

  const inputRef = useRef<HTMLInputElement>(null);
  const isFocused = useRef(false);

  const handleFocus = useCallback(() => {
    isFocused.current = true;
  }, []);

  const handleBlur = useCallback(() => {
    isFocused.current = false;
    inputProps.onBlur();
  }, [inputProps]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      inputProps.onChange(e);
    },
    [inputProps],
  );

  const resolvedValue = isFormatted && !isFocused.current
    ? displayValue
    : inputProps.value;

  const hasTone = tone !== "neutral";
  const hasError = Boolean(error);
  const activeTone = hasError ? "danger" : tone;

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
      data-tone={activeTone}
      data-size={size}
      data-disabled={disabled ? "true" : undefined}
      data-readonly={readOnly ? "true" : undefined}
      data-error={hasError ? "true" : undefined}
    >
      {label && (
        <label htmlFor={inputId} className="rni-label">
          {label}
        </label>
      )}

      <div className="rni-control">
        <button
          type="button"
          className="rni-btn rni-btn--decrement"
          {...decrementProps}
          aria-label="Decrement"
        >
          <span aria-hidden="true">−</span>
        </button>

        <input
          ref={(el) => {
            (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
            if (typeof ref === "function") ref(el);
            else if (ref)
              (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
          }}
          id={inputId}
          type="text"
          inputMode="decimal"
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
          aria-invalid={hasError ? "true" : undefined}
        />

        <button
          type="button"
          className="rni-btn rni-btn--increment"
          {...incrementProps}
          aria-label="Increment"
        >
          <span aria-hidden="true">+</span>
        </button>
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
