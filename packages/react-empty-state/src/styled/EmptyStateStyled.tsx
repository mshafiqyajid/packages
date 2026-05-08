import { forwardRef, type CSSProperties, type ReactNode } from "react";
import { useEmptyState, type EmptyStatePreset } from "../useEmptyState";

const IconInbox = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M2 14h4l2 3h8l2-3h4" strokeLinejoin="round" />
    <path d="M9 9h6" strokeLinecap="round" />
    <path d="M10 12h4" strokeLinecap="round" />
    <path d="M12 4v5" strokeLinecap="round" strokeDasharray="1.5 1.5" />
    <path d="M9.5 6.5L12 4l2.5 2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconSearchX = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <circle cx="10.5" cy="10.5" r="7.5" />
    <path d="M21 21l-4.5-4.5" strokeLinecap="round" />
    <path d="M8 8l5 5M13 8l-5 5" strokeLinecap="round" />
  </svg>
);

const IconTriangleAlert = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinejoin="round" />
    <path d="M12 9v5" strokeLinecap="round" />
    <path d="M12 17.5v.5" strokeLinecap="round" />
    <path d="M9 18.5h6" strokeLinecap="round" strokeOpacity="0.3" />
    <path d="M7.5 16h.5" strokeLinecap="round" strokeOpacity="0.3" />
    <path d="M16 16h.5" strokeLinecap="round" strokeOpacity="0.3" />
  </svg>
);

const IconWifiSlash = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M2 2l20 20" strokeLinecap="round" />
    <path d="M8.5 8.5A10.5 10.5 0 0119 12.1" strokeLinecap="round" />
    <path d="M5 12a10.5 10.5 0 011.5-1.4" strokeLinecap="round" />
    <path d="M11 15.5a5 5 0 016 0" strokeLinecap="round" />
    <path d="M5 15.5a5 5 0 013.5-1.4" strokeLinecap="round" strokeDasharray="2 2" />
    <path d="M14 19a2 2 0 01-4 0" strokeLinecap="round" />
    <circle cx="12" cy="19" r="0.5" fill="currentColor" stroke="none" />
    <path d="M1 1l2.5 2.5" strokeLinecap="round" strokeOpacity="0" />
  </svg>
);

const IconFolderSearch = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M3 6a2 2 0 012-2h4l2 2h8a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V6z" strokeLinejoin="round" />
    <circle cx="11" cy="13" r="3" />
    <path d="M13.5 15.5L16 18" strokeLinecap="round" />
    <path d="M9.5 13h3" strokeLinecap="round" strokeOpacity="0.5" />
    <path d="M11 11.5v3" strokeLinecap="round" strokeOpacity="0.5" />
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
    icon: IconSearchX,
  },
  "error": {
    title: "Something went wrong",
    description: "Please try again later.",
    icon: IconTriangleAlert,
  },
  "offline": {
    title: "You're offline",
    description: "Check your internet connection.",
    icon: IconWifiSlash,
  },
  "empty-search": {
    title: "No matches",
    description: "We couldn't find anything matching your search.",
    icon: IconFolderSearch,
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
            <span className="rems-icon-wrap">
              <span className="rems-icon">{image}</span>
            </span>
          )
        ) : resolvedIcon != null ? (
          <span className="rems-icon-wrap">
            <span className="rems-icon">{resolvedIcon}</span>
          </span>
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
