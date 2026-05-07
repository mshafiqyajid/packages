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
import { useSelect, isSelectGroup } from "../useSelect";
import type { SelectItem, SelectGroup, SelectItemOrGroup } from "../useSelect";

export type SelectSize = "sm" | "md" | "lg";
export type SelectTone = "neutral" | "primary" | "success" | "danger";
export type SelectPlacement = "auto" | "top" | "bottom";
export type SelectStrategy = "absolute" | "fixed";

export interface SelectStyledProps {
  /**
   * Flat array of items, or an array that mixes `SelectItem` and `SelectGroup`.
   * Groups must not be mixed with flat items in the same array — use one shape.
   */
  items: SelectItemOrGroup[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  multiple?: boolean;
  searchable?: boolean;
  /** Async loader. When set, listbox is populated by this promise (debounced + cancellable). */
  loadOptions?: (query: string) => Promise<SelectItem[]>;
  /** Debounce (ms) before `loadOptions` fires. Default: 300. */
  debounceMs?: number;
  /** Text shown while async results are loading. Default: "Loading..." */
  loadingText?: React.ReactNode;
  /** Text shown when an async load fails. Default: "Failed to load." */
  errorText?: React.ReactNode;
  /** Text shown when there are no matching options. Default: "No results." */
  emptyText?: React.ReactNode;
  size?: SelectSize;
  tone?: SelectTone;
  disabled?: boolean;
  clearable?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** "auto" picks bottom unless there isn't room. Default: "auto" */
  placement?: SelectPlacement;
  /** Gap in px between trigger and listbox. Default: 4 */
  offset?: number;
  /** Viewport edge padding when computing flip. Default: 8 */
  collisionPadding?: number;
  /** Auto-flip when there isn't room. Default: true */
  flip?: boolean;
  /** "absolute" or "fixed". Default: "absolute" */
  strategy?: SelectStrategy;
  /** Replace the option content (li shell and keyboard logic stay managed). */
  renderItem?: (
    item: SelectItem,
    state: { selected: boolean; active: boolean },
  ) => ReactNode;
  /** Replace the "No results" message. */
  renderEmpty?: () => ReactNode;
  /** Replace the trigger button content (not the button itself). */
  renderTrigger?: (
    selected: SelectItem | SelectItem[] | null,
    open: boolean,
  ) => ReactNode;
}

interface DropdownStyleOpts {
  trigger: DOMRect;
  dropdownHeight: number;
  placement: SelectPlacement;
  offset: number;
  collisionPadding: number;
  flip: boolean;
  strategy: SelectStrategy;
}

function computeDropdownStyle({
  trigger,
  dropdownHeight,
  placement,
  offset,
  collisionPadding,
  flip,
  strategy,
}: DropdownStyleOpts): CSSProperties & { dataPlacement: "top" | "bottom" } {
  const sx = strategy === "absolute" ? window.scrollX : 0;
  const sy = strategy === "absolute" ? window.scrollY : 0;
  const spaceBelow = window.innerHeight - trigger.bottom - collisionPadding;
  const spaceAbove = trigger.top - collisionPadding;

  let placedAbove: boolean;
  if (placement === "top") placedAbove = true;
  else if (placement === "bottom") placedAbove = false;
  else placedAbove = spaceBelow < dropdownHeight + offset && spaceAbove > spaceBelow;

  if (placement !== "auto" && flip) {
    if (placedAbove && spaceAbove < dropdownHeight + offset && spaceBelow > spaceAbove) {
      placedAbove = false;
    } else if (!placedAbove && spaceBelow < dropdownHeight + offset && spaceAbove > spaceBelow) {
      placedAbove = true;
    }
  }

  return {
    position: strategy,
    left: trigger.left + sx,
    width: trigger.width,
    zIndex: 9999,
    top: placedAbove
      ? trigger.top + sy - dropdownHeight - offset
      : trigger.bottom + sy + offset,
    dataPlacement: placedAbove ? "top" : "bottom",
  };
}

function flattenItems(itemsOrGroups: SelectItemOrGroup[]): SelectItem[] {
  const flat: SelectItem[] = [];
  for (const entry of itemsOrGroups) {
    if (isSelectGroup(entry)) {
      flat.push(...entry.items);
    } else {
      flat.push(entry);
    }
  }
  return flat;
}

function isGroupedArray(itemsOrGroups: SelectItemOrGroup[]): itemsOrGroups is SelectGroup[] {
  return itemsOrGroups.length > 0 && isSelectGroup(itemsOrGroups[0]!);
}

export const SelectStyled = forwardRef<HTMLDivElement, SelectStyledProps>(
  function SelectStyled(
    {
      items: itemsProp,
      value,
      onChange,
      placeholder = "Select…",
      multiple = false,
      searchable = false,
      loadOptions,
      debounceMs = 300,
      loadingText = "Loading…",
      errorText = "Failed to load.",
      emptyText = "No results.",
      size = "md",
      tone = "neutral",
      disabled = false,
      clearable = false,
      className,
      style,
      placement = "auto",
      offset = 4,
      collisionPadding = 8,
      flip = true,
      strategy = "absolute",
      renderItem,
      renderEmpty,
      renderTrigger,
    },
    ref,
  ) {
    const [resolvedPlacement, setResolvedPlacement] = useState<"top" | "bottom">("bottom");
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

    const flatItems = flattenItems(itemsProp);

    const select = useSelect({
      items: flatItems,
      value,
      onChange,
      multiple,
      searchable: searchable || !!loadOptions,
      loadOptions,
      debounceMs,
    });

    const updatePosition = useCallback(() => {
      if (!wrapperRef.current || !dropdownRef.current) return;
      const triggerRect = wrapperRef.current.getBoundingClientRect();
      const dropdownRect = dropdownRef.current.getBoundingClientRect();
      const { dataPlacement, ...style } = computeDropdownStyle({
        trigger: triggerRect,
        dropdownHeight: dropdownRect.height || 240,
        placement,
        offset,
        collisionPadding,
        flip,
        strategy,
      });
      setDropdownStyle(style);
      setResolvedPlacement(dataPlacement);
    }, [placement, offset, collisionPadding, flip, strategy]);

    useEffect(() => {
      if (!select.isOpen) return;
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
      if (multiple) return null;
      return select.selectedItems[0]?.label ?? null;
    })();

    const triggerContent = (() => {
      if (renderTrigger) {
        const sel = multiple
          ? select.selectedItems
          : select.selectedItems[0] ?? null;
        return renderTrigger(sel, select.isOpen);
      }
      if (multiple && hasValue) {
        return (
          <span className="rsel-chips">
            {select.selectedItems.map((item) => (
              <span key={item.value} className="rsel-chip" data-entering="true">
                <span className="rsel-chip-label">{item.label}</span>
                <button
                  type="button"
                  className="rsel-chip-remove"
                  aria-label={`Remove ${item.label}`}
                  tabIndex={-1}
                  onClick={(e) => {
                    e.stopPropagation();
                    const next = selectedValues.filter((v) => v !== item.value);
                    onChange(next);
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </span>
        );
      }
      if (triggerLabel) return <span className="rsel-value">{triggerLabel}</span>;
      return <span className="rsel-placeholder">{placeholder}</span>;
    })();

    const grouped = !loadOptions && isGroupedArray(itemsProp);

    const renderListContent = () => {
      if (select.isLoading) {
        return (
          <li className="rsel-empty rsel-loading" role="option" aria-disabled="true">
            <span className="rsel-spinner" aria-hidden="true" />
            {loadingText}
          </li>
        );
      }
      if (select.loadError) {
        return (
          <li className="rsel-empty rsel-error" role="option" aria-disabled="true">
            {errorText}
          </li>
        );
      }
      if (select.filteredItems.length === 0) {
        return (
          <li className="rsel-empty" role="option" aria-disabled="true">
            {renderEmpty ? renderEmpty() : emptyText}
          </li>
        );
      }

      if (grouped) {
        const groups = itemsProp as SelectGroup[];
        const activeSearch = searchable && select.searchValue;
        return groups.map((grp) => {
          const grpItems = activeSearch
            ? grp.items.filter((item) =>
                item.label.toLowerCase().includes(select.searchValue.toLowerCase()),
              )
            : grp.items;
          if (grpItems.length === 0) return null;
          return (
            <li key={grp.group} className="rsel-group" role="presentation">
              <div className="rsel-group-label" aria-label={grp.group}>
                {grp.group}
              </div>
              <ul role="group" aria-label={grp.group} className="rsel-group-list">
                {grpItems.map((item) => renderListItem(item))}
              </ul>
            </li>
          );
        });
      }

      return select.filteredItems.map((item) => renderListItem(item));
    };

    const renderListItem = (item: SelectItem) => {
      const itemProps = select.getItemProps(item);
      const isSelected = itemProps["aria-selected"];
      const isActive = itemProps["data-focused"];
      return (
        <li
          key={item.value}
          {...itemProps}
          className="rsel-item"
          data-selected={isSelected ? "true" : undefined}
          data-disabled={item.disabled ? "true" : undefined}
          data-focused={isActive ? "true" : undefined}
        >
          {renderItem ? (
            renderItem(item, { selected: isSelected, active: isActive })
          ) : (
            <>
              {multiple && (
                <span className="rsel-item-check" aria-hidden="true">
                  {isSelected ? "✓" : ""}
                </span>
              )}
              <span className="rsel-item-label">{item.label}</span>
            </>
          )}
        </li>
      );
    };

    return (
      <div
        ref={(el) => {
          (wrapperRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
          if (typeof ref === "function") ref(el);
          else if (ref)
            (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
        }}
        className={["rsel-root", className].filter(Boolean).join(" ")}
        style={style}
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
            {triggerContent}
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
              data-placement={resolvedPlacement}
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
                aria-busy={select.isLoading || undefined}
              >
                {renderListContent()}
              </ul>
            </div>,
            document.body,
          )}
      </div>
    );
  },
);
