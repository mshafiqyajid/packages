import React, {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type ChangeEvent,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type TdHTMLAttributes,
} from "react";
import {
  exportTableCSV,
  exportTableJSON,
  useTable,
} from "../useTable";
import type { ColumnDef, SelectableMode, UseTableOptions, GroupEntry } from "../useTable";

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
  /**
   * When set, prepends a chevron column. Click toggles a detail panel rendered
   * below the row. Pair with `defaultExpandedRowIds` / controlled `expandedRowIds`.
   */
  expandable?: {
    renderExpanded: (row: T) => ReactNode;
  };
  /** Render a "Columns" toolbar button that opens a visibility checklist. */
  showColumnMenu?: boolean;
  /**
   * Render export button(s) in the toolbar. `true` enables CSV.
   * Use the array form to enable specific formats.
   * Always exports the current filter+sort (the hook's `filteredRows`).
   */
  exportable?: boolean | Array<"csv" | "json">;
  /** Filename (without extension) used by export buttons. Default: "table". */
  exportFilename?: string;
  /**
   * Apply WAI-ARIA grid pattern: `role="grid"`, `aria-rowindex`,
   * `aria-colindex`, plus arrow / Home / End / PageUp / PageDown navigation.
   * Default: false (opt-in to avoid changing existing screen-reader semantics).
   */
  ariaGrid?: boolean;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  /** Bulk actions rendered above the table when ≥1 row is selected. */
  bulkActions?: Array<{
    label: string;
    icon?: ReactNode;
    onClick: (selectedRows: T[]) => void;
    tone?: "neutral" | "danger";
  }>;
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

function ExpandChevron({ open }: { open: boolean }) {
  return (
    <svg
      className="rtbl-expand-chevron"
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      data-open={open || undefined}
    >
      <path d="M2 3.5l3 3 3-3" />
    </svg>
  );
}

function ResizeHandle({
  colKey,
  current,
  onCommit,
  min,
  max,
  thRef,
}: {
  colKey: string;
  current: number | undefined;
  onCommit: (key: string, w: number) => void;
  min: number;
  max: number;
  thRef: React.RefObject<HTMLTableCellElement>;
}) {
  return (
    <span
      className="rtbl-resize-handle"
      role="separator"
      aria-orientation="vertical"
      aria-label={`Resize column ${colKey}`}
      onPointerDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const startX = e.clientX;
        const startW = current ?? thRef.current?.getBoundingClientRect().width ?? min;
        const target = e.currentTarget;
        target.setPointerCapture(e.pointerId);
        const onMove = (mv: PointerEvent) => {
          const next = Math.min(max, Math.max(min, startW + (mv.clientX - startX)));
          onCommit(colKey, next);
        };
        const onUp = () => {
          target.releasePointerCapture(e.pointerId);
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("pointerup", onUp);
        };
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
      }}
    />
  );
}

function SortIcon({
  active,
  dir,
  index,
}: {
  active: boolean;
  dir: "asc" | "desc";
  index?: number;
}) {
  return (
    <span
      className="rtbl-sort-icon"
      aria-hidden="true"
      data-active={active ? "true" : undefined}
      data-dir={active ? dir : undefined}
    >
      {active ? (dir === "asc" ? "▲" : "▼") : "⇅"}
      {active && index !== undefined && index > 0 && (
        <span className="rtbl-sort-index">{index + 1}</span>
      )}
    </span>
  );
}

function ColumnMenu<T extends Record<string, unknown>>({
  columns,
  visibility,
  onToggle,
}: {
  columns: ColumnDef<T>[];
  visibility: Record<string, boolean>;
  onToggle: (key: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);
  return (
    <div className="rtbl-col-menu" ref={containerRef}>
      <button
        type="button"
        className="rtbl-col-menu-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        Columns
      </button>
      {open && (
        <div className="rtbl-col-menu-popup" role="menu">
          {columns
            .filter((c) => !c.hidden)
            .map((col) => {
              const checked = visibility[col.key] !== false;
              return (
                <label key={col.key} className="rtbl-col-menu-item">
                  <input
                    type="checkbox"
                    className="rtbl-checkbox"
                    checked={checked}
                    onChange={() => onToggle(col.key)}
                  />
                  <span>{col.header}</span>
                </label>
              );
            })}
        </div>
      )}
    </div>
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
    multiSort,
    onSortChange,
    selectable = false,
    onSort,
    onFilter,
    onSelect,
    selectedIds,
    onSelectChange,
    rowKey,
    page: controlledPage,
    onPageChange,
    manualSorting,
    manualFiltering,
    manualPagination,
    totalCount,
    storageKey,
    storage,
    columnVisibility: controlledVisibility,
    onColumnVisibilityChange,
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
    expandable,
    defaultExpandedRowIds,
    expandedRowIds: controlledExpanded,
    onExpandedRowsChange,
    defaultColumnWidths,
    showColumnMenu = false,
    exportable,
    exportFilename = "table",
    ariaGrid = false,
    ariaLabel,
    ariaLabelledBy,
    bulkActions,
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
    sortDir,
    sorts,
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
    isRowExpanded,
    toggleRowExpansion,
    columnWidths,
    setColumnWidth,
    visibleColumns,
    columnVisibility,
    toggleColumnVisibility,
    groups,
    groupExpanded,
    toggleGroupExpanded,
  } = useTable<T>({
    data,
    columns,
    pageSize,
    defaultSort,
    multiSort,
    onSortChange,
    selectable,
    onSort,
    onFilter,
    onSelect,
    selectedIds,
    onSelectChange,
    rowKey,
    page: controlledPage,
    onPageChange,
    manualSorting,
    manualFiltering,
    manualPagination,
    totalCount,
    storageKey,
    storage,
    defaultExpandedRowIds,
    expandedRowIds: controlledExpanded,
    onExpandedRowsChange,
    defaultColumnWidths,
    columnVisibility: controlledVisibility,
    onColumnVisibilityChange,
    groupBy: props.groupBy,
    groupExpanded: props.groupExpanded,
    onGroupExpandedChange: props.onGroupExpandedChange,
    onCellEdit: props.onCellEdit,
  });

  const pageRowIds = rows.map((row, i) => getRowId(row, (page - 1) * pageSize + i));

  // ---- Inline cell editing -----------------------------------------------
  const [editingCell, setEditingCell] = useState<{ rowId: string; colKey: string } | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");
  const [pendingCells, setPendingCells] = useState<Set<string>>(new Set());

  const startEdit = (rowId: string, colKey: string, current: unknown) => {
    setEditingCell({ rowId, colKey });
    setEditingValue(String(current ?? ""));
  };

  const commitEdit = useCallback(
    async (rowId: string, colKey: string, value: unknown) => {
      const pendingKey = `${rowId}:${colKey}`;
      const onCellEdit = props.onCellEdit;
      if (!onCellEdit) {
        setEditingCell(null);
        return;
      }
      const result = onCellEdit(rowId, colKey, value);
      if (result instanceof Promise) {
        setPendingCells((prev) => new Set(prev).add(pendingKey));
        try {
          await result;
        } finally {
          setPendingCells((prev) => {
            const next = new Set(prev);
            next.delete(pendingKey);
            return next;
          });
        }
      }
      setEditingCell(null);
    },
    [props.onCellEdit],
  );

  const cancelEdit = () => setEditingCell(null);

  // Resolve selection mode for rendering decisions.
  const selectMode: SelectableMode | null = selectable
    ? selectable === true
      ? "multi"
      : (selectable as SelectableMode)
    : null;

  const skeletonCols =
    visibleColumns.length + (selectMode ? 1 : 0) + (expandable ? 1 : 0);

  // thRefs for the resize handle to read each header's measured width.
  const thRefs = useRef<Record<string, HTMLTableCellElement | null>>({});

  const showFooterRow =
    showFooter &&
    visibleColumns.some((c) => c.footer !== undefined || c.aggregate !== undefined);

  const showSizeOptions =
    pageSizeOptions !== undefined &&
    pageSizeOptions.length > 0 &&
    (showPageSize ?? true);

  // ---- Export handlers ---------------------------------------------------
  const exportFormats: Array<"csv" | "json"> = Array.isArray(exportable)
    ? exportable
    : exportable === true
      ? ["csv"]
      : [];

  const handleExport = useCallback(
    (format: "csv" | "json") => {
      const opts = {
        rows: filteredRows,
        columns: visibleColumns,
        filename: `${exportFilename}.${format}`,
        download: true,
      };
      if (format === "csv") exportTableCSV(opts);
      else exportTableJSON(opts);
    },
    [filteredRows, visibleColumns, exportFilename],
  );

  // ---- ARIA grid keyboard navigation ------------------------------------
  const [focused, setFocused] = useState<{ r: number; c: number }>({ r: 0, c: 0 });
  const tbodyRef = useRef<HTMLTableSectionElement | null>(null);

  const focusCell = useCallback((r: number, c: number) => {
    const tbody = tbodyRef.current;
    if (!tbody) return;
    const row = tbody.querySelectorAll<HTMLTableRowElement>("tr.rtbl-tr-data")[r];
    if (!row) return;
    const cell = row.querySelectorAll<HTMLTableCellElement>("td.rtbl-td-data")[c];
    if (!cell) return;
    cell.focus();
  }, []);

  const onGridKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLTableElement>) => {
      if (!ariaGrid) return;
      const cellTarget = (e.target as HTMLElement).closest(
        "td.rtbl-td-data",
      ) as HTMLTableCellElement | null;
      if (!cellTarget) return;
      const colCount = visibleColumns.length;
      const rowCount = rows.length;
      let { r, c } = focused;
      switch (e.key) {
        case "ArrowRight":
          c = Math.min(colCount - 1, c + 1);
          break;
        case "ArrowLeft":
          c = Math.max(0, c - 1);
          break;
        case "ArrowDown":
          r = Math.min(rowCount - 1, r + 1);
          break;
        case "ArrowUp":
          r = Math.max(0, r - 1);
          break;
        case "Home":
          c = 0;
          break;
        case "End":
          c = colCount - 1;
          break;
        case "PageDown":
          r = Math.min(rowCount - 1, r + 10);
          break;
        case "PageUp":
          r = Math.max(0, r - 10);
          break;
        case "Enter":
          if (onRowClick) {
            e.preventDefault();
            const row = rows[r];
            if (row) onRowClick(row);
          }
          return;
        default:
          return;
      }
      e.preventDefault();
      setFocused({ r, c });
      // Focus on the next render frame after the data-focused attribute is set.
      requestAnimationFrame(() => focusCell(r, c));
    },
    [ariaGrid, focused, focusCell, visibleColumns.length, rows, onRowClick],
  );

  const renderCell = (col: ColumnDef<T>, row: T, rowId: string): ReactNode => {
    const raw = col.accessor ? col.accessor(row) : row[col.key];
    const pendingKey = `${rowId}:${col.key}`;
    const isPending = pendingCells.has(pendingKey);
    const isEditing = editingCell?.rowId === rowId && editingCell?.colKey === col.key;

    if (col.editable && isEditing) {
      if (col.editor) {
        return col.editor(
          row,
          raw,
          (next) => { void commitEdit(rowId, col.key, next); },
          cancelEdit,
        );
      }
      return (
        <input
          className="rtbl-cell-editor"
          autoFocus
          value={editingValue}
          onChange={(e) => setEditingValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { void commitEdit(rowId, col.key, editingValue); }
            if (e.key === "Escape") cancelEdit();
          }}
          onBlur={() => { void commitEdit(rowId, col.key, editingValue); }}
        />
      );
    }

    if (col.editable) {
      return (
        <span
          className="rtbl-cell-editable"
          data-pending={isPending ? "true" : undefined}
          onDoubleClick={() => startEdit(rowId, col.key, raw)}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === "F2") startEdit(rowId, col.key, raw);
          }}
        >
          {col.render ? col.render(row) : (() => {
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
          })()}
        </span>
      );
    }

    if (col.render) return col.render(row);
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

  const isAppendModifier = (e: ReactMouseEvent | ReactKeyboardEvent): boolean =>
    !!multiSort && (e.shiftKey || e.metaKey || e.ctrlKey);

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
        {showColumnMenu && (
          <ColumnMenu
            columns={columns}
            visibility={columnVisibility}
            onToggle={toggleColumnVisibility}
          />
        )}
        {exportFormats.length > 0 && (
          <div className="rtbl-export" role="group" aria-label="Export">
            {exportFormats.map((fmt) => (
              <button
                key={fmt}
                type="button"
                className="rtbl-export-btn"
                onClick={() => handleExport(fmt)}
                aria-label={`Export as ${fmt.toUpperCase()}`}
              >
                {fmt.toUpperCase()}
              </button>
            ))}
          </div>
        )}
        {toolbar}
      </div>

      {bulkActions && bulkActions.length > 0 && selectedRows.length > 0 && (
        <div className="rtbl-bulk-bar" role="toolbar" aria-label="Bulk actions">
          <span className="rtbl-bulk-count">{selectedRows.length} selected</span>
          {bulkActions.map((action, i) => {
            const selectedData = rows.filter((_row, ri) => selectedRows.includes(pageRowIds[ri] ?? String(ri)));
            return (
              <button
                key={i}
                type="button"
                className={[
                  "rtbl-bulk-btn",
                  action.tone === "danger" ? "rtbl-bulk-btn--danger" : "",
                ].filter(Boolean).join(" ")}
                onClick={() => action.onClick(selectedData)}
              >
                {action.icon && <span className="rtbl-bulk-btn-icon" aria-hidden="true">{action.icon}</span>}
                {action.label}
              </button>
            );
          })}
        </div>
      )}

      <div className="rtbl-scroll-wrap">
        <table
          className="rtbl-table"
          data-sticky-header={stickyHeader ? "true" : undefined}
          data-sticky-footer={stickyFooter ? "true" : undefined}
          role={ariaGrid ? "grid" : undefined}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-rowcount={ariaGrid ? rows.length + 1 : undefined}
          aria-colcount={
            ariaGrid
              ? visibleColumns.length + (selectMode ? 1 : 0) + (expandable ? 1 : 0)
              : undefined
          }
          onKeyDown={ariaGrid ? onGridKeyDown : undefined}
        >
          {caption && <caption className="rtbl-caption">{caption}</caption>}
          <thead className="rtbl-thead">
            <tr className="rtbl-tr" aria-rowindex={ariaGrid ? 1 : undefined}>
              {expandable && (
                <th className="rtbl-th rtbl-th--expand" scope="col" aria-label="Expand row" />
              )}
              {selectMode && (
                <th className="rtbl-th rtbl-th--check" scope="col">
                  {selectMode === "multi" || selectMode === "range" ? (
                    <input
                      type="checkbox"
                      className="rtbl-checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      aria-label="Select all rows"
                    />
                  ) : null}
                </th>
              )}
              {visibleColumns.map((col: ColumnDef<T>, ci) => {
                const sortIdx = sorts.findIndex((s) => s.key === col.key);
                const isSortActive = sortIdx !== -1;
                const colDir = isSortActive ? sorts[sortIdx]!.dir : sortDir;
                return (
                  <th
                    key={col.key}
                    ref={(el) => { thRefs.current[col.key] = el; }}
                    className={[
                      "rtbl-th",
                      col.sortable ? "rtbl-th--sortable" : "",
                      col.resizable ? "rtbl-th--resizable" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    scope="col"
                    style={{
                      ...(columnWidths[col.key] !== undefined
                        ? { width: columnWidths[col.key] }
                        : col.width !== undefined
                          ? { width: col.width }
                          : {}),
                      ...(col.align ? { textAlign: col.align } : {}),
                    }}
                    data-sticky={col.sticky ?? undefined}
                    aria-sort={
                      col.sortable && isSortActive
                        ? colDir === "asc"
                          ? "ascending"
                          : "descending"
                        : undefined
                    }
                    aria-colindex={
                      ariaGrid
                        ? ci + 1 + (selectMode ? 1 : 0) + (expandable ? 1 : 0)
                        : undefined
                    }
                    onClick={
                      col.sortable
                        ? (e) =>
                            toggleSort(col.key, { append: isAppendModifier(e) })
                        : undefined
                    }
                    tabIndex={col.sortable ? 0 : undefined}
                    onKeyDown={
                      col.sortable
                        ? (e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              toggleSort(col.key, { append: isAppendModifier(e) });
                            }
                          }
                        : undefined
                    }
                  >
                    <span className="rtbl-th-inner">
                      {col.header}
                      {col.sortable && (
                        <SortIcon
                          active={isSortActive}
                          dir={colDir}
                          index={isSortActive ? sortIdx : undefined}
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
                    {col.resizable && (
                      <ResizeHandle
                        colKey={col.key}
                        current={columnWidths[col.key]}
                        onCommit={setColumnWidth}
                        min={col.minWidth ?? 60}
                        max={col.maxWidth ?? 800}
                        thRef={{ current: thRefs.current[col.key] ?? null }}
                      />
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="rtbl-tbody" ref={tbodyRef}>
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
            ) : props.groupBy && groups.length > 0 ? (
              groups.flatMap((group: GroupEntry<T>) => {
                const isGroupOpen = groupExpanded[group.key] !== false;
                const groupHeaderRow = (
                  <tr key={`group-${group.key}`} className="rtbl-tr rtbl-row--group-header">
                    <td colSpan={skeletonCols} className="rtbl-td rtbl-td--group-header">
                      <button
                        type="button"
                        className="rtbl-group-toggle"
                        aria-expanded={isGroupOpen}
                        onClick={() => toggleGroupExpanded(group.key)}
                      >
                        <ExpandChevron open={isGroupOpen} />
                        {group.key}
                        <span className="rtbl-group-count">({group.rows.length})</span>
                      </button>
                    </td>
                  </tr>
                );
                if (!isGroupOpen) return [groupHeaderRow];
                return [
                  groupHeaderRow,
                  ...group.rows.map((row, ri) => {
                    const rowId = getRowId(row, ri);
                    const isSelected = !!selectMode && selectedRows.includes(rowId);
                    const isExpanded = expandable ? isRowExpanded(rowId) : false;
                    const customRowProps = getRowProps ? getRowProps(row, ri) : {};
                    return (
                      <React.Fragment key={rowId}>
                        <tr
                          {...customRowProps}
                          className={["rtbl-tr rtbl-tr-data", customRowProps.className].filter(Boolean).join(" ")}
                          data-selected={isSelected ? "true" : undefined}
                          data-expanded={isExpanded || undefined}
                          data-clickable={onRowClick ? "true" : undefined}
                          onClick={onRowClick ? () => onRowClick(row) : customRowProps.onClick}
                        >
                          {expandable && (
                            <td className="rtbl-td rtbl-td--expand">
                              <button
                                type="button"
                                className="rtbl-expand-btn"
                                aria-expanded={isExpanded}
                                aria-controls={`rtbl-expanded-${rowId}`}
                                aria-label={isExpanded ? "Collapse row" : "Expand row"}
                                onClick={(e) => { e.stopPropagation(); toggleRowExpansion(rowId); }}
                              >
                                <ExpandChevron open={isExpanded} />
                              </button>
                            </td>
                          )}
                          {selectMode && (
                            <td className="rtbl-td rtbl-td--check" onClick={(e) => e.stopPropagation()}>
                              <input
                                type={selectMode === "single" ? "radio" : "checkbox"}
                                className="rtbl-checkbox"
                                checked={isSelected}
                                onChange={() => toggleRow(rowId)}
                                aria-label={`Select row ${rowId}`}
                              />
                            </td>
                          )}
                          {visibleColumns.map((col: ColumnDef<T>) => (
                            <td
                              key={col.key}
                              className="rtbl-td rtbl-td-data"
                              style={col.align ? { textAlign: col.align } : undefined}
                              data-sticky={col.sticky ?? undefined}
                              data-pending={pendingCells.has(`${rowId}:${col.key}`) ? "true" : undefined}
                            >
                              {renderCell(col, row, rowId)}
                            </td>
                          ))}
                        </tr>
                        {expandable && isExpanded && (
                          <tr id={`rtbl-expanded-${rowId}`} className="rtbl-tr rtbl-tr--expanded">
                            <td className="rtbl-td rtbl-td--expanded-content" colSpan={skeletonCols}>
                              {expandable.renderExpanded(row)}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  }),
                ];
              })
            ) : (
              rows.map((row, ri) => {
                const rowId = pageRowIds[ri] ?? String(ri);
                const isSelected = !!selectMode && selectedRows.includes(rowId);
                const isExpanded = expandable ? isRowExpanded(rowId) : false;
                const customRowProps = getRowProps ? getRowProps(row, ri) : {};
                return (
                  <React.Fragment key={rowId}>
                    <tr
                      {...customRowProps}
                      className={["rtbl-tr rtbl-tr-data", customRowProps.className]
                        .filter(Boolean)
                        .join(" ")}
                      data-selected={isSelected ? "true" : undefined}
                      data-expanded={isExpanded || undefined}
                      data-clickable={onRowClick ? "true" : undefined}
                      aria-rowindex={ariaGrid ? ri + 2 : undefined}
                      aria-selected={
                        ariaGrid && selectMode ? isSelected : undefined
                      }
                      onClick={
                        onRowClick
                          ? (e) => {
                              if (
                                selectMode === "range" &&
                                (e.shiftKey || e.metaKey || e.ctrlKey)
                              ) {
                                toggleRow(rowId, { rangeAnchor: e.shiftKey });
                                return;
                              }
                              onRowClick(row);
                            }
                          : customRowProps.onClick
                      }
                    >
                      {expandable && (
                        <td
                          className="rtbl-td rtbl-td--expand"
                          aria-colindex={ariaGrid ? 1 : undefined}
                        >
                          <button
                            type="button"
                            className="rtbl-expand-btn"
                            aria-expanded={isExpanded}
                            aria-controls={`rtbl-expanded-${rowId}`}
                            aria-label={isExpanded ? "Collapse row" : "Expand row"}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRowExpansion(rowId);
                            }}
                          >
                            <ExpandChevron open={isExpanded} />
                          </button>
                        </td>
                      )}
                      {selectMode && (
                        <td
                          className="rtbl-td rtbl-td--check"
                          aria-colindex={
                            ariaGrid ? (expandable ? 2 : 1) : undefined
                          }
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type={selectMode === "single" ? "radio" : "checkbox"}
                            className="rtbl-checkbox"
                            name={
                              selectMode === "single"
                                ? `rtbl-select-${filterId}`
                                : undefined
                            }
                            checked={isSelected}
                            onChange={() => toggleRow(rowId)}
                            onClick={(e) => {
                              if (selectMode === "range" && e.shiftKey) {
                                toggleRow(rowId, { rangeAnchor: true });
                              }
                            }}
                            aria-label={`Select row ${rowId}`}
                          />
                        </td>
                      )}
                      {visibleColumns.map((col: ColumnDef<T>, ci) => {
                        const customCellProps = getCellProps
                          ? getCellProps(row, col)
                          : {};
                        const isFocusedCell =
                          ariaGrid && focused.r === ri && focused.c === ci;
                        return (
                          <td
                            key={col.key}
                            {...customCellProps}
                            className={[
                              "rtbl-td rtbl-td-data",
                              customCellProps.className,
                            ]
                              .filter(Boolean)
                              .join(" ")}
                            style={{
                              ...(col.align ? { textAlign: col.align } : {}),
                              ...customCellProps.style,
                            }}
                            data-sticky={col.sticky ?? undefined}
                            data-focused={isFocusedCell ? "true" : undefined}
                            tabIndex={
                              ariaGrid
                                ? focused.r === ri && focused.c === ci
                                  ? 0
                                  : -1
                                : undefined
                            }
                            aria-colindex={
                              ariaGrid
                                ? ci +
                                  1 +
                                  (selectMode ? 1 : 0) +
                                  (expandable ? 1 : 0)
                                : undefined
                            }
                          >
                            {renderCell(col, row, rowId)}
                          </td>
                        );
                      })}
                    </tr>
                    {expandable && isExpanded && (
                      <tr
                        id={`rtbl-expanded-${rowId}`}
                        className="rtbl-tr rtbl-tr--expanded"
                      >
                        <td className="rtbl-td rtbl-td--expanded-content" colSpan={skeletonCols}>
                          {expandable.renderExpanded(row)}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
          {showFooterRow && (
            <tfoot className="rtbl-tfoot">
              <tr className="rtbl-tr">
                {expandable && <td className="rtbl-td rtbl-td--expand" />}
                {selectMode && <td className="rtbl-td rtbl-td--check" />}
                {visibleColumns.map((col) => {
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
