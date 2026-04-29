import { useState, useCallback, type KeyboardEvent } from "react";

export interface UseSwitchOptions {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}

export interface UseSwitchResult {
  switchProps: {
    role: "switch";
    "aria-checked": boolean;
    "aria-disabled": boolean | undefined;
    tabIndex: number;
    onClick: () => void;
    onKeyDown: (e: KeyboardEvent<HTMLElement>) => void;
  };
  isChecked: boolean;
  toggle: () => void;
}

export function useSwitch({
  checked,
  defaultChecked = false,
  onChange,
  disabled = false,
}: UseSwitchOptions = {}): UseSwitchResult {
  const isControlled = checked !== undefined;
  const [internalChecked, setInternalChecked] = useState(defaultChecked);

  const isChecked = isControlled ? checked! : internalChecked;

  const toggle = useCallback(() => {
    if (disabled) return;
    const next = !isChecked;
    if (!isControlled) {
      setInternalChecked(next);
    }
    onChange?.(next);
  }, [disabled, isChecked, isControlled, onChange]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        toggle();
      }
    },
    [toggle],
  );

  return {
    switchProps: {
      role: "switch",
      "aria-checked": isChecked,
      "aria-disabled": disabled || undefined,
      tabIndex: disabled ? -1 : 0,
      onClick: toggle,
      onKeyDown,
    },
    isChecked,
    toggle,
  };
}
