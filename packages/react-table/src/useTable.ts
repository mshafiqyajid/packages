import { useState, useMemo, useCallback } from "react";
import type { ReactNode } from "react";

export type SortDir = "asc" | "desc";

export interface ColumnDef<T extends Record<string, unknown>> {
  key: keyof T & string;
  header: string;
  sortable?: boolean;
  width?: string | number;
  render?: (row: T) => ReactNode;
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
}

export interface UseTableResult<T extends Record<string, unknown>> {
  rows: T[];
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
}

function getRowId<T extends Record<string, unknown>>(row: T, index: number): string {
  if ("id" in row && (typeof row.id === "string" || typeof row.id === "number")) {
    return String(row.id);
  }
  return String(index);
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
  } = options;

  const [sortKey, setSortKey] = useState<string | null>(defaultSort?.key ?? null);
  const [sortDir, setSortDir] = useState<SortDir>(defaultSort?.dir ?? "asc");
  const [page, setPageState] = useState(1);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [filterValue, setFilterValueState] = useState("");

  const toggleSort = useCallback(
    (key: string) => {
      setSortKey((prev) => {
        const newDir: SortDir = prev === key && sortDir === "asc" ? "desc" : "asc";
        setSortDir(newDir);
        setPageState(1);
        onSort?.(key, newDir);
        return key;
      });
    },
    [sortDir, onSort],
  );

  const setFilterValue = useCallback(
    (value: string) => {
      setFilterValueState(value);
      setPageState(1);
      onFilter?.(value);
    },
    [onFilter],
  );

  const setPage = useCallback((p: number) => {
    setPageState(p);
  }, []);

  const stringColumns = useMemo(
    () => columns.filter((c) => !c.render).map((c) => c.key),
    [columns],
  );

  const filtered = useMemo(() => {
    if (!filterValue.trim()) return data;
    const lower = filterValue.toLowerCase();
    return data.filter((row) =>
      stringColumns.some((key) => {
        const val = row[key];
        return typeof val === "string" && val.toLowerCase().includes(lower);
      }),
    );
  }, [data, filterValue, stringColumns]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      let cmp = 0;
      if (typeof av === "number" && typeof bv === "number") {
        cmp = av - bv;
      } else {
        cmp = String(av ?? "").localeCompare(String(bv ?? ""));
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));

  const clampedPage = Math.min(Math.max(1, page), pageCount);

  const rows = useMemo(() => {
    const start = (clampedPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, clampedPage, pageSize]);

  const pageRowIds = useMemo(
    () => rows.map((row, i) => getRowId(row, (clampedPage - 1) * pageSize + i)),
    [rows, clampedPage, pageSize],
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
  };
}
