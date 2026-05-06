import { useCallback, useState, type ChangeEvent } from "react";

export type TextInputType =
  | "text"
  | "email"
  | "password"
  | "url"
  | "search"
  | "tel";

export interface UseTextInputOptions {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  type?: TextInputType;
}

export interface UseTextInputResult {
  inputProps: {
    value: string;
    type: TextInputType;
    disabled: boolean;
    readOnly: boolean;
    "aria-disabled": boolean | undefined;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  };
  value: string;
  setValue: (v: string) => void;
  clear: () => void;
  isEmpty: boolean;
}

export function useTextInput({
  value,
  defaultValue = "",
  onChange,
  disabled = false,
  readOnly = false,
  type = "text",
}: UseTextInputOptions = {}): UseTextInputResult {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue);
  const current = isControlled ? value! : internal;

  const setValue = useCallback(
    (v: string) => {
      if (!isControlled) setInternal(v);
      onChange?.(v);
    },
    [isControlled, onChange],
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
    },
    [setValue],
  );

  const clear = useCallback(() => setValue(""), [setValue]);

  return {
    inputProps: {
      value: current,
      type,
      disabled,
      readOnly,
      "aria-disabled": disabled || undefined,
      onChange: handleChange,
    },
    value: current,
    setValue,
    clear,
    isEmpty: current.length === 0,
  };
}
