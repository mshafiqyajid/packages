import { useEffect, useRef, useState, type ReactNode } from "react";
import type { ToastItem } from "../store";

export interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
  isBottom: boolean;
}

export function Toast({ toast, onDismiss, isBottom }: ToastProps) {
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-dismiss
  useEffect(() => {
    if (toast.duration === Infinity) return;
    timerRef.current = setTimeout(() => setExiting(true), toast.duration);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [toast.duration]);

  // After exit animation completes, remove from store
  useEffect(() => {
    if (!exiting) return;
    const t = setTimeout(() => onDismiss(toast.id), 320);
    return () => clearTimeout(t);
  }, [exiting, toast.id, onDismiss]);

  const durationMs = toast.duration === Infinity ? 0 : toast.duration;

  return (
    <div
      className="rtoast-item"
      data-type={toast.type}
      data-exiting={exiting ? "true" : undefined}
      data-direction={isBottom ? "bottom" : "top"}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="rtoast-icon" aria-hidden="true">{iconFor(toast.type)}</span>

      <div className="rtoast-body">
        {toast.title && <span className="rtoast-title">{toast.title}</span>}
        <span className="rtoast-message">{toast.message}</span>
        {toast.action && (
          <button
            type="button"
            className="rtoast-action"
            onClick={() => { toast.action!.onClick(); setExiting(true); }}
          >
            {toast.action.label}
          </button>
        )}
      </div>

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

      {/* Progress bar driven by CSS animation — no RAF/state needed */}
      {durationMs > 0 && (
        <div
          className="rtoast-progress"
          style={{ animationDuration: `${durationMs}ms` } as React.CSSProperties}
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
    default:
      return <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="8" cy="8" r="7"/><path d="M8 8h.01" strokeWidth="3"/></svg>;
  }
}
