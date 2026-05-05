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

export type DropdownMenuSide = "top" | "bottom" | "left" | "right";
export type DropdownMenuAlign = "start" | "center" | "end";
export type DropdownMenuPlacement =
  | DropdownMenuSide
  | `${DropdownMenuSide}-start`
  | `${DropdownMenuSide}-end`;
export type DropdownMenuSize = "sm" | "md" | "lg";
export type DropdownMenuStrategy = "absolute" | "fixed";

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
  /** Gap in px between trigger and menu. Default: 4 */
  offset?: number;
  /** Viewport edge padding for flip / shift. Default: 8 */
  collisionPadding?: number;
  /** Auto-flip to the opposite side when there isn't room. Default: true */
  flip?: boolean;
  /** Push back into view along the cross-axis. Default: true */
  shift?: boolean;
  /** "absolute" or "fixed" positioning. Default: "absolute" */
  strategy?: DropdownMenuStrategy;
}

function parsePlacement(p: DropdownMenuPlacement): {
  side: DropdownMenuSide;
  align: DropdownMenuAlign;
} {
  const dash = p.indexOf("-");
  if (dash === -1) {
    const side = p as DropdownMenuSide;
    return {
      side,
      align: side === "top" || side === "bottom" ? "start" : "center",
    };
  }
  return {
    side: p.slice(0, dash) as DropdownMenuSide,
    align: p.slice(dash + 1) as DropdownMenuAlign,
  };
}

function buildPlacement(
  side: DropdownMenuSide,
  align: DropdownMenuAlign,
): DropdownMenuPlacement {
  return (align === "center" ? side : `${side}-${align}`) as DropdownMenuPlacement;
}

interface ComputeOpts {
  trigger: DOMRect;
  floating: DOMRect;
  placement: DropdownMenuPlacement;
  offset: number;
  collisionPadding: number;
  flip: boolean;
  shift: boolean;
  strategy: DropdownMenuStrategy;
}

function computePosition({
  trigger,
  floating,
  placement,
  offset,
  collisionPadding,
  flip,
  shift,
  strategy,
}: ComputeOpts): { top: number; left: number; placement: DropdownMenuPlacement } {
  const { side, align } = parsePlacement(placement);
  const sx = strategy === "absolute" ? window.scrollX : 0;
  const sy = strategy === "absolute" ? window.scrollY : 0;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let chosen: DropdownMenuSide = side;
  if (flip) {
    if (side === "top" && trigger.top < floating.height + offset + collisionPadding) {
      if (vh - trigger.bottom >= floating.height + offset + collisionPadding) chosen = "bottom";
    } else if (
      side === "bottom" &&
      vh - trigger.bottom < floating.height + offset + collisionPadding
    ) {
      if (trigger.top >= floating.height + offset + collisionPadding) chosen = "top";
    } else if (side === "left" && trigger.left < floating.width + offset + collisionPadding) {
      if (vw - trigger.right >= floating.width + offset + collisionPadding) chosen = "right";
    } else if (
      side === "right" &&
      vw - trigger.right < floating.width + offset + collisionPadding
    ) {
      if (trigger.left >= floating.width + offset + collisionPadding) chosen = "left";
    }
  }

  let top = 0;
  let left = 0;
  if (chosen === "top" || chosen === "bottom") {
    top = chosen === "top" ? trigger.top - floating.height - offset : trigger.bottom + offset;
    if (align === "start") left = trigger.left;
    else if (align === "end") left = trigger.right - floating.width;
    else left = trigger.left + (trigger.width - floating.width) / 2;
  } else {
    left = chosen === "left" ? trigger.left - floating.width - offset : trigger.right + offset;
    if (align === "start") top = trigger.top;
    else if (align === "end") top = trigger.bottom - floating.height;
    else top = trigger.top + (trigger.height - floating.height) / 2;
  }

  if (shift) {
    if (chosen === "top" || chosen === "bottom") {
      const min = collisionPadding;
      const max = vw - floating.width - collisionPadding;
      if (max >= min) left = Math.max(min, Math.min(left, max));
    } else {
      const min = collisionPadding;
      const max = vh - floating.height - collisionPadding;
      if (max >= min) top = Math.max(min, Math.min(top, max));
    }
  }

  return { top: top + sy, left: left + sx, placement: buildPlacement(chosen, align) };
}

export const DropdownMenuStyled = forwardRef<HTMLElement, DropdownMenuStyledProps>(
  function DropdownMenuStyled(
    {
      trigger,
      items,
      placement = "bottom-start",
      size = "md",
      className,
      offset = 4,
      collisionPadding = 8,
      flip = true,
      shift = true,
      strategy = "absolute",
    },
    ref,
  ) {
    const [resolvedPlacement, setResolvedPlacement] =
      useState<DropdownMenuPlacement>(placement);
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
      const pos = computePosition({
        trigger: triggerRef.current.getBoundingClientRect(),
        floating: menuRef.current.getBoundingClientRect(),
        placement,
        offset,
        collisionPadding,
        flip,
        shift,
        strategy,
      });
      setCoords({ top: pos.top, left: pos.left });
      setResolvedPlacement(pos.placement);
    }, [placement, offset, collisionPadding, flip, shift, strategy]);

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

    const menuStyle: CSSProperties = { position: strategy, top: coords.top, left: coords.left, zIndex: 9999 };

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
            data-placement={resolvedPlacement}
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
