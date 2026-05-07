import {
  forwardRef,
  useState,
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";

export type BadgeVariant = "solid" | "subtle" | "outline";
export type BadgeSize = "sm" | "md" | "lg";
export type BadgeTone =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";

export type BadgeShape = "rounded" | "square";

export interface BadgeStyledProps {
  children?: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  tone?: BadgeTone;
  shape?: BadgeShape;
  dot?: boolean;
  /** Animate the dot with a pulsing ring */
  pulse?: boolean;
  count?: number;
  /** Cap shown count at this value, showing `{maxCount}+` when exceeded */
  maxCount?: number;
  /** Hide the entire badge when count is 0 (and no children/icon are set). Default false. */
  hideOnZero?: boolean;
  /** Render zero counts as a single character to keep the dot shape predictable. */
  showZero?: boolean;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: ReactNode;
  uppercase?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const BadgeStyled = forwardRef<HTMLSpanElement, BadgeStyledProps>(
  function BadgeStyled(
    {
      children,
      variant = "subtle",
      size = "md",
      tone = "neutral",
      shape = "rounded",
      dot = false,
      pulse = false,
      count,
      maxCount,
      hideOnZero = false,
      showZero = false,
      dismissible = false,
      onDismiss,
      icon,
      uppercase = false,
      className,
      style,
    },
    ref,
  ) {
    const [isDismissed, setIsDismissed] = useState(false);
    const [mounted, setMounted] = useState(false);
    const prevCountRef = useRef<number | undefined>(count);
    const [flipDir, setFlipDir] = useState<"up" | "down" | undefined>(
      undefined,
    );
    const [displayCount, setDisplayCount] = useState(count);
    const flipKeyRef = useRef(0);
    const [flipKey, setFlipKey] = useState(0);

    useEffect(() => {
      setMounted(true);
    }, []);

    useEffect(() => {
      if (count === undefined) {
        prevCountRef.current = count;
        setDisplayCount(count);
        return;
      }
      const prev = prevCountRef.current;
      if (prev === undefined) {
        prevCountRef.current = count;
        setDisplayCount(count);
        return;
      }
      if (count === prev) return;
      const dir = count > prev ? "up" : "down";
      setFlipDir(dir);
      flipKeyRef.current += 1;
      setFlipKey(flipKeyRef.current);
      setDisplayCount(count);
      prevCountRef.current = count;
    }, [count]);

    const hasContent = !!children || !!icon || dot;
    const isZero = count === 0;
    const shouldHide = hideOnZero && isZero && !showZero && !hasContent;
    if (shouldHide) return null;

    const handleDismiss = useCallback(() => {
      setIsDismissed(true);
      onDismiss?.();
    }, [onDismiss]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleDismiss();
        }
      },
      [handleDismiss],
    );

    if (isDismissed) return null;

    const shownCount =
      displayCount !== undefined
        ? maxCount !== undefined && displayCount > maxCount
          ? `${maxCount}+`
          : displayCount
        : undefined;

    const countAriaLabel =
      displayCount !== undefined
        ? `${maxCount !== undefined && displayCount > maxCount ? `${maxCount}+` : displayCount} items`
        : undefined;

    return (
      <span
        ref={ref}
        role="status"
        className={["rbadge-badge", className].filter(Boolean).join(" ")}
        style={style}
        data-variant={variant}
        data-size={size}
        data-tone={tone}
        data-shape={shape}
        data-uppercase={uppercase ? "true" : undefined}
        data-mounted={mounted ? "true" : undefined}
      >
        {dot && (
          <span className="rbadge-dot-wrap" aria-hidden="true">
            <span
              className="rbadge-dot"
              data-pulse={pulse ? "true" : undefined}
            />
          </span>
        )}
        {icon && (
          <span className="rbadge-icon" aria-hidden="true">
            {icon}
          </span>
        )}
        {children && <span className="rbadge-label">{children}</span>}
        {displayCount !== undefined &&
          !(hideOnZero && displayCount === 0 && !showZero) && (
            <span
              key={flipKey}
              className="rbadge-count"
              aria-label={countAriaLabel}
              data-dir={flipDir}
            >
              {shownCount}
            </span>
          )}
        {dismissible && (
          <span
            role="button"
            aria-label="Dismiss"
            tabIndex={0}
            className="rbadge-dismiss"
            onClick={handleDismiss}
            onKeyDown={handleKeyDown}
          >
            <svg
              aria-hidden="true"
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1.5 1.5L8.5 8.5M8.5 1.5L1.5 8.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
        )}
      </span>
    );
  },
);
