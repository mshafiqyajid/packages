import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { type AlertTone } from "../useAlert";

export type AlertVariant = "banner" | "filled" | "outline" | "soft";
export type AlertSize = "sm" | "md" | "lg";

export interface AlertStyledProps {
  variant?: AlertVariant;
  tone?: AlertTone;
  size?: AlertSize;
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  showIcon?: boolean;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

const InfoIcon = () => (
  <svg viewBox="0 0 20 20" width="100%" height="100%" fill="none" aria-hidden="true">
    <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10 9v4M10 7h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 20 20" width="100%" height="100%" fill="none" aria-hidden="true">
    <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
    <path d="M6.5 10.5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const WarningIcon = () => (
  <svg viewBox="0 0 20 20" width="100%" height="100%" fill="none" aria-hidden="true">
    <path d="M10 3L18 17H2L10 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M10 9v3M10 14h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const DangerIcon = () => (
  <svg viewBox="0 0 20 20" width="100%" height="100%" fill="none" aria-hidden="true">
    <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7.5 7.5l5 5M12.5 7.5l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const DismissIcon = () => (
  <svg viewBox="0 0 20 20" width="14" height="14" fill="none" aria-hidden="true">
    <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

function getDefaultIcon(tone: AlertTone): ReactNode {
  switch (tone) {
    case "success":
      return <CheckIcon />;
    case "warning":
      return <WarningIcon />;
    case "danger":
      return <DangerIcon />;
    case "neutral":
    case "primary":
    case "info":
    default:
      return <InfoIcon />;
  }
}

const EXIT_DURATION = 300;

export const AlertStyled = forwardRef<HTMLDivElement, AlertStyledProps>(
  function AlertStyled(
    {
      variant = "soft",
      tone = "neutral",
      size = "md",
      title,
      description,
      icon,
      showIcon = true,
      dismissible = false,
      onDismiss,
      action,
      children,
      className,
      style,
    },
    ref,
  ) {
    const [isExiting, setIsExiting] = useState(false);
    const [isGone, setIsGone] = useState(false);
    const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
      return () => {
        if (exitTimerRef.current !== null) {
          clearTimeout(exitTimerRef.current);
        }
      };
    }, []);

    const dismiss = useCallback(() => {
      setIsExiting(true);
      exitTimerRef.current = setTimeout(() => {
        setIsGone(true);
        onDismiss?.();
      }, EXIT_DURATION);
    }, [onDismiss]);

    const onKeyDown = useCallback(
      (e: KeyboardEvent<HTMLDivElement>) => {
        if (dismissible && e.key === "Escape") {
          e.preventDefault();
          dismiss();
        }
      },
      [dismissible, dismiss],
    );

    if (isGone) return null;

    const isDanger = tone === "danger";
    const rootClass = ["ralt-root", className].filter(Boolean).join(" ");
    const resolvedIcon = icon ?? getDefaultIcon(tone);

    return (
      <div
        ref={ref}
        role={isDanger ? "alert" : "status"}
        aria-live={isDanger ? "assertive" : "polite"}
        onKeyDown={onKeyDown}
        className={rootClass}
        data-variant={variant}
        data-tone={tone}
        data-size={size}
        data-exiting={isExiting ? "true" : undefined}
        style={style}
      >
        {showIcon && (
          <span className="ralt-icon-wrap">
            <span className="ralt-icon" aria-hidden="true">{resolvedIcon}</span>
          </span>
        )}
        <div className="ralt-body">
          {title && <p className="ralt-title">{title}</p>}
          {description && <p className="ralt-description">{description}</p>}
          {children && <div className="ralt-children">{children}</div>}
          {action && <div className="ralt-action">{action}</div>}
        </div>
        {dismissible && (
          <button
            type="button"
            aria-label="Dismiss"
            onClick={dismiss}
            className="ralt-dismiss"
          >
            <DismissIcon />
          </button>
        )}
      </div>
    );
  },
);
