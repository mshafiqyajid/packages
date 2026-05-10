# `@mshafiqyajid/react-kanban`

A polished React kanban — pointer-event drag with touch + keyboard support, column reorder, FLIP animations, multi-select, search, rich card metadata.

**[Full docs →](https://docs.shafiqyajid.com/react/kanban/)**

## Install

```bash
npm install @mshafiqyajid/react-kanban
```

## Highlights

- **Touch + keyboard from day one.** Pointer events under the hood, so cards move on phones, trackpads, and screen readers.
- **Smooth, not snappy.** FLIP animations slide cards into place when columns reflow.
- **Real placeholder.** A card-shaped drop slot opens at the target index — not a 1px line.
- **Auto-scroll on edges.** Scroll the board horizontally and a column vertically while dragging.
- **Multi-select & batch drag.** Shift- or Cmd-click to grab a stack and move it together.
- **Search built in.** `searchable` for a board-level filter; or `filter` to drive it yourself.
- **Rich card metadata.** Assignees, due dates, tags, checklist progress, attachments / comments counts, covers, priority — all rendered by default.
- **Column reorder.** Drag headers, or focus + Space + arrows.
- **Per-column accent + tones.** Eight column accents and five tones.
- **Controlled or uncontrolled.** `columns` + `onChange`, or `defaultColumns`.
- **Headless or styled.** Use the hook for a custom UI, or `KanbanStyled` for a polished default.

## Quick start

```tsx
import { useState } from "react";
import { KanbanStyled } from "@mshafiqyajid/react-kanban/styled";
import type { KanbanColumn } from "@mshafiqyajid/react-kanban";
import "@mshafiqyajid/react-kanban/styles.css";

const initial: KanbanColumn[] = [
  { id: "todo",  title: "To Do",       cards: [], accent: "blue"  },
  { id: "doing", title: "In Progress", cards: [], accent: "amber", wipLimit: 3 },
  { id: "done",  title: "Done",        cards: [], accent: "green" },
];

export default function Board() {
  const [columns, setColumns] = useState<KanbanColumn[]>(initial);
  return (
    <KanbanStyled
      columns={columns}
      onChange={setColumns}
      tone="primary"
      searchable
      selectable
      columnReorderable
      addCardPlaceholder="Add card"
      addColumnPlaceholder="Add column"
    />
  );
}
```

## Rich cards

```tsx
const card: KanbanCard = {
  id: "k1",
  content: "Migrate billing portal",
  description: "Move to v3 SDK before launch.",
  priority: "urgent",
  tags: ["billing", "infra"],
  dueDate: "2026-06-01",
  assignees: [
    { id: "u1", name: "Maya Linn", color: "#a78bfa" },
    { id: "u2", name: "Sam Vega",  color: "#f97316" },
  ],
  checklist: { done: 3, total: 5 },
  attachments: 2,
  comments: 7,
  cover: "linear-gradient(120deg, #6366f1, #ec4899)",
};
```

## Keyboard drag-and-drop

- `Tab` to focus a card.
- `Space` to pick up. `↑` / `↓` reorder; `←` / `→` move across columns.
- `Enter` or `Space` to drop. `Esc` to cancel.
- Same flow for column reorder when `columnReorderable` is on (focus a column header).

## Headless

```tsx
import { useKanban } from "@mshafiqyajid/react-kanban";

const {
  columns,
  drag,
  selection,
  getBoardProps,
  getCardProps,
  getColumnDropProps,
  getColumnHandleProps,
  addCard,
  removeCard,
  moveCard,
  reorderColumn,
} = useKanban({
  defaultColumns: [
    { id: "todo", title: "To Do", cards: [{ id: "1", content: "Ship docs" }] },
    { id: "done", title: "Done", cards: [] },
  ],
  reorderable: true,
  columnReorderable: true,
});
```

`getCardProps` and friends return ref + ARIA + pointer/keyboard handlers ready to spread.

## Migrating from `0.x`

- Drag is now **pointer events**, not HTML5 DnD.
- The hook's `getDragProps` / `getDropProps` were replaced by `getCardProps`, `getColumnDropProps`, `getColumnHandleProps`.
- `reorderable` defaults to `true`. Pass `reorderable={false}` to lock intra-column order.
- New: `drag`, `selection`, `moveCard`, `reorderColumn`, `cancelDrag` on the hook return.
- The styled component still takes `columns` / `onChange` exactly as before; new opt-in props add features without forcing changes.
- `react-dom` is now a peer dep (used for the drag preview portal).

## License

MIT
