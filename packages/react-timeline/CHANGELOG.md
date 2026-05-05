# @mshafiqyajid/react-timeline

## 1.0.0

### Major Changes

- d03819e: react-timeline v1.0 — full rewrite of the headless layer plus a stack of new behaviours on the styled component. The styled API is mostly additive (existing props from 0.2.x continue to work), but the headless hook signature changes, so we're bumping to 1.0.

  **New features:**

  - **Pending tail** — `pendingId` renders the matching item with a spinner + dashed connector ("more events coming", à la AntD).
  - **Expandable items** — `details` field on `TimelineItem` makes the row toggleable. `expansionMode: "single" | "multiple"`, `defaultExpanded` / controlled `expanded` + `onExpandedChange`. Smooth animation, ARIA `aria-expanded`/`aria-controls` on the toggle button.
  - **Grouping** — `groupBy: "groupId" | (item) => string` clusters consecutive items under sticky group headers. Customise labels via `groupLabels`.
  - **Time-proportional spacing** — opt-in `spacing="time"` lays vertical items out by `item.timestamp` instead of equal gaps.
  - **Reverse order** — `reverse` prop renders newest first.
  - **Animated reveal** — `animate` prop fades items in on mount with stagger; respects `prefers-reduced-motion`.
  - **Opposite content** — `item.opposite` renders right-side content in vertical layout.
  - **Filter / search** — `filter: string | (item) => boolean` hides non-matching items. String matches title/description/date.
  - **Load-more sentinel** — `onLoadMore` fires via IntersectionObserver when an end-of-list sentinel enters the viewport (200 px ahead).
  - **Imperative handle** — `TimelineStyled` accepts a `ref` of type `TimelineHandle` exposing `scrollToId`, `focusItem`, `expand`, `collapse`, `toggle`.
  - **Full keyboard navigation** — Up/Down (or Left/Right when horizontal), Home/End, Enter/Space to toggle expand.

  **Headless rewrite:**

  `useTimeline` now accepts `TimelineItem[]` (was `string[]`) and returns:

  - State: `visibleItems`, `groups`, `expandedIds`, `focusedId`, `pendingItem`.
  - Actions: `expand`, `collapse`, `toggle`, `focusItem`, `scrollToId`.
  - Prop getters: `getRootProps`, `getItemProps`, `getToggleProps`, `getDotProps`.
  - Refs: `loadMoreSentinelRef`.

  **Breaking:**

  - Headless: `useTimeline({items: string[]})` → `useTimeline({items: TimelineItem[]})`. Old return value (`getItemProps(id)` returning `{ "data-timeline-item": id, "data-orientation", "data-first", "data-last", "data-index" }`) is replaced by a richer shape — keys like `data-timeline-item` and the bare-string item form are gone. The styled component handles all of this internally; only headless-only consumers need to update.

  **Non-breaking for styled-only users:** every prop from 0.2.x continues to work unchanged.

## 0.2.0

### Minor Changes

- 1a6615d: Display polish + escape hatches (non-breaking):

  - `align="alternate"` — zigzag layout (vertical only) where successive items flip to opposite sides.
  - `density="compact" | "comfortable" | "spacious"` — controls vertical spacing between items.
  - `dotVariant="outline" | "solid" | "ring"` — visual style for the dot circle.
  - `tone="success" | "danger"` — extends the existing `neutral` / `primary` palette.
  - `onItemClick(item, e)` — non-disabled, non-header items become keyboard-interactive (tabbable, Enter/Space activates) and respond to clicks. Lands `data-clickable="true"`.
  - `renderItem(ctx)` — replace the entire item body. The `<li>` shell + a11y hooks stay owned by the component.
  - `activeId` — mark a single item as `aria-current="step"` and emphasize it visually. `data-active="true"` on the matching item.
  - `TimelineItem.disabled` — greys the item, blocks `onItemClick`. Lands `data-disabled` + `aria-disabled`.
  - `TimelineItem.dot` — per-item replacement for the dot circle content.
  - `TimelineItem.isHeader` — render this item as a section header (no rail, no dot, just a typographic separator). `role="separator"`.
  - New CSS classes / hooks: `.rtl-group-header`, `[data-density]`, `[data-dot-variant]`, `[data-clickable]`, `[data-active]`, `[data-disabled]`. `--rtl-clickable-hover-bg` token for hover styling.

## 0.1.0

### Minor Changes

- 9bb89cb: Initial public release of react-switch, react-badge, react-avatar, react-progress, react-slider, react-popover, react-dropdown-menu, and react-timeline
