# @mshafiqyajid/react-kanban

## 1.0.0

### Major Changes

- cf86ea0: 1.0.0 — full revamp.

  The drag system was rewritten on top of pointer events, so the board now works with mouse, touch, and keyboard out of the box. Columns can be reordered by dragging headers or via keyboard. Cards reflow with FLIP animations. The drop indicator is a card-shaped placeholder, not a 1px line. Auto-scroll kicks in near board and column edges.

  Cards gained a richer default body — assignees with avatars, due dates with overdue / today states, tags, checklist progress, attachments / comments counts, and gradient covers. There's a built-in `searchable` toolbar plus a `filter` prop, multi-select with batch drag (`selectable`), per-column accents, locked columns, an extended tone palette, an uncontrolled mode via `defaultColumns`, an `addCardPosition` prop, and an `onCardClick` callback.

  Breaking changes (headless): `getDragProps` / `getDropProps` were replaced by `getCardProps`, `getColumnDropProps`, `getColumnHandleProps`. The hook also returns `drag`, `selection`, `moveCard`, `reorderColumn`, `cancelDrag`. `reorderable` now defaults to `true`. `react-dom` is a new peer dep. The styled component's existing `columns` / `onChange` API is unchanged.

## 0.2.0

### Minor Changes

- 20a26d6: Major feature pass on the kanban board (non-breaking):

  - Within-column drag-to-reorder behind a new `reorderable` prop (default `false` to preserve existing behavior). Fires `onCardReorder(card, columnId, fromIndex, toIndex)`.
  - Insertion-point drop indicator between cards while dragging. Toggle via `showDropIndicator` (default `true`). Hook now exposes `dragOverIndex`.
  - `canDrop(card, from, to, toIndex?)` validator and `onDropRejected(card, from, to, reason)` callback. Reasons: `"canDrop"` | `"limit"`. Column gets a `data-drop-rejected` flash on rejection.
  - `onCardMove` widened with optional `toIndex` (insertion position). Cross-column drops now respect the cursor position instead of always appending.
  - Per-column WIP fields on `KanbanColumn`: `wipLimit` (hard cap; overrides `maxCardsPerColumn` for that column) and `wipWarnThreshold`. Column gets `data-wip-state="ok" | "warn" | "over"`. New `showWipBadge` prop renders `count / limit`.
  - Fixed: `addCardPlaceholder` was an inert affordance — now it opens an inline input that adds a card on Enter (Escape cancels).
  - Fixed: `addColumnPlaceholder` previously created a column whose title was the placeholder text — it now opens an inline title input.
  - Card actions: `cardActions` array (custom hover-revealed buttons) and `showCardRemoveButton` (× that calls the existing `onCardRemove`).
  - Column-level UX: `renameColumnInline` (double-click title to edit), `onColumnRename`, `onColumnRemove` (renders × in column header).
  - `KanbanCard<TData>` and `KanbanColumn<TData>` are now generic with a `data?: TData` field for typed payloads. `KanbanStyled` accepts an explicit `<TData>` type parameter.
  - New CSS variables: `--rkb-drop-indicator`, `--rkb-drop-reject`, `--rkb-priority-{low,medium,high,urgent}`, `--rkb-label-{bg,fg}`, `--rkb-wip-{warn,over}`, `--rkb-card-action-{bg,fg,hover-bg,hover-fg}`, `--rkb-input-{bg,fg,border}`. Priority now also draws a left-edge accent on the card.

## 0.1.0

### Minor Changes

- 0aecafe: Initial release of 10 new packages: date-picker (single/range calendar), file-upload (drag-and-drop), number-input (decimal/currency/percent), phone-input (country selector + dial code), color-input (hex/rgb/hsl picker), tag-input (chips + autocomplete), rich-text (contentEditable WYSIWYG), table (sort/filter/paginate), chart (SVG bar/line/pie), kanban (HTML5 DnD board).
