# @mshafiqyajid/react-table

## 0.5.0

### Minor Changes

- 31ce6d4: Wave 5 additive features for `react-table` — no breaking changes.

  - **`groupBy` row grouping.** `groupBy?: keyof T & string` on `useTable` and `TableStyled`. Groups rows by the distinct values of the chosen column; each group gets a collapsible header row. `groupExpanded?: Record<string, boolean>` (controlled) + `onGroupExpandedChange` manage expand/collapse state. The hook returns `groups: GroupEntry<T>[]` (each entry has `key`, `rows`, and optional `aggregate` map), `groupExpanded`, and `toggleGroupExpanded`. `TableStyled` renders sticky group-header rows with new CSS class `.rtbl-row--group-header`, `.rtbl-td--group-header`, `.rtbl-group-toggle`, `.rtbl-group-count`, and the var `--rtbl-group-header-bg` (dark-mode variant included).

  - **Inline cell editing.** `ColumnDef.editable?: boolean` activates double-click / F2 / Enter to edit the cell in place. `ColumnDef.editor?: (row, value, onCommit, onCancel) => ReactNode` overrides the default `<input>`. The default editor commits on Enter/blur and cancels on Escape. `onCellEdit?: (rowId, columnKey, value) => void | Promise<void>` on `useTable` / `TableStyled` receives every commit; async variants set `data-pending="true"` on the cell while the promise is in flight. New CSS classes `.rtbl-cell-editable`, `.rtbl-cell-editor` (with focus ring). Columns without `editable` are unchanged.

  - **Bulk action toolbar.** `bulkActions?: Array<{ label, icon?, onClick, tone? }>` on `TableStyled`. When ≥1 row is selected and `bulkActions` is provided, a contextual bar appears above the table with a count badge and the action buttons. `tone: "danger"` renders `.rtbl-bulk-btn--danger`. New CSS classes `.rtbl-bulk-bar`, `.rtbl-bulk-count`, `.rtbl-bulk-btn`, `.rtbl-bulk-btn-icon`, `.rtbl-bulk-btn--danger`. Tokens `--rtbl-bulk-bar-bg`, `--rtbl-bulk-bar-border`, `--rtbl-bulk-bar-fg`, `--rtbl-bulk-btn-danger-fg`, `--rtbl-bulk-btn-danger-bg` with dark-mode variants. Entry/exit animation respects `prefers-reduced-motion`.

## 0.4.0

### Minor Changes

- 1ac1dc7: Wave 4 feature pass on `react-table` — five additive feature areas, no breaking changes.

  - **Multi-column sort.** New `multiSort` option on `useTable` and `TableStyled`. Shift / Cmd / Ctrl-click on a sortable header appends a sort entry; cycling within the same key goes asc → desc → removed. The hook returns `sorts: SortBy[]`; the existing single-sort surface (`sortKey` / `sortDir`) keeps mirroring `sorts[0]`. `defaultSort` now also accepts `SortBy[]`. New callback `onSortChange(sorts)`. Header badges show the position of each active sort.

  - **Column visibility.** `ColumnDef.hidden` (always off, not toggleable) and `defaultHidden` (initial state for the menu). Controlled `columnVisibility` map with `onColumnVisibilityChange`. The hook returns `visibleColumns` and `toggleColumnVisibility`. `TableStyled` adds `showColumnMenu` — a "Columns" toolbar button that opens a checkbox popover. Visibility is included in `storageKey` persistence.

  - **CSV / JSON export.** New top-level helpers `exportTableCSV<T>(opts)` and `exportTableJSON<T>(opts)`. Both honor `column.accessor`, escape risky CSV cells, skip columns flagged `hidden`, and trigger a Blob download when `download: true`. `TableStyled` exposes `exportable?: boolean | ("csv" | "json")[]` plus `exportFilename` — the buttons export the current filter+sort (the hook's `filteredRows`).

  - **Selectable variants.** `selectable` accepts `"single" | "multi" | "range"` (`true` continues to mean `"multi"`, no break). `"single"` uses radio inputs and replaces the selection on each click. `"range"` supports shift-click between an anchor row and a target. New controlled prop `selectedIds` plus `onSelectChange`; the existing `onSelect` keeps firing.

  - **Keyboard nav + ARIA grid.** Opt-in `ariaGrid` adds `role="grid"`, `aria-rowindex`, `aria-colindex` (header + data rows), plus arrow / Home / End / PageUp / PageDown navigation across body cells. Enter triggers `onRowClick` when set. New `ariaLabel` / `ariaLabelledBy` props for the accessible grid name.

  New CSS hooks: `.rtbl-col-menu`, `.rtbl-col-menu-btn`, `.rtbl-col-menu-popup`, `.rtbl-col-menu-item`, `.rtbl-export`, `.rtbl-export-btn`, `.rtbl-sort-index`, `.rtbl-tr-data`, `.rtbl-td-data`, plus tokens `--rtbl-menu-bg`, `--rtbl-menu-fg`, `--rtbl-menu-border`, `--rtbl-menu-shadow`, `--rtbl-focus-ring`, `--rtbl-sort-index-bg`, `--rtbl-sort-index-fg` (with dark-mode variants under `[data-theme="dark"]`). Reduced-motion variants included.

## 0.3.0

### Minor Changes

- 1cf1b1a: Wave 3 high-impact features across three packages — all additive, no breaking changes.

  **react-dropdown-menu — submenus.** `DropdownMenuItem` now accepts `items?: DropdownMenuItem[]`. Parent rows get a chevron, hover or click opens a flyout to the right (auto-flips when there's no room), and `→` / `←` keyboard nav enters / leaves the submenu. Submenus inherit size + collisionPadding + flip + shift + strategy from the parent menu.

  **react-select — async `loadOptions`.** New options on `useSelect` and `SelectStyled`:

  - `loadOptions: (query: string) => Promise<SelectItem[]>` — when set, the listbox is populated by the promise (debounced + cancellable) instead of the in-memory `items` filter.
  - `debounceMs?: number` — default 300.
  - `loadingText` / `errorText` / `emptyText` — listbox state copy.
  - New return values: `isLoading: boolean`, `loadError: Error | null`. Listbox lands `aria-busy="true"` while loading.
  - `AbortController` cancels in-flight requests on rapid query changes; an aborted resolution is dropped silently.

  **react-table — column resize + expandable rows.**

  - `ColumnDef.resizable?: boolean` adds a drag handle on the right edge of the header (with `minWidth` / `maxWidth` clamp; defaults 60 / 800 px). Pointer-event-driven, no external dep.
  - `expandable?: { renderExpanded: (row) => ReactNode }` prop on `TableStyled`. Prepends a chevron column; clicking toggles a detail row beneath. Pair with `defaultExpandedRowIds` (uncontrolled) or `expandedRowIds` + `onExpandedRowsChange` (controlled).
  - Hook gains `expandedRowIds`, `isRowExpanded`, `toggleRowExpansion`, `columnWidths`, `setColumnWidth`.

  All three changes ship with reduced-motion-respecting CSS overrides.

## 0.2.0

### Minor Changes

- 9d90533: Major feature pass on react-table (non-breaking):

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

## 0.1.3

### Patch Changes

- 949c5f6: Retry publish after npm rate limit resolved.

## 0.1.2

### Patch Changes

- ebce144: Retry publish — npm rate-limited on two previous attempts.

## 0.1.1

### Patch Changes

- 1df254b: Initial release (republish after npm rate limit during first attempt).

## 0.1.0

### Minor Changes

- 0aecafe: Initial release of 10 new packages: date-picker (single/range calendar), file-upload (drag-and-drop), number-input (decimal/currency/percent), phone-input (country selector + dial code), color-input (hex/rgb/hsl picker), tag-input (chips + autocomplete), rich-text (contentEditable WYSIWYG), table (sort/filter/paginate), chart (SVG bar/line/pie), kanban (HTML5 DnD board).
