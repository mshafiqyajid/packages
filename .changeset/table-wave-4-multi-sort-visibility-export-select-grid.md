---
"@mshafiqyajid/react-table": minor
---

Wave 4 feature pass on `react-table` — five additive feature areas, no breaking changes.

- **Multi-column sort.** New `multiSort` option on `useTable` and `TableStyled`. Shift / Cmd / Ctrl-click on a sortable header appends a sort entry; cycling within the same key goes asc → desc → removed. The hook returns `sorts: SortBy[]`; the existing single-sort surface (`sortKey` / `sortDir`) keeps mirroring `sorts[0]`. `defaultSort` now also accepts `SortBy[]`. New callback `onSortChange(sorts)`. Header badges show the position of each active sort.

- **Column visibility.** `ColumnDef.hidden` (always off, not toggleable) and `defaultHidden` (initial state for the menu). Controlled `columnVisibility` map with `onColumnVisibilityChange`. The hook returns `visibleColumns` and `toggleColumnVisibility`. `TableStyled` adds `showColumnMenu` — a "Columns" toolbar button that opens a checkbox popover. Visibility is included in `storageKey` persistence.

- **CSV / JSON export.** New top-level helpers `exportTableCSV<T>(opts)` and `exportTableJSON<T>(opts)`. Both honor `column.accessor`, escape risky CSV cells, skip columns flagged `hidden`, and trigger a Blob download when `download: true`. `TableStyled` exposes `exportable?: boolean | ("csv" | "json")[]` plus `exportFilename` — the buttons export the current filter+sort (the hook's `filteredRows`).

- **Selectable variants.** `selectable` accepts `"single" | "multi" | "range"` (`true` continues to mean `"multi"`, no break). `"single"` uses radio inputs and replaces the selection on each click. `"range"` supports shift-click between an anchor row and a target. New controlled prop `selectedIds` plus `onSelectChange`; the existing `onSelect` keeps firing.

- **Keyboard nav + ARIA grid.** Opt-in `ariaGrid` adds `role="grid"`, `aria-rowindex`, `aria-colindex` (header + data rows), plus arrow / Home / End / PageUp / PageDown navigation across body cells. Enter triggers `onRowClick` when set. New `ariaLabel` / `ariaLabelledBy` props for the accessible grid name.

New CSS hooks: `.rtbl-col-menu`, `.rtbl-col-menu-btn`, `.rtbl-col-menu-popup`, `.rtbl-col-menu-item`, `.rtbl-export`, `.rtbl-export-btn`, `.rtbl-sort-index`, `.rtbl-tr-data`, `.rtbl-td-data`, plus tokens `--rtbl-menu-bg`, `--rtbl-menu-fg`, `--rtbl-menu-border`, `--rtbl-menu-shadow`, `--rtbl-focus-ring`, `--rtbl-sort-index-bg`, `--rtbl-sort-index-fg` (with dark-mode variants under `[data-theme="dark"]`). Reduced-motion variants included.
