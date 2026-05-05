import {
  type ReactNode,
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import {
  type CopySource,
  type UseCopyToClipboardOptions,
  useCopyToClipboard,
} from "../useCopyToClipboard";

export type CopyButtonVariant = "solid" | "outline" | "ghost" | "subtle";
export type CopyButtonSize = "sm" | "md" | "lg" | "icon";
export type CopyButtonTone = "neutral" | "primary" | "success" | "danger";

export interface CopyButtonStyledProps
  extends UseCopyToClipboardOptions,
    Omit<
      React.ButtonHTMLAttributes<HTMLButtonElement>,
      "onCopy" | "onError" | "onClick" | "children"
    > {
  /** Text to copy. String or async function. */
  text: CopySource;
  /** Default-state label. Default: "Copy". Pass empty string for icon-only. */
  label?: ReactNode;
  /** Label shown briefly after a successful copy. Default: "Copied". */
  copiedLabel?: ReactNode;
  /** Label shown briefly when the copy fails. When set, the button receives `data-error="true"`. */
  errorLabel?: ReactNode;
  /** Visual variant. Default: "solid". */
  variant?: CopyButtonVariant;
  /** Size. Default: "md". Use "icon" for square icon-only. */
  size?: CopyButtonSize;
  /** Color theme. Default: "neutral". */
  tone?: CopyButtonTone;
  /** Stretch to container width. */
  fullWidth?: boolean;
  /** Render icon on the left or right of the label. Default: "left". */
  iconPosition?: "left" | "right";
  /**
   * Custom icon. `true` (default) uses built-in copy/check icons.
   * `false` hides the icon container.
   * Pass `{ copy, check }` to override one or both icons.
   */
  icon?: boolean | { copy?: ReactNode; check?: ReactNode };
  /**
   * Show a spinner while copying. If `"auto"` (default), the spinner
   * appears only while an async `text` function is resolving.
   */
  loading?: boolean | "auto";
  /** Tooltip shown on hover/focus. */
  tooltip?: ReactNode;
  /**
   * Announce the copied state to screen readers via a live region.
   * Default: `true`. Pass a string to customize the message.
   */
  announceOnCopy?: boolean | string;
}

function DefaultCopyIcon() {
  return (
    <svg
      className="rcb-button__icon-copy"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function DefaultCheckIcon() {
  return (
    <svg
      className="rcb-button__icon-check"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function Spinner() {
  return (
    <span className="rcb-button__spinner" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeOpacity="0.18"
          strokeWidth="2.5"
        />
        <path
          d="M21 12a9 9 0 0 0-9-9"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          className="rcb-spin-arc-2"
          d="M3 12a9 9 0 0 0 4.5 7.79"
          stroke="currentColor"
          strokeOpacity="0.55"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

function Sparkles() {
  return (
    <span className="rcb-button__sparkles" aria-hidden="true">
      <span className="rcb-button__sparkle" />
      <span className="rcb-button__sparkle" />
      <span className="rcb-button__sparkle" />
      <span className="rcb-button__sparkle" />
      <span className="rcb-button__sparkle" />
      <span className="rcb-button__sparkle" />
    </span>
  );
}

interface IconBlockProps {
  icon: CopyButtonStyledProps["icon"];
  loading: boolean;
}

function IconBlock({ icon, loading }: IconBlockProps) {
  if (icon === false) {
    return loading ? <Spinner /> : null;
  }
  const customCopy = typeof icon === "object" ? icon.copy : undefined;
  const customCheck = typeof icon === "object" ? icon.check : undefined;

  return (
    <span className="rcb-button__icon" aria-hidden="true">
      {customCopy !== undefined ? (
        <span className="rcb-button__icon-copy" style={{ position: "absolute", inset: 0, display: "inline-flex" }}>
          {customCopy}
        </span>
      ) : (
        <DefaultCopyIcon />
      )}
      {customCheck !== undefined ? (
        <span className="rcb-button__icon-check" style={{ position: "absolute", inset: 0, display: "inline-flex" }}>
          {customCheck}
        </span>
      ) : (
        <DefaultCheckIcon />
      )}
      {loading ? <Spinner /> : null}
    </span>
  );
}

export const CopyButtonStyled = forwardRef<
  HTMLButtonElement,
  CopyButtonStyledProps
>(function CopyButtonStyled(
  {
    text,
    label = "Copy",
    copiedLabel = "Copied",
    errorLabel,
    variant = "solid",
    size = "md",
    tone = "neutral",
    fullWidth = false,
    iconPosition = "left",
    icon = true,
    loading = "auto",
    tooltip,
    announceOnCopy = true,
    resetAfter,
    onCopy,
    onError,
    className,
    type = "button",
    ...rest
  },
  ref,
) {
  const [autoLoading, setAutoLoading] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const liveRegionId = useId();
  const announceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (announceTimerRef.current !== null) {
        clearTimeout(announceTimerRef.current);
      }
    };
  }, []);

  const handleCopy = useCallback(
    (copiedText: string) => {
      onCopy?.(copiedText);
      if (announceOnCopy) {
        const message =
          typeof announceOnCopy === "string"
            ? announceOnCopy
            : "Copied to clipboard";
        setAnnouncement(""); // re-trigger by clearing first
        if (announceTimerRef.current !== null) {
          clearTimeout(announceTimerRef.current);
        }
        announceTimerRef.current = setTimeout(() => {
          setAnnouncement(message);
        }, 50);
      }
    },
    [onCopy, announceOnCopy],
  );

  const { copy, copied, error } = useCopyToClipboard({
    resetAfter,
    onCopy: handleCopy,
    onError,
  });

  const handleClick = useCallback(async () => {
    if (loading === "auto" && typeof text === "function") {
      setAutoLoading(true);
      try {
        await copy(text);
      } finally {
        setAutoLoading(false);
      }
    } else {
      void copy(text);
    }
  }, [copy, text, loading]);

  const isLoading = loading === true || (loading === "auto" && autoLoading);
  const hasError = error !== null && errorLabel !== undefined;
  const showLabel = size !== "icon" && label !== "" && label !== null && label !== undefined;
  const showCopiedLabel =
    size !== "icon" && copiedLabel !== "" && copiedLabel !== null && copiedLabel !== undefined;
  const showErrorLabel =
    size !== "icon" && hasError && errorLabel !== "" && errorLabel !== null;

  const mergedClassName = ["rcb-button", className].filter(Boolean).join(" ");

  const button = (
    <button
      ref={ref}
      type={type}
      onClick={() => void handleClick()}
      className={mergedClassName}
      data-variant={variant}
      data-size={size}
      data-tone={tone}
      data-icon-position={iconPosition}
      data-full-width={fullWidth ? "true" : undefined}
      data-loading={isLoading ? "true" : undefined}
      data-copied={copied ? "true" : undefined}
      data-error={hasError ? "true" : undefined}
      aria-describedby={announceOnCopy ? liveRegionId : undefined}
      {...rest}
    >
      <IconBlock icon={icon} loading={isLoading} />
      {(showLabel || showCopiedLabel || showErrorLabel) && (
        <span className="rcb-button__label">
          {showErrorLabel ? (
            <span className="rcb-button__label-error">{errorLabel}</span>
          ) : showLabel ? (
            <span className="rcb-button__label-copy">{label}</span>
          ) : null}
          {!showErrorLabel && showCopiedLabel ? (
            <span className="rcb-button__label-copied">{copiedLabel}</span>
          ) : null}
        </span>
      )}
      <Sparkles />
      {announceOnCopy ? (
        <span
          id={liveRegionId}
          className="rcb-sr-only"
          aria-live="polite"
          aria-atomic="true"
        >
          {announcement}
        </span>
      ) : null}
    </button>
  );

  if (tooltip) {
    return (
      <span
        className="rcb-tooltip-wrapper"
        data-full-width={fullWidth ? "true" : undefined}
      >
        {button}
        <span className="rcb-tooltip" role="tooltip">
          {tooltip}
        </span>
      </span>
    );
  }

  return button;
});
