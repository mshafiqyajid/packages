import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import type { ReactNode } from "react";

export type SortDir = "asc" | "desc";

export type Aggregator =
  | "sum"
  | "avg"
  | "min"
  | "max"
  | "count";

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
}

export interface DefaultSort {
  key: string;
  dir: SortDir;
}

export interface UseTableOptions<T extends Record<string, unknown>> {
  data: T[];
  columns: ColumnDef<T>[];
  pageSize?: number;
  defaultSort?: DefaultSort;
  selectable?: boolean;
  onSort?: (key: string, dir: SortDir) => void;
  onFilter?: (value: string) => void;
  onSelect?: (selectedIds: string[]) => void;
  rowKey?: (row: T) => string;
  page?: number;
  onPageChange?: (page: number) => void;
  manualSorting?: boolean;
  manualFiltering?: boolean;
  manualPagination?: boolean;
  totalCount?: number;
  storageKey?: string;
  storage?: Storage;
}

export interface UseTableResult<T extends Record<string, unknown>> {
  rows: T[];
  filteredRows: T[];
  sortKey: string | null;
  sortDir: SortDir;
  toggleSort: (key: string) => void;
  page: number;
  pageCount: number;
  setPage: (page: number) => void;
  selectedRows: string[];
  toggleRow: (id: string) => void;
  toggleAll: () => void;
  allSelected: boolean;
  filterValue: string;
  setFilterValue: (value: string) => void;
  columnFilters: Record<string, string>;
  setColumnFilter: (key: string, value: string) => void;
  getRowId: (row: T, index: number) => string;
  aggregates: Record<string, unknown>;
}

interface PersistedState {
  sortKey: string | null;
  sortDir: SortDir;
  filterValue: string;
  columnFilters: Record<string, string>;
  page: number;
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

export function useTable<T extends Record<string, unknown>>(
  options: UseTableOptions<T>,
): UseTableResult<T> {
  const {
    data,
    columns,
    pageSize = 10,
    defaultSort,
    selectable = false,
    onSort,
    onFilter,
    onSelect,
    rowKey,
    page: controlledPage,
    onPageChange,
    manualSorting = false,
    manualFiltering = false,
    manualPagination = false,
    totalCount,
    storageKey,
    storage,
  } = options;

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

  const [sortKey, setSortKey] = useState<string | null>(
    initialPersisted.sortKey ?? defaultSort?.key ?? null,
  );
  const [sortDir, setSortDir] = useState<SortDir>(
    initialPersisted.sortDir ?? defaultSort?.dir ?? "asc",
  );
  const [internalPage, setInternalPage] = useState(initialPersisted.page ?? 1);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [filterValue, setFilterValueState] = useState(initialPersisted.filterValue ?? "");
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>(
    initialPersisted.columnFilters ?? {},
  );

  const isControlledPage = controlledPage !== undefined;
  const page = isControlledPage ? controlledPage : internalPage;

  useEffect(() => {
    savePersisted(resolvedStorage, storageKey, {
      sortKey,
      sortDir,
      filterValue,
      columnFilters,
      page,
    });
  }, [sortKey, sortDir, filterValue, columnFilters, page, resolvedStorage, storageKey]);

  const toggleSort = useCallback(
    (key: string) => {
      setSortKey((prev) => {
        const newDir: SortDir = prev === key && sortDir === "asc" ? "desc" : "asc";
        setSortDir(newDir);
        if (!isControlledPage) setInternalPage(1);
        else onPageChange?.(1);
        onSort?.(key, newDir);
        return key;
      });
    },
    [sortDir, onSort, isControlledPage, onPageChange],
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
    if (!sortKey || manualSorting) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    if (col?.sortFn) {
      return [...filtered].sort((a, b) => col.sortFn!(a, b, sortDir));
    }
    return [...filtered].sort((a, b) => {
      const av = col ? readAccessor(col, a) : a[sortKey];
      const bv = col ? readAccessor(col, b) : b[sortKey];
      let cmp = 0;
      if (typeof av === "number" && typeof bv === "number") {
        cmp = av - bv;
      } else {
        cmp = String(av ?? "").localeCompare(String(bv ?? ""));
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir, columns, manualSorting]);

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
    selectable && pageRowIds.length > 0 && pageRowIds.every((id) => selectedRows.includes(id));

  const toggleRow = useCallback(
    (id: string) => {
      setSelectedRows((prev) => {
        const next = prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id];
        onSelect?.(next);
        return next;
      });
    },
    [onSelect],
  );

  const toggleAll = useCallback(() => {
    setSelectedRows((prev) => {
      const allChecked = pageRowIds.every((id) => prev.includes(id));
      const next = allChecked
        ? prev.filter((id) => !pageRowIds.includes(id))
        : [...new Set([...prev, ...pageRowIds])];
      onSelect?.(next);
      return next;
    });
  }, [pageRowIds, onSelect]);

  return {
    rows,
    filteredRows: sorted,
    sortKey,
    sortDir,
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
  };
}
