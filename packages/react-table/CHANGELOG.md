# @mshafiqyajid/react-table

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
