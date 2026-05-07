import {
  forwardRef,
  useRef,
  useId,
  useEffect,
  useState,
  useCallback,
  type MouseEvent,
  type ReactNode,
  type KeyboardEvent as ReactKeyboardEvent,
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
  invalid?: boolean;
  required?: boolean;
  readOnly?: boolean;
  tagVariant?: TagVariant;
  tagTone?: TagInputTone;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  name?: string;
  autoFocus?: boolean;
  renderTag?: (tag: string, index: number, onRemove: () => void) => ReactNode;
  /** @deprecated Use `reorderable` instead. */
  sortable?: boolean;
  /** When true, tags are draggable and can be reordered. Fires `onChange` on drop. */
  reorderable?: boolean;
  /** Derive a CSS color from each tag (e.g. category-based or hash-based) and apply as the chip background. */
  colorize?: (tag: string) => string;
  /** Render extra actions inside each tag chip (rename, link, etc). */
  tagActions?: (tag: string, index: number) => ReactNode;
  /** When set, fires with the new tag order after a drag-reorder commits. */
  onReorder?: (tags: string[]) => void;
  /** Text rendered while async `loadOptions` is in flight. Default: "Loading…" */
  loadingText?: ReactNode;
  /**
   * Async suggestions loader. When set, replaces the static `suggestions` filter.
   * Debounced (default 300 ms), cancellable via AbortController.
   */
  loadSuggestions?: (query: string) => Promise<string[]>;
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
      maxLength,
      onTagAdd,
      onTagRemove,
      caseSensitive = false,
      size = "md",
      tone = "neutral",
      placeholder,
      label,
      hint,
      error: errorProp,
      invalid: invalidProp,
      required,
      readOnly = false,
      tagVariant = "solid",
      tagTone,
      className,
      style,
      id: idProp,
      name,
      autoFocus,
      renderTag,
      sortable = false,
      reorderable = false,
      colorize,
      tagActions,
      onReorder,
      loadingText = "Loading…",
      loadOptions,
      loadSuggestions,
      debounceMs,
      spreadsheetPaste,
    },
    ref,
  ) {
    const autoId = useId();
    const id = idProp ?? autoId;
    const inputId = `${id}-input`;
    const labelId = `${id}-label`;
    const listboxId = `${id}-listbox`;
    const hintId = `${id}-hint`;

    // `loadSuggestions` is the new API; `loadOptions` is the existing one.
    // Prefer loadSuggestions when both are supplied.
    const resolvedLoadOptions = loadSuggestions ?? loadOptions;

    const {
      tags,
      inputProps,
      addTag,
      removeTag,
      filteredSuggestions,
      activeIndex,
      validationError,
      isLoading,
      loadError,
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
      maxLength,
      onTagAdd,
      onTagRemove,
      caseSensitive,
      loadOptions: resolvedLoadOptions,
      debounceMs,
      spreadsheetPaste,
    });

    // Drag-to-reorder state (`reorderable` or legacy `sortable`)
    const isDraggable = reorderable || sortable;
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    // Edit-in-place state
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editingValue, setEditingValue] = useState<string>("");
    const editInputRef = useRef<HTMLInputElement>(null);

    // Tag add/remove animation tracking
    const [addingIndex, setAddingIndex] = useState<number | null>(null);
    const [removingIndex, setRemovingIndex] = useState<number | null>(null);
    const prevTagsLengthRef = useRef(tags.length);

    useEffect(() => {
      const prevLen = prevTagsLengthRef.current;
      if (tags.length > prevLen) {
        setAddingIndex(tags.length - 1);
        const t = setTimeout(() => setAddingIndex(null), 320);
        return () => clearTimeout(t);
      }
      prevTagsLengthRef.current = tags.length;
    }, [tags.length]);

    // Focus edit input when editing starts
    useEffect(() => {
      if (editingIndex !== null) {
        editInputRef.current?.focus();
        editInputRef.current?.select();
      }
    }, [editingIndex]);

    const commitEdit = useCallback(
      (index: number, newValue: string) => {
        const trimmed = newValue.trim();
        if (trimmed && trimmed !== tags[index]) {
          const next = [...tags];
          next[index] = trimmed;
          onChange?.(next);
        }
        setEditingIndex(null);
        setEditingValue("");
      },
      [tags, onChange],
    );

    const handleEditKeyDown = useCallback(
      (e: ReactKeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Enter") {
          e.preventDefault();
          commitEdit(index, editingValue);
        } else if (e.key === "Escape") {
          setEditingIndex(null);
          setEditingValue("");
        }
      },
      [commitEdit, editingValue],
    );

    const handleDoubleClick = useCallback(
      (tag: string, index: number) => {
        if (disabled || readOnly) return;
        setEditingIndex(index);
        setEditingValue(tag);
      },
      [disabled, readOnly],
    );

    const handleDrop = useCallback(
      (e: React.DragEvent, targetIndex: number) => {
        e.preventDefault();
        setDragOverIndex(null);
        if (dragIndex === null || dragIndex === targetIndex) {
          setDragIndex(null);
          return;
        }
        const next = [...tags];
        const [moved] = next.splice(dragIndex, 1);
        if (moved !== undefined) next.splice(targetIndex, 0, moved);
        onChange?.(next);
        onReorder?.(next);
        setDragIndex(null);
      },
      [dragIndex, tags, onChange, onReorder],
    );

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

    const showDropdown =
      filteredSuggestions.length > 0 || isLoading || loadError !== null;

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
    const isInvalid = Boolean(displayError) || invalidProp === true;

    const renderTagChip = (tag: string, i: number) => {
      const onRemove = () => {
        setRemovingIndex(i);
        setTimeout(() => {
          removeTag(i);
          setRemovingIndex(null);
        }, 200);
      };

      const isAdding = addingIndex === i;
      const isRemoving = removingIndex === i;
      const isEditing = editingIndex === i;

      const dragProps = isDraggable
        ? {
            draggable: true as const,
            onDragStart: () => setDragIndex(i),
            onDragOver: (e: React.DragEvent) => {
              e.preventDefault();
              setDragOverIndex(i);
            },
            onDragLeave: () => setDragOverIndex(null),
            onDrop: (e: React.DragEvent) => handleDrop(e, i),
          }
        : {};

      const dataAttrs: Record<string, string | undefined> = {
        "data-variant": tagVariant,
        "data-tone": resolvedTagTone,
        "data-colorized": colorize ? "true" : undefined,
        "data-sortable": isDraggable ? "true" : undefined,
        "data-drag-over": dragOverIndex === i ? "true" : undefined,
        "data-dragging": dragIndex === i ? "true" : undefined,
        "data-adding": isAdding ? "true" : undefined,
        "data-removing": isRemoving ? "true" : undefined,
        "data-editing": isEditing ? "true" : undefined,
      };

      if (renderTag) {
        return (
          <span
            key={i}
            {...dataAttrs}
            {...dragProps}
          >
            {renderTag(tag, i, onRemove)}
          </span>
        );
      }

      const colorStyle = colorize
        ? ({ background: colorize(tag) } as React.CSSProperties)
        : undefined;

      return (
        <span
          key={i}
          className={[
            "rti-tag",
            isDraggable && dragIndex === i ? "rti-tag--dragging" : "",
            dragOverIndex === i ? "rti-tag--drop-target" : "",
            isEditing ? "rti-tag--editing" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          {...dataAttrs}
          style={colorStyle}
          {...dragProps}
          onDoubleClick={() => handleDoubleClick(tag, i)}
        >
          {isEditing ? (
            <input
              ref={editInputRef}
              className="rti-tag-edit-input"
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              onKeyDown={(e) => handleEditKeyDown(e, i)}
              onBlur={() => commitEdit(i, editingValue)}
              onClick={(e) => e.stopPropagation()}
              size={Math.max(3, editingValue.length + 1)}
            />
          ) : (
            <span className="rti-tag-label">{tag}</span>
          )}
          {tagActions && (
            <span
              className="rti-tag-actions"
              onClick={(e) => e.stopPropagation()}
            >
              {tagActions(tag, i)}
            </span>
          )}
          {!disabled && !isEditing && (
            <button
              type="button"
              className="rti-tag-remove"
              aria-label={`Remove ${tag}`}
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              tabIndex={-1}
            >
              ×
            </button>
          )}
        </span>
      );
    };

    return (
      <div
        ref={ref}
        className={["rti-root", className].filter(Boolean).join(" ")}
        style={style}
        data-size={size}
        data-tone={tone}
        data-disabled={disabled ? "true" : undefined}
        data-readonly={readOnly ? "true" : undefined}
        data-invalid={isInvalid ? "true" : undefined}
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
          data-invalid={isInvalid ? "true" : undefined}
          data-error={isInvalid ? "true" : undefined}
          data-disabled={disabled ? "true" : undefined}
          data-readonly={readOnly ? "true" : undefined}
          onClick={handleWrapperClick}
          role="none"
        >
          {tags.map((tag, i) => renderTagChip(tag, i))}

          <input
            {...inputProps}
            ref={inputRef}
            id={inputId}
            className="rti-input"
            placeholder={tags.length === 0 ? placeholder : undefined}
            readOnly={readOnly}
            autoFocus={autoFocus}
            aria-labelledby={label ? labelId : undefined}
            aria-controls={showDropdown ? listboxId : undefined}
            aria-invalid={isInvalid ? "true" : undefined}
            aria-required={required ? "true" : undefined}
            aria-describedby={
              [hintId, displayError ? `${id}-error` : undefined]
                .filter(Boolean)
                .join(" ") || undefined
            }
          />
        </div>

        {name &&
          tags.map((tag, i) => (
            <input
              key={`${name}-${i}`}
              type="hidden"
              name={name}
              value={tag}
              readOnly
            />
          ))}

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
              {isLoading && filteredSuggestions.length === 0 && (
                <li
                  className="rti-dropdown-item rti-dropdown-loading"
                  aria-disabled="true"
                >
                  <span className="rti-spinner" aria-hidden="true" />
                  {loadingText}
                </li>
              )}
              {loadError && filteredSuggestions.length === 0 && (
                <li
                  className="rti-dropdown-item rti-dropdown-error"
                  aria-disabled="true"
                >
                  {loadError.message}
                </li>
              )}
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
