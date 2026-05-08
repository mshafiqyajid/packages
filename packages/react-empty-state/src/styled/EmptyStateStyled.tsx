import { forwardRef, type CSSProperties, type ReactNode } from "react";
import { useEmptyState, type EmptyStatePreset } from "../useEmptyState";

const IconInbox = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M20 12H4M20 12l-4 4M20 12l-4-4M4 12l4-4M4 12l4 4" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="2" y="4" width="20" height="16" rx="2" strokeLinecap="round" />
  </svg>
);

const IconSearch = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <circle cx="10" cy="10" r="7" />
    <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
  </svg>
);

const IconExclamation = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
  </svg>
);

const IconWifiOff = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0119 12.55M5 12.55a10.94 10.94 0 015.17-2.39M10.71 5.05A16 16 0 0122.56 9M1.42 9a15.91 15.91 0 014.7-2.88M8.53 16.11a6 6 0 016.95 0M12 20h.01" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PRESET_DEFAULTS: Record<
  EmptyStatePreset,
  { title: string; description: string; icon: ReactNode }
> = {
  "no-data": {
    title: "No data yet",
    description: "Start adding items to see them here.",
    icon: IconInbox,
  },
  "no-results": {
    title: "No results found",
    description: "Try adjusting your search or filters.",
    icon: IconSearch,
  },
  "error": {
    title: "Something went wrong",
    description: "Please try again later.",
    icon: IconExclamation,
  },
  "offline": {
    title: "You're offline",
    description: "Check your internet connection.",
    icon: IconWifiOff,
  },
  "empty-search": {
    title: "No matches",
    description: "We couldn't find anything matching your search.",
    icon: IconSearch,
  },
};

export interface EmptyStateStyledProps {
  preset?: EmptyStatePreset;
  icon?: ReactNode;
  image?: string | ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  secondaryAction?: ReactNode;
  size?: "sm" | "md" | "lg";
  orientation?: "vertical" | "horizontal";
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export const EmptyStateStyled = forwardRef<HTMLDivElement, EmptyStateStyledProps>(
  function EmptyStateStyled(
    {
      preset,
      icon,
      image,
      title,
      description,
      action,
      secondaryAction,
      size = "md",
      orientation = "vertical",
      children,
      className,
      style,
    },
    ref,
  ) {
    const presetDefaults = preset ? PRESET_DEFAULTS[preset] : undefined;

    const resolvedTitle = title ?? presetDefaults?.title;
    const resolvedDescription = description ?? presetDefaults?.description;
    const resolvedIcon = icon ?? presetDefaults?.icon;

    const { rootProps } = useEmptyState({
      title: typeof resolvedTitle === "string" ? resolvedTitle : undefined,
    });

    const rootClass = ["rems-root", className].filter(Boolean).join(" ");

    const hasActions = action != null || secondaryAction != null;

    return (
      <div
        {...rootProps}
        ref={ref}
        className={rootClass}
        data-size={size}
        data-orientation={orientation}
        data-preset={preset ?? undefined}
        style={style}
      >
        {image != null ? (
          typeof image === "string" ? (
            <img src={image} alt="" className="rems-image" />
          ) : (
            <span className="rems-icon">{image}</span>
          )
        ) : resolvedIcon != null ? (
          <span className="rems-icon">{resolvedIcon}</span>
        ) : null}

        <div className="rems-body">
          {resolvedTitle != null && (
            <p className="rems-title">{resolvedTitle}</p>
          )}
          {resolvedDescription != null && (
            <p className="rems-description">{resolvedDescription}</p>
          )}
          {children}
          {hasActions && (
            <div className="rems-actions">
              {action}
              {secondaryAction}
            </div>
          )}
        </div>
      </div>
    );
  },
);
