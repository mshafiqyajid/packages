import { useCallback, useState, type KeyboardEvent } from "react";

export type AlertTone =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";

export interface UseAlertOptions {
  dismissible?: boolean;
  onDismiss?: () => void;
  tone?: AlertTone;
}

export interface UseAlertResult {
  alertProps: {
    role: "alert" | "status";
    "aria-live": "assertive" | "polite";
    onKeyDown: (e: KeyboardEvent) => void;
  };
  dismissProps: {
    "aria-label": string;
    onClick: () => void;
    type: "button";
  };
  isDismissed: boolean;
  dismiss: () => void;
}

export function useAlert({
  dismissible = false,
  onDismiss,
  tone = "neutral",
}: UseAlertOptions = {}): UseAlertResult {
  const [isDismissed, setIsDismissed] = useState(false);

  const dismiss = useCallback(() => {
    setIsDismissed(true);
    onDismiss?.();
  }, [onDismiss]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (dismissible && e.key === "Escape") {
        e.preventDefault();
        dismiss();
      }
    },
    [dismissible, dismiss],
  );

  const isDanger = tone === "danger";

  return {
    alertProps: {
      role: isDanger ? "alert" : "status",
      "aria-live": isDanger ? "assertive" : "polite",
      onKeyDown,
    },
    dismissProps: {
      "aria-label": "Dismiss",
      onClick: dismiss,
      type: "button",
    },
    isDismissed,
    dismiss,
  };
}
