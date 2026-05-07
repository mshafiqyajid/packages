import {
  forwardRef,
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { useTextInput, type TextInputType } from "../useTextInput";

export type TextInputSize = "sm" | "md" | "lg";
export type TextInputTone = "neutral" | "primary" | "success" | "danger";

export interface TextInputStyledProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "value" | "defaultValue" | "onChange" | "size" | "type" | "disabled" | "readOnly" | "prefix"
  > {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  type?: TextInputType;
  size?: TextInputSize;
  tone?: TextInputTone;
  disabled?: boolean;
  readOnly?: boolean;
  /** Render full-width within the parent track. */
  block?: boolean;
  /** Show a clear (✕) button when there is content. */
  clearable?: boolean;
  /** Show a spinner suffix while async work is in flight. */
  loading?: boolean;
  /** When true, applies the success tone and shows a green check suffix. */
  success?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
  className?: string;
  /** Extra className for the inner <input>. */
  inputClassName?: string;
  /** Label rendered above the field. */
  label?: ReactNode;
  /** Add a red asterisk to the label. */
  required?: boolean;
  /** Hint shown below the input. */
  hint?: ReactNode;
  /** Error message — shown below; sets tone="danger" automatically. */
  error?: ReactNode;
  /** When type="password", show an eye toggle that flips between password and text. */
  passwordToggle?: boolean;
  /** Show a character counter (auto-enabled when maxLength is set). */
  showCount?: boolean;
}

export const TextInputStyled = forwardRef<HTMLInputElement, TextInputStyledProps>(
  function TextInputStyled(
    {
      value,
      defaultValue,
      onChange,
      type = "text",
      size = "md",
      tone = "neutral",
      disabled = false,
      readOnly = false,
      block = false,
      clearable = false,
      loading = false,
      success = false,
      prefix,
      suffix,
      className,
      inputClassName,
      label,
      required = false,
      hint,
      error,
      passwordToggle = false,
      showCount,
      maxLength,
      ...rest
    },
    ref,
  ) {
    const labelId = useId();
    const hintId = useId();
    const errId = useId();
    const [reveal, setReveal] = useState(false);

    const effectiveType: TextInputType = type === "password" && passwordToggle && reveal ? "text" : type;

    const { inputProps, isEmpty, clear, value: current } = useTextInput({
      value,
      defaultValue,
      onChange,
      disabled,
      readOnly,
      type: effectiveType,
    });

    const effectiveTone: TextInputTone = error ? "danger" : success ? "success" : tone;
    const rootClass = ["rtxt-root", className].filter(Boolean).join(" ");
    const wrapClass = ["rtxt-wrap", inputClassName].filter(Boolean).join(" ");
    const wantsCounter = showCount === true || (showCount !== false && typeof maxLength === "number");
    const length = current.length;

    return (
      <span
        className={rootClass}
        data-size={size}
        data-tone={effectiveTone}
        data-disabled={disabled ? "true" : undefined}
        data-block={block ? "true" : undefined}
      >
        {label && (
          <label className="rtxt-label" id={labelId} htmlFor={(rest as { id?: string }).id}>
            {label}
            {required && <span className="rtxt-required" aria-hidden="true"> *</span>}
          </label>
        )}
        <span className={wrapClass}>
          {prefix && <span className="rtxt-affix rtxt-affix--prefix">{prefix}</span>}
          <input
            {...rest}
            {...inputProps}
            ref={ref}
            maxLength={maxLength}
            aria-labelledby={label ? labelId : undefined}
            aria-describedby={error ? errId : hint ? hintId : undefined}
            aria-required={required || undefined}
            aria-invalid={error ? true : undefined}
            className="rtxt-input"
          />
          {loading && <span className="rtxt-spinner" aria-hidden="true" />}
          {success && !loading && (
            <span className="rtxt-check" aria-hidden="true">
              <svg viewBox="0 0 12 12" width="12" height="12">
                <path d="M2.5 6.5l2.3 2.3L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </span>
          )}
          {clearable && !isEmpty && !disabled && !readOnly && !loading && (
            <button
              type="button"
              className="rtxt-clear"
              aria-label="Clear"
              onClick={clear}
              tabIndex={-1}
            >
              <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true">
                <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
          {type === "password" && passwordToggle && !disabled && (
            <button
              type="button"
              className="rtxt-reveal"
              aria-label={reveal ? "Hide password" : "Show password"}
              aria-pressed={reveal}
              onClick={() => setReveal((r) => !r)}
              tabIndex={-1}
            >
              {reveal ? (
                <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M2 2l12 12" />
                  <path d="M6.5 6.5a2 2 0 0 0 2.83 2.83" />
                  <path d="M14 8c-1.5 2.5-3.5 4-6 4-1 0-1.93-.24-2.78-.66M3.5 5.5C2.6 6.3 1.7 7.27 1 8c1.5 2.5 3.5 4 6 4 .9 0 1.74-.2 2.5-.55" />
                </svg>
              ) : (
                <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" />
                  <circle cx="8" cy="8" r="2" />
                </svg>
              )}
            </button>
          )}
          {suffix && <span className="rtxt-affix rtxt-affix--suffix">{suffix}</span>}
        </span>
        <span className="rtxt-meta">
          {(hint || error) && (
            <span
              id={error ? errId : hintId}
              className={error ? "rtxt-message rtxt-message--error" : "rtxt-message"}
              role={error ? "alert" : undefined}
            >
              {error ?? hint}
            </span>
          )}
          {wantsCounter && (
            <span className="rtxt-count" aria-live="polite">
              {length}{typeof maxLength === "number" ? ` / ${maxLength}` : ""}
            </span>
          )}
        </span>
      </span>
    );
  },
);
