# @mshafiqyajid/react-tooltip

## 0.3.0

### Minor Changes

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

## 0.2.0

### Minor Changes

- 9710a32: Floating-UI parity (non-breaking):

  - Extended `placement` to `-start | -end` aligned variants for all four sides.
  - New props: `offset` (default 8), `collisionPadding` (default 8), `flip` (default true), `shift` (default true), `strategy` (`"absolute"` | `"fixed"`).
  - `data-placement` now reflects the resolved (post-flip) placement.
  - Exports `TooltipSide`, `TooltipAlign`, `TooltipStrategy`.

## 0.1.0

### Minor Changes

- 0d8d416: Add react-tooltip package; update npm homepage to docs site for all packages
