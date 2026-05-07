import { useState, useCallback, useRef, type KeyboardEvent } from "react";

export interface UseSwitchOptions {
  checked?: boolean;
  defaultChecked?: boolean;
  /** Called with the new checked state. Return a Promise to drive a pending state automatically; if it rejects, the optimistic update is reverted. */
  onChange?: (checked: boolean) => void | Promise<void>;
  /** Called before committing the toggle. Return false (or a Promise that resolves to false) to cancel. While a Promise is pending, the switch enters a pending state. */
  confirm?: (next: boolean) => boolean | Promise<boolean>;
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
  confirm,
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

    if (confirm) {
      const guardResult = confirm(next);
      if (typeof (guardResult as Promise<boolean>)?.then === "function") {
        pendingRef.current = true;
        setIsPending(true);
        (guardResult as Promise<boolean>).then(
          (allowed) => {
            pendingRef.current = false;
            setIsPending(false);
            if (!allowed) return;
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
          },
          () => {
            pendingRef.current = false;
            setIsPending(false);
          },
        );
        return;
      }
      if (!(guardResult as boolean)) return;
    }

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
  }, [disabled, isChecked, isControlled, onChange, confirm]);

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
