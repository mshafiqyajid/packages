import {
  forwardRef,
  useId,
  type ReactNode,
  type ChangeEvent,
} from "react";
import { useTable } from "../useTable";
import type { ColumnDef, UseTableOptions } from "../useTable";

export type TableSize = "sm" | "md" | "lg";
export type TableTone = "neutral" | "primary";

export interface TableStyledProps<T extends Record<string, unknown>>
  extends UseTableOptions<T> {
  size?: TableSize;
  tone?: TableTone;
  striped?: boolean;
  bordered?: boolean;
  hoverable?: boolean;
  stickyHeader?: boolean;
  loading?: boolean;
  emptyText?: ReactNode;
  caption?: string;
}

const SKELETON_ROWS = 5;

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
    pageSize = 10,
    defaultSort,
    selectable = false,
    onSort,
    onFilter,
    onSelect,
    size = "md",
    tone = "neutral",
    striped = false,
    bordered = false,
    hoverable = true,
    stickyHeader = false,
    loading = false,
    emptyText = "No data",
    caption,
  } = props;

  const filterId = useId();

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
  } = useTable<T>({
    data,
    columns,
    pageSize,
    defaultSort,
    selectable,
    onSort,
    onFilter,
    onSelect,
  });

  const pageRowIds = rows.map((row, i) => {
    if ("id" in row && (typeof row.id === "string" || typeof row.id === "number")) {
      return String(row.id);
    }
    return String((page - 1) * pageSize + i);
  });

  const skeletonCols = selectable ? columns.length + 1 : columns.length;

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
      </div>

      <div className="rtbl-scroll-wrap">
        <table
          className="rtbl-table"
          data-sticky-header={stickyHeader ? "true" : undefined}
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
                  style={col.width !== undefined ? { width: col.width } : undefined}
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
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="rtbl-tbody">
            {loading ? (
              Array.from({ length: SKELETON_ROWS }).map((_, ri) => (
                <tr key={ri} className="rtbl-tr rtbl-tr--skeleton" aria-hidden="true">
                  {Array.from({ length: skeletonCols }).map((_, ci) => (
                    <td key={ci} className="rtbl-td">
                      <span className="rtbl-skeleton" />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr className="rtbl-tr rtbl-tr--empty">
                <td
                  className="rtbl-td rtbl-td--empty"
                  colSpan={skeletonCols}
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              rows.map((row, ri) => {
                const rowId = pageRowIds[ri] ?? String(ri);
                const isSelected = selectable && selectedRows.includes(rowId);
                return (
                  <tr
                    key={rowId}
                    className="rtbl-tr"
                    data-selected={isSelected ? "true" : undefined}
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
                    {columns.map((col: ColumnDef<T>) => (
                      <td key={col.key} className="rtbl-td">
                        {col.render ? col.render(row) : String(row[col.key] ?? "")}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="rtbl-pagination" aria-label="Pagination">
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
