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
import type { PopoverPlacement, PopoverTrigger } from "../usePopover";

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
  className?: string;
}

function computeCoords(
  trigger: DOMRect,
  popover: DOMRect,
  placement: PopoverPlacement,
  offset: number,
): { top: number; left: number } {
  const sx = window.scrollX;
  const sy = window.scrollY;
  switch (placement) {
    case "top":
      return {
        top: trigger.top + sy - popover.height - offset,
        left: trigger.left + sx + (trigger.width - popover.width) / 2,
      };
    case "bottom":
      return {
        top: trigger.bottom + sy + offset,
        left: trigger.left + sx + (trigger.width - popover.width) / 2,
      };
    case "left":
      return {
        top: trigger.top + sy + (trigger.height - popover.height) / 2,
        left: trigger.left + sx - popover.width - offset,
      };
    case "right":
      return {
        top: trigger.top + sy + (trigger.height - popover.height) / 2,
        left: trigger.right + sx + offset,
      };
  }
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
      const rect = triggerRef.current.getBoundingClientRect();
      const MARGIN = 80;
      let pl = placement;
      if (placement === "top" && rect.top < MARGIN) pl = "bottom";
      else if (placement === "bottom" && rect.bottom > window.innerHeight - MARGIN) pl = "top";
      else if (placement === "left" && rect.left < MARGIN) pl = "right";
      else if (placement === "right" && rect.right > window.innerWidth - MARGIN) pl = "left";
      setResolvedPlacement(pl);
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

    const updateCoords = useCallback(
      (pl: PopoverPlacement) => {
        if (!triggerRef.current || !popoverRef.current) return;
        const pos = computeCoords(
          triggerRef.current.getBoundingClientRect(),
          popoverRef.current.getBoundingClientRect(),
          pl,
          offset,
        );
        setCoords(pos);
      },
      [offset],
    );

    // Recompute coords after open (popover has real size now)
    useEffect(() => {
      if (isOpen) updateCoords(resolvedPlacement);
    }, [isOpen, resolvedPlacement, updateCoords]);

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
      const onReposition = () => updateCoords(resolvedPlacement);
      window.addEventListener("scroll", onReposition, { passive: true });
      window.addEventListener("resize", onReposition, { passive: true });
      return () => {
        window.removeEventListener("scroll", onReposition);
        window.removeEventListener("resize", onReposition);
      };
    }, [isOpen, resolvedPlacement, updateCoords]);

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
      position: "absolute",
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
