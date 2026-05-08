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
  HoverCardPlacement,
  HoverCardSide,
  HoverCardAlign,
  HoverCardStrategy,
} from "../useHoverCard";

export interface HoverCardStyledProps {
  /** The element that triggers the hover card */
  children: ReactElement;
  /** Hover card body content — any ReactNode */
  content: ReactNode;
  /** Open delay in ms. Default: 300 */
  openDelay?: number;
  /** Close delay in ms after mouse-leave. Default: 100 */
  closeDelay?: number;
  /** Preferred placement. "auto" picks the side with the most room. Default: "auto" */
  placement?: HoverCardPlacement;
  /** Gap in px between trigger and card. Default: 8 */
  offset?: number;
  /** Viewport edge padding for flip / shift. Default: 8 */
  collisionPadding?: number;
  /** Auto-flip to opposite side when there isn't room. Default: true */
  flip?: boolean;
  /** Push back into view along the cross-axis when crowded. Default: true */
  shift?: boolean;
  /** Show the arrow pointer. Default: true */
  arrow?: boolean;
  /** "absolute" (page-relative) or "fixed" (viewport-relative). Default: "absolute" */
  strategy?: HoverCardStrategy;
  /** Controlled open state */
  open?: boolean;
  /** Default open (uncontrolled). Default: false */
  defaultOpen?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  className?: string;
  style?: CSSProperties;
}

function parsePlacement(p: Exclude<HoverCardPlacement, "auto">): { side: HoverCardSide; align: HoverCardAlign } {
  const dash = p.indexOf("-");
  if (dash === -1) return { side: p as HoverCardSide, align: "center" };
  return {
    side: p.slice(0, dash) as HoverCardSide,
    align: p.slice(dash + 1) as HoverCardAlign,
  };
}

function buildPlacement(side: HoverCardSide, align: HoverCardAlign): HoverCardSide | `${HoverCardSide}-${HoverCardAlign}` {
  return (align === "center" ? side : `${side}-${align}`) as HoverCardSide | `${HoverCardSide}-${HoverCardAlign}`;
}

function resolveAutoPlacement(trigger: DOMRect): HoverCardSide {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const spaceTop = trigger.top;
  const spaceBottom = vh - trigger.bottom;
  const spaceLeft = trigger.left;
  const spaceRight = vw - trigger.right;
  const max = Math.max(spaceTop, spaceBottom, spaceLeft, spaceRight);
  if (max === spaceBottom) return "bottom";
  if (max === spaceTop) return "top";
  if (max === spaceRight) return "right";
  return "left";
}

interface ComputeOptions {
  trigger: DOMRect;
  floating: DOMRect;
  placement: Exclude<HoverCardPlacement, "auto">;
  offset: number;
  collisionPadding: number;
  flip: boolean;
  shift: boolean;
  strategy: HoverCardStrategy;
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
}: ComputeOptions): { top: number; left: number; placement: HoverCardSide | `${HoverCardSide}-${HoverCardAlign}` } {
  const { side, align } = parsePlacement(placement);
  const sx = strategy === "absolute" ? window.scrollX : 0;
  const sy = strategy === "absolute" ? window.scrollY : 0;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let chosen: HoverCardSide = side;
  if (flip) {
    if (side === "top" && trigger.top < floating.height + offset + collisionPadding) {
      if (vh - trigger.bottom >= floating.height + offset + collisionPadding) chosen = "bottom";
    } else if (side === "bottom" && vh - trigger.bottom < floating.height + offset + collisionPadding) {
      if (trigger.top >= floating.height + offset + collisionPadding) chosen = "top";
    } else if (side === "left" && trigger.left < floating.width + offset + collisionPadding) {
      if (vw - trigger.right >= floating.width + offset + collisionPadding) chosen = "right";
    } else if (side === "right" && vw - trigger.right < floating.width + offset + collisionPadding) {
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

export const HoverCardStyled = forwardRef<HTMLDivElement, HoverCardStyledProps>(
  function HoverCardStyled(
    {
      children,
      content,
      openDelay = 300,
      closeDelay = 100,
      placement: placementProp = "auto",
      offset = 8,
      collisionPadding = 8,
      flip = true,
      shift = true,
      arrow = true,
      strategy = "absolute",
      open: controlledOpen,
      defaultOpen = false,
      onOpenChange,
      className,
      style,
    },
    ref,
  ) {
    const id = useId();
    const isControlled = controlledOpen !== undefined;
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const isOpen = isControlled ? controlledOpen! : internalOpen;

    const [rendered, setRendered] = useState(isOpen);
    const [resolvedPlacement, setResolvedPlacement] = useState<HoverCardSide | `${HoverCardSide}-${HoverCardAlign}`>("bottom");
    const [coords, setCoords] = useState<{ top: number; left: number }>({ top: -9999, left: -9999 });
    const [mounted, setMounted] = useState(false);

    const triggerRef = useRef<HTMLElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => { setMounted(true); }, []);

    const clearTimers = useCallback(() => {
      if (openTimer.current !== null) { clearTimeout(openTimer.current); openTimer.current = null; }
      if (closeTimer.current !== null) { clearTimeout(closeTimer.current); closeTimer.current = null; }
    }, []);

    // When isOpen transitions to false, start the exit timer so the card
    // can play its close transition before unmounting.
    useEffect(() => {
      if (isOpen) {
        if (exitTimer.current) { clearTimeout(exitTimer.current); exitTimer.current = null; }
        setRendered(true);
      } else {
        exitTimer.current = setTimeout(() => setRendered(false), 200);
      }
    }, [isOpen]);

    const doOpen = useCallback(() => {
      if (!isControlled) setInternalOpen(true);
      onOpenChange?.(true);
    }, [isControlled, onOpenChange]);

    const doClose = useCallback(() => {
      if (!isControlled) setInternalOpen(false);
      onOpenChange?.(false);
    }, [isControlled, onOpenChange]);

    const scheduleOpen = useCallback(() => {
      clearTimers();
      openTimer.current = setTimeout(doOpen, openDelay);
    }, [clearTimers, doOpen, openDelay]);

    const scheduleClose = useCallback(() => {
      clearTimers();
      closeTimer.current = setTimeout(doClose, closeDelay);
    }, [clearTimers, doClose, closeDelay]);

    const updateCoords = useCallback(() => {
      if (!triggerRef.current || !cardRef.current) return;
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const effectivePlacement: Exclude<HoverCardPlacement, "auto"> =
        placementProp === "auto" ? resolveAutoPlacement(triggerRect) : placementProp;
      const pos = computePosition({
        trigger: triggerRect,
        floating: cardRef.current.getBoundingClientRect(),
        placement: effectivePlacement,
        offset,
        collisionPadding,
        flip,
        shift,
        strategy,
      });
      setCoords({ top: pos.top, left: pos.left });
      setResolvedPlacement(pos.placement);
    }, [placementProp, offset, collisionPadding, flip, shift, strategy]);

    useEffect(() => {
      if (isOpen && rendered) updateCoords();
    }, [isOpen, rendered, updateCoords]);

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

    // Escape key
    useEffect(() => {
      if (!isOpen) return;
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") doClose();
      };
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }, [isOpen, doClose]);

    useEffect(() => () => {
      clearTimers();
      if (exitTimer.current) clearTimeout(exitTimer.current);
    }, [clearTimers]);

    const triggerElement = isValidElement(children)
      ? cloneElement(children as ReactElement<Record<string, unknown>>, {
          ref: (el: HTMLElement | null) => {
            (triggerRef as React.MutableRefObject<HTMLElement | null>).current = el;
            const childRef = (children as ReactElement & { ref?: React.Ref<unknown> }).ref;
            if (typeof childRef === "function") childRef(el);
            else if (childRef && typeof childRef === "object") {
              (childRef as React.MutableRefObject<HTMLElement | null>).current = el;
            }
          },
          "aria-describedby": isOpen ? id : undefined,
          onMouseEnter: (e: React.MouseEvent) => {
            scheduleOpen();
            (children.props as { onMouseEnter?: (e: React.MouseEvent) => void }).onMouseEnter?.(e);
          },
          onMouseLeave: (e: React.MouseEvent) => {
            scheduleClose();
            (children.props as { onMouseLeave?: (e: React.MouseEvent) => void }).onMouseLeave?.(e);
          },
          onFocus: (e: React.FocusEvent) => {
            scheduleOpen();
            (children.props as { onFocus?: (e: React.FocusEvent) => void }).onFocus?.(e);
          },
          onBlur: (e: React.FocusEvent) => {
            scheduleClose();
            (children.props as { onBlur?: (e: React.FocusEvent) => void }).onBlur?.(e);
          },
        })
      : children;

    const cardStyle: CSSProperties = {
      position: strategy,
      top: coords.top,
      left: coords.left,
      zIndex: 9999,
    };

    const hasInteractiveContent = true; // hover card always allows interaction

    return (
      <>
        {triggerElement}
        {mounted && rendered &&
          createPortal(
            <div
              ref={(el) => {
                (cardRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
                if (typeof ref === "function") ref(el);
                else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
              }}
              id={id}
              role="dialog"
              aria-modal={false as unknown as boolean | undefined}
              className={`rhc-card${className ? ` ${className}` : ""}`}
              data-state={isOpen ? "open" : "closed"}
              data-placement={resolvedPlacement}
              data-arrow={arrow ? "true" : undefined}
              style={{ ...cardStyle, ...(style ?? {}) }}
              onMouseEnter={() => clearTimers()}
              onMouseLeave={scheduleClose}
            >
              {hasInteractiveContent && <div className="rhc-content">{content}</div>}
            </div>,
            document.body,
          )}
      </>
    );
  },
);
