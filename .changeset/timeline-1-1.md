---
"@mshafiqyajid/react-timeline": minor
---

Two follow-ups to the v1.0 rewrite — both were filed as next-plan items right after 1.0:

**1. Smooth re-layout on expand/collapse.** The 1.0 expandable details panel used a `max-height: 0 → 500px` keyframe, which (a) capped at 500 px (taller content popped in instantly) and (b) caused horizontal jerks when scrollbars appeared / disappeared mid-transition. Replaced with the modern `grid-template-rows: 0fr → 1fr` smooth-expand pattern (no magic number, works for any content height), plus `scrollbar-gutter: stable` on the timeline root and `contain: layout` on each item so a single panel opening doesn't reflow the rest of the list.

**2. `statusIcons` + `pendingIcon` props.** The built-in ✓ / ✕ / ⚠ icons were hard-coded — consumers wanting brand icons had to set `item.icon` on every item. New props on `TimelineStyled`:

- `statusIcons?: { completed?, error?, warning?, active?, default? }` — global override per status. Resolution order: `item.icon` → `statusIcons[status]` → built-in default. Setting `statusIcons.active` suppresses the default pulse ring (so consumers can use a custom active glyph).
- `pendingIcon?: ReactNode` — replace the spinner used for the `pendingId` item.

Both additive, no breaking changes.
