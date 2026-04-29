import {
  forwardRef,
  useRef,
  useState,
  useCallback,
  useEffect,
  useId,
  cloneElement,
  isValidElement,
  type ReactNode,
  type ReactElement,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";

export type DropdownMenuPlacement = "bottom-start" | "bottom-end" | "top-start" | "top-end";
export type DropdownMenuSize = "sm" | "md" | "lg";

export interface DropdownMenuItem {
  label?: string;
  icon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  divider?: boolean;
}

export interface DropdownMenuStyledProps {
  /** The trigger element — any ReactElement (button, icon, etc.) */
  trigger: ReactElement;
  items: DropdownMenuItem[];
  placement?: DropdownMenuPlacement;
  size?: DropdownMenuSize;
  className?: string;
}

const GAP = 4;

function computeCoords(
  triggerRect: DOMRect,
  menuRect: DOMRect,
  placement: DropdownMenuPlacement,
): { top: number; left: number } {
  const sx = window.scrollX;
  const sy = window.scrollY;
  const MARGIN = 8;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let v: "top" | "bottom" = placement.startsWith("bottom") ? "bottom" : "top";
  let h: "start" | "end" = placement.endsWith("start") ? "start" : "end";

  // Flip vertical
  if (v === "bottom" && triggerRect.bottom + menuRect.height + GAP > vh - MARGIN) v = "top";
  else if (v === "top" && triggerRect.top - menuRect.height - GAP < MARGIN) v = "bottom";

  // Flip horizontal
  if (h === "start" && triggerRect.left + menuRect.width > vw - MARGIN) h = "end";
  else if (h === "end" && triggerRect.right - menuRect.width < MARGIN) h = "start";

  const top = v === "bottom"
    ? triggerRect.bottom + sy + GAP
    : triggerRect.top + sy - menuRect.height - GAP;

  const left = h === "start"
    ? triggerRect.left + sx
    : triggerRect.right + sx - menuRect.width;

  return { top, left };
}

export const DropdownMenuStyled = forwardRef<HTMLElement, DropdownMenuStyledProps>(
  function DropdownMenuStyled(
    { trigger, items, placement = "bottom-start", size = "md", className },
    ref,
  ) {
    const menuId = useId();
    const [isOpen, setIsOpen] = useState(false);
    const [rendered, setRendered] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [coords, setCoords] = useState<{ top: number; left: number }>({ top: -9999, left: -9999 });
    const [mounted, setMounted] = useState(false);

    const triggerRef = useRef<HTMLElement>(null);
    const menuRef = useRef<HTMLUListElement>(null);
    const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => { setMounted(true); }, []);

    const visibleItems = items.filter((item) => !item.divider);

    const open = useCallback(() => {
      if (exitTimerRef.current) { clearTimeout(exitTimerRef.current); exitTimerRef.current = null; }
      setRendered(true);
      setIsOpen(false); // reset first
      setActiveIndex(0);
      requestAnimationFrame(() => requestAnimationFrame(() => setIsOpen(true)));
    }, []);

    const close = useCallback(() => {
      setIsOpen(false);
      setActiveIndex(-1);
      exitTimerRef.current = setTimeout(() => setRendered(false), 150);
      triggerRef.current?.focus();
    }, []);

    const updateCoords = useCallback(() => {
      if (!triggerRef.current || !menuRef.current) return;
      const pos = computeCoords(
        triggerRef.current.getBoundingClientRect(),
        menuRef.current.getBoundingClientRect(),
        placement,
      );
      setCoords(pos);
    }, [placement]);

    useEffect(() => {
      if (rendered) requestAnimationFrame(() => updateCoords());
    }, [rendered, updateCoords]);

    useEffect(() => {
      if (!rendered) return;
      const onScroll = () => updateCoords();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
    }, [rendered, updateCoords]);

    useEffect(() => {
      if (!rendered) return;
      const onPointerDown = (e: PointerEvent) => {
        if (!triggerRef.current?.contains(e.target as Node) && !menuRef.current?.contains(e.target as Node)) {
          close();
        }
      };
      document.addEventListener("pointerdown", onPointerDown);
      return () => document.removeEventListener("pointerdown", onPointerDown);
    }, [rendered, close]);

    useEffect(() => () => { if (exitTimerRef.current) clearTimeout(exitTimerRef.current); }, []);

    const handleTriggerKeyDown = useCallback((e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); isOpen ? close() : open(); }
      else if (e.key === "ArrowDown") { e.preventDefault(); isOpen ? setActiveIndex((i) => (i + 1) % visibleItems.length) : open(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); isOpen ? setActiveIndex((i) => (i - 1 + visibleItems.length) % visibleItems.length) : open(); }
      else if (e.key === "Escape") { e.preventDefault(); close(); }
      else if (e.key === "Tab") close();
    }, [isOpen, visibleItems.length, open, close]);

    const handleMenuKeyDown = useCallback((e: React.KeyboardEvent<HTMLUListElement>) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex((i) => (i + 1) % visibleItems.length); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIndex((i) => (i - 1 + visibleItems.length) % visibleItems.length); }
      else if (e.key === "Escape") { e.preventDefault(); close(); }
      else if (e.key === "Tab") close();
      else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const item = visibleItems[activeIndex];
        if (item && !item.disabled) { item.onClick?.(); close(); }
      }
    }, [visibleItems, activeIndex, close]);

    // Clone trigger to attach ref + aria + event handlers
    const triggerEl = isValidElement(trigger)
      ? cloneElement(trigger as ReactElement<Record<string, unknown>>, {
          ref: (el: HTMLElement | null) => {
            (triggerRef as React.MutableRefObject<HTMLElement | null>).current = el;
            if (typeof ref === "function") ref(el);
            else if (ref) (ref as React.MutableRefObject<HTMLElement | null>).current = el;
            const childRef = (trigger as ReactElement & { ref?: React.Ref<unknown> }).ref;
            if (typeof childRef === "function") childRef(el);
            else if (childRef && typeof childRef === "object") (childRef as React.MutableRefObject<HTMLElement | null>).current = el;
          },
          "aria-haspopup": "menu",
          "aria-expanded": isOpen,
          "aria-controls": isOpen ? menuId : undefined,
          "data-open": isOpen ? "true" : undefined,
          onClick: (e: React.MouseEvent) => {
            isOpen ? close() : open();
            (trigger.props as { onClick?: (e: React.MouseEvent) => void }).onClick?.(e);
          },
          onKeyDown: (e: React.KeyboardEvent) => {
            handleTriggerKeyDown(e);
            (trigger.props as { onKeyDown?: (e: React.KeyboardEvent) => void }).onKeyDown?.(e);
          },
        })
      : trigger;

    const menuStyle: CSSProperties = { position: "absolute", top: coords.top, left: coords.left, zIndex: 9999 };

    let visibleIndex = -1;

    return (
      <span className={["rdrop-root", className].filter(Boolean).join(" ")}>
        {triggerEl}
        {mounted && rendered && createPortal(
          <ul
            ref={menuRef}
            id={menuId}
            role="menu"
            className="rdrop-menu"
            data-placement={placement}
            data-size={size}
            data-open={isOpen ? "true" : undefined}
            tabIndex={-1}
            style={menuStyle}
            onKeyDown={handleMenuKeyDown}
          >
            {items.map((item, rawIndex) => {
              if (item.divider) {
                return <li key={rawIndex} role="separator" className="rdrop-divider" aria-hidden="true" />;
              }
              visibleIndex += 1;
              const curIdx = visibleIndex;
              const isActive = activeIndex === curIdx;
              return (
                <li
                  key={rawIndex}
                  role="menuitem"
                  tabIndex={isActive ? 0 : -1}
                  className="rdrop-item"
                  data-active={isActive ? "true" : undefined}
                  data-disabled={item.disabled ? "true" : undefined}
                  aria-disabled={item.disabled}
                  onMouseEnter={() => setActiveIndex(curIdx)}
                  onClick={() => { if (item.disabled) return; item.onClick?.(); close(); }}
                >
                  {item.icon && <span className="rdrop-item-icon" aria-hidden="true">{item.icon}</span>}
                  <span className="rdrop-item-label">{item.label}</span>
                </li>
              );
            })}
          </ul>,
          document.body,
        )}
      </span>
    );
  },
);
