import { useEffect, useRef, useState, useCallback } from "react";
import type { ToastItem } from "../store";

export interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
  isBottom: boolean;
  /** Pause auto-dismiss timers while any toast is hovered. */
  paused?: boolean;
}

const SWIPE_THRESHOLD = 80; // px

export function Toast({ toast, onDismiss, isBottom, paused }: ToastProps) {
  const [exiting, setExiting] = useState(false);
  const [swipeX, setSwipeX] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [contentKey, setContentKey] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startXRef = useRef<number | null>(null);
  const remainingRef = useRef<number>(toast.duration);
  const startTimeRef = useRef<number>(Date.now());
  const prevMessageRef = useRef(toast.message);
  const prevTitleRef = useRef(toast.title);
  const prevTypeRef = useRef(toast.type);

  const isPaused = paused || hovered;
  const swipeEnabled = toast.dismissibleSwipe !== false;
  const isPersistent = toast.duration === 0 || toast.duration === Infinity;

  useEffect(() => {
    if (
      toast.message !== prevMessageRef.current ||
      toast.title !== prevTitleRef.current ||
      toast.type !== prevTypeRef.current
    ) {
      prevMessageRef.current = toast.message;
      prevTitleRef.current = toast.title;
      prevTypeRef.current = toast.type;
      setContentKey((k) => k + 1);
    }
  }, [toast.message, toast.title, toast.type]);

  const startTimer = useCallback(
    (duration: number) => {
      if (isPersistent || duration <= 0) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      startTimeRef.current = Date.now();
      remainingRef.current = duration;
      timerRef.current = setTimeout(() => setExiting(true), duration);
    },
    [isPersistent],
  );

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      remainingRef.current -= Date.now() - startTimeRef.current;
    }
  }, []);

  useEffect(() => {
    if (isPersistent) return;
    if (isPaused) {
      stopTimer();
    } else {
      startTimer(remainingRef.current);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPaused, toast.duration, startTimer, stopTimer, isPersistent]);

  useEffect(() => {
    if (!exiting) return;
    const t = setTimeout(() => onDismiss(toast.id), 320);
    return () => clearTimeout(t);
  }, [exiting, toast.id, onDismiss]);

  const durationMs = isPersistent ? 0 : toast.duration;
  const opacity = swipeX === 0 ? 1 : Math.max(0, 1 - Math.abs(swipeX) / 200);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!swipeEnabled || e.pointerType !== "touch") return;
    startXRef.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (startXRef.current === null) return;
    setSwipeX(e.clientX - startXRef.current);
  };

  const handlePointerUp = () => {
    if (startXRef.current === null) return;
    if (Math.abs(swipeX) > SWIPE_THRESHOLD) {
      setExiting(true);
    } else {
      setSwipeX(0);
    }
    startXRef.current = null;
  };

  const showProgressRing = toast.showProgress && durationMs > 0 && !toast.undo;

  return (
    <div
      className="rtoast-item"
      data-type={toast.type}
      data-exiting={exiting ? "true" : undefined}
      data-direction={isBottom ? "bottom" : "top"}
      data-swiping={swipeX !== 0 ? "true" : undefined}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        transform: swipeX !== 0 ? `translateX(${swipeX}px)` : undefined,
        opacity: swipeX !== 0 ? opacity : undefined,
        transition: swipeX === 0 && startXRef.current === null ? undefined : "none",
      }}
    >
      <span className="rtoast-icon" aria-hidden="true">{iconFor(toast.type)}</span>

      <div className="rtoast-body rtoast-body--fade" key={contentKey}>
        {toast.title && <span className="rtoast-title">{toast.title}</span>}
        <span className="rtoast-message">{toast.message}</span>
        {toast.action && (
          <button
            type="button"
            className="rtoast-action"
            data-variant={toast.action.variant ?? "primary"}
            onClick={() => { toast.action!.onClick(); setExiting(true); }}
          >
            {toast.action.label}
          </button>
        )}
      </div>

      <div className="rtoast-actions">
        {toast.undo && durationMs > 0 && (
          <button
            type="button"
            className="rtoast-undo"
            aria-label={toast.undoLabel ?? "Undo"}
            onClick={() => { toast.undo!(); setExiting(true); }}
          >
            <svg
              viewBox="0 0 32 32"
              width="28"
              height="28"
              className="rtoast-undo-ring"
              aria-hidden="true"
            >
              <circle cx="16" cy="16" r="14" className="rtoast-undo-ring-bg" />
              <circle
                cx="16"
                cy="16"
                r="14"
                className="rtoast-undo-ring-fill"
                style={
                  {
                    animationDuration: `${durationMs}ms`,
                    animationPlayState: isPaused ? "paused" : "running",
                  } as React.CSSProperties
                }
              />
            </svg>
            <span className="rtoast-undo-label">{toast.undoLabel ?? "Undo"}</span>
          </button>
        )}

        {showProgressRing && (
          <svg
            viewBox="0 0 32 32"
            width="24"
            height="24"
            className="rtoast-ring"
            aria-hidden="true"
          >
            <circle cx="16" cy="16" r="13" className="rtoast-ring-bg" />
            <circle
              cx="16"
              cy="16"
              r="13"
              className="rtoast-ring-fill"
              style={
                {
                  animationDuration: `${durationMs}ms`,
                  animationPlayState: isPaused ? "paused" : "running",
                } as React.CSSProperties
              }
            />
          </svg>
        )}

        <button
          type="button"
          className="rtoast-close"
          aria-label="Dismiss"
          onClick={() => setExiting(true)}
        >
          <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M2 2l12 12M14 2L2 14" />
          </svg>
        </button>
      </div>

      {durationMs > 0 && !toast.undo && !showProgressRing && (
        <div
          className="rtoast-progress"
          style={
            {
              animationDuration: `${durationMs}ms`,
              animationPlayState: isPaused ? "paused" : "running",
            } as React.CSSProperties
          }
          aria-hidden="true"
        />
      )}
    </div>
  );
}

function iconFor(type: ToastItem["type"]): JSX.Element {
  switch (type) {
    case "success":
      return <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="8" cy="8" r="7"/><path d="M4.5 8l2.5 2.5 4-5"/></svg>;
    case "error":
      return <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="8" cy="8" r="7"/><path d="M8 5v3M8 11v.5"/></svg>;
    case "warning":
      return <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 1L15 14H1L8 1z"/><path d="M8 6v3M8 11v.5"/></svg>;
    case "info":
      return <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="8" cy="8" r="7"/><path d="M8 7v4M8 5v.5"/></svg>;
    case "loading":
      return <span className="rtoast-spinner" aria-hidden="true" />;
    default:
      return <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="8" cy="8" r="7"/><path d="M8 8h.01" strokeWidth="3"/></svg>;
  }
}
