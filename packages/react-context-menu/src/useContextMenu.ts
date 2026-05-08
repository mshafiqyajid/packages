import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type RefObject,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";

export interface ContextMenuPosition {
  x: number;
  y: number;
}

export interface UseContextMenuOptions {
  /** Controlled open state */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Disable the context menu entirely */
  disabled?: boolean;
  /** Total count of navigable items (skips separators and labels) */
  itemCount?: number;
}

export interface UseContextMenuResult {
  triggerProps: {
    ref: RefObject<HTMLDivElement>;
    onContextMenu: (e: ReactMouseEvent<HTMLDivElement>) => void;
    "aria-haspopup": "menu";
    "aria-disabled"?: true;
  };
  menuProps: {
    ref: RefObject<HTMLDivElement>;
    role: "menu";
    "aria-orientation": "vertical";
    tabIndex: number;
    onKeyDown: (e: ReactKeyboardEvent<HTMLDivElement>) => void;
    style: { position: "fixed"; top: number; left: number; zIndex: number };
  };
  getItemProps: (
    index: number,
    opts?: { disabled?: boolean; onClick?: () => void },
  ) => {
    role: "menuitem";
    tabIndex: number;
    "data-focused": boolean;
    "aria-disabled": boolean | undefined;
    onMouseEnter: () => void;
    onClick: (e: ReactMouseEvent) => void;
  };
  isOpen: boolean;
  position: ContextMenuPosition;
  close: () => void;
  focusedIndex: number;
  setFocusedIndex: (index: number) => void;
}

export function useContextMenu({
  open: controlledOpen,
  onOpenChange,
  disabled = false,
  itemCount = 0,
}: UseContextMenuOptions = {}): UseContextMenuResult {
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const [position, setPosition] = useState<ContextMenuPosition>({ x: 0, y: 0 });
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const isOpen = isControlled ? (controlledOpen ?? false) : internalOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const close = useCallback(() => {
    setOpen(false);
    setFocusedIndex(-1);
  }, [setOpen]);

  const clampToViewport = useCallback(
    (x: number, y: number, menuEl: HTMLDivElement | null): ContextMenuPosition => {
      if (!menuEl) return { x, y };
      const rect = menuEl.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const w = rect.width || 200;
      const h = rect.height || 300;
      return {
        x: Math.min(x, vw - w - 8),
        y: Math.min(y, vh - h - 8),
      };
    },
    [],
  );

  const handleContextMenu = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      if (disabled) return;
      e.preventDefault();
      const rawX = e.clientX;
      const rawY = e.clientY;

      setOpen(true);
      setFocusedIndex(-1);
      // Set initial position immediately; we'll clamp after menu renders
      setPosition({ x: rawX, y: rawY });

      // After the menu renders, clamp to viewport
      requestAnimationFrame(() => {
        const clamped = clampToViewport(rawX, rawY, menuRef.current);
        setPosition(clamped);
        menuRef.current?.focus();
      });
    },
    [disabled, setOpen, clampToViewport],
  );

  // Close on outside pointer-down
  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!menuRef.current?.contains(target)) {
        close();
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen, close]);

  // Close on scroll
  useEffect(() => {
    if (!isOpen) return;
    const handleScroll = () => close();
    window.addEventListener("scroll", handleScroll, { passive: true, capture: true });
    return () => window.removeEventListener("scroll", handleScroll, { capture: true });
  }, [isOpen, close]);

  const navigableCount = Math.max(itemCount, 1);

  const handleMenuKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        triggerRef.current?.focus();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((i) => (i + 1) % navigableCount);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((i) => (i - 1 + navigableCount) % navigableCount);
      } else if (e.key === "Tab") {
        close();
      }
    },
    [close, navigableCount],
  );

  return {
    triggerProps: {
      ref: triggerRef as RefObject<HTMLDivElement>,
      onContextMenu: handleContextMenu,
      "aria-haspopup": "menu",
      ...(disabled ? { "aria-disabled": true as const } : {}),
    },
    menuProps: {
      ref: menuRef as RefObject<HTMLDivElement>,
      role: "menu",
      "aria-orientation": "vertical",
      tabIndex: -1,
      onKeyDown: handleMenuKeyDown,
      style: {
        position: "fixed",
        top: position.y,
        left: position.x,
        zIndex: 9999,
      },
    },
    getItemProps: (index, opts = {}) => ({
      role: "menuitem",
      tabIndex: focusedIndex === index ? 0 : -1,
      "data-focused": focusedIndex === index,
      "aria-disabled": opts.disabled,
      onMouseEnter: () => setFocusedIndex(index),
      onClick: (e: ReactMouseEvent) => {
        if (opts.disabled) return;
        e.stopPropagation();
        opts.onClick?.();
        close();
      },
    }),
    isOpen,
    position,
    close,
    focusedIndex,
    setFocusedIndex,
  };
}
