import {
  forwardRef,
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
  prefix?: ReactNode;
  suffix?: ReactNode;
  className?: string;
  /** Extra className for the inner <input>. */
  inputClassName?: string;
  /** Hint shown below the input. */
  hint?: ReactNode;
  /** Error message — shown below; sets tone="danger" automatically. */
  error?: ReactNode;
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
      prefix,
      suffix,
      className,
      inputClassName,
      hint,
      error,
      ...rest
    },
    ref,
  ) {
    const { inputProps, isEmpty, clear, value: current } = useTextInput({
      value,
      defaultValue,
      onChange,
      disabled,
      readOnly,
      type,
    });

    const effectiveTone: TextInputTone = error ? "danger" : tone;
    const rootClass = ["rti-root", className].filter(Boolean).join(" ");
    const wrapClass = ["rti-wrap", inputClassName].filter(Boolean).join(" ");

    return (
      <span
        className={rootClass}
        data-size={size}
        data-tone={effectiveTone}
        data-disabled={disabled ? "true" : undefined}
        data-block={block ? "true" : undefined}
      >
        <span className={wrapClass}>
          {prefix && <span className="rti-affix rti-affix--prefix">{prefix}</span>}
          <input
            {...rest}
            {...inputProps}
            ref={ref}
            className="rti-input"
          />
          {clearable && !isEmpty && !disabled && !readOnly && (
            <button
              type="button"
              className="rti-clear"
              aria-label="Clear"
              onClick={clear}
              tabIndex={-1}
            >
              <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true">
                <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
          {suffix && <span className="rti-affix rti-affix--suffix">{suffix}</span>}
        </span>
        {(hint || error) && (
          <span className={error ? "rti-message rti-message--error" : "rti-message"}>
            {error ?? hint}
          </span>
        )}
        {/* Keep the consumer's onChange aware of value with React's controlled API */}
        {/* current is reflected via inputProps.value */}
        <span hidden data-current={current} />
      </span>
    );
  },
);
