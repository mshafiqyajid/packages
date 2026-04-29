import {
  useState,
  useCallback,
  useRef,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import {
  findCountry,
  digitCount,
  applyFormat,
  COUNTRIES,
} from "./countries";

export type { Country } from "./countries";
export { COUNTRIES } from "./countries";

export interface UsePhoneInputOptions {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  defaultCountry?: string;
  disabled?: boolean;
}

export interface UsePhoneInputResult {
  inputProps: {
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
    disabled: boolean;
    type: "tel";
    autoComplete: "tel";
    inputMode: "tel";
  };
  country: string;
  setCountry: (iso2: string) => void;
  dialCode: string;
  formattedValue: string;
  isValid: boolean;
}

function digitsOnly(str: string): string {
  return str.replace(/\D/g, "");
}

export function usePhoneInput({
  value: controlledValue,
  defaultValue = "",
  onChange,
  defaultCountry = "US",
  disabled = false,
}: UsePhoneInputOptions = {}): UsePhoneInputResult {
  const isControlled = controlledValue !== undefined;

  const [internalValue, setInternalValue] = useState<string>(() =>
    digitsOnly(defaultValue),
  );
  const [country, setCountryState] = useState<string>(
    defaultCountry.toUpperCase(),
  );

  const prevCountry = useRef(country);

  const digits = isControlled
    ? digitsOnly(controlledValue ?? "")
    : internalValue;

  const countryData = findCountry(country) ?? COUNTRIES[0]!;
  const format = countryData.format;
  const maxDigits = digitCount(format);

  const formattedValue = applyFormat(digits, format);
  const isValid = digits.length === maxDigits;

  const commitDigits = useCallback(
    (nextDigits: string) => {
      if (!isControlled) {
        setInternalValue(nextDigits);
      }
      onChange?.(nextDigits);
    },
    [isControlled, onChange],
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const raw = digitsOnly(e.target.value);
      const clamped = raw.slice(0, maxDigits);
      commitDigits(clamped);
    },
    [maxDigits, commitDigits],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && digits.length > 0) {
        const next = digits.slice(0, -1);
        e.preventDefault();
        commitDigits(next);
      }
    },
    [digits, commitDigits],
  );

  const setCountry = useCallback(
    (iso2: string) => {
      const upper = iso2.toUpperCase();
      if (upper === prevCountry.current) return;
      prevCountry.current = upper;
      setCountryState(upper);
      commitDigits("");
    },
    [commitDigits],
  );

  return {
    inputProps: {
      value: formattedValue,
      onChange: handleChange,
      onKeyDown: handleKeyDown,
      disabled,
      type: "tel",
      autoComplete: "tel",
      inputMode: "tel",
    },
    country,
    setCountry,
    dialCode: countryData.dialCode,
    formattedValue,
    isValid,
  };
}
