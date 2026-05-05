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
import { useFocusTrap } from "../useFocusTrap";

export type ModalSize = "sm" | "md" | "lg" | "full";
export type ModalVariant = "dialog" | "drawer-left" | "drawer-right" | "drawer-bottom";
export type CloseReason = "esc" | "overlay" | "close-button" | "programmatic";

export interface ModalStyledProps {
  /** Open state. `open` is the canonical name; `isOpen` continues to work. */
  open?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  /** Modal heading — omit to hide the header entirely */
  title?: ReactNode;
  /** Optional accessible description. Renders below the title and links via aria-describedby. */
  description?: ReactNode;
  children: ReactNode;
  /** Footer content — omit to hide footer */
  footer?: ReactNode;
  size?: ModalSize;
  variant?: ModalVariant;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
  /** Backdrop blur intensity. Default: "md" */
  blur?: "none" | "sm" | "md" | "lg";
  /** Custom overlay color e.g. "rgba(0,0,0,0.6)" */
  overlayColor?: string;
  /** Padding inside the body. Default: "md" */
  padding?: "none" | "sm" | "md" | "lg";
  /** Max height of scrollable body. Default: auto */
  scrollable?: boolean;
  className?: string;
  /** Element to focus when the modal opens. Defaults to the first focusable child inside the panel. */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Element to focus when the modal closes. Defaults to whatever was focused before opening. */
  finalFocusRef?: RefObject<HTMLElement | null>;
  /** Fires after the open transition completes. */
  onAfterOpen?: () => void;
  /** Fires after the close transition completes (and unmount). */
  onAfterClose?: () => void;
  /** Return false to veto a close attempt. Receives the trigger reason. */
  preventClose?: (reason: CloseReason) => boolean;
  /** Disable body scroll lock while open. Default: true (locked). */
  lockBodyScroll?: boolean;
  /** Override the portal container. Default: document.body. */
  container?: HTMLElement | null;
}

export const ModalStyled = forwardRef<HTMLDivElement, ModalStyledProps>(
  function ModalStyled(
    {
      open,
      isOpen,
      onClose,
      title,
      description,
      children,
      footer,
      size = "md",
      variant = "dialog",
      closeOnOverlayClick = true,
      closeOnEsc = true,
      showCloseButton = true,
      blur = "md",
      overlayColor,
      padding = "md",
      scrollable = true,
      className,
      initialFocusRef,
      finalFocusRef,
      onAfterOpen,
      onAfterClose,
      preventClose,
      lockBodyScroll = true,
      container,
    },
    ref,
  ) {
    const titleId = useId();
    const descId = useId();
    const isActuallyOpen = open ?? isOpen ?? false;
    const [mounted, setMounted] = useState(false);
    const [rendered, setRendered] = useState(false);
    const [visible, setVisible] = useState(false);
    const panelRef = useRef<HTMLDivElement | null>(null);
    const originalOverflowRef = useRef("");
    const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const enterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const { activate, deactivate, handleKeyDown } = useFocusTrap();

    const onAfterOpenRef = useRef(onAfterOpen);
    onAfterOpenRef.current = onAfterOpen;
    const onAfterCloseRef = useRef(onAfterClose);
    onAfterCloseRef.current = onAfterClose;

    useEffect(() => { setMounted(true); }, []);

    const requestClose = useCallback(
      (reason: CloseReason) => {
        if (preventClose && !preventClose(reason)) return;
        onClose();
      },
      [preventClose, onClose],
    );

    useEffect(() => {
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
      if (enterTimerRef.current) {
        clearTimeout(enterTimerRef.current);
        enterTimerRef.current = null;
      }

      if (isActuallyOpen) {
        setRendered(true);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setVisible(true);
          });
        });
        if (lockBodyScroll) {
          originalOverflowRef.current = document.body.style.overflow;
          document.body.style.overflow = "hidden";
        }
        // Fire onAfterOpen once the enter transition has had time to settle.
        enterTimerRef.current = setTimeout(() => {
          onAfterOpenRef.current?.();
        }, 320);
      } else {
        setVisible(false);
        exitTimerRef.current = setTimeout(() => {
          setRendered(false);
          onAfterCloseRef.current?.();
        }, 300);
        if (lockBodyScroll) {
          document.body.style.overflow = originalOverflowRef.current;
        }
      }
    }, [isActuallyOpen, lockBodyScroll]);

    useEffect(() => {
      return () => {
        if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
        if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
        if (lockBodyScroll) {
          document.body.style.overflow = originalOverflowRef.current;
        }
      };
    }, [lockBodyScroll]);

    // Focus management
    const previouslyFocusedRef = useRef<HTMLElement | null>(null);
    useEffect(() => {
      if (isActuallyOpen) {
        previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
        if (panelRef.current) {
          activate(panelRef.current);
          // Honor initialFocusRef after the panel is mounted+visible
          requestAnimationFrame(() => {
            if (initialFocusRef?.current) {
              initialFocusRef.current.focus();
            }
          });
        }
      } else {
        deactivate();
        // Honor finalFocusRef on close, otherwise restore previous focus
        const target = finalFocusRef?.current ?? previouslyFocusedRef.current;
        if (target && typeof target.focus === "function") {
          target.focus();
        }
      }
    }, [isActuallyOpen, activate, deactivate, initialFocusRef, finalFocusRef]);

    const onKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (closeOnEsc && e.key === "Escape") {
          requestClose("esc");
          return;
        }
        handleKeyDown(e.nativeEvent);
      },
      [closeOnEsc, requestClose, handleKeyDown],
    );

    const handleOverlayClick = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) {
          requestClose("overlay");
        }
      },
      [closeOnOverlayClick, requestClose],
    );

    const setPanelRef = useCallback(
      (el: HTMLDivElement | null) => {
        panelRef.current = el;
        if (typeof ref === "function") ref(el);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
        if (el && isActuallyOpen) activate(el);
      },
      [ref, isActuallyOpen, activate],
    );

    if (!mounted || !rendered) return null;

    const hasHeader = title !== undefined || showCloseButton;
    const portalTarget = container ?? document.body;

    return createPortal(
      <div
        className={[
          "rmod-overlay",
          visible ? "rmod-overlay--visible" : "",
        ].filter(Boolean).join(" ")}
        data-variant={variant}
        data-blur={blur}
        data-state={visible ? "open" : "closed"}
        style={overlayColor ? { "--rmod-overlay-bg": overlayColor } as React.CSSProperties : undefined}
        onClick={handleOverlayClick}
        onKeyDown={onKeyDown}
      >
        <div
          ref={setPanelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          aria-describedby={description ? descId : undefined}
          tabIndex={-1}
          className={[
            "rmod-panel",
            className,
            visible ? "rmod-panel--visible" : "",
          ].filter(Boolean).join(" ")}
          data-size={size}
          data-variant={variant}
          data-padding={padding}
          data-scrollable={scrollable ? "true" : undefined}
          data-state={visible ? "open" : "closed"}
        >
          {hasHeader && (
            <div className="rmod-header">
              {title ? (
                <h2 id={titleId} className="rmod-title">{title}</h2>
              ) : (
                <span />
              )}
              {showCloseButton && (
                <button
                  type="button"
                  className="rmod-close"
                  aria-label="Close"
                  onClick={() => requestClose("close-button")}
                >
                  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>
          )}
          {description !== undefined && (
            <p id={descId} className="rmod-description">{description}</p>
          )}
          <div className="rmod-body">{children}</div>
          {footer && <div className="rmod-footer">{footer}</div>}
        </div>
      </div>,
      portalTarget,
    );
  },
);
