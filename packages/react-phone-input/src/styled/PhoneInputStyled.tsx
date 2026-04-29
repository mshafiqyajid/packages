import {
  forwardRef,
  useId,
  useRef,
  useState,
  useEffect,
  useCallback,
  type KeyboardEvent,
} from "react";
import { usePhoneInput, type UsePhoneInputOptions } from "../usePhoneInput";
import { COUNTRIES } from "../countries";

export type PhoneInputSize = "sm" | "md" | "lg";
export type PhoneInputTone = "neutral" | "primary" | "success" | "danger";

export interface PhoneInputStyledProps extends UsePhoneInputOptions {
  size?: PhoneInputSize;
  tone?: PhoneInputTone;
  label?: string;
  hint?: string;
  error?: string;
  invalid?: boolean;
  required?: boolean;
  readOnly?: boolean;
  showFlag?: boolean;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  name?: string;
  autoFocus?: boolean;
  placeholder?: string;
}

export const PhoneInputStyled = forwardRef<
  HTMLInputElement,
  PhoneInputStyledProps
>(function PhoneInputStyled(
  {
    value,
    defaultValue,
    onChange,
    defaultCountry = "US",
    disabled = false,
    size = "md",
    tone = "neutral",
    label,
    hint,
    error,
    invalid: invalidProp,
    required,
    readOnly = false,
    showFlag = true,
    className,
    style,
    id: idProp,
    name,
    autoFocus,
    placeholder,
  },
  ref,
) {
  const autoId = useId();
  const inputId = idProp ?? autoId;
  const hintId = useId();
  const errorId = useId();

  const { inputProps, country, setCountry, dialCode, isValid } = usePhoneInput(
    {
      value,
      defaultValue,
      onChange,
      defaultCountry,
      disabled,
    },
  );

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selectedCountry = COUNTRIES.find((c) => c.iso2 === country);

  const closeDropdown = useCallback(() => setDropdownOpen(false), []);

  useEffect(() => {
    if (!dropdownOpen) return;
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") closeDropdown();
    };
    const onPointerDown = (e: PointerEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        closeDropdown();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [dropdownOpen, closeDropdown]);

  const handleTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setDropdownOpen((prev) => !prev);
    }
  };

  const isInvalid = Boolean(error) || invalidProp === true;
  const activeTone = isInvalid ? "danger" : tone;

  const describedBy = [error ? errorId : null, hint ? hintId : null]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div
      className={["rphi-root", className].filter(Boolean).join(" ")}
      style={style}
      data-size={size}
      data-tone={activeTone}
      data-disabled={disabled ? "true" : undefined}
      data-readonly={readOnly ? "true" : undefined}
      data-invalid={isInvalid ? "true" : undefined}
      data-valid={isValid ? "true" : undefined}
    >
      {label && (
        <label className="rphi-label" htmlFor={inputId}>
          {label}
        </label>
      )}

      <div className="rphi-field">
        <div className="rphi-selector-wrap">
          <button
            ref={triggerRef}
            type="button"
            className="rphi-selector"
            aria-label={`Country: ${selectedCountry?.name ?? country}`}
            aria-expanded={dropdownOpen}
            aria-haspopup="listbox"
            disabled={disabled}
            onClick={() => setDropdownOpen((prev) => !prev)}
            onKeyDown={handleTriggerKeyDown}
          >
            {showFlag && selectedCountry && (
              <span className="rphi-flag" aria-hidden="true">
                {selectedCountry.flag}
              </span>
            )}
            <span className="rphi-dial">+{dialCode}</span>
            <span className="rphi-chevron" aria-hidden="true" />
          </button>

          {dropdownOpen && (
            <div
              ref={dropdownRef}
              className="rphi-dropdown"
              role="listbox"
              aria-label="Select country"
            >
              {COUNTRIES.map((c) => (
                <button
                  key={c.iso2}
                  type="button"
                  role="option"
                  className="rphi-option"
                  aria-selected={c.iso2 === country}
                  data-selected={c.iso2 === country ? "true" : undefined}
                  onClick={() => {
                    setCountry(c.iso2);
                    closeDropdown();
                  }}
                >
                  {showFlag && (
                    <span className="rphi-flag" aria-hidden="true">
                      {c.flag}
                    </span>
                  )}
                  <span className="rphi-option-name">{c.name}</span>
                  <span className="rphi-option-dial">+{c.dialCode}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <input
          {...inputProps}
          id={inputId}
          name={name}
          ref={ref}
          className="rphi-input"
          placeholder={placeholder}
          required={required}
          readOnly={readOnly}
          autoFocus={autoFocus}
          aria-describedby={describedBy}
          aria-invalid={isInvalid ? "true" : undefined}
          aria-required={required ? "true" : undefined}
        />
      </div>

      {error && (
        <span id={errorId} className="rphi-error" role="alert">
          {error}
        </span>
      )}
      {!error && hint && (
        <span id={hintId} className="rphi-hint">
          {hint}
        </span>
      )}
    </div>
  );
});
