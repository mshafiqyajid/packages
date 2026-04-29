import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useFocusTrap } from "../useFocusTrap";

export type ModalSize = "sm" | "md" | "lg" | "full";
export type ModalVariant = "dialog" | "drawer-left" | "drawer-right" | "drawer-bottom";

export interface ModalStyledProps {
  isOpen: boolean;
  onClose: () => void;
  /** Modal heading — omit to hide the header entirely */
  title?: ReactNode;
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
}

export const ModalStyled = forwardRef<HTMLDivElement, ModalStyledProps>(
  function ModalStyled(
    {
      isOpen,
      onClose,
      title,
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
    },
    ref,
  ) {
    const titleId = useId();
    const [mounted, setMounted] = useState(false);
    const [rendered, setRendered] = useState(false);
    const [visible, setVisible] = useState(false);
    const panelRef = useRef<HTMLDivElement | null>(null);
    const originalOverflowRef = useRef("");
    const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const { activate, deactivate, handleKeyDown } = useFocusTrap();

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }

      if (isOpen) {
        setRendered(true);
        // Double RAF ensures the element is in the DOM before we add the visible class
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setVisible(true);
          });
        });
        originalOverflowRef.current = document.body.style.overflow;
        document.body.style.overflow = "hidden";
      } else {
        // Remove visible class first (triggers CSS exit transition)
        setVisible(false);
        // Then unmount after transition finishes
        exitTimerRef.current = setTimeout(() => {
          setRendered(false);
        }, 300);
        document.body.style.overflow = originalOverflowRef.current;
      }
    }, [isOpen]);

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
        document.body.style.overflow = originalOverflowRef.current;
      };
    }, []);

    useEffect(() => {
      if (isOpen && panelRef.current) {
        activate(panelRef.current);
      } else if (!isOpen) {
        deactivate();
      }
    }, [isOpen, activate, deactivate]);

    const onKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (closeOnEsc && e.key === "Escape") {
          onClose();
          return;
        }
        handleKeyDown(e.nativeEvent);
      },
      [closeOnEsc, onClose, handleKeyDown],
    );

    const handleOverlayClick = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) {
          onClose();
        }
      },
      [closeOnOverlayClick, onClose],
    );

    const setPanelRef = useCallback(
      (el: HTMLDivElement | null) => {
        panelRef.current = el;
        if (typeof ref === "function") ref(el);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
        if (el && isOpen) activate(el);
      },
      [ref, isOpen, activate],
    );

    if (!mounted || !rendered) return null;

    const hasHeader = title !== undefined || showCloseButton;

    return createPortal(
      <div
        className={[
          "rmod-overlay",
          visible ? "rmod-overlay--visible" : "",
        ].filter(Boolean).join(" ")}
        data-variant={variant}
        data-blur={blur}
        style={overlayColor ? { "--rmod-overlay-bg": overlayColor } as React.CSSProperties : undefined}
        onClick={handleOverlayClick}
        onKeyDown={onKeyDown}
      >
        <div
          ref={setPanelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
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
        >
          {hasHeader && (
            <div className="rmod-header">
              {title ? (
                <h2 id={titleId} className="rmod-title">{title}</h2>
              ) : (
                <span />
              )}
              {showCloseButton && (
                <button type="button" className="rmod-close" aria-label="Close" onClick={onClose}>
                  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>
          )}
          <div className="rmod-body">{children}</div>
          {footer && <div className="rmod-footer">{footer}</div>}
        </div>
      </div>,
      document.body,
    );
  },
);
