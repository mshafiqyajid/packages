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
import type { TooltipPlacement } from "../useTooltip";

export type TooltipSize = "sm" | "md" | "lg";
export type TooltipTone = "neutral" | "primary" | "success" | "danger";

export interface TooltipStyledProps {
  /** The element that triggers the tooltip */
  children: ReactElement;
  /** Tooltip text or content */
  content: ReactNode;
  placement?: TooltipPlacement;
  size?: TooltipSize;
  tone?: TooltipTone;
  /** Delay in ms before showing. Default: 0 */
  delay?: number;
  /** Disable the tooltip entirely */
  disabled?: boolean;
  /** Allow content to wrap across multiple lines (e.g. for rich HTML content) */
  multiline?: boolean;
  className?: string;
}

const GAP = 8;

function computeCoords(
  trigger: DOMRect,
  tooltip: DOMRect,
  placement: TooltipPlacement,
): { top: number; left: number } {
  const sx = window.scrollX;
  const sy = window.scrollY;
  switch (placement) {
    case "top":
      return {
        top:  trigger.top  + sy - tooltip.height - GAP,
        left: trigger.left + sx + (trigger.width - tooltip.width) / 2,
      };
    case "bottom":
      return {
        top:  trigger.bottom + sy + GAP,
        left: trigger.left   + sx + (trigger.width - tooltip.width) / 2,
      };
    case "left":
      return {
        top:  trigger.top  + sy + (trigger.height - tooltip.height) / 2,
        left: trigger.left + sx - tooltip.width - GAP,
      };
    case "right":
      return {
        top:  trigger.top   + sy + (trigger.height - tooltip.height) / 2,
        left: trigger.right + sx + GAP,
      };
  }
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

    // SSR-safe portal mount
    useEffect(() => { setMounted(true); }, []);

    const clearTimer = useCallback(() => {
      if (timer.current !== null) { clearTimeout(timer.current); timer.current = null; }
    }, []);

    const updateCoords = useCallback((pl: TooltipPlacement) => {
      if (!triggerRef.current || !tooltipRef.current) return;
      const pos = computeCoords(
        triggerRef.current.getBoundingClientRect(),
        tooltipRef.current.getBoundingClientRect(),
        pl,
      );
      setCoords(pos);
    }, []);

    const show = useCallback(() => {
      if (disabled) return;
      clearTimer();
      timer.current = setTimeout(() => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const MARGIN = 80;
        let pl = placement;
        if (placement === "top"    && rect.top    < MARGIN)                     pl = "bottom";
        else if (placement === "bottom" && rect.bottom > window.innerHeight - MARGIN) pl = "top";
        else if (placement === "left"   && rect.left   < MARGIN)                pl = "right";
        else if (placement === "right"  && rect.right  > window.innerWidth - MARGIN)  pl = "left";
        setResolvedPlacement(pl);
        setIsVisible(true);
      }, delay);
    }, [disabled, delay, placement, clearTimer]);

    const hide = useCallback(() => { clearTimer(); setIsVisible(false); }, [clearTimer]);

    // Recompute coords after visible (tooltip has real size now)
    useEffect(() => {
      if (isVisible) updateCoords(resolvedPlacement);
    }, [isVisible, resolvedPlacement, updateCoords]);

    useEffect(() => {
      if (!isVisible) return;
      const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") hide(); };
      const onScroll = () => updateCoords(resolvedPlacement);
      document.addEventListener("keydown", onKey);
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      return () => {
        document.removeEventListener("keydown", onKey);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      };
    }, [isVisible, hide, resolvedPlacement, updateCoords]);

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
      position: "absolute",
      top: coords.top,
      left: coords.left,
      zIndex: 9999,
    };

    return (
      <>
        {trigger}
        {mounted && createPortal(
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
