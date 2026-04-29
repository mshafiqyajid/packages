import {
  useState,
  useCallback,
  useRef,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import { isValidHex, normalizeHex } from "./colorUtils";

export interface UseColorInputOptions {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export interface UseColorInputResult {
  inputProps: {
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
    onBlur: () => void;
    disabled: boolean;
    "aria-invalid": boolean;
  };
  swatchProps: {
    onClick: () => void;
    disabled: boolean;
    "aria-expanded": boolean;
    "aria-haspopup": "dialog";
    type: "button";
  };
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  isValid: boolean;
  currentHex: string;
  setHex: (hex: string) => void;
}

export function useColorInput({
  value,
  defaultValue = "#000000",
  onChange,
  disabled = false,
}: UseColorInputOptions = {}): UseColorInputResult {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string>(
    isControlled ? (value ?? defaultValue) : defaultValue,
  );
  const [inputText, setInputText] = useState<string>(
    isControlled ? (value ?? defaultValue) : defaultValue,
  );
  const [isOpen, setIsOpen] = useState(false);
  const prevExternalValue = useRef(value);

  if (isControlled && value !== prevExternalValue.current) {
    prevExternalValue.current = value;
    const v = value ?? defaultValue;
    if (isValidHex(v)) {
      setInternalValue(normalizeHex(v));
      setInputText(normalizeHex(v));
    }
  }

  const currentHex = isControlled
    ? isValidHex(value ?? "") ? normalizeHex(value ?? defaultValue) : internalValue
    : internalValue;

  const isValid = isValidHex(inputText);

  const setHex = useCallback(
    (hex: string) => {
      if (!isValidHex(hex)) return;
      const normalized = normalizeHex(hex);
      setInternalValue(normalized);
      setInputText(normalized);
      onChange?.(normalized);
    },
    [onChange],
  );

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      setInputText(raw);
      const candidate = raw.startsWith("#") ? raw : `#${raw}`;
      if (isValidHex(candidate)) {
        const normalized = normalizeHex(candidate);
        setInternalValue(normalized);
        onChange?.(normalized);
      }
    },
    [onChange],
  );

  const handleInputBlur = useCallback(() => {
    if (!isValidHex(inputText)) {
      setInputText(currentHex);
    } else {
      const normalized = normalizeHex(inputText);
      setInputText(normalized);
      setInternalValue(normalized);
      onChange?.(normalized);
    }
  }, [inputText, currentHex, onChange]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        if (isValidHex(inputText)) {
          const normalized = normalizeHex(inputText);
          setInputText(normalized);
          setInternalValue(normalized);
          onChange?.(normalized);
        } else {
          setInputText(currentHex);
        }
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        setInputText(currentHex);
      }
    },
    [inputText, currentHex, onChange],
  );

  const open = useCallback(() => {
    if (!disabled) setIsOpen(true);
  }, [disabled]);

  const close = useCallback(() => setIsOpen(false), []);

  const toggle = useCallback(() => {
    if (!disabled) setIsOpen((prev) => !prev);
  }, [disabled]);

  return {
    inputProps: {
      value: inputText,
      onChange: handleInputChange,
      onKeyDown: handleKeyDown,
      onBlur: handleInputBlur,
      disabled,
      "aria-invalid": !isValid,
    },
    swatchProps: {
      onClick: toggle,
      disabled,
      "aria-expanded": isOpen,
      "aria-haspopup": "dialog",
      type: "button",
    },
    isOpen,
    open,
    close,
    toggle,
    isValid,
    currentHex,
    setHex,
  };
}
