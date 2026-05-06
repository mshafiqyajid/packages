import { useCallback, useRef, useState, type MouseEvent } from "react";

export interface UseButtonOptions {
  /** Called on click. Return a Promise to drive a pending state automatically — onClick is no-op'd while in flight. */
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void | Promise<void>;
  disabled?: boolean;
  /** Force loading state. Auto-set when onClick returns a Promise. */
  loading?: boolean;
}

export interface UseButtonResult {
  buttonProps: {
    "aria-disabled": boolean | undefined;
    "aria-busy": boolean | undefined;
    disabled: boolean;
    onClick: (e: MouseEvent<HTMLButtonElement>) => void;
    type: "button";
  };
  isPending: boolean;
}

export function useButton({
  onClick,
  disabled = false,
  loading = false,
}: UseButtonOptions = {}): UseButtonResult {
  const [isPending, setIsPending] = useState(false);
  const pendingRef = useRef(false);

  const handleClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading || pendingRef.current) return;
      const result = onClick?.(e);
      if (result && typeof (result as Promise<void>).then === "function") {
        pendingRef.current = true;
        setIsPending(true);
        (result as Promise<void>).finally(() => {
          pendingRef.current = false;
          setIsPending(false);
        });
      }
    },
    [disabled, loading, onClick],
  );

  const showPending = isPending || loading;

  return {
    buttonProps: {
      "aria-disabled": disabled || undefined,
      "aria-busy": showPending || undefined,
      disabled: disabled || showPending,
      onClick: handleClick,
      type: "button",
    },
    isPending: showPending,
  };
}
