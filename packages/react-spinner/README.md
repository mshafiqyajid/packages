# @mshafiqyajid/react-spinner

Accessible loading spinner with five animation variants and six tones.

**[Full docs →](https://docs.shafiqyajid.com/react/spinner/)**

## Install

```bash
npm install @mshafiqyajid/react-spinner
```

## Quick start

```tsx
import { SpinnerStyled } from "@mshafiqyajid/react-spinner/styled";
import "@mshafiqyajid/react-spinner/styles.css";

<SpinnerStyled />
<SpinnerStyled variant="dots" tone="success" size="lg" />
<SpinnerStyled variant="bars" speed="fast" />
```

## Variants

- **spin** (default) — rotating arc circle
- **dots** — three bouncing dots with stagger
- **bars** — four animated equaliser bars
- **pulse** — single pulsing circle
- **ring** — two concentric counter-rotating rings

## Sizes

`xs` · `sm` · `md` · `lg` · `xl`

## Tones

`neutral` · `primary` · `success` · `warning` · `danger` · `info` · `current`

## Overlay

```tsx
<div style={{ position: "relative", width: 200, height: 200 }}>
  <img src="..." alt="..." />
  <SpinnerStyled overlay />
</div>
```

## Headless

```tsx
import { useSpinner } from "@mshafiqyajid/react-spinner";

function MySpinner() {
  const { spinnerProps } = useSpinner({ label: "Loading data" });
  return (
    <span {...spinnerProps} className="my-spinner">
      {/* your animation */}
    </span>
  );
}
```

## API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | "spin" \| "dots" \| "bars" \| "pulse" \| "ring" | "spin" | Animation style |
| size | "xs" \| "sm" \| "md" \| "lg" \| "xl" | "md" | Dimensions |
| tone | "neutral" \| "primary" \| "success" \| "warning" \| "danger" \| "info" \| "current" | "primary" | Color |
| speed | "slow" \| "normal" \| "fast" | "normal" | Animation speed |
| label | string | "Loading" | Screen reader label |
| overlay | boolean | false | Fills parent with a translucent backdrop |
| className | string | — | Extra class on root |
| style | CSSProperties | — | Inline style override |

## License

MIT © Shafiq Yajid
