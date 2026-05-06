---
"@mshafiqyajid/react-dropdown-menu": minor
"@mshafiqyajid/react-select": minor
"@mshafiqyajid/react-table": minor
---

Wave 3 high-impact features across three packages — all additive, no breaking changes.

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
