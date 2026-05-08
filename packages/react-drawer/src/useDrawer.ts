import { useCallback, useEffect, useId, useRef, useState } from "react";

export interface UseDrawerOptions {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  closeOnEsc?: boolean;
  lockBodyScroll?: boolean;
  variant?: "overlay" | "push";
  showCloseButton?: boolean;
  width?: string | number;
  swipeable?: boolean;
  keepMounted?: boolean;
}

export interface DrawerProps {
  role: "dialog";
  "aria-modal": true;
  "aria-labelledby": string;
  "aria-describedby": string;
  tabIndex: -1;
  id: string;
}

export interface OverlayProps {
  "data-rdrw-overlay": string;
  "aria-hidden": true;
}

export interface TriggerProps {
  "aria-haspopup": "dialog";
  "aria-expanded": boolean;
  "aria-controls": string;
}

export interface UseDrawerResult {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  drawerProps: DrawerProps;
  overlayProps: OverlayProps;
  triggerProps: TriggerProps;
  dragOffset: number;
  isDragging: boolean;
}

export function useDrawer(options: UseDrawerOptions = {}): UseDrawerResult {
  const {
    open: controlledOpen,
    defaultOpen = false,
    onOpenChange,
    closeOnEsc = true,
    lockBodyScroll = true,
    variant = "overlay",
  } = options;

  const isControlled = controlledOpen !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = isControlled ? (controlledOpen ?? false) : uncontrolledOpen;

  const originalOverflowRef = useRef("");
  const hasOpenedRef = useRef(defaultOpen);
  const drawerId = useId();
  const titleId = `${drawerId}-title`;
  const descId = `${drawerId}-desc`;

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

  // Push variant: expose --rdrw-push-offset CSS variable on documentElement
  useEffect(() => {
    if (variant !== "push") return;
    if (isOpen) {
      // The actual offset will be set by DrawerStyled once it knows the panel width.
      // Here we just ensure cleanup on close.
      return () => {
        document.documentElement.style.removeProperty("--rdrw-push-offset");
      };
    } else {
      document.documentElement.style.removeProperty("--rdrw-push-offset");
    }
  }, [isOpen, variant]);

  // Escape key
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, closeOnEsc, close]);

  const drawerProps: DrawerProps = {
    role: "dialog",
    "aria-modal": true,
    "aria-labelledby": titleId,
    "aria-describedby": descId,
    tabIndex: -1,
    id: drawerId,
  };

  const overlayProps: OverlayProps = {
    "data-rdrw-overlay": "true",
    "aria-hidden": true as const,
  };

  const triggerProps: TriggerProps = {
    "aria-haspopup": "dialog",
    "aria-expanded": isOpen,
    "aria-controls": drawerId,
  };

  return {
    isOpen,
    open,
    close,
    toggle,
    drawerProps,
    overlayProps,
    triggerProps,
    dragOffset: 0,
    isDragging: false,
  };
}
