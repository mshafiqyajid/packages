import React, {
  forwardRef,
  useId,
  useRef,
  useCallback,
  type InputHTMLAttributes,
} from "react";
import { useInputMask, type FormatChars } from "../useInputMask";

export type InputMaskSize = "sm" | "md" | "lg";
export type InputMaskTone = "neutral" | "primary" | "success" | "danger";

export interface InputMaskStyledProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    | "value"
    | "defaultValue"
    | "onChange"
    | "size"
    | "disabled"
    | "readOnly"
    | "prefix"
  > {
  mask: string;
  maskChar?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, rawValue: string) => void;
  onAccept?: (value: string, rawValue: string) => void;
  onComplete?: (value: string, rawValue: string) => void;
  allowedChars?: RegExp;
  formatChars?: FormatChars;
  lazy?: boolean;
  showMask?: boolean;
  autoUnmask?: boolean;
  prefix?: string;
  suffix?: string;
  size?: InputMaskSize;
  tone?: InputMaskTone;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  label?: string;
  hint?: string;
  error?: string;
  className?: string;
}

export const InputMaskStyled = forwardRef<HTMLInputElement, InputMaskStyledProps>(
  function InputMaskStyled(
    {
      mask,
      maskChar,
      value,
      defaultValue,
      onChange,
      onAccept,
      onComplete,
      onFocus,
      onBlur,
      allowedChars,
      formatChars,
      lazy,
      showMask,
      autoUnmask,
      prefix,
      suffix,
      size = "md",
      tone = "neutral",
      disabled = false,
      readOnly = false,
      required = false,
      invalid = false,
      label,
      hint,
      error,
      className,
      placeholder,
      id,
      name,
      autoFocus,
      style,
      ...rest
    },
    forwardedRef,
  ) {
    const autoId = useId();
    const inputId = id ?? autoId;
    const hintId = useId();
    const errId = useId();

    // We need to forward both the user ref and the internal ref from the hook.
    const internalRef = useRef<HTMLInputElement | null>(null);

    const mergedRef = useCallback(
      (el: HTMLInputElement | null) => {
        internalRef.current = el;
        if (typeof forwardedRef === "function") {
          forwardedRef(el);
        } else if (forwardedRef) {
          (forwardedRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
        }
      },
      [forwardedRef],
    );

    const { inputProps, isFocused } = useInputMask({
      mask,
      maskChar,
      value,
      defaultValue,
      onChange,
      onAccept,
      onComplete,
      onFocus,
      onBlur,
      allowedChars,
      formatChars,
      lazy,
      showMask,
      autoUnmask,
      disabled,
      readOnly,
    });

    // Extract the ref from inputProps so we can merge it
    const { ref: hookRef, ...restInputProps } = inputProps as typeof inputProps & {
      ref?: (el: HTMLInputElement | null) => void;
    };

    const combinedRef = useCallback(
      (el: HTMLInputElement | null) => {
        hookRef?.(el);
        mergedRef(el);
      },
      [hookRef, mergedRef],
    );

    const effectiveTone: InputMaskTone = error ? "danger" : tone;
    const hasError = !!(error || invalid);

    const rootClass = ["rimsk-root", className].filter(Boolean).join(" ");

    return (
      <span
        className={rootClass}
        data-size={size}
        data-tone={effectiveTone}
        data-disabled={disabled ? "true" : undefined}
        data-readonly={readOnly ? "true" : undefined}
        data-invalid={hasError ? "true" : undefined}
        data-focused={isFocused ? "true" : undefined}
        data-has-prefix={prefix ? "true" : undefined}
        data-has-suffix={suffix ? "true" : undefined}
        data-lazy={lazy === false ? "false" : undefined}
        data-show-mask={showMask === false ? "false" : undefined}
        style={style}
      >
        {label && (
          <label className="rimsk-label" htmlFor={inputId}>
            {label}
            {required && (
              <span className="rimsk-required" aria-hidden="true">
                {" "}
                *
              </span>
            )}
          </label>
        )}
        <span className="rimsk-wrap">
          {prefix && (
            <span className="rimsk-prefix" aria-hidden="true">
              {prefix}
            </span>
          )}
          <input
            {...rest}
            {...restInputProps}
            ref={combinedRef}
            id={inputId}
            name={name}
            autoFocus={autoFocus}
            placeholder={placeholder}
            aria-required={required || undefined}
            aria-invalid={hasError || undefined}
            aria-describedby={
              error ? errId : hint ? hintId : undefined
            }
            className="rimsk-input"
          />
          {suffix && (
            <span className="rimsk-suffix" aria-hidden="true">
              {suffix}
            </span>
          )}
        </span>
        {(hint || error) && (
          <span
            id={error ? errId : hintId}
            className={
              error ? "rimsk-message rimsk-message--error" : "rimsk-message"
            }
            role={error ? "alert" : undefined}
          >
            {error ?? hint}
          </span>
        )}
      </span>
    );
  },
);
