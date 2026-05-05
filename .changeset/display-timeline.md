---
"@mshafiqyajid/react-timeline": minor
---

Display polish + escape hatches (non-breaking):

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
