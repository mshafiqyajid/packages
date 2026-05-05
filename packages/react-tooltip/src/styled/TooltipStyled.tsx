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
  TooltipPlacement,
  TooltipSide,
  TooltipAlign,
  TooltipStrategy,
} from "../useTooltip";

export type TooltipSize = "sm" | "md" | "lg";
export type TooltipTone = "neutral" | "primary" | "success" | "danger";

export interface TooltipStyledProps {
  children: ReactElement;
  content: ReactNode;
  placement?: TooltipPlacement;
  size?: TooltipSize;
  tone?: TooltipTone;
  delay?: number;
  disabled?: boolean;
  multiline?: boolean;
  /** Gap in px between trigger and tooltip. Default: 8 */
  offset?: number;
  /** Viewport edge padding for flip / shift. Default: 8 */
  collisionPadding?: number;
  /** Auto-flip to opposite side when there isn't room. Default: true */
  flip?: boolean;
  /** Push back into view along the cross-axis when crowded. Default: true */
  shift?: boolean;
  /** "absolute" or "fixed" positioning. Default: "absolute" */
  strategy?: TooltipStrategy;
  className?: string;
}

function parsePlacement(p: TooltipPlacement): { side: TooltipSide; align: TooltipAlign } {
  const dash = p.indexOf("-");
  if (dash === -1) return { side: p as TooltipSide, align: "center" };
  return {
    side: p.slice(0, dash) as TooltipSide,
    align: p.slice(dash + 1) as TooltipAlign,
  };
}

function buildPlacement(side: TooltipSide, align: TooltipAlign): TooltipPlacement {
  return (align === "center" ? side : `${side}-${align}`) as TooltipPlacement;
}

interface ComputeOpts {
  trigger: DOMRect;
  floating: DOMRect;
  placement: TooltipPlacement;
  offset: number;
  collisionPadding: number;
  flip: boolean;
  shift: boolean;
  strategy: TooltipStrategy;
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
}: ComputeOpts): { top: number; left: number; placement: TooltipPlacement } {
  const { side, align } = parsePlacement(placement);
  const sx = strategy === "absolute" ? window.scrollX : 0;
  const sy = strategy === "absolute" ? window.scrollY : 0;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let chosen: TooltipSide = side;
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

export const TooltipStyled = forwardRef<HTMLDivElement, TooltipStyledProps>(
  function TooltipStyled(
    {
      children,
      content,
      placement = "top",
      size = "md",
      tone = "neutral",
      delay = 0,
      disabled = false,
      multiline = false,
      offset = 8,
      collisionPadding = 8,
      flip = true,
      shift = true,
      strategy = "absolute",
    },
    ref,
  ) {
    const id = useId();
    const [isVisible, setIsVisible] = useState(false);
    const [resolvedPlacement, setResolvedPlacement] = useState<TooltipPlacement>(placement);
    const [coords, setCoords] = useState<{ top: number; left: number }>({ top: -9999, left: -9999 });
    const [mounted, setMounted] = useState(false);

    const triggerRef = useRef<HTMLElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
      setMounted(true);
    }, []);

    const clearTimer = useCallback(() => {
      if (timer.current !== null) {
        clearTimeout(timer.current);
        timer.current = null;
      }
    }, []);

    const updateCoords = useCallback(() => {
      if (!triggerRef.current || !tooltipRef.current) return;
      const pos = computePosition({
        trigger: triggerRef.current.getBoundingClientRect(),
        floating: tooltipRef.current.getBoundingClientRect(),
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

    const show = useCallback(() => {
      if (disabled) return;
      clearTimer();
      timer.current = setTimeout(() => {
        setIsVisible(true);
      }, delay);
    }, [disabled, delay, clearTimer]);

    const hide = useCallback(() => {
      clearTimer();
      setIsVisible(false);
    }, [clearTimer]);

    useEffect(() => {
      if (isVisible) updateCoords();
    }, [isVisible, updateCoords]);

    useEffect(() => {
      if (!isVisible) return;
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") hide();
      };
      const onScroll = () => updateCoords();
      document.addEventListener("keydown", onKey);
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      return () => {
        document.removeEventListener("keydown", onKey);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      };
    }, [isVisible, hide, updateCoords]);

    useEffect(() => () => clearTimer(), [clearTimer]);

    const trigger = isValidElement(children)
      ? cloneElement(children as ReactElement<Record<string, unknown>>, {
          ref: (el: HTMLElement | null) => {
            (triggerRef as React.MutableRefObject<HTMLElement | null>).current = el;
            const childRef = (children as ReactElement & { ref?: React.Ref<unknown> }).ref;
            if (typeof childRef === "function") childRef(el);
            else if (childRef && typeof childRef === "object") {
              (childRef as React.MutableRefObject<HTMLElement | null>).current = el;
            }
          },
          "aria-describedby": isVisible ? id : undefined,
          onMouseEnter: (e: React.MouseEvent) => {
            show();
            (children.props as { onMouseEnter?: (e: React.MouseEvent) => void }).onMouseEnter?.(e);
          },
          onMouseLeave: (e: React.MouseEvent) => {
            hide();
            (children.props as { onMouseLeave?: (e: React.MouseEvent) => void }).onMouseLeave?.(e);
          },
          onFocus: (e: React.FocusEvent) => {
            show();
            (children.props as { onFocus?: (e: React.FocusEvent) => void }).onFocus?.(e);
          },
          onBlur: (e: React.FocusEvent) => {
            hide();
            (children.props as { onBlur?: (e: React.FocusEvent) => void }).onBlur?.(e);
          },
        })
      : children;

    const tooltipStyle: CSSProperties = {
      position: strategy,
      top: coords.top,
      left: coords.left,
      zIndex: 9999,
    };

    return (
      <>
        {trigger}
        {mounted &&
          createPortal(
            <div
              ref={(el) => {
                (tooltipRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
                if (typeof ref === "function") ref(el);
                else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
              }}
              id={id}
              role="tooltip"
              className="rtt-tooltip"
              data-placement={resolvedPlacement}
              data-size={size}
              data-tone={tone}
              data-visible={isVisible ? "true" : undefined}
              data-multiline={multiline ? "true" : undefined}
              aria-hidden={!isVisible}
              style={tooltipStyle}
            >
              <span className="rtt-content">{content}</span>
            </div>,
            document.body,
          )}
      </>
    );
  },
);
