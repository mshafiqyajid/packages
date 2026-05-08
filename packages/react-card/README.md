# @mshafiqyajid/react-card

Flexible card component with variants, tones, clickable state, and sub-components.

**[Full docs →](https://docs.shafiqyajid.com/react/card/)**

## Install

```bash
npm install @mshafiqyajid/react-card
```

## Quick start

```tsx
import { Card } from "@mshafiqyajid/react-card/styled";
import "@mshafiqyajid/react-card/styles.css";

// Simple card
<Card header="Title" footer="Footer text">
  Card body content goes here.
</Card>

// Clickable with tone
<Card
  variant="outlined"
  tone="primary"
  clickable
  onClick={() => console.log("clicked")}
>
  Click me
</Card>

// Sub-components
<Card>
  <Card.Header>Custom header</Card.Header>
  <Card.Body>Body with full control</Card.Body>
  <Card.Footer>Footer</Card.Footer>
</Card>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"elevated" \| "outlined" \| "filled" \| "ghost"` | `"elevated"` | Visual style |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Controls padding |
| `tone` | `"neutral" \| "primary" \| "success" \| "warning" \| "danger" \| "info"` | `"neutral"` | Color accent |
| `shadow` | `"none" \| "sm" \| "md" \| "lg"` | auto | Box shadow (defaults to `sm` for elevated) |
| `radius` | `"none" \| "sm" \| "md" \| "lg"` | `"md"` | Border radius |
| `clickable` | `boolean` | `false` | Enables interactive button behaviour |
| `selected` | `boolean` | — | Controlled selected state |
| `defaultSelected` | `boolean` | `false` | Uncontrolled default selected state |
| `disabled` | `boolean` | `false` | Disables interactions |
| `onClick` | `(e: MouseEvent) => void` | — | Click handler |
| `onSelect` | `(selected: boolean) => void` | — | Called with new selected state |
| `href` | `string` | — | Renders as `<a>` |
| `as` | `ElementType` | `"div"` | Polymorphic root element |
| `header` | `ReactNode` | — | Shorthand header slot |
| `footer` | `ReactNode` | — | Shorthand footer slot |

## Headless usage

```tsx
import { useCard } from "@mshafiqyajid/react-card";

function MyCard() {
  const { cardProps, isSelected } = useCard({
    clickable: true,
    onSelect: (v) => console.log("selected:", v),
  });

  return (
    <div {...cardProps} className={isSelected ? "selected" : ""}>
      Custom card
    </div>
  );
}
```

## License

MIT
