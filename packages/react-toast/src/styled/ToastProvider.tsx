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
  /** Pause auto-dismiss timers when the cursor enters the toast region. Default: true. */
  pauseOnHover?: boolean;
  /** Allow the user to drag the entire toast region to a different corner. Default: false. */
  draggable?: boolean;
  /** Persist the dragged position under this localStorage key. Used only when `draggable`. */
  positionStorageKey?: string;
}

const POSITIONS: ToastPosition[] = [
  "top-left", "top-center", "top-right",
  "bottom-left", "bottom-center", "bottom-right",
];

function nearestPosition(x: number, y: number): ToastPosition {
  const w = typeof window !== "undefined" ? window.innerWidth : 1024;
  const h = typeof window !== "undefined" ? window.innerHeight : 768;
  const top = y < h / 2 ? "top" : "bottom";
  const horiz = x < w / 3 ? "left" : x > (w * 2) / 3 ? "right" : "center";
  return `${top}-${horiz}` as ToastPosition;
}

export function ToastProvider({
  position: positionProp = "bottom-right",
  maxToasts = 5,
  duration = 4000,
  pauseOnHover = true,
  draggable = false,
  positionStorageKey,
}: ToastProviderProps) {
  const [mounted, setMounted] = useState(false);
  const [hoveringRegion, setHoveringRegion] = useState(false);
  const [position, setPosition] = useState<ToastPosition>(() => {
    if (!draggable || !positionStorageKey || typeof window === "undefined") return positionProp;
    const saved = window.localStorage.getItem(positionStorageKey);
    return (saved && POSITIONS.includes(saved as ToastPosition)
      ? (saved as ToastPosition)
      : positionProp);
  });
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

  const handleDragStart = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!draggable) return;
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);
    target.setAttribute("data-dragging", "true");

    const move = (mv: PointerEvent) => {
      target.style.position = "fixed";
      target.style.left = `${mv.clientX - 20}px`;
      target.style.top = `${mv.clientY - 20}px`;
      target.style.right = "auto";
      target.style.bottom = "auto";
    };
    const up = (mv: PointerEvent) => {
      target.removeAttribute("data-dragging");
      target.style.position = "";
      target.style.left = "";
      target.style.top = "";
      target.style.right = "";
      target.style.bottom = "";
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      const next = nearestPosition(mv.clientX, mv.clientY);
      setPosition(next);
      if (positionStorageKey && typeof window !== "undefined") {
        window.localStorage.setItem(positionStorageKey, next);
      }
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  return createPortal(
    <div
      className="rtoast-region"
      data-position={position}
      data-draggable={draggable || undefined}
      aria-label="Notifications"
      aria-live="polite"
      aria-relevant="additions removals"
      onMouseEnter={() => setHoveringRegion(true)}
      onMouseLeave={() => setHoveringRegion(false)}
    >
      {draggable && (
        <button
          type="button"
          className="rtoast-drag-handle"
          aria-label="Drag toast region"
          onPointerDown={handleDragStart}
        >
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="5" cy="4" r="0.8" fill="currentColor" />
            <circle cx="11" cy="4" r="0.8" fill="currentColor" />
            <circle cx="5" cy="8" r="0.8" fill="currentColor" />
            <circle cx="11" cy="8" r="0.8" fill="currentColor" />
            <circle cx="5" cy="12" r="0.8" fill="currentColor" />
            <circle cx="11" cy="12" r="0.8" fill="currentColor" />
          </svg>
        </button>
      )}
      {orderedToasts.map((t) => (
        <Toast
          key={t.id}
          toast={t}
          onDismiss={handleDismiss}
          isBottom={isBottom}
          paused={pauseOnHover && hoveringRegion}
        />
      ))}
    </div>,
    document.body,
  );
}
