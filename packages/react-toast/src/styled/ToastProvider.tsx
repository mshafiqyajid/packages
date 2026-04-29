import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toastStore, type ToastItem } from "../store";
import { useToasts } from "../useToast";
import { Toast } from "./Toast";

export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export interface ToastProviderProps {
  position?: ToastPosition;
  maxToasts?: number;
  /** Default duration in ms for all toasts (can be overridden per-toast). Default: 4000 */
  duration?: number;
}

export function ToastProvider({
  position = "bottom-right",
  maxToasts = 5,
  duration = 4000,
}: ToastProviderProps) {
  const [mounted, setMounted] = useState(false);
  const allToasts = useToasts();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Apply default duration to newly added toasts that used the store default (4000)
  // and enforce maxToasts cap by trimming the oldest
  useEffect(() => {
    const capped =
      allToasts.length > maxToasts ? allToasts.slice(-maxToasts) : allToasts;

    const withDuration = capped.map((t) =>
      t.duration === 4000 ? { ...t, duration } : t,
    );

    const changed =
      withDuration.length !== allToasts.length ||
      withDuration.some((t, i) => t.id !== allToasts[i]?.id || t.duration !== allToasts[i]?.duration);

    if (changed) {
      toastStore.setToasts(withDuration);
    }
  }, [allToasts, maxToasts, duration]);

  const isBottom = position.startsWith("bottom");

  // For bottom positions newest is last in DOM (visually on top via column-reverse)
  // For top positions newest is first in DOM (visually on top)
  const orderedToasts: ToastItem[] = isBottom
    ? [...allToasts]
    : [...allToasts].reverse();

  const handleDismiss = useCallback((id: string) => {
    toastStore.dismiss(id);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className="rtoast-region"
      data-position={position}
      aria-label="Notifications"
      aria-live="polite"
      aria-relevant="additions removals"
    >
      {orderedToasts.map((t) => (
        <Toast
          key={t.id}
          toast={t}
          onDismiss={handleDismiss}
          isBottom={isBottom}
        />
      ))}
    </div>,
    document.body,
  );
}
