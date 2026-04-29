import { useState, useCallback, useId } from "react";

export interface UseBadgeOptions {
  onDismiss?: () => void;
}

export interface UseBadgeResult {
  badgeProps: {
    id: string;
    role: "status";
    "aria-label"?: string;
  };
  dismissProps: {
    role: "button";
    "aria-label": string;
    tabIndex: number;
    onClick: () => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
  };
  isDismissed: boolean;
  dismiss: () => void;
}

export function useBadge({ onDismiss }: UseBadgeOptions = {}): UseBadgeResult {
  const id = useId();
  const [isDismissed, setIsDismissed] = useState(false);

  const dismiss = useCallback(() => {
    setIsDismissed(true);
    onDismiss?.();
  }, [onDismiss]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        dismiss();
      }
    },
    [dismiss],
  );

  return {
    badgeProps: {
      id,
      role: "status",
    },
    dismissProps: {
      role: "button",
      "aria-label": "Dismiss",
      tabIndex: 0,
      onClick: dismiss,
      onKeyDown: handleKeyDown,
    },
    isDismissed,
    dismiss,
  };
}
