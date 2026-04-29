import { forwardRef, type ReactNode } from "react";

export type TimelineStatus = "default" | "active" | "completed" | "error" | "warning";
export type TimelineSize = "sm" | "md" | "lg";
export type TimelineTone = "neutral" | "primary";
export type TimelineConnector = "line" | "dashed" | "none";
export type TimelineAlign = "left" | "right" | "center";
export type TimelineOrientation = "vertical" | "horizontal";

export interface TimelineItem {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  date?: ReactNode;
  icon?: ReactNode;
  status?: TimelineStatus;
}

export interface TimelineStyledProps {
  items: TimelineItem[];
  orientation?: TimelineOrientation;
  size?: TimelineSize;
  tone?: TimelineTone;
  connector?: TimelineConnector;
  /** Vertical only — which side body content appears */
  align?: TimelineAlign;
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
      >
        {items.map((item, index) => {
          const isFirst = index === 0;
          const isLast = index === count - 1;
          const status: TimelineStatus = item.status ?? "default";

          const defaultIcon = status === "completed" ? <CheckIcon />
            : status === "error" ? <CloseIcon />
            : status === "warning" ? <WarningIcon />
            : null;

          return (
            <li
              key={item.id}
              className="rtl-item"
              data-status={status}
              data-first={isFirst || undefined}
              data-last={isLast || undefined}
            >
              <div className="rtl-rail">
                <div className="rtl-dot" aria-hidden="true">
                  {status === "active" && <span className="rtl-dot-pulse" aria-hidden="true" />}
                  {(item.icon != null || defaultIcon != null) && (
                    <span className="rtl-icon">{item.icon ?? defaultIcon}</span>
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
