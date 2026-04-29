import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useId,
  type RefObject,
} from "react";

export type TooltipPlacement = "top" | "bottom" | "left" | "right";

export interface UseTooltipOptions {
  placement?: TooltipPlacement;
  /** Delay in ms before showing. Default: 0 */
  delay?: number;
  /** Disable the tooltip entirely. Default: false */
  disabled?: boolean;
}

export interface UseTooltipResult {
  /** Attach to the trigger element */
  triggerProps: {
    ref: RefObject<HTMLElement>;
    "aria-describedby": string | undefined;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onFocus: () => void;
    onBlur: () => void;
  };
  /** Attach to the tooltip content element */
  tooltipProps: {
    id: string;
    role: "tooltip";
    hidden: boolean;
  };
  /** The resolved placement (may flip near viewport edges) */
  placement: TooltipPlacement;
  /** Whether the tooltip is currently visible */
  isVisible: boolean;
}

export function useTooltip({
  placement = "top",
  delay = 0,
  disabled = false,
}: UseTooltipOptions = {}): UseTooltipResult {
  const id = useId();
  const [isVisible, setIsVisible] = useState(false);
  const [resolvedPlacement, setResolvedPlacement] =
    useState<TooltipPlacement>(placement);
  const triggerRef = useRef<HTMLElement>(null);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (showTimer.current !== null) {
      clearTimeout(showTimer.current);
      showTimer.current = null;
    }
  }, []);

  const show = useCallback(() => {
    if (disabled) return;
    clearTimer();
    showTimer.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  }, [disabled, delay, clearTimer]);

  const hide = useCallback(() => {
    clearTimer();
    setIsVisible(false);
  }, [clearTimer]);

  // Compute flip placement based on trigger position in viewport
  useEffect(() => {
    if (!isVisible || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const MARGIN = 80;

    let flipped = placement;
    if (placement === "top" && rect.top < MARGIN) flipped = "bottom";
    else if (placement === "bottom" && rect.bottom > vh - MARGIN) flipped = "top";
    else if (placement === "left" && rect.left < MARGIN) flipped = "right";
    else if (placement === "right" && rect.right > vw - MARGIN) flipped = "left";

    setResolvedPlacement(flipped);
  }, [isVisible, placement]);

  // Hide on Escape
  useEffect(() => {
    if (!isVisible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") hide();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isVisible, hide]);

  // Cleanup timer on unmount
  useEffect(() => () => clearTimer(), [clearTimer]);

  return {
    triggerProps: {
      ref: triggerRef as RefObject<HTMLElement>,
      "aria-describedby": isVisible ? id : undefined,
      onMouseEnter: show,
      onMouseLeave: hide,
      onFocus: show,
      onBlur: hide,
    },
    tooltipProps: {
      id,
      role: "tooltip",
      hidden: !isVisible,
    },
    placement: resolvedPlacement,
    isVisible,
  };
}
