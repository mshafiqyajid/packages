import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export interface BubbleMenuProps {
  /** Selection rect in viewport coordinates. */
  rect: { top: number; left: number; bottom: number; right: number; width: number; height: number };
  offset?: number;
  children: React.ReactNode;
}

/**
 * Floating bubble menu — positions itself above the selection rect. Flips
 * below if there's no room above. Portaled to document.body to escape
 * containing-block constraints.
 */
export function BubbleMenu({ rect, offset = 8, children }: BubbleMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; flipped: boolean }>({
    top: 0,
    left: 0,
    flipped: false,
  });

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const w = el.offsetWidth || 200;
    const h = el.offsetHeight || 36;
    const scrollX = typeof window !== "undefined" ? window.scrollX : 0;
    const scrollY = typeof window !== "undefined" ? window.scrollY : 0;
    const above = rect.top - h - offset;
    const flipped = above < 0;
    const top = (flipped ? rect.bottom + offset : rect.top - h - offset) + scrollY;
    const centered = rect.left + rect.width / 2 - w / 2 + scrollX;
    setPos({ top, left: Math.max(8 + scrollX, centered), flipped });
  }, [rect.top, rect.left, rect.bottom, rect.right, rect.width, rect.height, offset]);

  if (typeof document === "undefined") return null;
  return createPortal(
    <div
      ref={ref}
      className="rrt2-bubble"
      role="toolbar"
      aria-label="Selection actions"
      data-flipped={pos.flipped ? "true" : undefined}
      style={{ position: "absolute", top: pos.top, left: pos.left, zIndex: 1000 }}
      onMouseDown={(e) => e.preventDefault()}
    >
      {children}
    </div>,
    document.body,
  );
}
