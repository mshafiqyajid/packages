import { forwardRef, type ReactNode } from "react";
import { useBreadcrumb } from "../useBreadcrumb";
import type { BreadcrumbItem } from "../useBreadcrumb";

export interface BreadcrumbStyledProps {
  items: BreadcrumbItem[];
  separator?: ReactNode | "slash" | "chevron" | "arrow";
  maxItems?: number;
  expandLabel?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  style?: React.CSSProperties;
}

function getSeparatorNode(separator: ReactNode | "slash" | "chevron" | "arrow"): ReactNode {
  if (separator === "slash") return <span aria-hidden="true" className="rbrc-separator">/</span>;
  if (separator === "arrow") return <span aria-hidden="true" className="rbrc-separator">→</span>;
  if (separator === "chevron" || separator === undefined) {
    return <span aria-hidden="true" className="rbrc-separator">›</span>;
  }
  return <span aria-hidden="true" className="rbrc-separator">{separator}</span>;
}

export const BreadcrumbStyled = forwardRef<HTMLElement, BreadcrumbStyledProps>(
  function BreadcrumbStyled(
    {
      items,
      separator = "chevron",
      maxItems,
      expandLabel = "Show all",
      size = "md",
      className,
      style,
    },
    ref,
  ) {
    const { navProps, visibleItems, isCollapsed, expand } = useBreadcrumb({
      items,
      maxItems,
      expandLabel,
    });

    const rootClass = ["rbrc-nav", className].filter(Boolean).join(" ");
    const separatorNode = getSeparatorNode(separator);

    return (
      <nav
        ref={ref}
        {...navProps}
        className={rootClass}
        style={style}
        data-size={size}
        data-collapsed={isCollapsed ? "true" : undefined}
      >
        <ol className="rbrc-list">
          {visibleItems.map(({ item, originalIndex, isEllipsis }, displayIndex) => {
            const isLast = !isEllipsis && originalIndex === items.length - 1;
            const isFirst = displayIndex === 0;

            return (
              <li key={isEllipsis ? "ellipsis" : originalIndex} className="rbrc-item">
                {!isFirst && separatorNode}

                {isEllipsis ? (
                  <button
                    type="button"
                    className="rbrc-ellipsis-btn"
                    onClick={expand}
                    aria-label={expandLabel}
                    title={expandLabel}
                  >
                    &hellip;
                  </button>
                ) : isLast ? (
                  <span
                    className="rbrc-current"
                    aria-current="page"
                  >
                    {item.icon && <span className="rbrc-icon">{item.icon}</span>}
                    {item.label}
                  </span>
                ) : item.href ? (
                  <a
                    href={item.href}
                    className="rbrc-link"
                    onClick={item.onClick}
                  >
                    {item.icon && <span className="rbrc-icon">{item.icon}</span>}
                    {item.label}
                  </a>
                ) : item.onClick ? (
                  <button
                    type="button"
                    className="rbrc-button"
                    onClick={item.onClick}
                  >
                    {item.icon && <span className="rbrc-icon">{item.icon}</span>}
                    {item.label}
                  </button>
                ) : (
                  <span className="rbrc-link rbrc-link--static">
                    {item.icon && <span className="rbrc-icon">{item.icon}</span>}
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  },
);
