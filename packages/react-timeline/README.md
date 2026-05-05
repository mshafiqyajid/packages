# @mshafiqyajid/react-timeline

A serious, batteries-included timeline for React. Headless hook + styled component with grouping, expandable items, pending state, time-proportional layout, animated reveal, opposite content, infinite scroll, and full keyboard navigation.

**[Full docs →](https://docs.shafiqyajid.com/react/timeline/)**

## Highlights

- **Pending state** — last item renders with a spinner + dashed connector ("more events coming").
- **Expandable items** — `details` field on items, smooth animation, single or multiple expansion.
- **Grouping** — sticky group headers via `groupBy="groupId"` or a custom group function.
- **Time-proportional spacing** — opt-in `spacing="time"` lays items out by their `timestamp`.
- **Reverse order**, **animated reveal**, **opposite content**, **filter / search**, **load-more sentinel**.
- **Programmatic API** — `scrollToId`, `expand`, `collapse`, `focusItem` via ref.
- **Full keyboard nav** — Up/Down (or Left/Right when horizontal), Home/End, Enter/Space to toggle expand.
- **Headless hook + styled** — every prop getter exposed; bring your own UI or take the styled defaults.

## Installation

```bash
npm install @mshafiqyajid/react-timeline
```

## Quick start (styled)

```tsx
import { TimelineStyled } from "@mshafiqyajid/react-timeline/styled";
import type { TimelineItem } from "@mshafiqyajid/react-timeline";
import "@mshafiqyajid/react-timeline/styles.css";

const items: TimelineItem[] = [
  { id: "1", title: "Order placed", date: "Jan 1", status: "completed" },
  { id: "2", title: "Processing",   date: "Jan 2", status: "active",
    details: "Picking from warehouse #4." },
  { id: "3", title: "Shipped",      date: "Jan 3", status: "default" },
];

<TimelineStyled items={items} tone="primary" />
```

## Recipes

### Pending state (à la AntD)

```tsx
<TimelineStyled
  items={[...completed, { id: "next", title: "Awaiting confirmation" }]}
  pendingId="next"
/>
```

### Grouping with sticky headers

```tsx
<TimelineStyled
  items={items} // each item has groupId: "today" | "earlier"
  groupBy="groupId"
  groupLabels={{ today: "Today", earlier: "Earlier this week" }}
/>
```

### Expandable items

```tsx
const items = [
  { id: "1", title: "Deployed", details: <DeployLogs id="1" /> },
];

<TimelineStyled items={items} expansionMode="single" />
```

### Time-proportional layout

```tsx
const items = activity.map((a) => ({
  id: a.id, title: a.event, timestamp: a.at,
}));

<TimelineStyled items={items} spacing="time" />
```

### Programmatic control via ref

```tsx
import { useRef } from "react";
import { TimelineStyled, type TimelineHandle } from "@mshafiqyajid/react-timeline/styled";

const ref = useRef<TimelineHandle>(null);

<>
  <button onClick={() => ref.current?.scrollToId("step-3")}>Jump to step 3</button>
  <TimelineStyled ref={ref} items={items} />
</>
```

### Infinite scroll

```tsx
<TimelineStyled
  items={items}
  onLoadMore={() => fetchOlder()} // fires when sentinel enters viewport
/>
```

### Filter / search

```tsx
const [query, setQuery] = useState("");
<input value={query} onChange={(e) => setQuery(e.target.value)} />
<TimelineStyled items={items} filter={query} />
```

## Headless hook

```tsx
import { useTimeline } from "@mshafiqyajid/react-timeline";

const tl = useTimeline({
  items,
  groupBy: "groupId",
  expansionMode: "single",
});

return (
  <ol {...tl.getRootProps()}>
    {tl.groups.map((g) => (
      <section key={g.id}>
        <h3>{g.label}</h3>
        {g.items.map((it) => (
          <li key={it.id} {...tl.getItemProps(it.id)}>
            <span {...tl.getDotProps(it.id)} />
            <p>{it.title}</p>
            {it.details && (
              <>
                <button {...tl.getToggleProps(it.id)}>Details</button>
                {tl.isExpanded(it.id) && <div>{it.details}</div>}
              </>
            )}
          </li>
        ))}
      </section>
    ))}
  </ol>
);
```

## Props (styled)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `TimelineItem[]` | — | Items to render |
| `orientation` | `"vertical" \| "horizontal"` | `"vertical"` | Layout direction |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Size variant |
| `tone` | `"neutral" \| "primary" \| "success" \| "danger"` | `"neutral"` | Color tone |
| `connector` | `"line" \| "dashed" \| "none"` | `"line"` | Connector style |
| `align` | `"left" \| "right" \| "center" \| "alternate"` | `"left"` | Content alignment (vertical only) |
| `density` | `"compact" \| "comfortable" \| "spacious"` | `"comfortable"` | Spacing between items |
| `dotVariant` | `"outline" \| "solid" \| "ring"` | `"outline"` | Dot visual style |
| `activeId` | `string` | — | Marks the matching item with `aria-current="step"` |
| `pendingId` | `string` | — | Renders the matching item as pending tail |
| `reverse` | `boolean` | `false` | Newest first |
| `filter` | `string \| (item) => boolean` | — | Hide non-matching items |
| `groupBy` | `"groupId" \| (item) => string` | — | Cluster items under a sticky header |
| `groupLabels` | `Record<string, ReactNode>` | — | Map group id → label |
| `spacing` | `"uniform" \| "time"` | `"uniform"` | Equal gaps or proportional to `item.timestamp` |
| `defaultExpanded` | `string[]` | `[]` | Pre-expanded ids (uncontrolled) |
| `expanded` | `string[]` | — | Controlled expanded ids |
| `onExpandedChange` | `(ids) => void` | — | Pair with `expanded` for controlled mode |
| `expansionMode` | `"single" \| "multiple"` | `"multiple"` | One open at a time vs. many |
| `animate` | `boolean` | `false` | Stagger fade-in on mount (respects reduced motion) |
| `onItemClick` | `(item) => void` | — | Click handler — fires alongside expand toggle |
| `onLoadMore` | `() => void` | — | Fired when end-of-list sentinel enters viewport |
| `renderItem` | `(ctx) => ReactNode` | — | Replace item body content |

### TimelineItem

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Required, unique |
| `title` | `ReactNode` | Required |
| `description` | `ReactNode?` | Sub-text under the title |
| `date` | `ReactNode?` | Date label above the title |
| `opposite` | `ReactNode?` | Right-side content in vertical layout |
| `details` | `ReactNode?` | Expandable body — when present, item becomes toggleable |
| `icon` | `ReactNode?` | Custom icon inside the dot |
| `status` | `"default" \| "active" \| "completed" \| "error" \| "warning"?` | Status color + default icon |
| `groupId` | `string?` | Used with `groupBy="groupId"` |
| `timestamp` | `Date \| number?` | Used with `spacing="time"` |
| `disabled` | `boolean?` | Greyed out, click ignored |
| `dot` | `ReactNode?` | Replace the entire dot |
| `data` | `T?` | Free-form payload, surfaced in `renderItem` callbacks |

## Imperative handle (styled)

The styled `TimelineStyled` accepts a ref of type `TimelineHandle`:

```ts
interface TimelineHandle {
  scrollToId: (id: string, opts?: ScrollIntoViewOptions) => void;
  focusItem: (id: string) => void;
  expand: (id: string) => void;
  collapse: (id: string) => void;
  toggle: (id: string) => void;
}
```

## Keyboard navigation

| Key | Action |
|-----|--------|
| `↓` / `↑` (or `→` / `←` horizontal) | Move focus between items |
| `Home` / `End` | Jump to first / last |
| `Enter` / `Space` | Toggle expand on items with `details` |

## License

MIT
