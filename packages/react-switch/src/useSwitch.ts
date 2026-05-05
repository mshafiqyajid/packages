import { useState, useCallback, useRef, type KeyboardEvent } from "react";

export interface UseSwitchOptions {
  checked?: boolean;
  defaultChecked?: boolean;
  /** Called with the new checked state. Return a Promise to drive a pending state automatically; if it rejects, the optimistic update is reverted. */
  onChange?: (checked: boolean) => void | Promise<void>;
  disabled?: boolean;
}

export interface UseSwitchResult {
  switchProps: {
    role: "switch";
    "aria-checked": boolean;
    "aria-disabled": boolean | undefined;
    "aria-busy": boolean | undefined;
    tabIndex: number;
    onClick: () => void;
    onKeyDown: (e: KeyboardEvent<HTMLElement>) => void;
  };
  isChecked: boolean;
  isPending: boolean;
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
  const [isPending, setIsPending] = useState(false);
  const pendingRef = useRef(false);

  const isChecked = isControlled ? checked! : internalChecked;

  const toggle = useCallback(() => {
    if (disabled || pendingRef.current) return;
    const next = !isChecked;
    if (!isControlled) setInternalChecked(next);
    const result = onChange?.(next);
    if (result && typeof (result as Promise<void>).then === "function") {
      pendingRef.current = true;
      setIsPending(true);
      (result as Promise<void>).then(
        () => {
          pendingRef.current = false;
          setIsPending(false);
        },
        () => {
          pendingRef.current = false;
          setIsPending(false);
          if (!isControlled) setInternalChecked(!next);
        },
      );
    }
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
      "aria-busy": isPending || undefined,
      tabIndex: disabled ? -1 : 0,
      onClick: toggle,
      onKeyDown,
    },
    isChecked,
    isPending,
    toggle,
  };
}
