# @mshafiqyajid/react-dropdown-menu

## 0.4.0

### Minor Changes

- 26a5f07: Add checkbox/radio items, shortcut display, async loadItems, and submenu slide motion.

  - `kind?: "item" | "checkbox" | "radio"` on `DropdownMenuItem`. Checkbox renders `role="menuitemcheckbox"` with a checkmark; radio renders `role="menuitemradio"` with a dot. Radio items sharing a `group` string are wrapped in `<ul role="group" aria-label={group}>`.
  - `shortcut?: string` — renders a right-aligned `<kbd class="rdrop-kbd">` in the item row (pure display, no hotkey wiring).
  - `loadItems?: () => Promise<DropdownMenuItem[]>` on `DropdownMenuStyledProps` — fires on open, shows a spinner row (`rdrop-loading`) while pending, and shows `errorText` (default `"Failed to load"`) on rejection. One fetch per open session.
  - Submenu entry now uses `translate3d` with 160ms ease for left and right directions; `prefers-reduced-motion` disables all animations.

## 0.3.2

### Patch Changes

- dac8c63: docs: republish to land "What's new" sections on npm.

  Each of these packages shipped new features in their last release but the npm-bundled README didn't yet mention them — that left the package pages on npm describing the older API. This patch re-publishes them with a "What's new in vX.Y.Z" section appended so the npm pages match the current docs site.

  What each section covers:

  - **react-toast 0.3.0** — swipe-to-dismiss, undo countdown ring, pause-on-hover, `action.variant`, draggable region.
  - **react-tabs 0.3.0** — closeable tabs (×), scrollable overflow, sortable drag-to-reorder, keyboard typeahead, `scrollActiveIntoView`.
  - **react-modal 0.3.0** — stacked modals, `transition` variants, `confirm()` utility, `swipeToDismiss`, `closeOnSubmit`.
  - **react-popover 0.3.0** — virtual element anchoring, `--rpv-arrow-bg`, `returnFocus`, `closeWhenAnchorHidden`, `modal` (focus trap).
  - **react-tooltip 0.3.0** — `sticky`, `--rtt-arrow-bg`, group keyboard nav, `header`/`footer` slots, `longPressDelay`.
  - **react-slider 0.3.0** — `showValueOnInteraction`, `formatValue`, labelled `marks`, `orientation`, `onCommit`.
  - **react-segmented-control 0.3.0** — per-segment `badge`, `scrollable`, `equalize`, `href` per option. **Plus a CSS fix:** badged segments now get extra horizontal padding and the track widens its inter-segment gap to 6 px when any segment has a badge — fixes the "Pending 12Archived" cramped look from the original 0.3.0 release.
  - **react-tag-input 1.2.0** — async `loadOptions`, `colorize`, `tagActions`, `onReorder`, spreadsheet TSV paste.
  - **react-dropdown-menu 0.3.x** — nested submenus + 0.3.1 submenu padding fix.

  No code changes — README-only.

## 0.3.1

### Patch Changes

- 0526171: Wave 4 — 5 new features per package across 8 packages, plus a dropdown-menu polish fix.

  **react-toast:**

  - Swipe-to-dismiss (touch only; threshold 80 px) per-toast or globally via `dismissibleSwipe`.
  - Undo with countdown ring — toasts with `undo: () => void` render a circular SVG progress that counts down from `duration`; clicking it cancels and dismisses.
  - Pause-on-hover — hovering any toast pauses _every_ toast's auto-dismiss timer (`pauseOnHover` on `ToastProvider`, default true).
  - Action button variant — `action.variant?: "primary" | "outline" | "ghost"`.
  - Drag handle — `<ToastProvider draggable positionStorageKey="…">` exposes a small handle at the top-right of the region; users can drag the entire stack to a different corner; the choice is persisted under `positionStorageKey`.

  **react-tabs:**

  - Closeable tabs — `tab.closable?: boolean` renders an × button; pair with `onTabClose(value)`.
  - Scrollable overflow — `scrollable?: boolean` makes the tab list scroll horizontally with chevron buttons at the edges instead of wrapping.
  - Drag-to-reorder — `sortable?: boolean` + `onReorder(values)`. HTML5 DnD, no external dep.
  - Keyboard typeahead — letters jump to the first matching tab whose label starts with the buffer (600 ms reset).
  - Auto-scroll active into view — `scrollActiveIntoView?: boolean` (default `true` when `scrollable`) keeps the active tab in the viewport on activation.

  **react-modal:**

  - Stacked modals — depth-aware z-index + a behind-scale-down effect. Open a second modal and the first scales/translates back automatically.
  - Transition variants — `transition: "fade" | "zoom" | "slide-up" | "slide-down"` (default `"fade"`). Drawers keep their slide-from-edge transition.
  - `confirm()` programmatic utility — `import { confirm } from "@mshafiqyajid/react-modal/styled"`. Self-mounts a one-off modal with `Cancel` / `Confirm` buttons (with `danger` variant). Returns `Promise<boolean>`.
  - Swipe-to-dismiss — `swipeToDismiss?: boolean` (default `true` for `drawer-bottom`). Touch-drag down past 120 px to dismiss.
  - `closeOnSubmit?: boolean` — when the modal contains a `<form>` and it submits successfully, auto-close (skipped if the consumer's onSubmit calls `e.preventDefault()`).

  **react-popover:**

  - Virtual element anchoring — `anchor: { getBoundingClientRect: () => DOMRect } | null` lets you anchor to a cursor / selection rect / arbitrary point instead of `children`.
  - `--rpv-arrow-bg` / `--rpv-arrow-border` CSS vars — themed popovers can now keep arrow colour in sync.
  - `returnFocus?: boolean` (default `true`) — restores focus to the trigger on close.
  - `closeWhenAnchorHidden?: boolean` — auto-close when the trigger scrolls out of the viewport (IntersectionObserver-driven).
  - `modal?: boolean` — modal-popover variant. Sets `aria-modal="true"` on the popover and traps Tab focus inside the body.

  **react-tooltip:**

  - `sticky?: boolean` — keeps the tooltip open when the cursor moves from the trigger onto the tooltip body (interactive content).
  - `--rtt-arrow-bg` CSS var — themed tooltips now keep arrow colour in sync.
  - `group?: string` + `groupId?: string` — sequential keyboard nav; ↓/↑ on a focused trigger cycles through every tooltip sharing the group.
  - `header?` / `footer?` slots — render rich content above/below the main tooltip body without composing a popover.
  - `longPressDelay?: number` (default `500`) — touch long-press to show; set `0` to disable touch trigger entirely.

  **react-slider:**

  - Animated value bubble — `showValueOnInteraction?: boolean` shows the bubble only on thumb hover/active with smooth opacity + translate transition.
  - Labelled marks — `marks` now accepts `number[]` or `{ value, label }[]` (in addition to the existing `boolean`); labels render below each tick.
  - `formatValue?: (value: number) => ReactNode` — custom renderer for the bubble.
  - `orientation?: "horizontal" | "vertical"` — adds `data-orientation="vertical"` for vertical-layout styling.
  - `onCommit?: (value) => void` — fires only on pointer release / keyboard commit, not every step.

  **react-segmented-control:**

  - Per-segment `badge` — option config accepts `{ value, label, badge }`; badge renders as a pill on the right of the label, with active-state styling.
  - `scrollable?: boolean` — track scrolls horizontally instead of wrapping when content overflows.
  - `equalize?: boolean` — every segment is sized to the widest via CSS grid (`grid-template-columns: repeat(N, 1fr)`).
  - `href` per option — when set, segment renders as `<a href>` for routing while still wired to the control's keyboard nav.
  - Hook return shape exposes the new `badge` and `href` so headless consumers see them too.

  **react-tag-input:**

  - Async `loadOptions: (query: string) => Promise<string[]>` — debounced (default 300 ms), cancellable via `AbortController`, with `isLoading` + `loadError` exposed.
  - `colorize?: (tag: string) => string` — derive a CSS color per tag (category-based, hash-based) and apply as the chip background. `data-colorized` lands for further styling hooks.
  - `tagActions?: (tag, index) => ReactNode` — render extra buttons inside each chip (rename, link, copy).
  - `onReorder?: (tags: string[]) => void` — fires after a drag-reorder commits (alongside the existing `onChange`).
  - Spreadsheet TSV paste — `spreadsheetPaste?: boolean` (default `true`) treats `\n` and `\t` as cell breaks alongside the existing comma/semicolon split.

  **react-dropdown-menu (patch):**

  - Submenu polish: 4 px gap between the parent menu and the submenu (was flush), plus a subtle entry transition. Fixes the "no padding" complaint on the Wave 3 submenus.

  Plus a docs-app-only fix bundled in this same release: prop tables now wrap long type strings instead of overflowing into the right-hand Table of Contents.

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

  - Extended `placement` to all four sides with `-start` / `-end` alignment: previously only `bottom-start | bottom-end | top-start | top-end`; now also `left | right` (and aligned variants), plus center alignment for left/right.
  - New props: `offset` (default 4), `collisionPadding` (default 8), `flip` (default true), `shift` (default true), `strategy` (`"absolute"` | `"fixed"`).
  - `data-placement` reflects the resolved (post-flip) placement.
  - Exports `DropdownMenuSide`, `DropdownMenuAlign`, `DropdownMenuStrategy`.

## 0.1.0

### Minor Changes

- 9bb89cb: Initial public release of react-switch, react-badge, react-avatar, react-progress, react-slider, react-popover, react-dropdown-menu, and react-timeline
