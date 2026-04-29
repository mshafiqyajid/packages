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
} from "react";
import { createPortal } from "react-dom";
import { useSelect } from "../useSelect";
import type { SelectItem } from "../useSelect";

export type SelectSize = "sm" | "md" | "lg";
export type SelectTone = "neutral" | "primary" | "success" | "danger";

export interface SelectStyledProps {
  items: SelectItem[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  multiple?: boolean;
  searchable?: boolean;
  size?: SelectSize;
  tone?: SelectTone;
  disabled?: boolean;
  clearable?: boolean;
  className?: string;
}

const GAP = 4;

function computeDropdownStyle(
  trigger: DOMRect,
  dropdownHeight: number,
): CSSProperties {
  const sx = window.scrollX;
  const sy = window.scrollY;
  const spaceBelow = window.innerHeight - trigger.bottom;
  const spaceAbove = trigger.top;
  const placedAbove = spaceBelow < dropdownHeight + GAP && spaceAbove > spaceBelow;

  return {
    position: "absolute",
    left: trigger.left + sx,
    width: trigger.width,
    zIndex: 9999,
    top: placedAbove
      ? trigger.top + sy - dropdownHeight - GAP
      : trigger.bottom + sy + GAP,
  };
}

export const SelectStyled = forwardRef<HTMLDivElement, SelectStyledProps>(
  function SelectStyled(
    {
      items,
      value,
      onChange,
      placeholder = "Select…",
      multiple = false,
      searchable = false,
      size = "md",
      tone = "neutral",
      disabled = false,
      clearable = false,
      className,
    },
    ref,
  ) {
    const [mounted, setMounted] = useState(false);
    const [dropdownStyle, setDropdownStyle] = useState<CSSProperties>({
      position: "absolute",
      top: -9999,
      left: -9999,
      width: 0,
    });

    const wrapperRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const searchId = useId();

    useEffect(() => {
      setMounted(true);
    }, []);

    const select = useSelect({ items, value, onChange, multiple, searchable });

    const updatePosition = useCallback(() => {
      if (!wrapperRef.current || !dropdownRef.current) return;
      const triggerRect = wrapperRef.current.getBoundingClientRect();
      const dropdownRect = dropdownRef.current.getBoundingClientRect();
      setDropdownStyle(computeDropdownStyle(triggerRect, dropdownRect.height || 240));
    }, []);

    useEffect(() => {
      if (!select.isOpen) return;
      // Position after paint so dropdown has real height
      requestAnimationFrame(() => updatePosition());
    }, [select.isOpen, updatePosition]);

    useEffect(() => {
      if (!select.isOpen) return;
      const onScroll = () => updatePosition();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      return () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      };
    }, [select.isOpen, updatePosition]);

    // Focus search input when dropdown opens
    useEffect(() => {
      if (select.isOpen && searchable) {
        requestAnimationFrame(() => searchRef.current?.focus());
      }
    }, [select.isOpen, searchable]);

    const handleClear = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(multiple ? [] : "");
      },
      [onChange, multiple],
    );

    const handleSearchKeyDown = useCallback(
      (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Escape") {
          e.preventDefault();
          // Delegate to trigger close logic
          select.triggerProps.onKeyDown(
            e as unknown as KeyboardEvent<HTMLButtonElement>,
          );
        } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          select.triggerProps.onKeyDown(
            e as unknown as KeyboardEvent<HTMLButtonElement>,
          );
        } else if (e.key === "Enter") {
          e.preventDefault();
          select.triggerProps.onKeyDown(
            e as unknown as KeyboardEvent<HTMLButtonElement>,
          );
        }
      },
      [select.triggerProps],
    );

    const selectedValues = Array.isArray(value) ? value : value ? [value] : [];
    const hasValue = selectedValues.length > 0;

    const triggerLabel = (() => {
      if (!hasValue) return null;
      if (multiple) return null; // chips rendered below
      return select.selectedItems[0]?.label ?? null;
    })();

    return (
      <div
        ref={(el) => {
          (wrapperRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
          if (typeof ref === "function") ref(el);
          else if (ref)
            (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
        }}
        className={["rsel-root", className].filter(Boolean).join(" ")}
        data-size={size}
        data-tone={tone}
        data-open={select.isOpen ? "true" : undefined}
        data-disabled={disabled ? "true" : undefined}
        data-multiple={multiple ? "true" : undefined}
      >
        <button
          {...select.triggerProps}
          className="rsel-trigger"
          disabled={disabled}
          type="button"
        >
          <span className="rsel-trigger-content">
            {multiple && hasValue ? (
              <span className="rsel-chips">
                {select.selectedItems.map((item) => (
                  <span key={item.value} className="rsel-chip">
                    <span className="rsel-chip-label">{item.label}</span>
                    <button
                      type="button"
                      className="rsel-chip-remove"
                      aria-label={`Remove ${item.label}`}
                      tabIndex={-1}
                      onClick={(e) => {
                        e.stopPropagation();
                        const next = selectedValues.filter(
                          (v) => v !== item.value,
                        );
                        onChange(next);
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </span>
            ) : triggerLabel ? (
              <span className="rsel-value">{triggerLabel}</span>
            ) : (
              <span className="rsel-placeholder">{placeholder}</span>
            )}
          </span>
          <span className="rsel-actions">
            {clearable && hasValue && (
              <span
                role="button"
                aria-label="Clear selection"
                className="rsel-clear"
                tabIndex={-1}
                onClick={handleClear}
              >
                ×
              </span>
            )}
            <span className="rsel-arrow" aria-hidden="true">
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="rsel-arrow-icon"
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

        {mounted &&
          createPortal(
            <div
              ref={dropdownRef}
              className="rsel-dropdown"
              data-open={select.isOpen ? "true" : undefined}
              data-size={size}
              data-tone={tone}
              style={dropdownStyle}
            >
              {searchable && (
                <div className="rsel-search-wrapper">
                  <input
                    ref={searchRef}
                    id={searchId}
                    type="text"
                    className="rsel-search"
                    placeholder="Search…"
                    value={select.searchValue}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      select.setSearchValue(e.target.value)
                    }
                    onKeyDown={handleSearchKeyDown}
                    aria-label="Search options"
                    autoComplete="off"
                  />
                </div>
              )}
              <ul
                {...select.listboxProps}
                className="rsel-listbox"
              >
                {select.filteredItems.length === 0 ? (
                  <li className="rsel-empty" role="option" aria-disabled="true">
                    No options
                  </li>
                ) : (
                  select.filteredItems.map((item) => {
                    const itemProps = select.getItemProps(item);
                    return (
                      <li
                        key={item.value}
                        {...itemProps}
                        className="rsel-item"
                        data-selected={itemProps["aria-selected"] ? "true" : undefined}
                        data-disabled={item.disabled ? "true" : undefined}
                        data-focused={itemProps["data-focused"] ? "true" : undefined}
                      >
                        {multiple && (
                          <span className="rsel-item-check" aria-hidden="true">
                            {itemProps["aria-selected"] ? "✓" : ""}
                          </span>
                        )}
                        <span className="rsel-item-label">{item.label}</span>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>,
            document.body,
          )}
      </div>
    );
  },
);
