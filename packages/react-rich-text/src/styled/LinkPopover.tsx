import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export interface LinkPopoverProps {
  /** Anchor rect in viewport coordinates (e.g. from getBoundingClientRect). */
  rect: { top: number; left: number; bottom: number; right: number; width: number; height: number };
  initialUrl?: string;
  initialNewTab?: boolean;
  isEdit: boolean;
  onSubmit: (url: string, opts: { newTab: boolean }) => void;
  onRemove?: () => void;
  onCancel: () => void;
}

const PLACEHOLDER_URL = "https://example.com";

export function LinkPopover({
  rect,
  initialUrl = "",
  initialNewTab = false,
  isEdit,
  onSubmit,
  onRemove,
  onCancel,
}: LinkPopoverProps) {
  const [url, setUrl] = useState(initialUrl);
  const [newTab, setNewTab] = useState(initialNewTab);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  useEffect(() => {
    function onDocPointerDown(e: MouseEvent) {
      if (!ref.current) return;
      if (ref.current.contains(e.target as Node)) return;
      onCancel();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("mousedown", onDocPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [onCancel]);

  const top = rect.bottom + 6 + (typeof window !== "undefined" ? window.scrollY : 0);
  const left = rect.left + (typeof window !== "undefined" ? window.scrollX : 0);

  const node = (
    <div
      ref={ref}
      className="rrt2-link-popover"
      role="dialog"
      aria-label={isEdit ? "Edit link" : "Add link"}
      style={{ position: "absolute", top, left, zIndex: 1000 }}
      onMouseDown={(e) => {
        // Keep editor selection from collapsing on input focus.
        if (e.target !== inputRef.current) e.preventDefault();
      }}
    >
      <input
        ref={inputRef}
        type="url"
        value={url}
        placeholder={PLACEHOLDER_URL}
        className="rrt2-link-popover-input"
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (url.trim()) onSubmit(url.trim(), { newTab });
          }
        }}
      />
      <label className="rrt2-link-popover-toggle">
        <input
          type="checkbox"
          checked={newTab}
          onChange={(e) => setNewTab(e.target.checked)}
        />
        <span>Open in new tab</span>
      </label>
      <div className="rrt2-link-popover-actions">
        {isEdit && onRemove && (
          <button
            type="button"
            className="rrt2-link-popover-btn rrt2-link-popover-btn--danger"
            onClick={onRemove}
          >
            Remove
          </button>
        )}
        <button type="button" className="rrt2-link-popover-btn" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          className="rrt2-link-popover-btn rrt2-link-popover-btn--primary"
          onClick={() => url.trim() && onSubmit(url.trim(), { newTab })}
          disabled={!url.trim()}
        >
          {isEdit ? "Save" : "Add"}
        </button>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(node, document.body);
}
