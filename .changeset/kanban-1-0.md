---
"@mshafiqyajid/react-kanban": major
---

1.0.0 — full revamp.

The drag system was rewritten on top of pointer events, so the board now works with mouse, touch, and keyboard out of the box. Columns can be reordered by dragging headers or via keyboard. Cards reflow with FLIP animations. The drop indicator is a card-shaped placeholder, not a 1px line. Auto-scroll kicks in near board and column edges.

Cards gained a richer default body — assignees with avatars, due dates with overdue / today states, tags, checklist progress, attachments / comments counts, and gradient covers. There's a built-in `searchable` toolbar plus a `filter` prop, multi-select with batch drag (`selectable`), per-column accents, locked columns, an extended tone palette, an uncontrolled mode via `defaultColumns`, an `addCardPosition` prop, and an `onCardClick` callback.

Breaking changes (headless): `getDragProps` / `getDropProps` were replaced by `getCardProps`, `getColumnDropProps`, `getColumnHandleProps`. The hook also returns `drag`, `selection`, `moveCard`, `reorderColumn`, `cancelDrag`. `reorderable` now defaults to `true`. `react-dom` is a new peer dep. The styled component's existing `columns` / `onChange` API is unchanged.
