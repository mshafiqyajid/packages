---
"@mshafiqyajid/react-timeline": major
---

react-timeline v1.0 — full rewrite of the headless layer plus a stack of new behaviours on the styled component. The styled API is mostly additive (existing props from 0.2.x continue to work), but the headless hook signature changes, so we're bumping to 1.0.

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
