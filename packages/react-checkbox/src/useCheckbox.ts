import { useCallback, useState, type KeyboardEvent } from "react";

export type CheckboxState = boolean | "indeterminate";

export interface UseCheckboxOptions {
  /** Controlled checked state. Pass "indeterminate" for tri-state. */
  checked?: CheckboxState;
  defaultChecked?: CheckboxState;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}

export interface UseCheckboxResult {
  checkboxProps: {
    role: "checkbox";
    "aria-checked": "true" | "false" | "mixed";
    "aria-disabled": boolean | undefined;
    tabIndex: number;
    onClick: () => void;
    onKeyDown: (e: KeyboardEvent<HTMLElement>) => void;
  };
  isChecked: boolean;
  isIndeterminate: boolean;
  toggle: () => void;
}

export function useCheckbox({
  checked,
  defaultChecked = false,
  onChange,
  disabled = false,
}: UseCheckboxOptions = {}): UseCheckboxResult {
  const isControlled = checked !== undefined;
  const [internal, setInternal] = useState<CheckboxState>(defaultChecked);
  const value = isControlled ? checked! : internal;

  const isChecked = value === true;
  const isIndeterminate = value === "indeterminate";

  const toggle = useCallback(() => {
    if (disabled) return;
    // Indeterminate → true. Otherwise flip.
    const next = isIndeterminate ? true : !isChecked;
    if (!isControlled) setInternal(next);
    onChange?.(next);
  }, [disabled, isChecked, isIndeterminate, isControlled, onChange]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      if (e.key === " ") {
        e.preventDefault();
        toggle();
      }
    },
    [toggle],
  );

  const ariaChecked: "true" | "false" | "mixed" = isIndeterminate
    ? "mixed"
    : isChecked
      ? "true"
      : "false";

  return {
    checkboxProps: {
      role: "checkbox",
      "aria-checked": ariaChecked,
      "aria-disabled": disabled || undefined,
      tabIndex: disabled ? -1 : 0,
      onClick: toggle,
      onKeyDown,
    },
    isChecked,
    isIndeterminate,
    toggle,
  };
}
