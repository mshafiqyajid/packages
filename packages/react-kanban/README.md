# `@mshafiqyajid/react-kanban`

Headless kanban hook and styled component for React. HTML5 Drag and Drop API — zero runtime dependencies.

**[Full docs →](https://docs.shafiqyajid.com/react/kanban/)**

## Install

```bash
npm install @mshafiqyajid/react-kanban
```

## Headless usage

```tsx
import { useKanban } from "@mshafiqyajid/react-kanban";

const columns = [
  { id: "todo", title: "To Do", cards: [{ id: "1", content: "Task one" }] },
  { id: "done", title: "Done", cards: [] },
];

function Board() {
  const { columns: cols, getDragProps, getDropProps, dragging } = useKanban({
    columns,
    onChange: (next) => console.log(next),
  });

  return (
    <div style={{ display: "flex", gap: 16 }}>
      {cols.map((col) => (
        <div key={col.id} {...getDropProps(col.id)}>
          <h3>{col.title}</h3>
          {col.cards.map((card) => (
            <div key={card.id} {...getDragProps(card.id, col.id)}
              style={{ opacity: dragging === card.id ? 0.4 : 1 }}>
              {card.content}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
```

## Styled usage

```tsx
import { KanbanStyled } from "@mshafiqyajid/react-kanban/styled";
import "@mshafiqyajid/react-kanban/styles.css";

const columns = [
  { id: "todo",  title: "To Do",       cards: [{ id: "1", content: "Design review" }] },
  { id: "wip",   title: "In Progress", cards: [{ id: "2", content: "Build feature" }] },
  { id: "done",  title: "Done",        cards: [{ id: "3", content: "Deploy"        }] },
];

function App() {
  return (
    <KanbanStyled
      columns={columns}
      onChange={(next) => console.log(next)}
      size="md"
      tone="neutral"
    />
  );
}
```

## Props

### `useKanban<TData>(options)`

| Option | Type | Default | Description |
|---|---|---|---|
| `columns` | `KanbanColumn<TData>[]` | — | Column data |
| `onChange` | `(columns) => void` | — | Fired after add / remove / move / reorder |
| `disabled` | `boolean` | `false` | Disable all drag interactions |
| `reorderable` | `boolean` | `false` | Allow drag-to-reorder within the same column |
| `canDrop` | `(card, from, to, toIndex?) => boolean` | — | Validate before drop |
| `onDropRejected` | `(card, from, to, reason) => void` | — | `reason: "canDrop" \| "limit"` |
| `onCardAdd` / `onCardRemove` | `(card, columnId) => void` | — | Add/remove callbacks |
| `onCardMove` | `(card, from, to, toIndex?) => void` | — | Cross-column move |
| `onCardReorder` | `(card, columnId, fromIndex, toIndex) => void` | — | Intra-column reorder |
| `maxCardsPerColumn` | `number` | — | Global per-column cap. Overridden by `column.wipLimit`. |

Returns `{ columns, setColumns, getDragProps, getDropProps, dragging, dragOver, dragOverIndex, rejectedColumn, addCard, removeCard }`.

### `KanbanColumn<TData>`

| Field | Type | Description |
|---|---|---|
| `id` / `title` / `cards` | — | Required |
| `wipLimit` | `number` | Hard cap; rejects drops that would exceed it |
| `wipWarnThreshold` | `number` | Soft warn — sets `data-wip-state="warn"` on the column |

### `KanbanCard<TData>`

| Field | Type | Description |
|---|---|---|
| `id` / `content` | — | Required |
| `description` | `string` | Secondary line |
| `label` | `string` | Pill label |
| `priority` | `"low" \| "medium" \| "high" \| "urgent"` | Adds `data-priority` for left-edge accent + dot |
| `data` | `TData` | Arbitrary typed payload accessible in `renderCard` |

### `KanbanStyled`

All `useKanban` options plus:

| Prop | Type | Default |
|---|---|---|
| `size` | `"sm" \| "md" \| "lg"` | `"md"` |
| `tone` | `"neutral" \| "primary"` | `"neutral"` |
| `columnMinWidth` | `string` | `"240px"` |
| `maxColumns` | `number` | — |
| `renderCard` / `renderColumnHeader` | `(...) => ReactNode` | — |
| `addCardPlaceholder` | `string` | — (when set, shows "+ Add card" button → inline input) |
| `addColumnPlaceholder` | `string` | — (when set, shows "+ Add column" button → inline title input) |
| `showDropIndicator` | `boolean` | `true` |
| `showCardRemoveButton` | `boolean` | `false` |
| `cardActions` | `{ id, label, icon?, onAction, show? }[]` | — |
| `renameColumnInline` | `boolean` | `false` |
| `onColumnRename` / `onColumnRemove` | callback | — |
| `showWipBadge` | `boolean` | `false` |
| `collapsible` / `cardDraggable` | — | — |

## License

MIT
