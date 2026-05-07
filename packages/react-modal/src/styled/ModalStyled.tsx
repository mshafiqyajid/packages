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
export type CloseReason = "esc" | "overlay" | "close-button" | "programmatic" | "swipe" | "submit";
export type ModalTransition = "fade" | "zoom" | "slide-up" | "slide-down";
export type ConfirmTone = "neutral" | "danger";
export type MobileVariant = "default" | "sheet";

// ---- Stacking registry (depth-aware z-index + scale-behind effect) -------
const _openModals: { id: number }[] = [];
let _modalIdCounter = 0;
const _stackListeners = new Set<() => void>();
function _notifyStack() { _stackListeners.forEach((fn) => fn()); }

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
  /** Footer content — omit to hide footer. Ignored when variant="confirm". */
  footer?: ReactNode;
  size?: ModalSize;
  /** Display variant. "dialog" | "drawer-*". Use `mobileVariant` for responsive sheet behaviour. */
  variant?: ModalVariant;
  /**
   * On viewports ≤ 640 px, render as a bottom-sheet instead of a centred dialog.
   * Drag-to-dismiss is enabled automatically. Desktop rendering is unchanged.
   */
  mobileVariant?: MobileVariant;
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
  /**
   * Async guard — return/resolve `true` to cancel the close.
   * Receives the trigger reason. Replaces the synchronous version from 0.3.x.
   */
  preventClose?: (reason: CloseReason) => boolean | Promise<boolean>;
  /** Disable body scroll lock while open. Default: true (locked). */
  lockBodyScroll?: boolean;
  /** Override the portal container. Default: document.body. */
  container?: HTMLElement | null;
  /** Transition variant for the panel (only `dialog`; drawers always slide). Default: "fade" */
  transition?: ModalTransition;
  /** Allow swipe-down-to-dismiss on touch devices. Default: false (true for `drawer-bottom`). */
  swipeToDismiss?: boolean;
  /** When the modal contains a single `<form>` and it submits successfully, auto-close. Default: false. */
  closeOnSubmit?: boolean;

  // ---- confirm variant ----
  /**
   * When `"confirm"`, a pre-wired footer is rendered automatically.
   * Supply `confirmLabel`, `cancelLabel`, `onConfirm`, `onCancel` and `confirmTone`.
   */
  confirmVariant?: "default" | "confirm";
  confirmLabel?: ReactNode;
  cancelLabel?: ReactNode;
  /** Called when the confirm button is clicked. */
  onConfirm?: () => void;
  /** Called when the cancel button is clicked (in addition to `onClose`). */
  onCancel?: () => void;
  /** Tone of the confirm button. Default: "neutral". */
  confirmTone?: ConfirmTone;

  /** Inline style override */
  style?: React.CSSProperties;
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
      mobileVariant = "default",
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
      transition = "fade",
      swipeToDismiss,
      closeOnSubmit = false,
      confirmVariant = "default",
      confirmLabel = "Confirm",
      cancelLabel = "Cancel",
      onConfirm,
      onCancel,
      confirmTone = "neutral",
      style,
    },
    ref,
  ) {
    const swipeEnabled = swipeToDismiss ?? variant === "drawer-bottom";
    const myStackIdRef = useRef<number>(-1);
    const [stackDepth, setStackDepth] = useState(0);
    const [stackPosition, setStackPosition] = useState(0); // 0 = top
    const [swipeY, setSwipeY] = useState(0);
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

    // Sheet: detect narrow viewport
    const [isNarrow, setIsNarrow] = useState(false);
    useEffect(() => {
      if (mobileVariant !== "sheet") return;
      const mq = window.matchMedia("(max-width: 640px)");
      setIsNarrow(mq.matches);
      const handler = (e: MediaQueryListEvent) => setIsNarrow(e.matches);
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }, [mobileVariant]);

    const isSheet = mobileVariant === "sheet" && isNarrow;

    // Sheet drag state
    const sheetStartYRef = useRef<number | null>(null);
    const sheetVelocityRef = useRef<number>(0);
    const sheetLastYRef = useRef<number | null>(null);
    const sheetLastTimeRef = useRef<number | null>(null);
    const [sheetDragY, setSheetDragY] = useState(0);
    const [sheetSnapping, setSheetSnapping] = useState(false);

    const reducedMotion = useRef(false);
    useEffect(() => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      reducedMotion.current = mq.matches;
      const handler = (e: MediaQueryListEvent) => { reducedMotion.current = e.matches; };
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }, []);

    const onAfterOpenRef = useRef(onAfterOpen);
    onAfterOpenRef.current = onAfterOpen;
    const onAfterCloseRef = useRef(onAfterClose);
    onAfterCloseRef.current = onAfterClose;

    useEffect(() => { setMounted(true); }, []);

    const requestClose = useCallback(
      async (reason: CloseReason) => {
        if (preventClose) {
          const vetoed = await Promise.resolve(preventClose(reason));
          if (vetoed) return;
        }
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

    // ---- Stacking: register / deregister this modal ---------------------
    useEffect(() => {
      if (!isActuallyOpen) return;
      const id = ++_modalIdCounter;
      myStackIdRef.current = id;
      _openModals.push({ id });
      _notifyStack();
      const sync = () => {
        const idx = _openModals.findIndex((m) => m.id === id);
        const total = _openModals.length;
        setStackDepth(total);
        setStackPosition(idx === -1 ? 0 : total - 1 - idx);
      };
      sync();
      _stackListeners.add(sync);
      return () => {
        _stackListeners.delete(sync);
        const idx = _openModals.findIndex((m) => m.id === id);
        if (idx !== -1) _openModals.splice(idx, 1);
        _notifyStack();
      };
    }, [isActuallyOpen]);

    // ---- closeOnSubmit: auto-close on a contained <form> submit ---------
    useEffect(() => {
      if (!closeOnSubmit || !isActuallyOpen || !panelRef.current) return;
      const panel = panelRef.current;
      const onSubmit = (e: Event) => {
        if (e.defaultPrevented) return;
        setTimeout(() => requestClose("submit"), 0);
      };
      panel.addEventListener("submit", onSubmit);
      return () => panel.removeEventListener("submit", onSubmit);
    }, [closeOnSubmit, isActuallyOpen, requestClose]);

    // ---- Swipe-to-dismiss (touch only, regular drawers) -----------------------------------
    const swipeStartYRef = useRef<number | null>(null);
    const handleSwipePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!swipeEnabled || e.pointerType !== "touch") return;
      swipeStartYRef.current = e.clientY;
    };
    const handleSwipePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
      if (swipeStartYRef.current === null) return;
      const dy = Math.max(0, e.clientY - swipeStartYRef.current);
      setSwipeY(dy);
    };
    const handleSwipePointerUp = () => {
      if (swipeStartYRef.current === null) return;
      if (swipeY > 120) requestClose("swipe");
      setSwipeY(0);
      swipeStartYRef.current = null;
    };

    // ---- Sheet drag-to-dismiss -----------------------------------------------
    const handleSheetPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
      if (!isSheet) return;
      sheetStartYRef.current = e.clientY;
      sheetLastYRef.current = e.clientY;
      sheetLastTimeRef.current = e.timeStamp;
      sheetVelocityRef.current = 0;
      setSheetSnapping(false);
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    }, [isSheet]);

    const handleSheetPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
      if (sheetStartYRef.current === null) return;
      const dy = Math.max(0, e.clientY - sheetStartYRef.current);
      if (sheetLastYRef.current !== null && sheetLastTimeRef.current !== null) {
        const dt = e.timeStamp - sheetLastTimeRef.current;
        if (dt > 0) {
          sheetVelocityRef.current = (e.clientY - sheetLastYRef.current) / dt;
        }
      }
      sheetLastYRef.current = e.clientY;
      sheetLastTimeRef.current = e.timeStamp;
      setSheetDragY(dy);
    }, []);

    const handleSheetPointerUp = useCallback(() => {
      if (sheetStartYRef.current === null) return;
      const panelHeight = panelRef.current?.offsetHeight ?? 300;
      const threshold = panelHeight * 0.4;
      const highVelocity = sheetVelocityRef.current > 0.5;
      sheetStartYRef.current = null;

      if (reducedMotion.current) {
        if (sheetDragY > 40 || highVelocity) {
          setSheetDragY(0);
          requestClose("swipe");
        } else {
          setSheetDragY(0);
        }
        return;
      }

      if (sheetDragY > threshold || highVelocity) {
        setSheetDragY(0);
        requestClose("swipe");
      } else {
        setSheetSnapping(true);
        setSheetDragY(0);
        setTimeout(() => setSheetSnapping(false), 400);
      }
    }, [sheetDragY, requestClose]);

    // Focus management
    const previouslyFocusedRef = useRef<HTMLElement | null>(null);
    useEffect(() => {
      if (isActuallyOpen) {
        previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
        if (panelRef.current) {
          activate(panelRef.current);
          requestAnimationFrame(() => {
            if (initialFocusRef?.current) {
              initialFocusRef.current.focus();
            }
          });
        }
      } else {
        deactivate();
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

    const overlayStyle: React.CSSProperties = {
      ...(overlayColor ? ({ "--rmod-overlay-bg": overlayColor } as React.CSSProperties) : {}),
      zIndex: 1000 + stackDepth * 10,
    };

    // Sheet drag inline style
    const sheetDragStyle: React.CSSProperties =
      isSheet && sheetDragY > 0
        ? {
            transform: `translateY(${sheetDragY}px)`,
            transition: "none",
          }
        : isSheet && sheetSnapping
          ? {
              transform: "translateY(0)",
              transition: `transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
            }
          : {};

    const panelStyle: React.CSSProperties = {
      ...(stackPosition > 0
        ? {
            transform: `translateY(${-stackPosition * 8}px) scale(${1 - stackPosition * 0.03})`,
            opacity: Math.max(0.6, 1 - stackPosition * 0.18),
          }
        : {}),
      ...(swipeY > 0 ? { transform: `translateY(${swipeY}px)`, transition: "none" } : {}),
      ...sheetDragStyle,
      ...style,
    };

    // Confirm variant footer
    const confirmFooter = confirmVariant === "confirm" ? (
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button
          type="button"
          className="rmod-btn rmod-btn--cancel"
          onClick={() => {
            onCancel?.();
            requestClose("close-button");
          }}
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          className={`rmod-btn rmod-btn--confirm${confirmTone === "danger" ? " rmod-btn--danger" : ""}`}
          onClick={() => {
            onConfirm?.();
          }}
          autoFocus
        >
          {confirmLabel}
        </button>
      </div>
    ) : null;

    const resolvedFooter = confirmVariant === "confirm" ? confirmFooter : footer;

    return createPortal(
      <div
        className={[
          "rmod-overlay",
          visible ? "rmod-overlay--visible" : "",
        ].filter(Boolean).join(" ")}
        data-variant={isSheet ? "sheet" : variant}
        data-blur={blur}
        data-transition={transition}
        data-stack-position={stackPosition || undefined}
        data-state={visible ? "open" : "closed"}
        style={overlayStyle}
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
          data-variant={isSheet ? "sheet" : variant}
          data-padding={padding}
          data-scrollable={scrollable ? "true" : undefined}
          data-transition={transition}
          data-state={visible ? "open" : "closed"}
          data-swiping={swipeY > 0 || sheetDragY > 0 ? "true" : undefined}
          style={panelStyle}
          onPointerDown={isSheet ? handleSheetPointerDown : swipeEnabled ? handleSwipePointerDown : undefined}
          onPointerMove={isSheet ? handleSheetPointerMove : swipeEnabled ? handleSwipePointerMove : undefined}
          onPointerUp={isSheet ? handleSheetPointerUp : swipeEnabled ? handleSwipePointerUp : undefined}
          onPointerCancel={isSheet ? handleSheetPointerUp : swipeEnabled ? handleSwipePointerUp : undefined}
        >
          {isSheet && <div className="rmod-sheet-handle" aria-hidden="true" />}
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
          {resolvedFooter && <div className="rmod-footer">{resolvedFooter}</div>}
        </div>
      </div>,
      portalTarget,
    );
  },
);
