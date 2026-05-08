import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";

export type SheetSide = "bottom" | "top" | "left" | "right";

const FOCUSABLE_SELECTORS = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
  "details > summary",
].join(", ");

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)).filter(
    (el) => !el.closest("[inert]") && getComputedStyle(el).display !== "none",
  );
}

export interface SheetStyledProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onAfterOpen?: () => void;
  onAfterClose?: () => void;
  side?: SheetSide;
  snapPoints?: (string | number)[];
  defaultSnapPoint?: string | number;
  onSnapPointChange?: (snap: string | number) => void;
  swipeToDismiss?: boolean;
  swipeThreshold?: number;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  showHandle?: boolean;
  title?: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  initialFocusRef?: RefObject<HTMLElement | null>;
  finalFocusRef?: RefObject<HTMLElement | null>;
  lockBodyScroll?: boolean;
  container?: HTMLElement | null;
  className?: string;
  style?: React.CSSProperties;
}

export const SheetStyled = forwardRef<HTMLDivElement, SheetStyledProps>(
  function SheetStyled(
    {
      open: controlledOpen,
      defaultOpen = false,
      onOpenChange,
      onAfterOpen,
      onAfterClose,
      side = "bottom",
      snapPoints,
      defaultSnapPoint,
      onSnapPointChange,
      swipeToDismiss = true,
      swipeThreshold = 50,
      closeOnOverlayClick = true,
      closeOnEsc = true,
      showHandle = true,
      title,
      description,
      footer,
      children,
      initialFocusRef,
      finalFocusRef,
      lockBodyScroll = true,
      container,
      className,
      style,
    },
    ref,
  ) {
    const isControlled = controlledOpen !== undefined;
    const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
    const isActuallyOpen = isControlled ? (controlledOpen ?? false) : uncontrolledOpen;

    const [mounted, setMounted] = useState(false);
    const [rendered, setRendered] = useState(false);
    const [visible, setVisible] = useState(false);

    const panelRef = useRef<HTMLDivElement | null>(null);
    const originalOverflowRef = useRef("");
    const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const enterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);

    const titleId = useId();
    const descId = useId();

    const onAfterOpenRef = useRef(onAfterOpen);
    onAfterOpenRef.current = onAfterOpen;
    const onAfterCloseRef = useRef(onAfterClose);
    onAfterCloseRef.current = onAfterClose;

    // Snap points
    const [currentSnap, setCurrentSnap] = useState<string | number | undefined>(defaultSnapPoint ?? snapPoints?.[0]);

    const requestClose = useCallback(() => {
      if (!isControlled) setUncontrolledOpen(false);
      onOpenChange?.(false);
    }, [isControlled, onOpenChange]);

    // Mount once on client
    useEffect(() => { setMounted(true); }, []);

    // Open/close state machine
    useEffect(() => {
      if (exitTimerRef.current) { clearTimeout(exitTimerRef.current); exitTimerRef.current = null; }
      if (enterTimerRef.current) { clearTimeout(enterTimerRef.current); enterTimerRef.current = null; }

      if (isActuallyOpen) {
        setRendered(true);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => { setVisible(true); });
        });
        if (lockBodyScroll) {
          originalOverflowRef.current = document.body.style.overflow;
          document.body.style.overflow = "hidden";
        }
        enterTimerRef.current = setTimeout(() => { onAfterOpenRef.current?.(); }, 370);
      } else {
        setVisible(false);
        exitTimerRef.current = setTimeout(() => {
          setRendered(false);
          onAfterCloseRef.current?.();
        }, 320);
        if (lockBodyScroll) {
          document.body.style.overflow = originalOverflowRef.current;
        }
      }
    }, [isActuallyOpen, lockBodyScroll]);

    useEffect(() => {
      return () => {
        if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
        if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
        if (lockBodyScroll) document.body.style.overflow = originalOverflowRef.current;
      };
    }, [lockBodyScroll]);

    // Focus management
    useEffect(() => {
      if (isActuallyOpen && panelRef.current) {
        previousFocusRef.current = document.activeElement as HTMLElement | null;
        requestAnimationFrame(() => {
          if (initialFocusRef?.current) {
            initialFocusRef.current.focus();
          } else if (panelRef.current) {
            const focusable = getFocusable(panelRef.current);
            if (focusable.length > 0) focusable[0]!.focus();
            else panelRef.current.focus();
          }
        });
      } else if (!isActuallyOpen) {
        const target = finalFocusRef?.current ?? previousFocusRef.current;
        if (target && typeof target.focus === "function") target.focus();
      }
    }, [isActuallyOpen, initialFocusRef, finalFocusRef]);

    // Keyboard: Escape + Tab trap
    const onKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (closeOnEsc && e.key === "Escape") {
          requestClose();
          return;
        }
        if (e.key === "Tab" && panelRef.current) {
          const focusable = getFocusable(panelRef.current);
          if (focusable.length === 0) { e.preventDefault(); return; }
          const first = focusable[0]!;
          const last = focusable[focusable.length - 1]!;
          if (e.shiftKey) {
            if (document.activeElement === first) { e.preventDefault(); last.focus(); }
          } else {
            if (document.activeElement === last) { e.preventDefault(); first.focus(); }
          }
        }
      },
      [closeOnEsc, requestClose],
    );

    const handleOverlayClick = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) requestClose();
      },
      [closeOnOverlayClick, requestClose],
    );

    // Swipe-to-dismiss drag state
    const dragStartRef = useRef<number | null>(null);
    const [dragOffset, setDragOffset] = useState(0);
    const [swiping, setSwiping] = useState(false);
    const [snapping, setSnapping] = useState(false);

    const isVertical = side === "bottom" || side === "top";

    const handlePointerDown = useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (!swipeToDismiss) return;
        dragStartRef.current = isVertical ? e.clientY : e.clientX;
        setSwiping(true);
        setSnapping(false);
        (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
      },
      [swipeToDismiss, isVertical],
    );

    const handlePointerMove = useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (!swipeToDismiss || dragStartRef.current === null) return;
        const current = isVertical ? e.clientY : e.clientX;
        const raw = current - dragStartRef.current;

        let offset = 0;
        if (side === "bottom") offset = Math.max(0, raw);
        else if (side === "top") offset = Math.min(0, raw);
        else if (side === "right") offset = Math.max(0, raw);
        else if (side === "left") offset = Math.min(0, raw);

        setDragOffset(offset);
      },
      [swipeToDismiss, isVertical, side],
    );

    const handlePointerUp = useCallback(() => {
      if (dragStartRef.current === null) return;
      dragStartRef.current = null;
      const absOffset = Math.abs(dragOffset);

      // Check snap points
      if (snapPoints && snapPoints.length > 0 && absOffset > 0) {
        const panel = panelRef.current;
        const panelSize = panel
          ? isVertical ? panel.offsetHeight : panel.offsetWidth
          : 300;
        const currentIdx = snapPoints.indexOf(currentSnap ?? snapPoints[0]!);
        if (absOffset > swipeThreshold) {
          const nextIdx = currentIdx + 1;
          if (nextIdx < snapPoints.length) {
            const nextSnap = snapPoints[nextIdx]!;
            setCurrentSnap(nextSnap);
            onSnapPointChange?.(nextSnap);
            setSnapping(true);
            setDragOffset(0);
            setSwiping(false);
            setTimeout(() => setSnapping(false), 400);
            return;
          }
        }
        void panelSize;
      }

      if (absOffset >= swipeThreshold) {
        setDragOffset(0);
        setSwiping(false);
        requestClose();
      } else {
        setSnapping(true);
        setDragOffset(0);
        setSwiping(false);
        setTimeout(() => setSnapping(false), 400);
      }
    }, [dragOffset, swipeThreshold, requestClose, snapPoints, currentSnap, onSnapPointChange, isVertical]);

    const setPanelRef = useCallback(
      (el: HTMLDivElement | null) => {
        panelRef.current = el;
        if (typeof ref === "function") ref(el);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
      },
      [ref],
    );

    if (!mounted || !rendered) return null;

    const portalTarget = container ?? document.body;

    // Compute snap point size
    const snapSize = currentSnap !== undefined ? String(currentSnap) : undefined;

    // Panel drag transform
    const dragTransform =
      dragOffset !== 0
        ? isVertical
          ? `translateY(${dragOffset}px)`
          : `translateX(${dragOffset}px)`
        : undefined;

    const panelStyle: React.CSSProperties = {
      ...(snapSize
        ? isVertical
          ? { maxHeight: snapSize, height: snapSize }
          : { maxWidth: snapSize, width: snapSize }
        : {}),
      ...(dragOffset !== 0 ? { transform: dragTransform, transition: "none" } : {}),
      ...(snapping
        ? {
            transform: isVertical ? "translateY(0)" : "translateX(0)",
            transition: "transform 380ms cubic-bezier(0.34, 1.56, 0.64, 1)",
          }
        : {}),
      ...style,
    };

    return createPortal(
      <div
        className={["rsh-overlay", visible ? "rsh-overlay--visible" : ""].filter(Boolean).join(" ")}
        data-side={side}
        data-state={visible ? "open" : "closed"}
        onClick={handleOverlayClick}
      >
        <div
          ref={setPanelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          aria-describedby={description ? descId : undefined}
          tabIndex={-1}
          className={["rsh-panel", className, visible ? "rsh-panel--visible" : ""].filter(Boolean).join(" ")}
          data-side={side}
          data-state={visible ? "open" : "closed"}
          data-swiping={swiping ? "true" : undefined}
          style={panelStyle}
          onKeyDown={onKeyDown}
          onPointerDown={swipeToDismiss ? handlePointerDown : undefined}
          onPointerMove={swipeToDismiss ? handlePointerMove : undefined}
          onPointerUp={swipeToDismiss ? handlePointerUp : undefined}
          onPointerCancel={swipeToDismiss ? handlePointerUp : undefined}
        >
          {showHandle && (
            <div
              className="rsh-handle"
              aria-hidden="true"
              data-rsh-handle="true"
            />
          )}
          {title !== undefined && (
            <div className="rsh-header">
              <h2 id={titleId} className="rsh-title">{title}</h2>
            </div>
          )}
          {description !== undefined && (
            <p id={descId} className="rsh-description">{description}</p>
          )}
          <div className="rsh-body">{children}</div>
          {footer !== undefined && (
            <div className="rsh-footer">{footer}</div>
          )}
        </div>
      </div>,
      portalTarget,
    );
  },
);
