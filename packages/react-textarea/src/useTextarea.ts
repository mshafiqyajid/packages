import { useState, useCallback, useId } from "react";

export interface UseTextareaOptions {
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onValueChange?: (value: string) => void;
  maxLength?: number;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  id?: string;
  name?: string;
}

export interface UseTextareaResult {
  textareaProps: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    disabled: boolean | undefined;
    readOnly: boolean | undefined;
    required: boolean | undefined;
    "aria-invalid": boolean | undefined;
    "aria-required": boolean | undefined;
    maxLength: number | undefined;
    id: string;
    name: string | undefined;
  };
  charCount: number;
  isAtLimit: boolean;
  isOverLimit: boolean;
}

export function useTextarea(options: UseTextareaOptions = {}): UseTextareaResult {
  const {
    value: controlledValue,
    defaultValue = "",
    onChange,
    onValueChange,
    maxLength,
    disabled,
    readOnly,
    required,
    invalid,
    id: idProp,
    name,
  } = options;

  const generatedId = useId();
  const id = idProp ?? generatedId;

  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState<string>(defaultValue);

  const value = isControlled ? controlledValue : internalValue;
  const charCount = value.length;
  const isAtLimit = maxLength !== undefined && charCount >= maxLength;
  const isOverLimit = maxLength !== undefined && charCount > maxLength;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(e);
      onValueChange?.(newValue);
    },
    [isControlled, onChange, onValueChange],
  );

  return {
    textareaProps: {
      value,
      onChange: handleChange,
      disabled: disabled || undefined,
      readOnly: readOnly || undefined,
      required: required || undefined,
      "aria-invalid": invalid || undefined,
      "aria-required": required || undefined,
      maxLength: maxLength,
      id,
      name,
    },
    charCount,
    isAtLimit,
    isOverLimit,
  };
}
