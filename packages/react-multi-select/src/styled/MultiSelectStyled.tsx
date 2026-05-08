import {
  forwardRef,
  useRef,
  useState,
  useEffect,
  useCallback,
  useId,
  type CSSProperties,
  type KeyboardEvent,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useMultiSelect } from "../useMultiSelect";
import type { MultiSelectOption } from "../useMultiSelect";

export type MultiSelectSize = "sm" | "md" | "lg";
export type MultiSelectTone = "neutral" | "primary" | "success" | "danger";
export type MultiSelectPlacement = "auto" | "top" | "bottom";
export type MultiSelectTriggerMode = "chips" | "count" | "auto";

export interface MultiSelectStyledProps {
  options: MultiSelectOption[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyText?: string;
  showSelectAll?: boolean;
  maxSelected?: number;
  clearable?: boolean;
  triggerMode?: MultiSelectTriggerMode;
  maxChips?: number;
  size?: MultiSelectSize;
  tone?: MultiSelectTone;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  label?: string;
  hint?: string;
  error?: string;
  placement?: MultiSelectPlacement;
  renderOption?: (
    option: MultiSelectOption,
    state: { selected: boolean; focused: boolean },
  ) => ReactNode;
  renderTrigger?: (selected: MultiSelectOption[]) => ReactNode;
  className?: string;
  style?: CSSProperties;
}

interface DropdownPosition {
  top: number;
  left: number;
  width: number;
  placement: "top" | "bottom";
}

function computePosition(
  triggerRect: DOMRect,
  dropdownHeight: number,
  placement: MultiSelectPlacement,
  offset: number,
): DropdownPosition {
  const spaceBelow = window.innerHeight - triggerRect.bottom - 8;
  const spaceAbove = triggerRect.top - 8;

  let placedAbove: boolean;
  if (placement === "top") {
    placedAbove = true;
  } else if (placement === "bottom") {
    placedAbove = false;
  } else {
    placedAbove =
      spaceBelow < dropdownHeight + offset && spaceAbove > spaceBelow;
  }

  return {
    top: placedAbove
      ? triggerRect.top + window.scrollY - dropdownHeight - offset
      : triggerRect.bottom + window.scrollY + offset,
    left: triggerRect.left + window.scrollX,
    width: triggerRect.width,
    placement: placedAbove ? "top" : "bottom",
  };
}

export const MultiSelectStyled = forwardRef<
  HTMLButtonElement,
  MultiSelectStyledProps
>(function MultiSelectStyled(
  {
    options,
    value,
    defaultValue,
    onChange,
    placeholder = "Select options…",
    searchable = true,
    searchPlaceholder = "Search…",
    emptyText = "No results.",
    showSelectAll = true,
    maxSelected,
    clearable = true,
    triggerMode = "auto",
    maxChips = 3,
    size = "md",
    tone = "neutral",
    disabled = false,
    required = false,
    invalid = false,
    label,
    hint,
    error,
    placement = "auto",
    renderOption,
    renderTrigger,
    className,
    style,
  },
  ref,
) {
  const [mounted, setMounted] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<DropdownPosition>({
    top: -9999,
    left: -9999,
    width: 0,
    placement: "bottom",
  });

  const wrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const searchId = useId();
  const labelId = useId();
  const errorId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  const multiSelect = useMultiSelect({
    options,
    value,
    defaultValue,
    onChange,
    searchable,
    maxSelected,
  });

  const updatePosition = useCallback(() => {
    if (!wrapperRef.current || !dropdownRef.current) return;
    const triggerRect = wrapperRef.current.getBoundingClientRect();
    const dropdownHeight = dropdownRef.current.getBoundingClientRect().height || 280;
    const pos = computePosition(triggerRect, dropdownHeight, placement, 4);
    setDropdownPos(pos);
  }, [placement]);

  useEffect(() => {
    if (!multiSelect.isOpen) return;
    requestAnimationFrame(() => updatePosition());
  }, [multiSelect.isOpen, updatePosition]);

  useEffect(() => {
    if (!multiSelect.isOpen) return;
    const onScroll = () => updatePosition();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [multiSelect.isOpen, updatePosition]);

  useEffect(() => {
    if (multiSelect.isOpen && searchable) {
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [multiSelect.isOpen, searchable]);

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      multiSelect.clearAll();
    },
    [multiSelect],
  );

  const handleSearchKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (
        e.key === "Escape" ||
        e.key === "ArrowDown" ||
        e.key === "ArrowUp" ||
        e.key === "Enter"
      ) {
        e.preventDefault();
        multiSelect.triggerProps.onKeyDown(
          e as unknown as KeyboardEvent<HTMLButtonElement>,
        );
      }
    },
    [multiSelect.triggerProps],
  );

  const { selectedOptions, selectedValues } = multiSelect;
  const hasValue = selectedValues.length > 0;

  const showAsCount =
    triggerMode === "count" ||
    (triggerMode === "auto" && selectedValues.length > maxChips);

  const triggerContent = (() => {
    if (renderTrigger) return renderTrigger(selectedOptions);
    if (!hasValue) {
      return <span className="rmsel-placeholder">{placeholder}</span>;
    }
    if (showAsCount) {
      return (
        <span className="rmsel-count-badge">
          {selectedValues.length} selected
        </span>
      );
    }
    const visibleChips =
      triggerMode === "chips" ? selectedOptions : selectedOptions.slice(0, maxChips);
    return (
      <span className="rmsel-chips">
        {visibleChips.map((opt) => (
          <span key={opt.value} className="rmsel-chip" data-entering="true">
            <span className="rmsel-chip-label">{opt.label}</span>
            {!disabled && (
              <button
                type="button"
                className="rmsel-chip-remove"
                aria-label={`Remove ${opt.label}`}
                tabIndex={-1}
                onClick={(e) => {
                  e.stopPropagation();
                  multiSelect.toggleOption(opt.value);
                }}
              >
                <svg
                  width="8"
                  height="8"
                  viewBox="0 0 8 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M1 1L7 7M7 1L1 7"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}
          </span>
        ))}
      </span>
    );
  })();

  const groupedOptions = (() => {
    const groups: Map<string, MultiSelectOption[]> = new Map();
    const ungrouped: MultiSelectOption[] = [];
    for (const opt of multiSelect.filteredOptions) {
      if (opt.group) {
        const existing = groups.get(opt.group) ?? [];
        existing.push(opt);
        groups.set(opt.group, existing);
      } else {
        ungrouped.push(opt);
      }
    }
    return { groups, ungrouped };
  })();

  const hasGroups = groupedOptions.groups.size > 0;

  const renderOptionItem = (opt: MultiSelectOption) => {
    const optProps = multiSelect.getOptionProps(opt);
    const isSelected = optProps["aria-selected"];
    const isFocused = optProps["data-focused"];
    return (
      <li
        key={opt.value}
        {...optProps}
        className="rmsel-option"
        data-selected={isSelected ? "true" : undefined}
        data-focused={isFocused ? "true" : undefined}
        data-disabled={opt.disabled ? "true" : undefined}
      >
        {renderOption ? (
          renderOption(opt, { selected: isSelected, focused: isFocused })
        ) : (
          <>
            <span className="rmsel-option-checkbox" aria-hidden="true">
              {isSelected && (
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1.5 5L4 7.5L8.5 2.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
            <span className="rmsel-option-label">{opt.label}</span>
          </>
        )}
      </li>
    );
  };

  const renderListContent = () => {
    if (multiSelect.filteredOptions.length === 0) {
      return (
        <li className="rmsel-empty" role="option" aria-disabled="true">
          {emptyText}
        </li>
      );
    }

    if (hasGroups) {
      return (
        <>
          {groupedOptions.ungrouped.map((opt) => renderOptionItem(opt))}
          {Array.from(groupedOptions.groups.entries()).map(([group, opts]) => (
            <li key={group} className="rmsel-group" role="presentation">
              <div className="rmsel-group-label">{group}</div>
              <ul
                role="group"
                aria-label={group}
                className="rmsel-group-list"
              >
                {opts.map((opt) => renderOptionItem(opt))}
              </ul>
            </li>
          ))}
        </>
      );
    }

    return multiSelect.filteredOptions.map((opt) => renderOptionItem(opt));
  };

  const enabledOptions = options.filter((o) => !o.disabled);
  const selectAllCheckedState = multiSelect.isAllSelected
    ? "true"
    : multiSelect.isIndeterminate
      ? "mixed"
      : "false";

  const dropdownStyle: CSSProperties = {
    position: "fixed",
    top: dropdownPos.top,
    left: dropdownPos.left,
    width: dropdownPos.width,
    zIndex: 9999,
  };

  const hasError = !!(error || invalid);
  const errorMessageId = hasError ? errorId : undefined;

  return (
    <div
      ref={wrapperRef}
      className={["rmsel-root", className].filter(Boolean).join(" ")}
      style={style}
      data-size={size}
      data-tone={tone}
      data-open={multiSelect.isOpen ? "true" : undefined}
      data-disabled={disabled ? "true" : undefined}
      data-invalid={hasError ? "true" : undefined}
    >
      {label && (
        <label id={labelId} className="rmsel-label" htmlFor={multiSelect.triggerProps.id}>
          {label}
          {required && (
            <span className="rmsel-required" aria-hidden="true">
              {" "}*
            </span>
          )}
        </label>
      )}

      <button
        {...multiSelect.triggerProps}
        ref={(el) => {
          (multiSelect.triggerProps.ref as React.MutableRefObject<HTMLButtonElement | null>).current = el;
          if (typeof ref === "function") ref(el);
          else if (ref)
            (ref as React.MutableRefObject<HTMLButtonElement | null>).current = el;
        }}
        className="rmsel-trigger"
        disabled={disabled}
        type="button"
        aria-required={required ? true : undefined}
        aria-invalid={hasError ? true : undefined}
        aria-describedby={errorMessageId}
        aria-labelledby={label ? labelId : undefined}
      >
        <span className="rmsel-trigger-content">{triggerContent}</span>
        <span className="rmsel-actions">
          {clearable && hasValue && !disabled && (
            <span
              role="button"
              aria-label="Clear all selections"
              className="rmsel-clear"
              tabIndex={-1}
              onClick={handleClear}
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M1 1L9 9M9 1L1 9"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          )}
          <span className="rmsel-arrow" aria-hidden="true">
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="rmsel-arrow-icon"
            >
              <path
                d="M2 4L6 8L10 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </span>
      </button>

      {hint && !hasError && (
        <p className="rmsel-hint">{hint}</p>
      )}
      {hasError && error && (
        <p id={errorId} className="rmsel-error-msg" role="alert">
          {error}
        </p>
      )}

      {mounted &&
        createPortal(
          <div
            ref={dropdownRef}
            className="rmsel-dropdown"
            data-open={multiSelect.isOpen ? "true" : undefined}
            data-size={size}
            data-tone={tone}
            data-placement={dropdownPos.placement}
            style={dropdownStyle}
          >
            {searchable && (
              <div className="rmsel-search-wrapper">
                <input
                  ref={searchRef}
                  id={searchId}
                  type="text"
                  className="rmsel-search"
                  placeholder={searchPlaceholder}
                  value={multiSelect.searchValue}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    multiSelect.setSearchValue(e.target.value)
                  }
                  onKeyDown={handleSearchKeyDown}
                  aria-label="Search options"
                  autoComplete="off"
                />
              </div>
            )}
            <ul
              {...multiSelect.listboxProps}
              className="rmsel-listbox"
            >
              {showSelectAll && enabledOptions.length > 0 && !multiSelect.searchValue && (
                <li
                  role="option"
                  aria-checked={selectAllCheckedState}
                  className="rmsel-select-all"
                  data-all-selected={multiSelect.isAllSelected ? "true" : undefined}
                  data-indeterminate={multiSelect.isIndeterminate ? "true" : undefined}
                  onClick={() => {
                    if (multiSelect.isAllSelected) {
                      multiSelect.clearAll();
                    } else {
                      multiSelect.selectAll();
                    }
                  }}
                >
                  <span className="rmsel-option-checkbox rmsel-option-checkbox--all" aria-hidden="true">
                    {multiSelect.isAllSelected && (
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M1.5 5L4 7.5L8.5 2.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                    {multiSelect.isIndeterminate && (
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M2 5H8"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    )}
                  </span>
                  <span className="rmsel-option-label">Select all</span>
                </li>
              )}
              {renderListContent()}
            </ul>
          </div>,
          document.body,
        )}
    </div>
  );
});
