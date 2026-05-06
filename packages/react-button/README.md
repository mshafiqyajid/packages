# @mshafiqyajid/react-button

Headless button hook and styled component for React. Variants, tones, sizes, async loading state, icon slots, ripple, pulse, fully accessible.

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

Return a `Promise` from `onClick` to drive the loading spinner automatically. Pass `loadingText` to swap the label for an in-flight message without layout shift.

```tsx
<ButtonStyled
  tone="primary"
  loadingText="Saving…"
  onClick={async () => {
    await fetch("/api/save", { method: "POST" });
  }}
>
  Save changes
</ButtonStyled>
```

## Pulse for CTAs

`pulse` renders a soft animated ring around the button — useful for primary CTAs that need attention.

```tsx
<ButtonStyled pulse tone="primary">Get started</ButtonStyled>
```

## Ripple

Material-style click ripple. Enabled by default — pass `ripple={false}` to opt out.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onClick` | `(e) => void \| Promise<void>` | — | Click handler. Promise drives the spinner. |
| `variant` | `"solid" \| "outline" \| "ghost" \| "link"` | `"solid"` | Visual style |
| `tone` | `"neutral" \| "primary" \| "success" \| "danger"` | `"primary"` | Color |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Size |
| `radius` | `"default" \| "pill" \| "sharp"` | `"default"` | Border radius shape |
| `block` | `boolean` | `false` | Full-width button |
| `loading` | `boolean` | `false` | Force spinner |
| `loadingText` | `ReactNode` | — | Label shown while loading (replaces children) |
| `pulse` | `boolean` | `false` | Subtle pulsing glow ring |
| `ripple` | `boolean` | `true` | Material-style ripple on click |
| `disabled` | `boolean` | `false` | Disable the button |
| `iconLeft` | `ReactNode` | — | Icon before label |
| `iconRight` | `ReactNode` | — | Icon after label |

## License

MIT
