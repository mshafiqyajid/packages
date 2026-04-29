# @mshafiqyajid/react-timeline

Headless timeline hook and styled component for React. Vertical/horizontal event list with connectors, status indicators, and full TypeScript support.

**[Full docs →](https://docs.shafiqyajid.com/react/timeline/)**

## Installation

```bash
npm install @mshafiqyajid/react-timeline
```

## Headless usage

```tsx
import { useTimeline } from "@mshafiqyajid/react-timeline";

const ids = ["step-1", "step-2", "step-3"];

function MyTimeline() {
  const { getItemProps } = useTimeline({ items: ids, orientation: "vertical" });

  return (
    <ol>
      {ids.map((id) => (
        <li key={id} {...getItemProps(id)}>
          {id}
        </li>
      ))}
    </ol>
  );
}
```

## Styled usage

```tsx
import { TimelineStyled } from "@mshafiqyajid/react-timeline/styled";
import "@mshafiqyajid/react-timeline/styles.css";

const items = [
  { id: "1", title: "Order placed", date: "Jan 1", status: "completed" },
  { id: "2", title: "Processing",   date: "Jan 2", status: "active" },
  { id: "3", title: "Shipped",      date: "Jan 3" },
];

function App() {
  return (
    <TimelineStyled
      items={items}
      orientation="vertical"
      size="md"
      tone="primary"
      connector="line"
      align="left"
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `TimelineItem[]` | — | Array of timeline items |
| `orientation` | `"vertical" \| "horizontal"` | `"vertical"` | Layout direction |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Size variant |
| `tone` | `"neutral" \| "primary"` | `"neutral"` | Color tone |
| `connector` | `"line" \| "dashed" \| "none"` | `"line"` | Connector style between items |
| `align` | `"left" \| "right" \| "center"` | `"left"` | Content alignment (vertical only) |

### TimelineItem

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier |
| `title` | `string` | Item title |
| `description` | `string?` | Optional description |
| `date` | `string?` | Optional date label |
| `icon` | `ReactNode?` | Custom icon inside the dot |
| `status` | `"default" \| "active" \| "completed" \| "error" \| "warning"?` | Status color |

## License

MIT
