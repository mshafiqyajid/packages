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
}

export const DrawerStyled = forwardRef<HTMLDivElement, DrawerStyledProps>(
  function DrawerStyled(
    {
      open: controlledOpen,
      defaultOpen = false,
      onOpenChange,
      side = "left",
      size = "md",
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
      } else {
        setVisible(false);
        exitTimerRef.current = setTimeout(() => {
          setRendered(false);
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

    const setPanelRef = useCallback(
      (el: HTMLDivElement | null) => {
        panelRef.current = el;
        if (typeof ref === "function") ref(el);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
      },
      [ref],
    );

    if (!mounted || !rendered) return null;

    return createPortal(
      <div
        className={["rdrw-overlay", visible ? "rdrw-overlay--visible" : ""].filter(Boolean).join(" ")}
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
          className={["rdrw-panel", className, visible ? "rdrw-panel--visible" : ""].filter(Boolean).join(" ")}
          data-side={side}
          data-state={visible ? "open" : "closed"}
          data-size={size}
          style={style}
          onKeyDown={onKeyDown}
          onClick={(e) => e.stopPropagation()}
        >
          {title !== undefined && (
            <div className="rdrw-header">
              <h2 id={titleId} className="rdrw-title">{title}</h2>
              <button
                type="button"
                className="rdrw-close"
                onClick={requestClose}
                aria-label="Close"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M2 2l12 12M14 2L2 14" />
                </svg>
              </button>
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
      </div>,
      document.body,
    );
  },
);
