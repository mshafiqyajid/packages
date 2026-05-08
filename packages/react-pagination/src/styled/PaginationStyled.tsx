import { forwardRef, useId } from "react";
import { usePagination } from "../usePagination";

function ChevronLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 2L4 7l5 5" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 2l5 5-5 5" />
    </svg>
  );
}

function ChevronDoubleLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 2L3 7l5 5M13 2L8 7l5 5" />
    </svg>
  );
}

function ChevronDoubleRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 2l5 5-5 5M1 2l5 5-5 5" />
    </svg>
  );
}

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
    prev?: React.ReactNode;
    next?: React.ReactNode;
    first?: React.ReactNode;
    last?: React.ReactNode;
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

    const firstContent = labels?.first ?? <ChevronDoubleLeft />;
    const prevContent = labels?.prev ?? <ChevronLeft />;
    const nextContent = labels?.next ?? <ChevronRight />;
    const lastContent = labels?.last ?? <ChevronDoubleRight />;

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
                data-nav="true"
                tabIndex={firstProps["aria-disabled"] ? -1 : 0}
              >
                {firstContent}
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
                data-nav="true"
                tabIndex={prevProps["aria-disabled"] ? -1 : 0}
              >
                {prevContent}
              </button>
            </li>
          )}

          {pages.map((p, i) =>
            p === "ghost" ? (
              <li key={`ghost-${i}`} aria-hidden="true">
                <span className="rpgn-ghost" />
              </li>
            ) : p === "..." ? (
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
                data-nav="true"
                tabIndex={nextProps["aria-disabled"] ? -1 : 0}
              >
                {nextContent}
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
                data-nav="true"
                tabIndex={lastProps["aria-disabled"] ? -1 : 0}
              >
                {lastContent}
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
