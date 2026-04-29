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
| `items` | `{ title: ReactNode; content: ReactNode }[]` | required | Accordion items |
| `type` | `"single" \| "multiple"` | `"single"` | Collapse mode |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Visual size |
| `tone` | `"neutral" \| "primary"` | `"neutral"` | Color tone |
| `defaultOpen` | `number \| number[]` | `undefined` | Initially open index or indices |
| `animated` | `boolean` | `true` | Enable height animation |

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

## License

MIT © Shafiq Yajid
