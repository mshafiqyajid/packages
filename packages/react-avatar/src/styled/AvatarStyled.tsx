import React, { forwardRef } from "react";
import { useAvatar } from "../useAvatar";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
export type AvatarShape = "circle" | "square";
export type AvatarPresence = "online" | "offline" | "busy" | "away";

export interface AvatarStyledProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  src?: string;
  name?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  status?: AvatarPresence;
  fallback?: React.ReactNode;
  border?: boolean;
  /** Custom background color e.g. "#6366f1" */
  color?: string;
  /** Auto-derive a stable background color from `name` (only when no `color` is set and the image is absent or errored). */
  autoColor?: boolean;
  /** Show a shimmering skeleton instead of the fallback while the image loads. */
  showLoading?: boolean;
  onClick?: () => void;
}

const AUTO_PALETTE = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#06b6d4", "#3b82f6", "#6366f1", "#a855f7",
  "#ec4899", "#14b8a6",
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export const AvatarStyled = forwardRef<HTMLSpanElement, AvatarStyledProps>(
  function AvatarStyled(
    {
      src,
      name,
      size = "md",
      shape = "circle",
      status,
      fallback,
      border = false,
      color,
      autoColor = false,
      showLoading = false,
      onClick,
      className,
      style,
      ...rest
    },
    ref,
  ) {
    const {
      imgProps,
      fallbackProps,
      status: loadStatus,
      initials,
    } = useAvatar({ src, name });

    const showSkeleton = showLoading && src && loadStatus === "loading";
    const showFallback = !showSkeleton && (loadStatus === "error" || !src);

    const derivedColor =
      !color && autoColor && name
        ? AUTO_PALETTE[hashString(name) % AUTO_PALETTE.length]
        : undefined;

    const resolvedBg = color ?? derivedColor;

    return (
      <span
        ref={ref}
        className={["rav-avatar", className].filter(Boolean).join(" ")}
        data-size={size}
        data-shape={shape}
        data-border={border ? "true" : undefined}
        data-clickable={onClick ? "true" : undefined}
        data-loading={showSkeleton ? "true" : undefined}
        onClick={onClick}
        style={{ ...(resolvedBg ? { "--rav-bg": resolvedBg, "--rav-fg": "#ffffff" } as React.CSSProperties : {}), ...style }}
        {...rest}
      >
        {/* .rav-clip clips image/fallback to the correct shape */}
        <span className="rav-clip">
          {showSkeleton && (
            <span className="rav-skeleton" aria-hidden="true" />
          )}
          {showFallback && (
            <span className="rav-fallback" {...fallbackProps}>
              {fallback ?? (initials ? initials : (
                <svg className="rav-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                </svg>
              ))}
            </span>
          )}
          {/* Image renders on top; fades in once loaded */}
          {src && (
            <img {...imgProps} className="rav-img" data-status={loadStatus} />
          )}
        </span>

        {/* Status dot sits outside .rav-clip — never clipped */}
        {status && (
          <span className="rav-status" data-presence={status} aria-label={status} />
        )}
      </span>
    );
  },
);
