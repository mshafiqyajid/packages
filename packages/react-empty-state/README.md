# @mshafiqyajid/react-empty-state

Empty state display with presets, custom illustrations, and action slots. Headless hook + styled component, fully accessible, dark mode, animated.

**[Full docs →](https://docs.shafiqyajid.com/react/empty-state/)**

## Install

```bash
npm install @mshafiqyajid/react-empty-state
```

## Quick start

```tsx
import { EmptyStateStyled } from "@mshafiqyajid/react-empty-state/styled";
import "@mshafiqyajid/react-empty-state/styles.css";

<EmptyStateStyled
  preset="no-data"
  action={<button>Add item</button>}
/>
```

## Custom content

```tsx
<EmptyStateStyled
  title="Nothing here yet"
  description="Create your first item to get started."
  icon={<MyIcon />}
  action={<button>Create item</button>}
  secondaryAction={<button>Learn more</button>}
  size="lg"
/>
```

## Headless usage

```tsx
import { useEmptyState } from "@mshafiqyajid/react-empty-state";

function MyEmptyState({ title }: { title: string }) {
  const { rootProps } = useEmptyState({ title });
  return (
    <div {...rootProps} className="my-empty-state">
      <p>{title}</p>
    </div>
  );
}
```

## Presets

| Preset | Title | Description |
|--------|-------|-------------|
| `no-data` | No data yet | Start adding items to see them here. |
| `no-results` | No results found | Try adjusting your search or filters. |
| `error` | Something went wrong | Please try again later. |
| `offline` | You're offline | Check your internet connection. |
| `empty-search` | No matches | We couldn't find anything matching your search. |

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `preset` | `"no-data" \| "no-results" \| "error" \| "offline" \| "empty-search"` | — | Built-in preset with icon, title, and description |
| `icon` | `ReactNode` | — | Custom icon (overrides preset icon) |
| `image` | `string \| ReactNode` | — | Image URL or element (replaces icon slot) |
| `title` | `ReactNode` | — | Heading text (overrides preset title) |
| `description` | `ReactNode` | — | Body text (overrides preset description) |
| `action` | `ReactNode` | — | Primary action slot |
| `secondaryAction` | `ReactNode` | — | Secondary action slot |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Size scale |
| `orientation` | `"vertical" \| "horizontal"` | `"vertical"` | Layout direction |
| `className` | `string` | — | Extra class on the root element |
| `style` | `CSSProperties` | — | Inline style override |

## License

MIT
