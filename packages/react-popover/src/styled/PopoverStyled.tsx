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
import type {
  PopoverPlacement,
  PopoverSide,
  PopoverAlign,
  PopoverTrigger,
  PopoverStrategy,
} from "../usePopover";

export type PopoverSize = "sm" | "md" | "lg";

export interface PopoverStyledProps {
  /** The element that triggers the popover */
  children: ReactElement;
  /** Popover body content — any ReactNode */
  content: ReactNode;
  /** Optional header title */
  title?: string;
  placement?: PopoverPlacement;
  trigger?: PopoverTrigger;
  /** Close when clicking outside the popover. Default: true */
  closeOnOutsideClick?: boolean;
  /** Close when pressing Escape. Default: true */
  closeOnEsc?: boolean;
  size?: PopoverSize;
  /** Show the arrow pointer. Default: true */
  showArrow?: boolean;
  /** Gap in px between trigger and popover. Default: 8 */
  offset?: number;
  /** Viewport edge padding for flip / shift. Default: 8 */
  collisionPadding?: number;
  /** Auto-flip to the opposite side when there isn't room. Default: true */
  flip?: boolean;
  /** Push back into view along the cross-axis when crowded. Default: true */
  shift?: boolean;
  /** "absolute" (page-relative) or "fixed" (viewport-relative). Default: "absolute" */
  strategy?: PopoverStrategy;
  className?: string;
}

function parsePlacement(p: PopoverPlacement): { side: PopoverSide; align: PopoverAlign } {
  const dash = p.indexOf("-");
  if (dash === -1) return { side: p as PopoverSide, align: "center" };
  return {
    side: p.slice(0, dash) as PopoverSide,
    align: p.slice(dash + 1) as PopoverAlign,
  };
}

function buildPlacement(side: PopoverSide, align: PopoverAlign): PopoverPlacement {
  return (align === "center" ? side : `${side}-${align}`) as PopoverPlacement;
}

interface ComputeOptions {
  trigger: DOMRect;
  floating: DOMRect;
  placement: PopoverPlacement;
  offset: number;
  collisionPadding: number;
  flip: boolean;
  shift: boolean;
  strategy: PopoverStrategy;
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
}: ComputeOptions): { top: number; left: number; placement: PopoverPlacement } {
  const { side, align } = parsePlacement(placement);
  const sx = strategy === "absolute" ? window.scrollX : 0;
  const sy = strategy === "absolute" ? window.scrollY : 0;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let chosen: PopoverSide = side;
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

export const PopoverStyled = forwardRef<HTMLDivElement, PopoverStyledProps>(
  function PopoverStyled(
    {
      children,
      content,
      title,
      placement = "bottom",
      trigger = "click",
      closeOnOutsideClick = true,
      closeOnEsc = true,
      size = "md",
      showArrow = true,
      offset = 8,
      collisionPadding = 8,
      flip = true,
      shift = true,
      strategy = "absolute",
    },
    ref,
  ) {
    const id = useId();
    const [isOpen, setIsOpen] = useState(false);
    const [rendered, setRendered] = useState(false);
    const [resolvedPlacement, setResolvedPlacement] =
      useState<PopoverPlacement>(placement);
    const [coords, setCoords] = useState<{ top: number; left: number }>({
      top: -9999,
      left: -9999,
    });
    const [mounted, setMounted] = useState(false);
    const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const triggerRef = useRef<HTMLElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const hoverLeaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // SSR-safe portal mount
    useEffect(() => {
      setMounted(true);
    }, []);

    const clearHoverTimer = useCallback(() => {
      if (hoverLeaveTimer.current !== null) {
        clearTimeout(hoverLeaveTimer.current);
        hoverLeaveTimer.current = null;
      }
    }, []);

    const open = useCallback(() => {
      if (exitTimerRef.current) { clearTimeout(exitTimerRef.current); exitTimerRef.current = null; }
      if (!triggerRef.current) return;
      setResolvedPlacement(placement);
      setRendered(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setIsOpen(true)));
    }, [placement]);

    const close = useCallback(() => {
      setIsOpen(false);
      exitTimerRef.current = setTimeout(() => setRendered(false), 200);
    }, []);

    const toggle = useCallback(() => {
      if (isOpen) close();
      else open();
    }, [isOpen, open, close]);

    const updateCoords = useCallback(() => {
      if (!triggerRef.current || !popoverRef.current) return;
      const pos = computePosition({
        trigger: triggerRef.current.getBoundingClientRect(),
        floating: popoverRef.current.getBoundingClientRect(),
        placement,
        offset,
        collisionPadding,
        flip,
        shift,
        strategy,
      });
      setCoords({ top: pos.top, left: pos.left });
      setResolvedPlacement(pos.placement);
    }, [offset, collisionPadding, flip, shift, strategy, placement]);

    // Recompute coords after open (popover has real size now)
    useEffect(() => {
      if (isOpen) updateCoords();
    }, [isOpen, updateCoords]);

    // Escape key
    useEffect(() => {
      if (!isOpen || !closeOnEsc) return;
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") close();
      };
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }, [isOpen, closeOnEsc, close]);

    // Outside click
    useEffect(() => {
      if (!isOpen || !closeOnOutsideClick || trigger !== "click") return;
      const onPointerDown = (e: PointerEvent) => {
        if (
          triggerRef.current?.contains(e.target as Node) ||
          popoverRef.current?.contains(e.target as Node)
        )
          return;
        close();
      };
      document.addEventListener("pointerdown", onPointerDown);
      return () => document.removeEventListener("pointerdown", onPointerDown);
    }, [isOpen, closeOnOutsideClick, trigger, close]);

    // Reposition on scroll/resize
    useEffect(() => {
      if (!isOpen) return;
      const onReposition = () => updateCoords();
      window.addEventListener("scroll", onReposition, { passive: true });
      window.addEventListener("resize", onReposition, { passive: true });
      return () => {
        window.removeEventListener("scroll", onReposition);
        window.removeEventListener("resize", onReposition);
      };
    }, [isOpen, updateCoords]);

    useEffect(() => () => { clearHoverTimer(); if (exitTimerRef.current) clearTimeout(exitTimerRef.current); }, [clearHoverTimer]);

    const triggerElement = isValidElement(children)
      ? cloneElement(children as ReactElement<Record<string, unknown>>, {
          ref: (el: HTMLElement | null) => {
            (triggerRef as React.MutableRefObject<HTMLElement | null>).current =
              el;
            const childRef = (
              children as ReactElement & { ref?: React.Ref<unknown> }
            ).ref;
            if (typeof childRef === "function") childRef(el);
            else if (childRef && typeof childRef === "object") {
              (
                childRef as React.MutableRefObject<HTMLElement | null>
              ).current = el;
            }
          },
          "aria-haspopup": "dialog",
          "aria-expanded": isOpen,
          "aria-controls": id,
          ...(trigger === "click"
            ? {
                onClick: (e: React.MouseEvent) => {
                  toggle();
                  (
                    children.props as { onClick?: (e: React.MouseEvent) => void }
                  ).onClick?.(e);
                },
              }
            : {
                onMouseEnter: (e: React.MouseEvent) => {
                  clearHoverTimer();
                  open();
                  (
                    children.props as {
                      onMouseEnter?: (e: React.MouseEvent) => void;
                    }
                  ).onMouseEnter?.(e);
                },
                onMouseLeave: (e: React.MouseEvent) => {
                  hoverLeaveTimer.current = setTimeout(() => {
                    if (!popoverRef.current?.matches(":hover")) close();
                  }, 100);
                  (
                    children.props as {
                      onMouseLeave?: (e: React.MouseEvent) => void;
                    }
                  ).onMouseLeave?.(e);
                },
                onFocus: (e: React.FocusEvent) => {
                  open();
                  (
                    children.props as { onFocus?: (e: React.FocusEvent) => void }
                  ).onFocus?.(e);
                },
                onBlur: (e: React.FocusEvent) => {
                  hoverLeaveTimer.current = setTimeout(() => close(), 100);
                  (
                    children.props as { onBlur?: (e: React.FocusEvent) => void }
                  ).onBlur?.(e);
                },
              }),
        })
      : children;

    const popoverStyle: CSSProperties = {
      position: strategy,
      top: coords.top,
      left: coords.left,
      zIndex: 9999,
    };

    return (
      <>
        {triggerElement}
        {mounted && rendered &&
          createPortal(
            <div
              ref={(el) => {
                (
                  popoverRef as React.MutableRefObject<HTMLDivElement | null>
                ).current = el;
                if (typeof ref === "function") ref(el);
                else if (ref)
                  (
                    ref as React.MutableRefObject<HTMLDivElement | null>
                  ).current = el;
              }}
              id={id}
              role="dialog"
              aria-modal={false}
              className="rpop-popover"
              data-placement={resolvedPlacement}
              data-size={size}
              data-open={isOpen ? "true" : undefined}
              data-arrow={showArrow ? "true" : undefined}
              style={popoverStyle}
            >
              <div className="rpop-inner">
                {title && <div className="rpop-title">{title}</div>}
                <div className="rpop-content">{content}</div>
              </div>
            </div>,
            document.body,
          )}
      </>
    );
  },
);
