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

export type DrawerSide = "left" | "right";
export type DrawerSize = "sm" | "md" | "lg";
export type DrawerVariant = "overlay" | "push";

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

export interface DrawerStyledProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: DrawerSide;
  size?: DrawerSize;
  variant?: DrawerVariant;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  lockBodyScroll?: boolean;
  title?: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  initialFocusRef?: RefObject<HTMLElement | null>;
  finalFocusRef?: RefObject<HTMLElement | null>;
  className?: string;
  style?: React.CSSProperties;
  showCloseButton?: boolean;
  width?: string | number;
  swipeable?: boolean;
  keepMounted?: boolean;
}

export const DrawerStyled = forwardRef<HTMLDivElement, DrawerStyledProps>(
  function DrawerStyled(
    {
      open: controlledOpen,
      defaultOpen = false,
      onOpenChange,
      side = "left",
      size = "md",
      variant = "overlay",
      closeOnOverlayClick = true,
      closeOnEsc = true,
      lockBodyScroll = true,
      title,
      description,
      footer,
      children,
      initialFocusRef,
      finalFocusRef,
      className,
      style,
      showCloseButton = true,
      width,
      swipeable = true,
      keepMounted = false,
    },
    ref,
  ) {
    const isControlled = controlledOpen !== undefined;
    const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
    const isActuallyOpen = isControlled ? (controlledOpen ?? false) : uncontrolledOpen;

    const [mounted, setMounted] = useState(false);
    const [rendered, setRendered] = useState(false);
    const [visible, setVisible] = useState(false);

    // Swipe state
    const [dragOffset, setDragOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef<{ x: number; y: number } | null>(null);
    const pointerId = useRef<number | null>(null);

    const panelRef = useRef<HTMLDivElement | null>(null);
    const originalOverflowRef = useRef("");
    const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const enterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);

    const titleId = useId();
    const descId = useId();

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
        if (lockBodyScroll && variant === "overlay") {
          originalOverflowRef.current = document.body.style.overflow;
          document.body.style.overflow = "hidden";
        }
      } else {
        setVisible(false);
        if (!keepMounted) {
          exitTimerRef.current = setTimeout(() => {
            setRendered(false);
          }, 320);
        }
        if (lockBodyScroll && variant === "overlay") {
          document.body.style.overflow = originalOverflowRef.current;
        }
        // Clean up push offset when closing
        if (variant === "push") {
          document.documentElement.style.removeProperty("--rdrw-push-offset");
          document.documentElement.removeAttribute("data-rdrw-push-side");
        }
      }
    }, [isActuallyOpen, lockBodyScroll, keepMounted, variant]);

    useEffect(() => {
      return () => {
        if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
        if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
        if (lockBodyScroll) document.body.style.overflow = originalOverflowRef.current;
        document.documentElement.style.removeProperty("--rdrw-push-offset");
        document.documentElement.removeAttribute("data-rdrw-push-side");
      };
    }, [lockBodyScroll]);

    // Push variant: set CSS variable when panel is visible and width is known.
    // Also sets data-rdrw-push-side on documentElement so consumers can apply
    // margin-left or margin-right depending on which side the drawer opens from.
    useEffect(() => {
      if (variant !== "push" || !isActuallyOpen || !panelRef.current) return;
      const updateOffset = () => {
        if (!panelRef.current) return;
        const w = panelRef.current.getBoundingClientRect().width;
        if (w > 0) {
          document.documentElement.style.setProperty("--rdrw-push-offset", `${w}px`);
          document.documentElement.setAttribute("data-rdrw-push-side", side);
        }
      };
      // Try immediately and after transition
      updateOffset();
      const t = setTimeout(updateOffset, 50);
      return () => clearTimeout(t);
    }, [isActuallyOpen, variant, visible, side]);

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
        if (variant === "overlay" && closeOnOverlayClick && e.target === e.currentTarget) requestClose();
      },
      [variant, closeOnOverlayClick, requestClose],
    );

    const setPanelRef = useCallback(
      (el: HTMLDivElement | null) => {
        panelRef.current = el;
        if (typeof ref === "function") ref(el);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
      },
      [ref],
    );

    // Swipe gesture handlers
    const onPointerDown = useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (!swipeable || !isActuallyOpen) return;
        // Don't capture swipe when the touch starts on an interactive element
        // (button, link, input, etc.) — doing so would prevent click from firing.
        const target = e.target as HTMLElement;
        if (target.closest('button, a, input, select, textarea, [role="button"]')) return;
        dragStartRef.current = { x: e.clientX, y: e.clientY };
        pointerId.current = e.pointerId;
        setIsDragging(true);
        (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
      },
      [swipeable, isActuallyOpen],
    );

    const onPointerMove = useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (!swipeable || !dragStartRef.current || pointerId.current !== e.pointerId) return;
        const dx = e.clientX - dragStartRef.current.x;
        // For left drawer: swipe left (negative dx) closes; for right: swipe right (positive dx) closes
        const closingDirection = side === "left" ? Math.min(0, dx) : Math.max(0, dx);
        setDragOffset(closingDirection);
      },
      [swipeable, side],
    );

    const onPointerUp = useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (!swipeable || !dragStartRef.current || pointerId.current !== e.pointerId) return;
        const dx = e.clientX - dragStartRef.current.x;
        const threshold = 80;
        const shouldClose =
          (side === "left" && dx < -threshold) ||
          (side === "right" && dx > threshold);

        dragStartRef.current = null;
        pointerId.current = null;
        setIsDragging(false);
        setDragOffset(0);

        if (shouldClose) requestClose();
      },
      [swipeable, side, requestClose],
    );

    const onPointerCancel = useCallback(() => {
      dragStartRef.current = null;
      pointerId.current = null;
      setIsDragging(false);
      setDragOffset(0);
    }, []);

    // Compute panel inline style
    const panelStyle: React.CSSProperties = {
      ...style,
    };
    if (width !== undefined) {
      const widthVal = typeof width === "number" ? `${width}px` : width;
      (panelStyle as Record<string, unknown>)["--rdrw-custom-width"] = widthVal;
    }
    if (isDragging && dragOffset !== 0) {
      panelStyle.transform = `translateX(${dragOffset}px)`;
      panelStyle.transition = "none";
    }

    const shouldRenderPortal = mounted && (rendered || keepMounted);

    // For keepMounted: keep portal in DOM but hide it when closed
    const isHidden = keepMounted && !isActuallyOpen;

    if (!shouldRenderPortal) return null;

    const panelNode = (
      <div
        ref={setPanelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={["rdrw-panel", className, visible ? "rdrw-panel--visible" : ""].filter(Boolean).join(" ")}
        data-side={side}
        data-state={visible ? "open" : "closed"}
        data-size={size}
        data-variant={variant}
        data-dragging={isDragging ? "true" : undefined}
        style={panelStyle}
        onKeyDown={onKeyDown}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        {(title !== undefined || showCloseButton) && (
          <div className="rdrw-header">
            {title !== undefined && (
              <h2 id={titleId} className="rdrw-title">{title}</h2>
            )}
            {showCloseButton && (
              <button
                type="button"
                className="rdrw-close"
                onClick={requestClose}
                aria-label="Close drawer"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M2 2l12 12M14 2L2 14" />
                </svg>
              </button>
            )}
          </div>
        )}
        {description !== undefined && (
          <p id={descId} className="rdrw-description">{description}</p>
        )}
        <div className="rdrw-body">{children}</div>
        {footer !== undefined && (
          <div className="rdrw-footer">{footer}</div>
        )}
      </div>
    );

    return createPortal(
      <div
        className={[
          "rdrw-root",
          variant === "overlay" ? "rdrw-overlay" : "rdrw-push",
          visible ? "rdrw-overlay--visible" : "",
        ].filter(Boolean).join(" ")}
        data-side={side}
        data-state={visible ? "open" : "closed"}
        data-variant={variant}
        aria-hidden={isHidden ? true : undefined}
        {...(isHidden ? { inert: "" } : {})}
        onClick={handleOverlayClick}
      >
        {panelNode}
      </div>,
      document.body,
    );
  },
);
