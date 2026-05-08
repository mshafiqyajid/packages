import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useId,
  type RefObject,
} from "react";

export type HoverCardSide = "top" | "bottom" | "left" | "right";
export type HoverCardAlign = "start" | "center" | "end";
export type HoverCardPlacement =
  | HoverCardSide
  | `${HoverCardSide}-start`
  | `${HoverCardSide}-end`
  | "auto";
export type HoverCardStrategy = "absolute" | "fixed";

export interface UseHoverCardOptions {
  /** Open delay in ms. Default: 300 */
  openDelay?: number;
  /** Close delay in ms after mouse-leave. Default: 100 */
  closeDelay?: number;
  /** Whether the card is controlled */
  open?: boolean;
  /** Default open state (uncontrolled). Default: false */
  defaultOpen?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
}

export interface UseHoverCardResult {
  /** Attach to the trigger element */
  triggerProps: {
    ref: RefObject<HTMLElement>;
    "aria-describedby": string | undefined;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onFocus: () => void;
    onBlur: () => void;
  };
  /** Attach to the hover card content element */
  cardProps: {
    id: string;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
  };
  /** Whether the card is currently open */
  isOpen: boolean;
  /** Imperatively open the card */
  open: () => void;
  /** Imperatively close the card */
  close: () => void;
}

export function useHoverCard({
  openDelay = 300,
  closeDelay = 100,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
}: UseHoverCardOptions = {}): UseHoverCardResult {
  const id = useId();
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = isControlled ? controlledOpen! : internalOpen;

  const triggerRef = useRef<HTMLElement>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (openTimer.current !== null) {
      clearTimeout(openTimer.current);
      openTimer.current = null;
    }
    if (closeTimer.current !== null) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const open = useCallback(() => {
    clearTimers();
    if (!isControlled) {
      setInternalOpen(true);
    }
    onOpenChange?.(true);
  }, [clearTimers, isControlled, onOpenChange]);

  const close = useCallback(() => {
    clearTimers();
    if (!isControlled) {
      setInternalOpen(false);
    }
    onOpenChange?.(false);
  }, [clearTimers, isControlled, onOpenChange]);

  const scheduleOpen = useCallback(() => {
    clearTimers();
    openTimer.current = setTimeout(open, openDelay);
  }, [clearTimers, open, openDelay]);

  const scheduleClose = useCallback(() => {
    clearTimers();
    closeTimer.current = setTimeout(close, closeDelay);
  }, [clearTimers, close, closeDelay]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  // Cleanup timers on unmount
  useEffect(() => () => clearTimers(), [clearTimers]);

  return {
    triggerProps: {
      ref: triggerRef as RefObject<HTMLElement>,
      "aria-describedby": isOpen ? id : undefined,
      onMouseEnter: scheduleOpen,
      onMouseLeave: scheduleClose,
      onFocus: scheduleOpen,
      onBlur: scheduleClose,
    },
    cardProps: {
      id,
      onMouseEnter: () => {
        // Hovering the card cancels the close timer
        clearTimers();
      },
      onMouseLeave: scheduleClose,
    },
    isOpen,
    open,
    close,
  };
}
