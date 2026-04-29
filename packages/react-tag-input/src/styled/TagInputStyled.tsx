import {
  forwardRef,
  useRef,
  useId,
  useEffect,
  useState,
  useCallback,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { createPortal } from "react-dom";
import { useTagInput, type UseTagInputOptions } from "../useTagInput";

export type TagInputSize = "sm" | "md" | "lg";
export type TagInputTone = "neutral" | "primary" | "success" | "danger";
export type TagVariant = "solid" | "subtle" | "outline";

export interface TagInputStyledProps extends UseTagInputOptions {
  size?: TagInputSize;
  tone?: TagInputTone;
  placeholder?: string;
  label?: string;
  hint?: string;
  error?: string;
  tagVariant?: TagVariant;
  tagTone?: TagInputTone;
  className?: string;
}

export const TagInputStyled = forwardRef<HTMLDivElement, TagInputStyledProps>(
  function TagInputStyled(
    {
      value,
      defaultValue,
      onChange,
      suggestions = [],
      maxTags,
      allowDuplicates = false,
      disabled = false,
      delimiter = ["Enter", ","],
      validate,
      size = "md",
      tone = "neutral",
      placeholder,
      label,
      hint,
      error: errorProp,
      tagVariant = "solid",
      tagTone,
      className,
    },
    ref,
  ) {
    const id = useId();
    const inputId = `${id}-input`;
    const labelId = `${id}-label`;
    const listboxId = `${id}-listbox`;
    const hintId = `${id}-hint`;

    const {
      tags,
      inputProps,
      addTag,
      removeTag,
      filteredSuggestions,
      activeIndex,
      validationError,
    } = useTagInput({
      value,
      defaultValue,
      onChange,
      suggestions,
      maxTags,
      allowDuplicates,
      disabled,
      delimiter,
      validate,
    });

    const inputRef = useRef<HTMLInputElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const listboxRef = useRef<HTMLUListElement>(null);
    const [dropdownCoords, setDropdownCoords] = useState<{
      top: number;
      left: number;
      width: number;
    } | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    const updateCoords = useCallback(() => {
      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      setDropdownCoords({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }, []);

    const showDropdown = filteredSuggestions.length > 0;

    useEffect(() => {
      if (showDropdown) updateCoords();
    }, [showDropdown, updateCoords]);

    useEffect(() => {
      if (!showDropdown) return;
      const onScroll = () => updateCoords();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      return () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      };
    }, [showDropdown, updateCoords]);

    const handleSuggestionClick = (suggestion: string, e: MouseEvent) => {
      e.preventDefault();
      addTag(suggestion);
      inputRef.current?.focus();
    };

    const handleWrapperClick = () => {
      inputRef.current?.focus();
    };

    const resolvedTagTone = tagTone ?? tone;
    const displayError = errorProp ?? validationError;

    return (
      <div
        ref={ref}
        className={["rti-root", className].filter(Boolean).join(" ")}
        data-size={size}
        data-tone={tone}
        data-disabled={disabled ? "true" : undefined}
      >
        {label && (
          <label id={labelId} htmlFor={inputId} className="rti-label">
            {label}
          </label>
        )}

        <div
          ref={wrapperRef}
          className="rti-wrapper"
          data-size={size}
          data-tone={tone}
          data-error={displayError ? "true" : undefined}
          data-disabled={disabled ? "true" : undefined}
          onClick={handleWrapperClick}
          role="none"
        >
          {tags.map((tag, i) => (
            <span
              key={i}
              className="rti-tag"
              data-variant={tagVariant}
              data-tone={resolvedTagTone}
            >
              <span className="rti-tag-label">{tag}</span>
              {!disabled && (
                <button
                  type="button"
                  className="rti-tag-remove"
                  aria-label={`Remove ${tag}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTag(i);
                  }}
                  tabIndex={-1}
                >
                  ×
                </button>
              )}
            </span>
          ))}

          <input
            {...inputProps}
            ref={inputRef}
            id={inputId}
            className="rti-input"
            placeholder={tags.length === 0 ? placeholder : undefined}
            aria-labelledby={label ? labelId : undefined}
            aria-controls={showDropdown ? listboxId : undefined}
            aria-describedby={
              [hintId, displayError ? `${id}-error` : undefined]
                .filter(Boolean)
                .join(" ") || undefined
            }
          />
        </div>

        {hint && !displayError && (
          <span id={hintId} className="rti-hint">
            {hint}
          </span>
        )}

        {displayError && (
          <span id={`${id}-error`} className="rti-error" role="alert">
            {displayError}
          </span>
        )}

        {mounted &&
          showDropdown &&
          dropdownCoords &&
          createPortal(
            <ul
              ref={listboxRef}
              id={listboxId}
              role="listbox"
              className="rti-dropdown"
              style={{
                position: "absolute",
                top: dropdownCoords.top,
                left: dropdownCoords.left,
                width: dropdownCoords.width,
                zIndex: 9999,
              }}
            >
              {filteredSuggestions.map((suggestion, i) => (
                <li
                  key={suggestion}
                  id={`rti-suggestion-${i}`}
                  role="option"
                  className="rti-dropdown-item"
                  data-active={i === activeIndex ? "true" : undefined}
                  aria-selected={i === activeIndex}
                  onMouseDown={(e) => handleSuggestionClick(suggestion, e)}
                >
                  {suggestion}
                </li>
              ))}
            </ul>,
            document.body,
          )}
      </div>
    );
  },
);
