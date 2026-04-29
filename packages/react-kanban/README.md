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

### `useKanban(options)`

| Option | Type | Default | Description |
|---|---|---|---|
| `columns` | `KanbanColumn[]` | — | Column data |
| `onChange` | `(columns: KanbanColumn[]) => void` | — | Called after a card is dropped |
| `disabled` | `boolean` | `false` | Disables all drag interactions |

Returns `{ columns, getDragProps, getDropProps, dragging, dragOver }`.

### `KanbanStyled`

All `useKanban` options plus:

| Prop | Type | Default |
|---|---|---|
| `size` | `"sm" \| "md" \| "lg"` | `"md"` |
| `tone` | `"neutral" \| "primary"` | `"neutral"` |
| `columnMinWidth` | `string` | `"240px"` |
| `maxColumns` | `number` | — |
| `renderCard` | `(card, col) => ReactNode` | — |
| `renderColumnHeader` | `(col) => ReactNode` | — |
| `addCardPlaceholder` | `string` | — |

## License

MIT
