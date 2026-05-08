import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

export interface UseLightboxOptions {
  /** Controlled open state */
  open?: boolean;
  /** Uncontrolled initial open state */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Controlled current image index (0-based) */
  index?: number;
  /** Uncontrolled initial index */
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  /** Total number of images — required for prev/next/loop logic */
  total?: number;
  loop?: boolean;
  closeOnEsc?: boolean;
  swipe?: boolean;
  zoom?: boolean;
  maxZoom?: number;
  onClose?: () => void;
}

export interface UseLightboxResult {
  isOpen: boolean;
  open: (index?: number) => void;
  close: () => void;
  index: number;
  setIndex: (index: number) => void;
  prev: () => void;
  next: () => void;
  zoomLevel: number;
  setZoomLevel: (level: number) => void;
  /** Navigation direction — used for slide animation */
  direction: "prev" | "next" | null;
  lightboxProps: {
    role: "dialog";
    "aria-modal": boolean;
    "aria-label": string;
    onKeyDown: (e: KeyboardEvent) => void;
  };
  overlayProps: {
    "data-state": "open" | "closed";
  };
}

export function useLightbox(options: UseLightboxOptions = {}): UseLightboxResult {
  const {
    open: controlledOpen,
    defaultOpen = false,
    onOpenChange,
    index: controlledIndex,
    defaultIndex = 0,
    onIndexChange,
    total = 0,
    loop = true,
    closeOnEsc = true,
    zoom = false,
    maxZoom = 3,
    onClose,
  } = options;

  const isControlledOpen = controlledOpen !== undefined;
  const isControlledIndex = controlledIndex !== undefined;

  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [internalIndex, setInternalIndex] = useState(defaultIndex);
  const [direction, setDirection] = useState<"prev" | "next" | null>(null);
  const [zoomLevel, setZoomLevelState] = useState(1);

  const isOpen = isControlledOpen ? controlledOpen : internalOpen;
  const index = isControlledIndex ? controlledIndex : internalIndex;

  const setOpen = useCallback(
    (value: boolean) => {
      if (!isControlledOpen) setInternalOpen(value);
      onOpenChange?.(value);
    },
    [isControlledOpen, onOpenChange],
  );

  const setIndex = useCallback(
    (value: number) => {
      if (!isControlledIndex) setInternalIndex(value);
      onIndexChange?.(value);
    },
    [isControlledIndex, onIndexChange],
  );

  const open = useCallback(
    (startIndex?: number) => {
      if (startIndex !== undefined) setIndex(startIndex);
      setOpen(true);
    },
    [setOpen, setIndex],
  );

  const close = useCallback(() => {
    setOpen(false);
    onClose?.();
    setZoomLevelState(1);
  }, [setOpen, onClose]);

  const prev = useCallback(() => {
    if (total === 0) return;
    setDirection("prev");
    setZoomLevelState(1);
    if (index <= 0) {
      if (loop) setIndex(total - 1);
    } else {
      setIndex(index - 1);
    }
  }, [index, total, loop, setIndex]);

  const next = useCallback(() => {
    if (total === 0) return;
    setDirection("next");
    setZoomLevelState(1);
    if (index >= total - 1) {
      if (loop) setIndex(0);
    } else {
      setIndex(index + 1);
    }
  }, [index, total, loop, setIndex]);

  const setZoomLevel = useCallback(
    (level: number) => {
      const clamped = Math.min(Math.max(1, level), maxZoom);
      setZoomLevelState(clamped);
    },
    [maxZoom],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      switch (e.key) {
        case "Escape":
          if (closeOnEsc) close();
          break;
        case "ArrowLeft":
          prev();
          break;
        case "ArrowRight":
          next();
          break;
        case "Home":
          e.preventDefault();
          setDirection("prev");
          setZoomLevelState(1);
          setIndex(0);
          break;
        case "End":
          e.preventDefault();
          setDirection("next");
          setZoomLevelState(1);
          setIndex(total - 1);
          break;
        case "+":
        case "=":
          if (zoom) setZoomLevel(zoomLevel + 0.5);
          break;
        case "-":
          if (zoom) setZoomLevel(zoomLevel - 0.5);
          break;
      }
    },
    [isOpen, closeOnEsc, close, prev, next, setIndex, total, zoom, zoomLevel, setZoomLevel],
  );

  // Reset direction after navigation settles
  const dirResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (direction !== null) {
      if (dirResetRef.current) clearTimeout(dirResetRef.current);
      dirResetRef.current = setTimeout(() => setDirection(null), 250);
    }
    return () => {
      if (dirResetRef.current) clearTimeout(dirResetRef.current);
    };
  }, [direction, index]);

  // Attach keyboard handler globally when open
  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleKeyDown]);

  // Body scroll lock
  const savedOverflowRef = useRef("");
  useEffect(() => {
    if (isOpen) {
      savedOverflowRef.current = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = savedOverflowRef.current;
    }
    return () => {
      document.body.style.overflow = savedOverflowRef.current;
    };
  }, [isOpen]);

  return {
    isOpen,
    open,
    close,
    index,
    setIndex,
    prev,
    next,
    zoomLevel,
    setZoomLevel,
    direction,
    lightboxProps: {
      role: "dialog",
      "aria-modal": true,
      "aria-label": "Image viewer",
      onKeyDown: handleKeyDown,
    },
    overlayProps: {
      "data-state": isOpen ? "open" : "closed",
    },
  };
}
