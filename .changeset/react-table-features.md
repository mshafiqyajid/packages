---
"@mshafiqyajid/react-table": minor
---

Major feature pass on react-table (non-breaking):

- `ColumnDef` gains `accessor` (nested or computed values), `sortFn` (custom comparator), `filterFn` (custom predicate), `aggregate` (`"sum" | "avg" | "min" | "max" | "count" | (rows) => unknown`), and `footer` (`ReactNode | (rows, agg) => ReactNode`).
- `useTable` returns `aggregates: Record<string, unknown>` and `filteredRows: T[]`. Aggregates run against the filtered set so totals reflect the active query.
- Server-side mode: `manualSorting`, `manualFiltering`, `manualPagination`, `totalCount`. The hook skips the corresponding in-memory step and surfaces sortKey / filterValue / page so consumers can feed the server.
- `storageKey` (+ `storage`) — persists sort/filter/columnFilters/page across reloads. Defaults to `localStorage` when available.
- TableStyled props:
  - `pageSizeOptions` + `showPageSize` + `onPageSizeChange` — adds a row-size `<select>` next to pagination.
  - `showFooter` + `stickyFooter` — renders `<tfoot>` from `ColumnDef.footer` and aggregates.
  - `showDensityToggle` + `onSizeChange` — SM/MD/LG button group in the toolbar (controlled or uncontrolled).
  - `renderEmpty`, `renderLoading`, `renderError`, `error`, `errorText`, `onRetry` — replace state rows.
  - `getRowProps(row, index)`, `getCellProps(row, column)` — per-row/-cell escape hatches that merge with library attributes.
  - `highlightMatches` — wraps matching substrings in `<mark className="rtbl-mark">`. Skipped for cells with custom `render`.
- New CSS variables / classes: `--rtbl-mark-bg`, `--rtbl-mark-fg`, `--rtbl-footer-bg`, `--rtbl-footer-fg`, `--rtbl-density-active-bg`, `--rtbl-density-active-fg`; `.rtbl-mark`, `.rtbl-tfoot`, `.rtbl-td--footer`, `.rtbl-density`, `.rtbl-density-btn`, `.rtbl-page-size`, `.rtbl-page-size-select`, `.rtbl-tr--error`, `.rtbl-td--state`. Dark-mode variants included.
