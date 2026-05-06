# @mshafiqyajid/react-button

Headless button hook and styled component for React. Variants, tones, sizes, async loading state, icon slots, fully accessible.

**[Full docs →](https://docs.shafiqyajid.com/react/button/)**

## Install

```bash
npm install @mshafiqyajid/react-button
```

## Headless usage

```tsx
import { useButton } from "@mshafiqyajid/react-button";

function MyButton() {
  const { buttonProps, isPending } = useButton({
    onClick: async () => {
      await fetch("/api/save", { method: "POST" });
    },
  });
  return <button {...buttonProps}>{isPending ? "Saving…" : "Save"}</button>;
}
```

## Styled usage

```tsx
import { ButtonStyled } from "@mshafiqyajid/react-button/styled";
import "@mshafiqyajid/react-button/styles.css";

<ButtonStyled tone="primary" size="md" onClick={() => alert("hi")}>
  Click me
</ButtonStyled>
```

## Async clicks

Return a `Promise` from `onClick` to drive the loading spinner automatically. The button blocks further clicks while the promise is in flight.

```tsx
<ButtonStyled
  tone="primary"
  onClick={async () => {
    await fetch("/api/checkout", { method: "POST" });
  }}
>
  Checkout
</ButtonStyled>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onClick` | `(e) => void \| Promise<void>` | — | Click handler. Promise drives the spinner. |
| `variant` | `"solid" \| "outline" \| "ghost" \| "link"` | `"solid"` | Visual style |
| `tone` | `"neutral" \| "primary" \| "success" \| "danger"` | `"primary"` | Color |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Size |
| `block` | `boolean` | `false` | Full-width button |
| `loading` | `boolean` | `false` | Force spinner |
| `disabled` | `boolean` | `false` | Disable the button |
| `iconLeft` | `ReactNode` | — | Icon before label |
| `iconRight` | `ReactNode` | — | Icon after label |

## License

MIT
