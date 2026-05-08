# @mshafiqyajid/react-sortable

Drag-and-drop sortable list with keyboard reordering and spring animations. Zero runtime dependencies — built on native pointer events.

**[Full docs →](https://docs.shafiqyajid.com/react/sortable/)**

## Install

```bash
npm install @mshafiqyajid/react-sortable
```

## Quick start — styled component

```tsx
import { useState } from "react";
import { SortableStyled } from "@mshafiqyajid/react-sortable/styled";
import "@mshafiqyajid/react-sortable/styles.css";

interface Task {
  id: string;
  title: string;
  done: boolean;
}

function App() {
  const [items, setItems] = useState<Task[]>([
    { id: "1", title: "Design tokens", done: false },
    { id: "2", title: "Write tests",   done: true  },
    { id: "3", title: "Ship it",       done: false },
  ]);

  return (
    <SortableStyled
      items={items}
      onReorder={setItems}
      renderItem={(item, { isDragging }) => (
        <span style={{ opacity: isDragging ? 0.5 : 1 }}>
          {item.title}
        </span>
      )}
    />
  );
}
```

## Headless hook

```tsx
import { useSortable } from "@mshafiqyajid/react-sortable";

const { containerProps, getItemProps, getItemState, activeId } = useSortable({
  items,
  onReorder: setItems,
});

const { ref, ...restContainerProps } = containerProps;

return (
  <ul ref={ref} {...restContainerProps}>
    {items.map((item) => (
      <li key={item.id} {...getItemProps(item)}>
        {item.label}
      </li>
    ))}
  </ul>
);
```

## Props — `SortableStyled`

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `SortableItem[]` | — | Array of items with a required `id` field |
| `onReorder` | `(items: SortableItem[]) => void` | — | Called when order changes |
| `renderItem` | `(item, state) => ReactNode` | — | Render each item; receives `isDragging`, `isOver`, `handleProps` |
| `orientation` | `"vertical" \| "horizontal"` | `"vertical"` | List direction |
| `handle` | `boolean` | `true` | Show drag handle grip icon |
| `disabled` | `boolean` | `false` | Disable all drag and keyboard interaction |
| `animationDuration` | `number` | `200` | Transition duration in milliseconds |
| `className` | `string` | — | Additional class name on the container |
| `style` | `React.CSSProperties` | — | Inline styles on the container |

## `SortableItem` type

```ts
interface SortableItem {
  id: string | number;
  [key: string]: unknown;
}
```

## Keyboard controls

| Key | Action |
|---|---|
| `Space` | Pick up / drop item |
| `Enter` | Drop item at current position |
| `ArrowUp` / `ArrowDown` | Move item (vertical list) |
| `ArrowLeft` / `ArrowRight` | Move item (horizontal list) |
| `Escape` | Cancel — restore original order |

A live region announces position changes to screen readers during keyboard reordering.

## CSS variables

```css
--rsort-bg               /* container background */
--rsort-item-bg          /* item background */
--rsort-item-fg          /* item text color */
--rsort-item-border      /* item border color */
--rsort-item-radius      /* item border radius */
--rsort-item-shadow      /* item box shadow */
--rsort-item-padding     /* item padding */
--rsort-handle-color     /* grip icon color */
--rsort-gap              /* gap between items */
--rsort-font-size        /* item font size */
--rsort-over-bg          /* drop target background */
--rsort-over-border      /* drop target border color */
--rsort-active-opacity   /* opacity of the picked-up ghost */
--rsort-duration         /* transition duration (ms) */
--rsort-focus-ring       /* keyboard focus ring */
```

## ARIA

- Container: `role="listbox"`, `aria-orientation`
- Items: `role="option"`, `aria-roledescription="sortable item"`, `aria-grabbed`
- Live region: `role="status"`, `aria-live="assertive"` — announces position changes during keyboard reorder

## License

MIT
