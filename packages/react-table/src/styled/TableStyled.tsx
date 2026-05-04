import {
  forwardRef,
  useId,
  useState,
  type ReactNode,
  type ChangeEvent,
  type HTMLAttributes,
  type TdHTMLAttributes,
} from "react";
import { useTable } from "../useTable";
import type { ColumnDef, UseTableOptions } from "../useTable";

export type TableSize = "sm" | "md" | "lg";
export type TableTone = "neutral" | "primary";

export interface TableStyledProps<T extends Record<string, unknown>>
  extends UseTableOptions<T> {
  size?: TableSize;
  onSizeChange?: (size: TableSize) => void;
  tone?: TableTone;
  striped?: boolean;
  bordered?: boolean;
  hoverable?: boolean;
  stickyHeader?: boolean;
  loading?: boolean;
  emptyText?: ReactNode;
  caption?: string;
  onRowClick?: (row: T) => void;
  toolbar?: ReactNode;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
  showPageSize?: boolean;
  showFooter?: boolean;
  stickyFooter?: boolean;
  showDensityToggle?: boolean;
  renderEmpty?: () => ReactNode;
  renderLoading?: () => ReactNode;
  error?: boolean;
  renderError?: (retry: () => void) => ReactNode;
  errorText?: ReactNode;
  onRetry?: () => void;
  getRowProps?: (
    row: T,
    index: number,
  ) => Partial<HTMLAttributes<HTMLTableRowElement>> & Record<string, unknown>;
  getCellProps?: (
    row: T,
    column: ColumnDef<T>,
  ) => Partial<TdHTMLAttributes<HTMLTableCellElement>> & Record<string, unknown>;
  highlightMatches?: boolean;
}

const SKELETON_ROWS = 5;

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlight(text: string, query: string): ReactNode {
  if (!query.trim()) return text;
  const re = new RegExp(`(${escapeRegExp(query)})`, "ig");
  const parts = text.split(re);
  return parts.map((part, i) =>
    re.test(part) ? (
      <mark key={i} className="rtbl-mark">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  return (
    <span
      className="rtbl-sort-icon"
      aria-hidden="true"
      data-active={active ? "true" : undefined}
      data-dir={active ? dir : undefined}
    >
      {active ? (dir === "asc" ? "▲" : "▼") : "⇅"}
    </span>
  );
}

function TableStyledInner<T extends Record<string, unknown>>(
  props: TableStyledProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const {
    data,
    columns,
    pageSize: pageSizeProp = 10,
    defaultSort,
    selectable = false,
    onSort,
    onFilter,
    onSelect,
    rowKey,
    page: controlledPage,
    onPageChange,
    manualSorting,
    manualFiltering,
    manualPagination,
    totalCount,
    storageKey,
    storage,
    size: sizeProp,
    onSizeChange,
    tone = "neutral",
    striped = false,
    bordered = false,
    hoverable = true,
    stickyHeader = false,
    loading = false,
    emptyText = "No data",
    caption,
    onRowClick,
    toolbar,
    pageSizeOptions,
    onPageSizeChange,
    showPageSize,
    showFooter = false,
    stickyFooter = false,
    showDensityToggle = false,
    renderEmpty,
    renderLoading,
    error = false,
    renderError,
    errorText = "Failed to load",
    onRetry,
    getRowProps,
    getCellProps,
    highlightMatches = false,
  } = props;

  const filterId = useId();

  const [internalSize, setInternalSize] = useState<TableSize>(sizeProp ?? "md");
  const size = sizeProp ?? internalSize;
  const setSize = (next: TableSize) => {
    if (onSizeChange) onSizeChange(next);
    else setInternalSize(next);
  };

  const [internalPageSize, setInternalPageSize] = useState<number>(pageSizeProp);
  const pageSize = onPageSizeChange ? pageSizeProp : internalPageSize;
  const setPageSize = (next: number) => {
    if (onPageSizeChange) onPageSizeChange(next);
    else setInternalPageSize(next);
  };

  const {
    rows,
    sortKey,
    sortDir,
    toggleSort,
    page,
    pageCount,
    setPage,
    selectedRows,
    toggleRow,
    toggleAll,
    allSelected,
    filterValue,
    setFilterValue,
    columnFilters,
    setColumnFilter,
    getRowId,
    aggregates,
    filteredRows,
  } = useTable<T>({
    data,
    columns,
    pageSize,
    defaultSort,
    selectable,
    onSort,
    onFilter,
    onSelect,
    rowKey,
    page: controlledPage,
    onPageChange,
    manualSorting,
    manualFiltering,
    manualPagination,
    totalCount,
    storageKey,
    storage,
  });

  const pageRowIds = rows.map((row, i) => getRowId(row, (page - 1) * pageSize + i));

  const skeletonCols = selectable ? columns.length + 1 : columns.length;

  const showFooterRow =
    showFooter && columns.some((c) => c.footer !== undefined || c.aggregate !== undefined);

  const showSizeOptions =
    pageSizeOptions !== undefined &&
    pageSizeOptions.length > 0 &&
    (showPageSize ?? true);

  const renderCell = (col: ColumnDef<T>, row: T): ReactNode => {
    if (col.render) return col.render(row);
    const raw = col.accessor ? col.accessor(row) : row[col.key];
    const text = String(raw ?? "");
    if (highlightMatches && filterValue.trim()) {
      const colFilter = columnFilters[col.key];
      const query = colFilter && colFilter.trim() ? colFilter : filterValue;
      return highlight(text, query);
    }
    if (highlightMatches) {
      const colFilter = columnFilters[col.key];
      if (colFilter && colFilter.trim()) return highlight(text, colFilter);
    }
    return text;
  };

  return (
    <div
      ref={ref}
      className="rtbl-root"
      data-size={size}
      data-tone={tone}
      data-striped={striped ? "true" : undefined}
      data-bordered={bordered ? "true" : undefined}
      data-hoverable={hoverable ? "true" : undefined}
    >
      <div className="rtbl-toolbar">
        <label htmlFor={filterId} className="rtbl-filter-label">
          Filter
        </label>
        <input
          id={filterId}
          type="search"
          className="rtbl-filter"
          value={filterValue}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setFilterValue(e.target.value)
          }
          placeholder="Search…"
          aria-label="Filter table rows"
        />
        {showDensityToggle && (
          <div className="rtbl-density" role="group" aria-label="Row density">
            {(["sm", "md", "lg"] as TableSize[]).map((s) => (
              <button
                key={s}
                type="button"
                className="rtbl-density-btn"
                aria-pressed={size === s}
                data-active={size === s ? "true" : undefined}
                onClick={() => setSize(s)}
              >
                {s.toUpperCase()}
              </button>
            ))}
          </div>
        )}
        {toolbar}
      </div>

      <div className="rtbl-scroll-wrap">
        <table
          className="rtbl-table"
          data-sticky-header={stickyHeader ? "true" : undefined}
          data-sticky-footer={stickyFooter ? "true" : undefined}
        >
          {caption && <caption className="rtbl-caption">{caption}</caption>}
          <thead className="rtbl-thead">
            <tr className="rtbl-tr">
              {selectable && (
                <th className="rtbl-th rtbl-th--check" scope="col">
                  <input
                    type="checkbox"
                    className="rtbl-checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="Select all rows"
                  />
                </th>
              )}
              {columns.map((col: ColumnDef<T>) => (
                <th
                  key={col.key}
                  className={[
                    "rtbl-th",
                    col.sortable ? "rtbl-th--sortable" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  scope="col"
                  style={{
                    ...(col.width !== undefined ? { width: col.width } : {}),
                    ...(col.align ? { textAlign: col.align } : {}),
                  }}
                  data-sticky={col.sticky ?? undefined}
                  aria-sort={
                    col.sortable && sortKey === col.key
                      ? sortDir === "asc"
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                  onClick={
                    col.sortable ? () => toggleSort(col.key) : undefined
                  }
                  tabIndex={col.sortable ? 0 : undefined}
                  onKeyDown={
                    col.sortable
                      ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            toggleSort(col.key);
                          }
                        }
                      : undefined
                  }
                >
                  <span className="rtbl-th-inner">
                    {col.header}
                    {col.sortable && (
                      <SortIcon
                        active={sortKey === col.key}
                        dir={sortDir}
                      />
                    )}
                  </span>
                  {col.filterable && (
                    <input
                      type="text"
                      className="rtbl-col-filter"
                      value={columnFilters[col.key] ?? ""}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setColumnFilter(col.key, e.target.value)
                      }
                      placeholder={`Filter…`}
                      aria-label={`Filter by ${col.header}`}
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="rtbl-tbody">
            {loading ? (
              renderLoading ? (
                <tr className="rtbl-tr">
                  <td className="rtbl-td rtbl-td--state" colSpan={skeletonCols}>
                    {renderLoading()}
                  </td>
                </tr>
              ) : (
                Array.from({ length: SKELETON_ROWS }).map((_, ri) => (
                  <tr key={ri} className="rtbl-tr rtbl-tr--skeleton" aria-hidden="true">
                    {Array.from({ length: skeletonCols }).map((_, ci) => (
                      <td key={ci} className="rtbl-td">
                        <span className="rtbl-skeleton" />
                      </td>
                    ))}
                  </tr>
                ))
              )
            ) : error ? (
              <tr className="rtbl-tr rtbl-tr--error" role="alert">
                <td className="rtbl-td rtbl-td--state" colSpan={skeletonCols}>
                  {renderError ? renderError(onRetry ?? (() => {})) : errorText}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr className="rtbl-tr rtbl-tr--empty">
                <td className="rtbl-td rtbl-td--empty" colSpan={skeletonCols}>
                  {renderEmpty ? renderEmpty() : emptyText}
                </td>
              </tr>
            ) : (
              rows.map((row, ri) => {
                const rowId = pageRowIds[ri] ?? String(ri);
                const isSelected = selectable && selectedRows.includes(rowId);
                const customRowProps = getRowProps ? getRowProps(row, ri) : {};
                return (
                  <tr
                    key={rowId}
                    {...customRowProps}
                    className={["rtbl-tr", customRowProps.className]
                      .filter(Boolean)
                      .join(" ")}
                    data-selected={isSelected ? "true" : undefined}
                    data-clickable={onRowClick ? "true" : undefined}
                    onClick={onRowClick ? () => onRowClick(row) : customRowProps.onClick}
                  >
                    {selectable && (
                      <td className="rtbl-td rtbl-td--check">
                        <input
                          type="checkbox"
                          className="rtbl-checkbox"
                          checked={isSelected}
                          onChange={() => toggleRow(rowId)}
                          aria-label={`Select row ${rowId}`}
                        />
                      </td>
                    )}
                    {columns.map((col: ColumnDef<T>) => {
                      const customCellProps = getCellProps ? getCellProps(row, col) : {};
                      return (
                        <td
                          key={col.key}
                          {...customCellProps}
                          className={["rtbl-td", customCellProps.className]
                            .filter(Boolean)
                            .join(" ")}
                          style={{
                            ...(col.align ? { textAlign: col.align } : {}),
                            ...customCellProps.style,
                          }}
                          data-sticky={col.sticky ?? undefined}
                        >
                          {renderCell(col, row)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
          {showFooterRow && (
            <tfoot className="rtbl-tfoot">
              <tr className="rtbl-tr">
                {selectable && <td className="rtbl-td rtbl-td--check" />}
                {columns.map((col) => {
                  const aggValue = aggregates[col.key];
                  let content: ReactNode = null;
                  if (typeof col.footer === "function") {
                    content = col.footer(filteredRows, aggValue);
                  } else if (col.footer !== undefined) {
                    content = col.footer;
                  } else if (aggValue !== undefined) {
                    content =
                      typeof aggValue === "number"
                        ? Number.isInteger(aggValue)
                          ? String(aggValue)
                          : aggValue.toFixed(2)
                        : String(aggValue);
                  }
                  return (
                    <td
                      key={col.key}
                      className="rtbl-td rtbl-td--footer"
                      style={col.align ? { textAlign: col.align } : undefined}
                      data-sticky={col.sticky ?? undefined}
                    >
                      {content}
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <div className="rtbl-pagination" aria-label="Pagination">
        {showSizeOptions && (
          <label className="rtbl-page-size">
            <span className="rtbl-page-size-label">Rows</span>
            <select
              className="rtbl-page-size-select"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              aria-label="Rows per page"
            >
              {pageSizeOptions!.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        )}
        <button
          className="rtbl-page-btn"
          onClick={() => setPage(1)}
          disabled={page === 1}
          aria-label="First page"
        >
          «
        </button>
        <button
          className="rtbl-page-btn"
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
        >
          ‹
        </button>
        <span className="rtbl-page-info">
          {page} / {pageCount}
        </span>
        <button
          className="rtbl-page-btn"
          onClick={() => setPage(page + 1)}
          disabled={page === pageCount}
          aria-label="Next page"
        >
          ›
        </button>
        <button
          className="rtbl-page-btn"
          onClick={() => setPage(pageCount)}
          disabled={page === pageCount}
          aria-label="Last page"
        >
          »
        </button>
      </div>
    </div>
  );
}

export const TableStyled = forwardRef(TableStyledInner) as <
  T extends Record<string, unknown>,
>(
  props: TableStyledProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> },
) => React.ReactElement | null;
