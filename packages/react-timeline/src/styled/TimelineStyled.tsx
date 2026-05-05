import { forwardRef, type ReactNode, type MouseEvent } from "react";

export type TimelineStatus =
  | "default"
  | "active"
  | "completed"
  | "error"
  | "warning";
export type TimelineSize = "sm" | "md" | "lg";
export type TimelineTone = "neutral" | "primary" | "success" | "danger";
export type TimelineConnector = "line" | "dashed" | "none";
export type TimelineAlign = "left" | "right" | "center" | "alternate";
export type TimelineOrientation = "vertical" | "horizontal";
export type TimelineDensity = "compact" | "comfortable" | "spacious";
export type TimelineDotVariant = "outline" | "solid" | "ring";

export interface TimelineItem {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  date?: ReactNode;
  icon?: ReactNode;
  status?: TimelineStatus;
  /** Disable interaction on this item. Greyed out, click ignored. */
  disabled?: boolean;
  /** Custom dot content (replaces the default circle). */
  dot?: ReactNode;
  /** Render this item as a section header instead of a regular item. */
  isHeader?: boolean;
}

export interface TimelineRenderItemContext {
  item: TimelineItem;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  isActive: boolean;
  isDisabled: boolean;
  status: TimelineStatus;
}

export interface TimelineStyledProps {
  items: TimelineItem[];
  orientation?: TimelineOrientation;
  size?: TimelineSize;
  tone?: TimelineTone;
  connector?: TimelineConnector;
  /** Vertical only — `"alternate"` zigzags content side by side. */
  align?: TimelineAlign;
  /** Spacing between items. */
  density?: TimelineDensity;
  /** Visual style for the dot circle. */
  dotVariant?: TimelineDotVariant;
  /** Click handler for non-disabled items. When set, items become interactive. */
  onItemClick?: (item: TimelineItem, e: MouseEvent<HTMLLIElement>) => void;
  /** Replace the default item body content. The wrapper `<li>` and rail stay owned by the component. */
  renderItem?: (ctx: TimelineRenderItemContext) => ReactNode;
  /** Mark a single item as `aria-current="step"`. */
  activeId?: string;
  className?: string;
}

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1.5 5l2.5 2.5 4.5-5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M1 1l6 6M7 1L1 7" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 2v2.5M4 6v.25" />
    </svg>
  );
}

export const TimelineStyled = forwardRef<HTMLOListElement, TimelineStyledProps>(
  function TimelineStyled(
    {
      items,
      orientation = "vertical",
      size = "md",
      tone = "neutral",
      connector = "line",
      align = "left",
      density = "comfortable",
      dotVariant = "outline",
      onItemClick,
      renderItem,
      activeId,
      className,
    },
    ref,
  ) {
    const count = items.length;

    return (
      <ol
        ref={ref}
        className={["rtl-timeline", className].filter(Boolean).join(" ")}
        data-orientation={orientation}
        data-size={size}
        data-tone={tone}
        data-connector={connector}
        data-align={orientation === "vertical" ? align : undefined}
        data-density={density}
        data-dot-variant={dotVariant}
      >
        {items.map((item, index) => {
          const isFirst = index === 0;
          const isLast = index === count - 1;
          const status: TimelineStatus = item.status ?? "default";
          const isActive = activeId === item.id || status === "active";
          const isDisabled = Boolean(item.disabled);
          const isClickable = !!onItemClick && !isDisabled && !item.isHeader;

          if (item.isHeader) {
            return (
              <li
                key={item.id}
                className="rtl-group-header"
                data-first={isFirst || undefined}
                data-last={isLast || undefined}
                role="separator"
              >
                {item.title}
              </li>
            );
          }

          const defaultIcon = status === "completed" ? <CheckIcon />
            : status === "error" ? <CloseIcon />
            : status === "warning" ? <WarningIcon />
            : null;

          const liProps = {
            key: item.id,
            className: "rtl-item",
            "data-status": status,
            "data-first": isFirst || undefined,
            "data-last": isLast || undefined,
            "data-disabled": isDisabled || undefined,
            "data-clickable": isClickable || undefined,
            "data-active": isActive || undefined,
            "aria-current": isActive ? ("step" as const) : undefined,
            "aria-disabled": isDisabled || undefined,
            tabIndex: isClickable ? 0 : undefined,
            onClick: isClickable
              ? (e: MouseEvent<HTMLLIElement>) => onItemClick!(item, e)
              : undefined,
            onKeyDown: isClickable
              ? (e: React.KeyboardEvent<HTMLLIElement>) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    // Synthetic click — not a real MouseEvent, but the consumer's
                    // onItemClick rarely needs the event details. Cast for the API.
                    onItemClick!(item, e as unknown as MouseEvent<HTMLLIElement>);
                  }
                }
              : undefined,
          };

          if (renderItem) {
            return (
              <li {...liProps}>
                {renderItem({
                  item,
                  index,
                  isFirst,
                  isLast,
                  isActive,
                  isDisabled,
                  status,
                })}
              </li>
            );
          }

          return (
            <li {...liProps}>
              <div className="rtl-rail">
                <div className="rtl-dot" aria-hidden="true">
                  {item.dot != null ? (
                    item.dot
                  ) : (
                    <>
                      {isActive && <span className="rtl-dot-pulse" aria-hidden="true" />}
                      {(item.icon != null || defaultIcon != null) && (
                        <span className="rtl-icon">{item.icon ?? defaultIcon}</span>
                      )}
                    </>
                  )}
                </div>
                {!isLast && <div className="rtl-connector" aria-hidden="true" />}
              </div>

              <div className="rtl-body">
                {item.date != null && <time className="rtl-date">{item.date}</time>}
                <p className="rtl-title">{item.title}</p>
                {item.description != null && <p className="rtl-description">{item.description}</p>}
              </div>
            </li>
          );
        })}
      </ol>
    );
  },
);
