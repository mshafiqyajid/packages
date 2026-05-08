import {
  forwardRef,
  useId,
  useRef,
  useState,
  useLayoutEffect,
  useCallback,
  type CSSProperties,
} from "react";
import { useTextarea } from "../useTextarea";

export type TextareaSize = "sm" | "md" | "lg";
export type TextareaTone = "neutral" | "primary" | "success" | "danger";

export interface TextareaStyledProps {
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  rows?: number;
  minRows?: number;
  maxRows?: number;
  autoResize?: boolean;
  maxLength?: number;
  showCount?: boolean;
  countPosition?: "inside" | "outside";
  resize?: "none" | "vertical" | "horizontal" | "both";
  size?: TextareaSize;
  tone?: TextareaTone;
  label?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  id?: string;
  name?: string;
  autoFocus?: boolean;
  spellCheck?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const TextareaStyled = forwardRef<HTMLTextAreaElement, TextareaStyledProps>(
  function TextareaStyled(
    {
      value,
      defaultValue,
      onChange,
      onValueChange,
      placeholder,
      rows = 3,
      minRows = 2,
      maxRows = 10,
      autoResize = true,
      maxLength,
      showCount = false,
      countPosition = "outside",
      resize = "none",
      size = "md",
      tone = "neutral",
      label,
      hint,
      error,
      disabled = false,
      readOnly = false,
      required = false,
      invalid = false,
      id: idProp,
      name,
      autoFocus,
      spellCheck,
      className,
      style,
    },
    forwardedRef,
  ) {
    const generatedId = useId();
    const id = idProp ?? generatedId;
    const labelId = useId();
    const hintId = useId();
    const errId = useId();

    const [isFocused, setIsFocused] = useState(false);

    const internalRef = useRef<HTMLTextAreaElement>(null);
    const mirrorRef = useRef<HTMLDivElement>(null);

    // Merge forwardedRef with internalRef
    const setRef = useCallback(
      (node: HTMLTextAreaElement | null) => {
        (internalRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
        if (typeof forwardedRef === "function") {
          forwardedRef(node);
        } else if (forwardedRef) {
          (forwardedRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
        }
      },
      [forwardedRef],
    );

    const { textareaProps, charCount, isAtLimit, isOverLimit } = useTextarea({
      value,
      defaultValue,
      onChange,
      onValueChange,
      maxLength,
      disabled,
      readOnly,
      required,
      invalid: invalid || !!error,
      id,
      name,
    });

    const currentValue = textareaProps.value;
    const effectiveTone: TextareaTone = error ? "danger" : tone;

    // Auto-resize logic
    useLayoutEffect(() => {
      if (!autoResize) return;
      const textarea = internalRef.current;
      const mirror = mirrorRef.current;
      if (!textarea || !mirror) return;

      const computed = window.getComputedStyle(textarea);
      const lineHeight = parseFloat(computed.lineHeight) || parseFloat(computed.fontSize) * 1.5;
      const paddingTop = parseFloat(computed.paddingTop) || 0;
      const paddingBottom = parseFloat(computed.paddingBottom) || 0;
      const borderTop = parseFloat(computed.borderTopWidth) || 0;
      const borderBottom = parseFloat(computed.borderBottomWidth) || 0;

      const minHeight = minRows * lineHeight + paddingTop + paddingBottom + borderTop + borderBottom;
      const maxHeight = maxRows * lineHeight + paddingTop + paddingBottom + borderTop + borderBottom;

      // Mirror font/padding/width
      mirror.style.font = computed.font;
      mirror.style.padding = computed.padding;
      mirror.style.border = computed.border;
      mirror.style.width = `${textarea.offsetWidth}px`;
      mirror.style.boxSizing = computed.boxSizing;

      mirror.textContent = currentValue + "\n";

      const natural = mirror.scrollHeight;
      const clamped = Math.min(Math.max(natural, minHeight), maxHeight);

      textarea.style.height = `${clamped}px`;
      textarea.style.overflowY = natural > maxHeight ? "auto" : "hidden";
    }, [currentValue, minRows, maxRows, autoResize]);

    const rootClass = ["rtxa-root", className].filter(Boolean).join(" ");
    const describedBy = [
      error ? errId : hint ? hintId : null,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

    const resizeStyle: CSSProperties = {
      resize: autoResize ? "none" : resize,
    };

    return (
      <div
        className={rootClass}
        style={style}
        data-size={size}
        data-tone={effectiveTone}
        data-disabled={disabled ? "true" : undefined}
        data-readonly={readOnly ? "true" : undefined}
        data-invalid={invalid || !!error ? "true" : undefined}
        data-focused={isFocused ? "true" : undefined}
      >
        {label && (
          <label className="rtxa-label" id={labelId} htmlFor={id}>
            {label}
            {required && (
              <span className="rtxa-required" aria-hidden="true">
                {" "}*
              </span>
            )}
          </label>
        )}
        <div className="rtxa-control">
          <textarea
            {...textareaProps}
            ref={setRef}
            className="rtxa-textarea"
            placeholder={placeholder}
            rows={autoResize ? undefined : rows}
            autoFocus={autoFocus}
            spellCheck={spellCheck}
            style={resizeStyle}
            aria-labelledby={label ? labelId : undefined}
            aria-describedby={describedBy}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          {showCount && countPosition === "inside" && (
            <span
              className="rtxa-count rtxa-count--inside"
              data-over-limit={isOverLimit ? "true" : undefined}
              data-at-limit={isAtLimit && !isOverLimit ? "true" : undefined}
              aria-live="polite"
            >
              {charCount}
              {maxLength != null ? `/${maxLength}` : ""}
            </span>
          )}
          {autoResize && (
            <div
              className="rtxa-mirror"
              aria-hidden="true"
              ref={mirrorRef}
            />
          )}
        </div>
        {showCount && countPosition === "outside" && (
          <span
            className="rtxa-count rtxa-count--outside"
            data-over-limit={isOverLimit ? "true" : undefined}
            data-at-limit={isAtLimit && !isOverLimit ? "true" : undefined}
            aria-live="polite"
          >
            {charCount}
            {maxLength != null ? `/${maxLength}` : ""}
          </span>
        )}
        {(hint || error) && (
          <span
            id={error ? errId : hintId}
            className="rtxa-hint"
            data-error={error ? "true" : undefined}
            role={error ? "alert" : undefined}
          >
            {error ?? hint}
          </span>
        )}
      </div>
    );
  },
);
