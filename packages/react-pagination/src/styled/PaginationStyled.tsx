import { forwardRef, useId } from "react";
import { usePagination } from "../usePagination";

export interface PaginationStyledProps {
  page?: number;
  defaultPage?: number;
  onChange?: (page: number) => void;
  total: number;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  showPageSize?: boolean;
  siblings?: number;
  boundaries?: number;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "ghost";
  tone?: "neutral" | "primary";
  labels?: {
    prev?: string;
    next?: string;
    first?: string;
    last?: string;
  };
  className?: string;
  style?: React.CSSProperties;
}

export const PaginationStyled = forwardRef<HTMLElement, PaginationStyledProps>(
  function PaginationStyled(
    {
      page: controlledPage,
      defaultPage,
      onChange,
      total,
      pageSize = 10,
      onPageSizeChange,
      pageSizeOptions = [10, 20, 50, 100],
      showPageSize = false,
      siblings = 1,
      boundaries = 1,
      showFirstLast = true,
      showPrevNext = true,
      size = "md",
      variant = "default",
      tone = "neutral",
      labels,
      className,
      style,
    },
    ref,
  ) {
    const selectId = useId();

    const {
      page,
      pages,
      totalPages,
      getPageProps,
      prevProps,
      nextProps,
      firstProps,
      lastProps,
    } = usePagination({
      page: controlledPage,
      defaultPage,
      onChange,
      total,
      pageSize,
      siblings,
      boundaries,
    });

    const prevLabel = labels?.prev ?? "‹";
    const nextLabel = labels?.next ?? "›";
    const firstLabel = labels?.first ?? "«";
    const lastLabel = labels?.last ?? "»";

    const rootClass = ["rpgn-nav", className].filter(Boolean).join(" ");

    return (
      <nav
        ref={ref}
        className={rootClass}
        style={style}
        role="navigation"
        aria-label="Pagination"
        data-size={size}
        data-variant={variant}
        data-tone={tone}
      >
        <ol className="rpgn-list">
          {showFirstLast && (
            <li>
              <button
                type="button"
                className="rpgn-btn"
                onClick={firstProps.onClick}
                aria-label={firstProps["aria-label"]}
                aria-disabled={firstProps["aria-disabled"]}
                data-disabled={firstProps["aria-disabled"] ? "true" : undefined}
                tabIndex={firstProps["aria-disabled"] ? -1 : 0}
              >
                {firstLabel}
              </button>
            </li>
          )}

          {showPrevNext && (
            <li>
              <button
                type="button"
                className="rpgn-btn"
                onClick={prevProps.onClick}
                aria-label={prevProps["aria-label"]}
                aria-disabled={prevProps["aria-disabled"]}
                data-disabled={prevProps["aria-disabled"] ? "true" : undefined}
                tabIndex={prevProps["aria-disabled"] ? -1 : 0}
              >
                {prevLabel}
              </button>
            </li>
          )}

          {pages.map((p, i) =>
            p === "..." ? (
              <li key={`ellipsis-${i}`} aria-hidden="true">
                <span className="rpgn-ellipsis">…</span>
              </li>
            ) : (
              <li key={p}>
                <button
                  type="button"
                  className="rpgn-btn"
                  {...getPageProps(p)}
                >
                  {p}
                </button>
              </li>
            ),
          )}

          {showPrevNext && (
            <li>
              <button
                type="button"
                className="rpgn-btn"
                onClick={nextProps.onClick}
                aria-label={nextProps["aria-label"]}
                aria-disabled={nextProps["aria-disabled"]}
                data-disabled={nextProps["aria-disabled"] ? "true" : undefined}
                tabIndex={nextProps["aria-disabled"] ? -1 : 0}
              >
                {nextLabel}
              </button>
            </li>
          )}

          {showFirstLast && (
            <li>
              <button
                type="button"
                className="rpgn-btn"
                onClick={lastProps.onClick}
                aria-label={lastProps["aria-label"]}
                aria-disabled={lastProps["aria-disabled"]}
                data-disabled={lastProps["aria-disabled"] ? "true" : undefined}
                tabIndex={lastProps["aria-disabled"] ? -1 : 0}
              >
                {lastLabel}
              </button>
            </li>
          )}
        </ol>

        {showPageSize && (
          <div className="rpgn-size-wrapper">
            <label htmlFor={selectId} className="rpgn-size-label">
              Rows per page
            </label>
            <select
              id={selectId}
              className="rpgn-size-select"
              value={pageSize}
              onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
              aria-label="Rows per page"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}

        <span className="rpgn-sr-only" aria-live="polite" aria-atomic="true">
          Page {page} of {totalPages}
        </span>
      </nav>
    );
  },
);
