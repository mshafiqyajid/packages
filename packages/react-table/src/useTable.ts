import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import type { ReactNode } from "react";

export type SortDir = "asc" | "desc";

export type SortBy = { key: string; dir: SortDir };

export type Aggregator =
  | "sum"
  | "avg"
  | "min"
  | "max"
  | "count";

export type SelectableMode = "single" | "multi" | "range";

export interface ColumnDef<T extends Record<string, unknown>> {
  key: keyof T & string;
  header: string;
  sortable?: boolean;
  width?: string | number;
  render?: (row: T) => ReactNode;
  filterable?: boolean;
  align?: "left" | "center" | "right";
  sticky?: "left" | "right";
  accessor?: (row: T) => unknown;
  sortFn?: (a: T, b: T, dir: SortDir) => number;
  filterFn?: (row: T, query: string) => boolean;
  aggregate?: Aggregator | ((rows: T[]) => unknown);
  footer?: ReactNode | ((rows: T[], aggregate: unknown) => ReactNode);
  /** Drag the right edge of the header to resize this column. */
  resizable?: boolean;
  /** Minimum width in px when resizing. Default: 60. */
  minWidth?: number;
  /** Maximum width in px when resizing. Default: 800. */
  maxWidth?: number;
  /** Always hide the column from the rendered table. Cannot be toggled. */
  hidden?: boolean;
  /** Initial visibility (uncontrolled) for the column-visibility menu. */
  defaultHidden?: boolean;
}

export interface DefaultSort {
  key: string;
  dir: SortDir;
}

export interface UseTableOptions<T extends Record<string, unknown>> {
  data: T[];
  columns: ColumnDef<T>[];
  pageSize?: number;
  defaultSort?: DefaultSort | SortBy[];
  /** Allow more than one column to be sorted at once. Default: false. */
  multiSort?: boolean;
  /** Fired whenever the sorts array changes. */
  onSortChange?: (sorts: SortBy[]) => void;
  selectable?: boolean | SelectableMode;
  onSort?: (key: string, dir: SortDir) => void;
  onFilter?: (value: string) => void;
  onSelect?: (selectedIds: string[]) => void;
  /** Controlled selection ids. */
  selectedIds?: string[];
  /** Fired with the next selection. Mirrors `onSelect` but conventional. */
  onSelectChange?: (ids: string[]) => void;
  rowKey?: (row: T) => string;
  page?: number;
  onPageChange?: (page: number) => void;
  manualSorting?: boolean;
  manualFiltering?: boolean;
  manualPagination?: boolean;
  totalCount?: number;
  storageKey?: string;
  storage?: Storage;
  /** Initial expanded row ids (uncontrolled). */
  defaultExpandedRowIds?: string[];
  /** Controlled expanded row ids. */
  expandedRowIds?: string[];
  onExpandedRowsChange?: (ids: string[]) => void;
  /** Initial per-column widths in px (uncontrolled). */
  defaultColumnWidths?: Record<string, number>;
  /** Controlled column visibility map (`true` shown, `false` hidden). */
  columnVisibility?: Record<string, boolean>;
  /** Fired whenever the visibility map changes. */
  onColumnVisibilityChange?: (vis: Record<string, boolean>) => void;
}

export interface UseTableResult<T extends Record<string, unknown>> {
  rows: T[];
  filteredRows: T[];
  sortKey: string | null;
  sortDir: SortDir;
  /** Active sort entries. Mirrors `sortKey`/`sortDir` for single-sort consumers. */
  sorts: SortBy[];
  toggleSort: (key: string, opts?: { append?: boolean }) => void;
  page: number;
  pageCount: number;
  setPage: (page: number) => void;
  selectedRows: string[];
  toggleRow: (id: string, opts?: { rangeAnchor?: boolean }) => void;
  toggleAll: () => void;
  allSelected: boolean;
  filterValue: string;
  setFilterValue: (value: string) => void;
  columnFilters: Record<string, string>;
  setColumnFilter: (key: string, value: string) => void;
  getRowId: (row: T, index: number) => string;
  aggregates: Record<string, unknown>;
  expandedRowIds: string[];
  isRowExpanded: (id: string) => boolean;
  toggleRowExpansion: (id: string) => void;
  columnWidths: Record<string, number>;
  setColumnWidth: (key: string, width: number) => void;
  /** Columns currently rendered, with `hidden` / visibility map applied. */
  visibleColumns: ColumnDef<T>[];
  /** Map of `key -> shown?` (defaults true for any key not present). */
  columnVisibility: Record<string, boolean>;
  toggleColumnVisibility: (key: string) => void;
}

interface PersistedState {
  sortKey: string | null;
  sortDir: SortDir;
  sorts: SortBy[];
  filterValue: string;
  columnFilters: Record<string, string>;
  page: number;
  columnVisibility: Record<string, boolean>;
}

function defaultGetRowId<T extends Record<string, unknown>>(row: T, index: number): string {
  if ("id" in row && (typeof row.id === "string" || typeof row.id === "number")) {
    return String(row.id);
  }
  return String(index);
}

function readAccessor<T extends Record<string, unknown>>(col: ColumnDef<T>, row: T): unknown {
  return col.accessor ? col.accessor(row) : row[col.key];
}

function computeAggregate<T extends Record<string, unknown>>(
  col: ColumnDef<T>,
  rows: T[],
): unknown {
  if (col.aggregate === undefined) return undefined;
  if (typeof col.aggregate === "function") return col.aggregate(rows);
  if (rows.length === 0) {
    return col.aggregate === "count" ? 0 : null;
  }
  const values = rows.map((r) => readAccessor(col, r));
  const numbers = values.filter((v): v is number => typeof v === "number");
  switch (col.aggregate) {
    case "sum":
      return numbers.reduce((a, b) => a + b, 0);
    case "avg":
      return numbers.length > 0 ? numbers.reduce((a, b) => a + b, 0) / numbers.length : null;
    case "min":
      return numbers.length > 0 ? Math.min(...numbers) : null;
    case "max":
      return numbers.length > 0 ? Math.max(...numbers) : null;
    case "count":
      return rows.length;
    default:
      return undefined;
  }
}

function loadPersisted(storage: Storage | undefined, key: string | undefined): Partial<PersistedState> | null {
  if (!storage || !key) return null;
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<PersistedState>;
  } catch {
    return null;
  }
}

function savePersisted(
  storage: Storage | undefined,
  key: string | undefined,
  state: PersistedState,
): void {
  if (!storage || !key) return;
  try {
    storage.setItem(key, JSON.stringify(state));
  } catch {
    /* quota / disabled */
  }
}

function normalizeMode(selectable: boolean | SelectableMode | undefined): SelectableMode | null {
  if (!selectable) return null;
  if (selectable === true) return "multi";
  return selectable;
}

function toSortsArray(input: DefaultSort | SortBy[] | undefined): SortBy[] {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  return [{ key: input.key, dir: input.dir }];
}

export function useTable<T extends Record<string, unknown>>(
  options: UseTableOptions<T>,
): UseTableResult<T> {
  const {
    data,
    columns,
    pageSize = 10,
    defaultSort,
    multiSort = false,
    onSortChange,
    selectable = false,
    onSort,
    onFilter,
    onSelect,
    selectedIds: controlledSelectedIds,
    onSelectChange,
    rowKey,
    page: controlledPage,
    onPageChange,
    manualSorting = false,
    manualFiltering = false,
    manualPagination = false,
    totalCount,
    storageKey,
    storage,
    defaultExpandedRowIds,
    expandedRowIds: controlledExpanded,
    onExpandedRowsChange,
    defaultColumnWidths,
    columnVisibility: controlledVisibility,
    onColumnVisibilityChange,
  } = options;

  const selectMode = normalizeMode(selectable);

  const resolvedStorage =
    storage ?? (typeof window !== "undefined" ? window.localStorage : undefined);

  const initialPersistedRef = useRef<Partial<PersistedState> | null>(null);
  if (initialPersistedRef.current === null) {
    initialPersistedRef.current = loadPersisted(resolvedStorage, storageKey) ?? {};
  }
  const initialPersisted = initialPersistedRef.current;

  const getRowId = useCallback(
    (row: T, index: number): string => {
      if (rowKey) return rowKey(row);
      return defaultGetRowId(row, index);
    },
    [rowKey],
  );

  // ---- Sorts -------------------------------------------------------------
  const initialSorts: SortBy[] = useMemo(() => {
    if (initialPersisted.sorts && initialPersisted.sorts.length > 0) {
      return initialPersisted.sorts;
    }
    if (initialPersisted.sortKey) {
      return [
        {
          key: initialPersisted.sortKey,
          dir: (initialPersisted.sortDir ?? "asc") as SortDir,
        },
      ];
    }
    return toSortsArray(defaultSort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [sorts, setSortsState] = useState<SortBy[]>(initialSorts);

  const setSorts = useCallback(
    (next: SortBy[]) => {
      setSortsState(next);
      onSortChange?.(next);
      // Back-compat: emit single-sort callback for the head entry.
      const head = next[0];
      if (head) onSort?.(head.key, head.dir);
    },
    [onSort, onSortChange],
  );

  const [internalPage, setInternalPage] = useState(initialPersisted.page ?? 1);
  const [internalSelectedRows, setInternalSelectedRows] = useState<string[]>(
    controlledSelectedIds ?? [],
  );
  const selectedRows = controlledSelectedIds ?? internalSelectedRows;
  const rangeAnchorRef = useRef<string | null>(null);
  const [filterValue, setFilterValueState] = useState(initialPersisted.filterValue ?? "");
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>(
    initialPersisted.columnFilters ?? {},
  );

  // ---- Column visibility -------------------------------------------------
  const isVisibilityControlled = controlledVisibility !== undefined;
  const initialVisibility = useMemo<Record<string, boolean>>(() => {
    const fromPersisted = initialPersisted.columnVisibility ?? {};
    const out: Record<string, boolean> = { ...fromPersisted };
    for (const col of columns) {
      if (out[col.key] === undefined) {
        out[col.key] = !(col.defaultHidden ?? false);
      }
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [internalVisibility, setInternalVisibility] = useState<Record<string, boolean>>(
    initialVisibility,
  );
  const columnVisibility = isVisibilityControlled
    ? (controlledVisibility as Record<string, boolean>)
    : internalVisibility;

  const setVisibility = useCallback(
    (next: Record<string, boolean>) => {
      if (!isVisibilityControlled) setInternalVisibility(next);
      onColumnVisibilityChange?.(next);
    },
    [isVisibilityControlled, onColumnVisibilityChange],
  );

  const toggleColumnVisibility = useCallback(
    (key: string) => {
      const current = columnVisibility[key] ?? true;
      setVisibility({ ...columnVisibility, [key]: !current });
    },
    [columnVisibility, setVisibility],
  );

  const visibleColumns = useMemo(
    () =>
      columns.filter((c) => {
        if (c.hidden) return false;
        const v = columnVisibility[c.key];
        return v === undefined ? true : v;
      }),
    [columns, columnVisibility],
  );

  const isControlledPage = controlledPage !== undefined;
  const page = isControlledPage ? controlledPage : internalPage;

  const headSort = sorts[0] ?? null;
  const sortKey = headSort?.key ?? null;
  const sortDir: SortDir = headSort?.dir ?? "asc";

  useEffect(() => {
    savePersisted(resolvedStorage, storageKey, {
      sortKey,
      sortDir,
      sorts,
      filterValue,
      columnFilters,
      page,
      columnVisibility,
    });
  }, [
    sortKey,
    sortDir,
    sorts,
    filterValue,
    columnFilters,
    page,
    columnVisibility,
    resolvedStorage,
    storageKey,
  ]);

  const toggleSort = useCallback(
    (key: string, opts?: { append?: boolean }) => {
      const append = !!opts?.append && multiSort;
      const existingIdx = sorts.findIndex((s) => s.key === key);
      let next: SortBy[];

      if (append) {
        if (existingIdx === -1) {
          next = [...sorts, { key, dir: "asc" }];
        } else {
          const existing = sorts[existingIdx]!;
          if (existing.dir === "asc") {
            next = sorts.map((s, i) =>
              i === existingIdx ? { key: s.key, dir: "desc" as SortDir } : s,
            );
          } else {
            // desc -> remove
            next = sorts.filter((_, i) => i !== existingIdx);
          }
        }
      } else {
        // Single-sort behavior (preserves pre-0.4 semantics):
        // same key + asc -> desc; otherwise -> asc on the new key.
        const head = sorts[0];
        if (head && head.key === key && head.dir === "asc") {
          next = [{ key, dir: "desc" }];
        } else {
          next = [{ key, dir: "asc" }];
        }
      }
      setSorts(next);
      if (!isControlledPage) setInternalPage(1);
      else onPageChange?.(1);
    },
    [sorts, multiSort, setSorts, isControlledPage, onPageChange],
  );

  const setFilterValue = useCallback(
    (value: string) => {
      setFilterValueState(value);
      if (!isControlledPage) setInternalPage(1);
      else onPageChange?.(1);
      onFilter?.(value);
    },
    [onFilter, isControlledPage, onPageChange],
  );

  const setPage = useCallback(
    (p: number) => {
      if (isControlledPage) {
        onPageChange?.(p);
      } else {
        setInternalPage(p);
      }
    },
    [isControlledPage, onPageChange],
  );

  const setColumnFilter = useCallback(
    (key: string, value: string) => {
      setColumnFilters((prev) => ({ ...prev, [key]: value }));
      if (!isControlledPage) setInternalPage(1);
      else onPageChange?.(1);
    },
    [isControlledPage, onPageChange],
  );

  const stringColumns = useMemo(
    () => columns.filter((c) => !c.render).map((c) => c.key),
    [columns],
  );

  const filtered = useMemo(() => {
    if (manualFiltering) return data;
    let result = data;
    if (filterValue.trim()) {
      const lower = filterValue.toLowerCase();
      result = result.filter((row) =>
        columns.some((col) => {
          if (col.filterFn) return col.filterFn(row, lower);
          if (col.render) return false;
          if (!stringColumns.includes(col.key)) return false;
          const val = readAccessor(col, row);
          return String(val ?? "").toLowerCase().includes(lower);
        }),
      );
    }
    const activeColFilters = Object.entries(columnFilters).filter(([, v]) => v.trim());
    if (activeColFilters.length > 0) {
      result = result.filter((row) =>
        activeColFilters.every(([key, filterVal]) => {
          const col = columns.find((c) => c.key === key);
          if (col?.filterFn) return col.filterFn(row, filterVal.toLowerCase());
          const val = col ? readAccessor(col, row) : row[key];
          return String(val ?? "").toLowerCase().includes(filterVal.toLowerCase());
        }),
      );
    }
    return result;
  }, [data, filterValue, stringColumns, columnFilters, columns, manualFiltering]);

  const sorted = useMemo(() => {
    if (sorts.length === 0 || manualSorting) return filtered;
    const colByKey = new Map(columns.map((c) => [c.key as string, c] as const));
    return [...filtered].sort((a, b) => {
      for (const s of sorts) {
        const col = colByKey.get(s.key);
        let cmp = 0;
        if (col?.sortFn) {
          cmp = col.sortFn(a, b, s.dir);
          if (cmp !== 0) return cmp;
          continue;
        }
        const av = col ? readAccessor(col, a) : (a as Record<string, unknown>)[s.key];
        const bv = col ? readAccessor(col, b) : (b as Record<string, unknown>)[s.key];
        if (typeof av === "number" && typeof bv === "number") {
          cmp = av - bv;
        } else {
          cmp = String(av ?? "").localeCompare(String(bv ?? ""));
        }
        if (s.dir === "desc") cmp = -cmp;
        if (cmp !== 0) return cmp;
      }
      return 0;
    });
  }, [filtered, sorts, columns, manualSorting]);

  const totalRows = manualPagination
    ? totalCount ?? filtered.length
    : sorted.length;
  const pageCount = Math.max(1, Math.ceil(totalRows / pageSize));
  const clampedPage = Math.min(Math.max(1, page), pageCount);

  const rows = useMemo(() => {
    if (manualPagination) return sorted;
    const start = (clampedPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, clampedPage, pageSize, manualPagination]);

  const aggregates = useMemo<Record<string, unknown>>(() => {
    const out: Record<string, unknown> = {};
    for (const col of columns) {
      if (col.aggregate !== undefined) {
        out[col.key] = computeAggregate(col, sorted);
      }
    }
    return out;
  }, [columns, sorted]);

  const pageRowIds = useMemo(
    () => rows.map((row, i) => getRowId(row, (clampedPage - 1) * pageSize + i)),
    [rows, clampedPage, pageSize, getRowId],
  );

  const allSelected =
    selectMode === "multi" || selectMode === "range"
      ? pageRowIds.length > 0 && pageRowIds.every((id) => selectedRows.includes(id))
      : false;

  const commitSelection = useCallback(
    (next: string[]) => {
      if (controlledSelectedIds === undefined) setInternalSelectedRows(next);
      onSelect?.(next);
      onSelectChange?.(next);
    },
    [controlledSelectedIds, onSelect, onSelectChange],
  );

  const toggleRow = useCallback(
    (id: string, opts?: { rangeAnchor?: boolean }) => {
      if (selectMode === "single") {
        const isAlready = selectedRows.length === 1 && selectedRows[0] === id;
        commitSelection(isAlready ? [] : [id]);
        rangeAnchorRef.current = id;
        return;
      }
      if (selectMode === "range" && opts?.rangeAnchor && rangeAnchorRef.current) {
        const startIdx = pageRowIds.indexOf(rangeAnchorRef.current);
        const endIdx = pageRowIds.indexOf(id);
        if (startIdx !== -1 && endIdx !== -1) {
          const [a, b] = startIdx < endIdx ? [startIdx, endIdx] : [endIdx, startIdx];
          const span = pageRowIds.slice(a, b + 1);
          const merged = Array.from(new Set([...selectedRows, ...span]));
          commitSelection(merged);
          return;
        }
      }
      const next = selectedRows.includes(id)
        ? selectedRows.filter((r) => r !== id)
        : [...selectedRows, id];
      commitSelection(next);
      rangeAnchorRef.current = id;
    },
    [selectMode, selectedRows, pageRowIds, commitSelection],
  );

  const toggleAll = useCallback(() => {
    if (selectMode !== "multi" && selectMode !== "range") return;
    const allChecked = pageRowIds.every((id) => selectedRows.includes(id));
    const next = allChecked
      ? selectedRows.filter((id) => !pageRowIds.includes(id))
      : Array.from(new Set([...selectedRows, ...pageRowIds]));
    commitSelection(next);
  }, [selectMode, pageRowIds, selectedRows, commitSelection]);

  // ---- Expansion state ---------------------------------------------------
  const isExpansionControlled = controlledExpanded !== undefined;
  const [internalExpanded, setInternalExpanded] = useState<string[]>(
    defaultExpandedRowIds ?? [],
  );
  const expandedRowIds = isExpansionControlled
    ? (controlledExpanded as string[])
    : internalExpanded;

  const setExpanded = useCallback(
    (next: string[]) => {
      if (!isExpansionControlled) setInternalExpanded(next);
      onExpandedRowsChange?.(next);
    },
    [isExpansionControlled, onExpandedRowsChange],
  );

  const isRowExpanded = useCallback(
    (id: string) => expandedRowIds.includes(id),
    [expandedRowIds],
  );

  const toggleRowExpansion = useCallback(
    (id: string) => {
      if (expandedRowIds.includes(id)) {
        setExpanded(expandedRowIds.filter((x) => x !== id));
      } else {
        setExpanded([...expandedRowIds, id]);
      }
    },
    [expandedRowIds, setExpanded],
  );

  // ---- Column widths -----------------------------------------------------
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(
    defaultColumnWidths ?? {},
  );
  const setColumnWidth = useCallback((key: string, width: number) => {
    setColumnWidths((prev) => ({ ...prev, [key]: width }));
  }, []);

  return {
    rows,
    filteredRows: sorted,
    sortKey,
    sortDir,
    sorts,
    toggleSort,
    page: clampedPage,
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
    expandedRowIds,
    isRowExpanded,
    toggleRowExpansion,
    columnWidths,
    setColumnWidth,
    visibleColumns,
    columnVisibility,
    toggleColumnVisibility,
  };
}

// ---------------------------------------------------------------------------
// Export helpers
// ---------------------------------------------------------------------------

export interface ExportTableOptions<T extends Record<string, unknown>> {
  rows: T[];
  columns: ColumnDef<T>[];
  filename?: string;
  /** When true and in browser, trigger a Blob download. */
  download?: boolean;
}

function readExportValue<T extends Record<string, unknown>>(
  col: ColumnDef<T>,
  row: T,
): unknown {
  return col.accessor ? col.accessor(row) : row[col.key];
}

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = typeof value === "string" ? value : String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function triggerBrowserDownload(content: string, mime: string, filename: string): void {
  if (typeof document === "undefined" || typeof URL === "undefined") return;
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportTableCSV<T extends Record<string, unknown>>(
  opts: ExportTableOptions<T>,
): string {
  const { rows, columns, filename = "table.csv", download = false } = opts;
  const cols = columns.filter((c) => !c.hidden);
  const header = cols.map((c) => escapeCsv(c.header)).join(",");
  const lines = rows.map((row) =>
    cols.map((c) => escapeCsv(readExportValue(c, row))).join(","),
  );
  const csv = [header, ...lines].join("\n");
  if (download) triggerBrowserDownload(csv, "text/csv;charset=utf-8", filename);
  return csv;
}

export function exportTableJSON<T extends Record<string, unknown>>(
  opts: ExportTableOptions<T>,
): string {
  const { rows, columns, filename = "table.json", download = false } = opts;
  const cols = columns.filter((c) => !c.hidden);
  const payload = rows.map((row) => {
    const out: Record<string, unknown> = {};
    for (const c of cols) out[c.key] = readExportValue(c, row);
    return out;
  });
  const json = JSON.stringify(payload, null, 2);
  if (download) triggerBrowserDownload(json, "application/json;charset=utf-8", filename);
  return json;
}
