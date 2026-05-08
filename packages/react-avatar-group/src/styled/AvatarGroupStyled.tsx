import { forwardRef } from "react";
import type { AvatarGroupItem } from "../useAvatarGroup";
import { useAvatarGroup } from "../useAvatarGroup";

export interface AvatarGroupStyledProps {
  avatars: AvatarGroupItem[];
  max?: number;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  shape?: "circle" | "square";
  spacing?: "tight" | "normal" | "loose";
  showTooltip?: boolean;
  overflow?: "count" | "avatars";
  onOverflowClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export const AvatarGroupStyled = forwardRef<HTMLDivElement, AvatarGroupStyledProps>(
  function AvatarGroupStyled(
    {
      avatars,
      max = 4,
      size = "md",
      shape = "circle",
      spacing = "normal",
      showTooltip = true,
      overflow = "count",
      onOverflowClick,
      className,
      style,
    },
    ref,
  ) {
    const { groupProps, getAvatarProps, overflowProps, visibleAvatars, overflowCount } =
      useAvatarGroup({ avatars, max, overflow, onOverflowClick });

    const rootClass = ["ravg-root", className].filter(Boolean).join(" ");

    return (
      <div
        ref={ref}
        className={rootClass}
        data-size={size}
        data-shape={shape}
        data-spacing={spacing}
        style={style}
        {...groupProps}
      >
        {visibleAvatars.map((avatar, index) => {
          const avatarProps = getAvatarProps(avatar, index);
          const inner = (
            <span
              className="ravg-avatar"
              key={index}
              data-index={index}
              title={showTooltip && avatar.name ? avatar.name : undefined}
              {...avatarProps}
            >
              {avatar.src ? (
                <img className="ravg-img" src={avatar.src} alt={avatar.name ?? ""} />
              ) : (
                <span className="ravg-initials" aria-hidden="true">
                  {avatar.fallback ??
                    (avatar.name ? getInitials(avatar.name) : "?")}
                </span>
              )}
            </span>
          );

          if (avatar.href) {
            return (
              <a
                key={index}
                href={avatar.href}
                className="ravg-avatar-link"
                title={showTooltip && avatar.name ? avatar.name : undefined}
                aria-label={avatar.name}
              >
                {inner}
              </a>
            );
          }

          return inner;
        })}

        {overflowCount > 0 && (
          <span
            className="ravg-overflow"
            title={showTooltip ? overflowProps["aria-label"] : undefined}
            {...overflowProps}
          >
            +{overflowCount}
          </span>
        )}
      </div>
    );
  },
);
