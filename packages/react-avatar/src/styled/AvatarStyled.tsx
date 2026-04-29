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
  onClick?: () => void;
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

    return (
      <span
        ref={ref}
        className={["rav-avatar", className].filter(Boolean).join(" ")}
        data-size={size}
        data-shape={shape}
        data-border={border ? "true" : undefined}
        data-clickable={onClick ? "true" : undefined}
        onClick={onClick}
        style={{ ...(color ? { "--rav-bg": color, "--rav-fg": "#ffffff" } as React.CSSProperties : {}), ...style }}
        {...rest}
      >
        {/* .rav-clip clips image/fallback to the correct shape */}
        <span className="rav-clip">
          {/* Always render fallback; it shows when image is absent or errored */}
          {(loadStatus === "error" || !src) && (
            <span className="rav-fallback" {...fallbackProps}>
              {fallback ?? (initials ? initials : (
                <svg className="rav-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                </svg>
              ))}
            </span>
          )}
          {/* Image renders on top of fallback; fades in once loaded */}
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
