import {
  forwardRef,
  useRef,
  useState,
  useEffect,
  useCallback,
  useId,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useCombobox } from "../useCombobox";
import type { ComboboxOption } from "../useCombobox";

export type ComboboxSize = "sm" | "md" | "lg";
export type ComboboxTone = "neutral" | "primary" | "success" | "danger";
export type ComboboxPlacement = "auto" | "top" | "bottom";

export interface ComboboxStyledProps {
  value?: string | null;
  defaultValue?: string;
  onChange?: (value: string | null) => void;
  options?: ComboboxOption[];
  loadOptions?: (query: string) => Promise<ComboboxOption[]>;
  debounceMs?: number;
  placeholder?: string;
  emptyText?: string;
  loadingText?: string;
  errorText?: string;
  creatable?: boolean;
  createLabel?: (query: string) => string;
  onCreateOption?: (value: string) => void;
  clearable?: boolean;
  size?: ComboboxSize;
  tone?: ComboboxTone;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  label?: string;
  hint?: string;
  error?: string;
  placement?: ComboboxPlacement;
  offset?: number;
  flip?: boolean;
  renderOption?: (
    option: ComboboxOption,
    state: { focused: boolean; selected: boolean },
  ) => ReactNode;
  className?: string;
  style?: CSSProperties;
}

interface DropdownPos {
  top: number;
  left: number;
  width: number;
  placement: "top" | "bottom";
}

function computePosition(
  triggerRect: DOMRect,
  dropdownHeight: number,
  placement: ComboboxPlacement,
  offset: number,
  flip: boolean,
): DropdownPos {
  const spaceBelow = window.innerHeight - triggerRect.bottom - 8;
  const spaceAbove = triggerRect.top - 8;

  let above: boolean;
  if (placement === "top") above = true;
  else if (placement === "bottom") above = false;
  else above = spaceBelow < dropdownHeight + offset && spaceAbove > spaceBelow;

  if (flip && placement !== "auto") {
    if (above && spaceAbove < dropdownHeight + offset && spaceBelow > spaceAbove) {
      above = false;
    } else if (!above && spaceBelow < dropdownHeight + offset && spaceAbove > spaceBelow) {
      above = true;
    }
  }

  return {
    top: above
      ? triggerRect.top + window.scrollY - dropdownHeight - offset
      : triggerRect.bottom + window.scrollY + offset,
    left: triggerRect.left + window.scrollX,
    width: triggerRect.width,
    placement: above ? "top" : "bottom",
  };
}

export const ComboboxStyled = forwardRef<HTMLInputElement, ComboboxStyledProps>(
  function ComboboxStyled(
    {
      value,
      defaultValue,
      onChange,
      options = [],
      loadOptions,
      debounceMs = 300,
      placeholder = "Search…",
      emptyText = "No options",
      loadingText = "Loading…",
      errorText,
      creatable = false,
      createLabel,
      onCreateOption,
      clearable = true,
      size = "md",
      tone = "neutral",
      disabled = false,
      readOnly = false,
      required = false,
      invalid = false,
      label,
      hint,
      error,
      placement = "auto",
      offset = 4,
      flip = true,
      renderOption,
      className,
      style,
    },
    ref,
  ) {
    const [mounted, setMounted] = useState(false);
    const [dropdownStyle, setDropdownStyle] = useState<CSSProperties>({
      position: "fixed",
      top: -9999,
      left: -9999,
      width: 0,
    });
    const [resolvedPlacement, setResolvedPlacement] = useState<"top" | "bottom">("bottom");

    const controlRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const labelId = useId();
    const hintId = useId();
    const errorId = useId();

    useEffect(() => { setMounted(true); }, []);

    const combobox = useCombobox({
      options,
      value,
      defaultValue,
      onChange,
      loadOptions,
      debounceMs,
      creatable,
      onCreateOption,
    });

    const updatePosition = useCallback(() => {
      if (!controlRef.current || !dropdownRef.current) return;
      const triggerRect = controlRef.current.getBoundingClientRect();
      const dropdownRect = dropdownRef.current.getBoundingClientRect();
      const height = dropdownRect.height || 260;
      const pos = computePosition(triggerRect, height, placement, offset, flip);
      setResolvedPlacement(pos.placement);
      setDropdownStyle({
        position: "fixed",
        top: pos.top - window.scrollY,
        left: pos.left - window.scrollX,
        width: pos.width,
        zIndex: 9999,
      });
    }, [placement, offset, flip]);

    useEffect(() => {
      if (!combobox.isOpen) return;
      requestAnimationFrame(() => updatePosition());
    }, [combobox.isOpen, updatePosition]);

    useEffect(() => {
      if (!combobox.isOpen) return;
      const onUpdate = () => updatePosition();
      window.addEventListener("scroll", onUpdate, { passive: true });
      window.addEventListener("resize", onUpdate, { passive: true });
      return () => {
        window.removeEventListener("scroll", onUpdate);
        window.removeEventListener("resize", onUpdate);
      };
    }, [combobox.isOpen, updatePosition]);

    const handleClear = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        combobox.clearSelection();
      },
      [combobox],
    );

    const showClear = clearable && !!combobox.selectedOption && !disabled && !readOnly;
    const hasError = invalid || !!error;

    // Groups from options
    const groups = options.reduce<string[]>((acc, o) => {
      if (o.group && !acc.includes(o.group)) acc.push(o.group);
      return acc;
    }, []);
    const isGrouped = groups.length > 0;

    const renderOptionItem = (option: ComboboxOption, listIndex: number) => {
      const props = combobox.getOptionProps(option, listIndex);
      const isFocused = props["data-focused"];
      const isSelected = props["data-selected"];
      return (
        <li
          key={option.value}
          {...props}
          className="rcbx-option"
          data-focused={isFocused ? "true" : undefined}
          data-selected={isSelected ? "true" : undefined}
          data-disabled={option.disabled ? "true" : undefined}
        >
          {renderOption ? (
            renderOption(option, { focused: isFocused, selected: isSelected })
          ) : (
            <>
              <span className="rcbx-option-label">{option.label}</span>
              {isSelected && (
                <span className="rcbx-option-check" aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              )}
            </>
          )}
        </li>
      );
    };

    const renderListContent = () => {
      if (combobox.isLoading) {
        return (
          <li className="rcbx-state" role="option" aria-disabled="true">
            <span className="rcbx-spinner" aria-hidden="true" />
            {loadingText}
          </li>
        );
      }

      if (combobox.loadError) {
        return (
          <li className="rcbx-state rcbx-state--error" role="option" aria-disabled="true">
            {errorText ?? combobox.loadError.message}
          </li>
        );
      }

      const items: ReactNode[] = [];

      if (isGrouped && !loadOptions) {
        groups.forEach((group) => {
          const groupOptions = combobox.filteredOptions.filter(
            (o) => o.group === group,
          );
          if (groupOptions.length === 0) return;
          items.push(
            <li key={`group-${group}`} className="rcbx-group" role="presentation">
              <div className="rcbx-group-label">{group}</div>
              <ul className="rcbx-group-list" role="group" aria-label={group}>
                {groupOptions.map((opt) =>
                  renderOptionItem(opt, combobox.filteredOptions.indexOf(opt)),
                )}
              </ul>
            </li>,
          );
        });
        // ungrouped options
        const ungrouped = combobox.filteredOptions.filter((o) => !o.group);
        ungrouped.forEach((opt) => {
          items.push(renderOptionItem(opt, combobox.filteredOptions.indexOf(opt)));
        });
      } else {
        combobox.filteredOptions.forEach((opt, i) => {
          items.push(renderOptionItem(opt, i));
        });
      }

      if (combobox.showCreateOption) {
        const createText = createLabel
          ? createLabel(combobox.query)
          : `Create "${combobox.query}"`;
        items.push(
          <li
            key="__create__"
            id={`${combobox.listboxProps.id}-opt-create`}
            role="option"
            aria-selected={false}
            className="rcbx-option rcbx-option--create"
            data-focused={
              combobox.inputProps["aria-activedescendant"] ===
              `${combobox.listboxProps.id}-opt-create`
                ? "true"
                : undefined
            }
            onMouseEnter={() => {
              // handled internally, the create button uses its own focus tracking
            }}
            onClick={() => {
              onCreateOption?.(combobox.query.trim());
              combobox.clearSelection();
            }}
          >
            <span className="rcbx-option-label">{createText}</span>
            <span className="rcbx-option-create-icon" aria-hidden="true">+</span>
          </li>,
        );
      }

      if (items.length === 0) {
        return (
          <li className="rcbx-state" role="option" aria-disabled="true">
            {emptyText}
          </li>
        );
      }

      return items;
    };

    const ariaDescribedBy = [
      hint ? hintId : null,
      hasError ? errorId : null,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

    return (
      <div
        className={["rcbx-root", className].filter(Boolean).join(" ")}
        style={style}
        data-size={size}
        data-tone={tone}
        data-open={combobox.isOpen ? "true" : undefined}
        data-disabled={disabled ? "true" : undefined}
        data-invalid={hasError ? "true" : undefined}
      >
        {label && (
          <label htmlFor={combobox.inputProps.id} id={labelId} className="rcbx-label">
            {label}
            {required && (
              <span className="rcbx-required" aria-hidden="true">
                {" *"}
              </span>
            )}
          </label>
        )}

        <div ref={controlRef} className="rcbx-control">
          <input
            {...combobox.inputProps}
            ref={(el) => {
              (combobox.inputProps.ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
              if (typeof ref === "function") ref(el);
              else if (ref)
                (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
            }}
            className="rcbx-input"
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            aria-invalid={hasError || undefined}
            aria-describedby={ariaDescribedBy}
            aria-labelledby={label ? labelId : undefined}
          />

          <span className="rcbx-actions">
            {combobox.isLoading && (
              <span className="rcbx-spinner rcbx-spinner--inline" aria-hidden="true" />
            )}
            {showClear && (
              <button
                type="button"
                className="rcbx-clear"
                aria-label="Clear selection"
                tabIndex={-1}
                onMouseDown={handleClear}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M1.5 1.5l7 7M8.5 1.5l-7 7"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}
            <span className="rcbx-chevron" aria-hidden="true">
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                className="rcbx-chevron-icon"
              >
                <path
                  d="M2 4l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </span>
        </div>

        {hint && !hasError && (
          <span id={hintId} className="rcbx-hint">
            {hint}
          </span>
        )}
        {hasError && (
          <span id={errorId} className="rcbx-error" role="alert">
            {error}
          </span>
        )}

        {mounted &&
          createPortal(
            <div
              ref={dropdownRef}
              className="rcbx-dropdown"
              data-open={combobox.isOpen ? "true" : undefined}
              data-size={size}
              data-tone={tone}
              data-placement={resolvedPlacement}
              style={dropdownStyle}
            >
              <ul
                {...combobox.listboxProps}
                className="rcbx-listbox"
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
