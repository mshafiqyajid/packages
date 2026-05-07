# @mshafiqyajid/react-accordion

Headless accordion hook + styled component for React. Accessible, keyboard-friendly, single/multiple mode, animated, SSR-safe, fully typed.

**[Full docs →](https://docs.shafiqyajid.com/react/accordion/)**

## Install

```bash
npm install @mshafiqyajid/react-accordion
```

## Headless usage

```tsx
import { useAccordion } from "@mshafiqyajid/react-accordion";

const items = [
  { id: "a", label: "Item A", content: "Content A" },
  { id: "b", label: "Item B", content: "Content B" },
];

function MyAccordion() {
  const accordion = useAccordion({ items: items.map((i) => i.id), type: "single" });

  return (
    <div>
      {items.map((item) => {
        const { triggerProps, panelProps, isOpen } = accordion.getItemProps(item.id);
        return (
          <div key={item.id}>
            <button {...triggerProps}>{item.label}</button>
            <div {...panelProps}>{isOpen && item.content}</div>
          </div>
        );
      })}
    </div>
  );
}
```

## Styled usage

```tsx
import { AccordionStyled } from "@mshafiqyajid/react-accordion/styled";
import "@mshafiqyajid/react-accordion/styles.css";

const items = [
  { title: "What is React?", content: "A JavaScript library for building UIs." },
  { title: "What is TypeScript?", content: "A typed superset of JavaScript." },
];

function App() {
  return (
    <AccordionStyled
      items={items}
      type="single"
      size="md"
      tone="neutral"
      variant="bordered"
      defaultOpen={0}
      animated
    />
  );
}
```

## Props

### `useAccordion(options)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `items` | `string[]` | required | Array of item IDs |
| `type` | `"single" \| "multiple"` | `"single"` | Allow one or many open at a time |
| `defaultOpen` | `string \| string[]` | `undefined` | Initially open item(s) |

Returns `{ getItemProps(id) }` where each call returns `{ triggerProps, panelProps, isOpen }`.

### `<AccordionStyled />`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `AccordionItem[]` | required | Accordion items |
| `type` | `"single" \| "multiple"` | `"single"` | Collapse mode |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Visual size |
| `tone` | `"neutral" \| "primary" \| "success" \| "danger"` | `"neutral"` | Color tone |
| `variant` | `"bordered" \| "separated" \| "flush"` | `"bordered"` | Visual layout variant |
| `defaultOpen` | `number \| number[]` | `undefined` | Initially open index or indices |
| `animated` | `boolean` | `true` | Enable height animation |
| `lazy` | `boolean` | `false` | Mount panel content only after first expand |
| `disabled` | `boolean` | `false` | Disable all items |
| `collapsible` | `boolean` | `true` | Allow re-clicking open item to close it (single mode) |
| `apiRef` | `Ref<AccordionImperative>` | — | Imperative handle: `expandAll`, `collapseAll`, `open(i)`, `close(i)`, `toggle(i)` |

### `AccordionItem`

| Field | Type | Description |
|-------|------|-------------|
| `title` | `ReactNode` | Trigger label (used when `renderHeader` is absent) |
| `content` | `ReactNode` | Panel content |
| `disabled` | `boolean` | Disable this specific item |
| `renderHeader` | `(props: { isOpen: boolean; toggle: () => void }) => ReactNode` | Custom trigger content — replaces the button's inner content; button shell and ARIA attrs stay |
| `forceMount` | `boolean` | Always mount this item's content, even when `lazy` is true on the parent |

## Variants

| Value | Description |
|-------|-------------|
| `"bordered"` | Default — single bordered container, items separated by dividers |
| `"separated"` | Each item is an independent card with a gap between items |
| `"flush"` | No borders or rounded corners — designed for embedding inside a card |

## Lazy loading panels

```tsx
<AccordionStyled
  lazy
  items={[
    { title: "Chart", content: <HeavyChart /> },
    { title: "Form", content: <ExpensiveForm />, forceMount: true },
  ]}
/>
```

With `lazy`, `HeavyChart` only mounts after the first expand and stays mounted after collapse. `forceMount: true` on the form item mounts it immediately regardless.

## Custom header slot

```tsx
const items = [
  {
    title: "Default trigger",
    renderHeader: ({ isOpen }) => (
      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Avatar src="/user.png" size={20} />
        <span style={{ flex: 1 }}>Profile settings</span>
        <Badge>{isOpen ? "Close" : "Open"}</Badge>
      </span>
    ),
    content: "...",
  },
];
```

## Nested accordions

Child `<AccordionStyled>` components inside a parent item's `content` work without CSS or focus conflicts — each accordion manages its own keyboard navigation scope and animation.

```tsx
const parentItems = [
  {
    title: "Section A",
    content: (
      <AccordionStyled
        items={[
          { title: "Sub 1", content: "Sub content 1" },
          { title: "Sub 2", content: "Sub content 2" },
        ]}
      />
    ),
  },
];
```

## Keyboard navigation

| Key | Action |
|-----|--------|
| Enter / Space | Toggle focused item |
| Arrow Down | Move focus to next trigger |
| Arrow Up | Move focus to previous trigger |
| Home | Move focus to first trigger |
| End | Move focus to last trigger |

## Dark mode

Add `data-theme="dark"` to any ancestor element:

```html
<div data-theme="dark">
  <!-- accordion renders in dark mode -->
</div>
```

## What's new in 0.3.0

- **`variant` prop** — `"separated"` and `"flush"` variants added alongside existing `"bordered"` default
- **`lazy` prop** — defer panel mount until first expand; stays mounted after collapse
- **`renderHeader` slot** — per-item custom trigger content with `isOpen` and `toggle` access
- **Nested accordions** — CSS isolation ensures inner `.racc-panel` animation is independent of outer
- **Spring motion** — chevron uses `cubic-bezier(0.34, 1.56, 0.64, 1)` on open; close uses fast ease-in; panel transitions are asymmetric; `prefers-reduced-motion` respected

## License

MIT © Shafiq Yajid
