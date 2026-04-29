import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useId,
  type RefObject,
} from "react";

export type PopoverPlacement = "top" | "bottom" | "left" | "right";
export type PopoverTrigger = "click" | "hover";

export interface UsePopoverOptions {
  placement?: PopoverPlacement;
  trigger?: PopoverTrigger;
  /** Close when clicking outside the popover. Default: true */
  closeOnOutsideClick?: boolean;
  /** Close when pressing Escape. Default: true */
  closeOnEsc?: boolean;
}

export interface UsePopoverResult {
  /** Attach to the trigger element */
  triggerProps: {
    ref: RefObject<HTMLElement>;
    "aria-haspopup": "dialog";
    "aria-expanded": boolean;
    "aria-controls": string;
    onClick?: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    onFocus?: () => void;
    onBlur?: () => void;
  };
  /** Attach to the popover content element */
  popoverProps: {
    id: string;
    role: "dialog";
    "aria-modal": false;
  };
  /** Whether the popover is currently open */
  isOpen: boolean;
  /** Open the popover */
  open: () => void;
  /** Close the popover */
  close: () => void;
  /** Toggle the popover open/closed */
  toggle: () => void;
}

export function usePopover({
  placement = "bottom",
  trigger = "click",
  closeOnOutsideClick = true,
  closeOnEsc = true,
}: UsePopoverOptions = {}): UsePopoverResult {
  const id = useId();
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLElement>(null);
  const hoverLeaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHoverTimer = useCallback(() => {
    if (hoverLeaveTimer.current !== null) {
      clearTimeout(hoverLeaveTimer.current);
      hoverLeaveTimer.current = null;
    }
  }, []);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  useEffect(() => {
    if (!isOpen) return;

    if (closeOnEsc) {
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") close();
      };
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }
  }, [isOpen, closeOnEsc, close]);

  useEffect(() => {
    if (!isOpen || !closeOnOutsideClick || trigger !== "click") return;

    const onPointerDown = (e: PointerEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        const popoverEl = document.getElementById(id);
        if (!popoverEl || !popoverEl.contains(e.target as Node)) {
          close();
        }
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isOpen, closeOnOutsideClick, trigger, id, close]);

  useEffect(() => () => clearHoverTimer(), [clearHoverTimer]);

  const triggerProps: UsePopoverResult["triggerProps"] = {
    ref: triggerRef as RefObject<HTMLElement>,
    "aria-haspopup": "dialog",
    "aria-expanded": isOpen,
    "aria-controls": id,
  };

  if (trigger === "click") {
    triggerProps.onClick = toggle;
  } else {
    triggerProps.onMouseEnter = () => {
      clearHoverTimer();
      open();
    };
    triggerProps.onMouseLeave = () => {
      hoverLeaveTimer.current = setTimeout(() => {
        const popoverEl = document.getElementById(id);
        if (!popoverEl?.matches(":hover")) close();
      }, 100);
    };
    triggerProps.onFocus = open;
    triggerProps.onBlur = () => {
      hoverLeaveTimer.current = setTimeout(() => close(), 100);
    };
  }

  return {
    triggerProps,
    popoverProps: {
      id,
      role: "dialog",
      "aria-modal": false,
    },
    isOpen,
    open,
    close,
    toggle,
  };
}
