# @mshafiqyajid/react-select

## 0.4.0

### Minor Changes

- 26a5f07: **What's new in 0.4.0**

  - **Grouped items** — pass `SelectGroup[]` to `items` to render sticky group labels (`rsel-group`, `rsel-group-label`). Keyboard navigation and search filter work across groups.
  - **`renderItem` render prop** — customize option content while the hook keeps managing the `<li>` shell, keyboard focus, and selection logic.
  - **`renderEmpty` render prop** — replace the default "No results" text with any ReactNode.
  - **`renderTrigger` render prop** — replace the trigger button's inner content (receives `selected` and `open` state).
  - **Motion polish** — list items slide-fade in on open with CSS stagger; selected chips scale in; the async loading spinner has a smooth rotation. All animations respect `prefers-reduced-motion`.
  - **`style` prop** added to `SelectStyledProps` for inline sizing without a wrapper element.
  - No breaking changes. All existing props and class names are unchanged.

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

- 9710a32: Floating-UI parity (non-breaking):

  - New props: `placement` (`"auto" | "top" | "bottom"`, default `"auto"`), `offset` (default 4), `collisionPadding` (default 8), `flip` (default true), `strategy` (`"absolute"` | `"fixed"`).
  - The listbox now lands `data-placement="top" | "bottom"` reflecting the resolved side, so consumers can flip arrow direction or radius.
  - Exports `SelectPlacement` and `SelectStrategy` types.
  - Note: select keeps width tied to the trigger width — left/right placements aren't applicable.

## 0.1.0

### Minor Changes

- d1c5eda: Initial public release of react-accordion, react-tabs, react-toast, react-select, and react-modal
