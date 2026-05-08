import { useCallback, useEffect, useId, useRef, useState } from "react";

export interface UseSheetOptions {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  closeOnEsc?: boolean;
  swipeToDismiss?: boolean;
  swipeThreshold?: number;
  lockBodyScroll?: boolean;
}

export interface SheetProps {
  role: "dialog";
  "aria-modal": true;
  "aria-labelledby": string;
  "aria-describedby": string;
  tabIndex: -1;
  id: string;
}

export interface OverlayProps {
  "data-rsh-overlay": string;
}

export interface HandleProps {
  "data-rsh-handle": string;
  "aria-label": string;
}

export interface UseSheetResult {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  sheetProps: SheetProps;
  overlayProps: OverlayProps;
  handleProps: HandleProps;
  dragY: number;
}

export function useSheet(options: UseSheetOptions = {}): UseSheetResult {
  const {
    open: controlledOpen,
    defaultOpen = false,
    onOpenChange,
    closeOnEsc = true,
    swipeToDismiss = true,
    swipeThreshold = 50,
    lockBodyScroll = true,
  } = options;

  const isControlled = controlledOpen !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

  const [dragY, setDragY] = useState(0);
  const dragStartRef = useRef<number | null>(null);
  const originalOverflowRef = useRef("");
  const hasOpenedRef = useRef(defaultOpen);
  const sheetId = useId();
  const titleId = `${sheetId}-title`;
  const descId = `${sheetId}-desc`;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const open = useCallback(() => setOpen(true), [setOpen]);
  const close = useCallback(() => setOpen(false), [setOpen]);
  const toggle = useCallback(() => setOpen(!isOpen), [isOpen, setOpen]);

  // Body scroll lock
  useEffect(() => {
    if (!lockBodyScroll) return;
    if (isOpen) {
      hasOpenedRef.current = true;
      originalOverflowRef.current = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflowRef.current;
      };
    } else if (hasOpenedRef.current) {
      document.body.style.overflow = originalOverflowRef.current;
    }
  }, [isOpen, lockBodyScroll]);

  // Escape key
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, closeOnEsc, close]);

  // Pointer drag tracking (for headless consumers)
  const onPointerDown = useCallback(
    (e: PointerEvent) => {
      if (!swipeToDismiss) return;
      dragStartRef.current = e.clientY;
      setDragY(0);
    },
    [swipeToDismiss],
  );

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      if (!swipeToDismiss || dragStartRef.current === null) return;
      const dy = Math.max(0, e.clientY - dragStartRef.current);
      setDragY(dy);
    },
    [swipeToDismiss],
  );

  const onPointerUp = useCallback(() => {
    if (dragStartRef.current === null) return;
    if (dragY >= swipeThreshold) {
      close();
    }
    dragStartRef.current = null;
    setDragY(0);
  }, [dragY, swipeThreshold, close]);

  useEffect(() => {
    if (!isOpen || !swipeToDismiss) return;
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
    document.addEventListener("pointercancel", onPointerUp);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("pointercancel", onPointerUp);
    };
  }, [isOpen, swipeToDismiss, onPointerDown, onPointerMove, onPointerUp]);

  const sheetProps: SheetProps = {
    role: "dialog",
    "aria-modal": true,
    "aria-labelledby": titleId,
    "aria-describedby": descId,
    tabIndex: -1,
    id: sheetId,
  };

  const overlayProps: OverlayProps = {
    "data-rsh-overlay": "true",
  };

  const handleProps: HandleProps = {
    "data-rsh-handle": "true",
    "aria-label": "Drag to dismiss",
  };

  return {
    isOpen,
    open,
    close,
    toggle,
    sheetProps,
    overlayProps,
    handleProps,
    dragY,
  };
}
