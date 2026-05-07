# @mshafiqyajid/react-progress

Headless progress hook and styled progress bar and circle components for React. Accessible, animated, fully typed.

**[Full docs →](https://docs.shafiqyajid.com/react/progress/)**

## Installation

```bash
npm install @mshafiqyajid/react-progress
```

## Headless usage

```tsx
import { useProgress } from "@mshafiqyajid/react-progress";

function MyProgress() {
  const { progressProps, percent, isComplete } = useProgress({ value: 60 });

  return (
    <div {...progressProps}>
      {percent}% {isComplete && "Done!"}
    </div>
  );
}
```

## Styled usage

```tsx
import { ProgressBar, ProgressCircle } from "@mshafiqyajid/react-progress/styled";
import "@mshafiqyajid/react-progress/styles.css";

function App() {
  return (
    <>
      <ProgressBar value={75} tone="primary" size="md" showValue label="Uploading…" />
      <ProgressCircle value={75} tone="success" size="lg" showValue />

      {/* Segmented bar — N discrete cells */}
      <ProgressBar value={60} segments={5} tone="primary" />

      {/* Custom value renderer */}
      <ProgressBar
        value={42}
        showValue
        formatValue={(percent, value) => `${value}/100 (${percent}%)`}
      />
    </>
  );
}
```

## ProgressBar props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | — | Current progress value |
| `min` / `max` | `number` | `0` / `100` | Range |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Bar height |
| `tone` | `"neutral" \| "primary" \| "success" \| "warning" \| "danger"` | `"neutral"` | Fill color |
| `label` | `string` | — | Accessible label displayed above the bar |
| `showValue` | `boolean` | `false` | Render the value text next to the label |
| `animateValue` | `boolean` | `true` | Smoothly count the displayed number when `value` changes. Disabled automatically under `prefers-reduced-motion`. |
| `formatValue` | `(percent, value) => ReactNode` | — | Customize the value display; replaces the animated counter |
| `animated` | `boolean` | `false` | Diagonal stripe animation on the fill |
| `rounded` | `boolean` | `true` | Rounded track and fill |
| `segments` | `number` | — | Render N discrete segment cells instead of a continuous fill |
| `sections` | `Array<{ value; tone?; label? }>` | — | Proportional coloured sections; when set, `value` is ignored |
| `bufferValue` | `number` | — | Ghost fill behind the active fill (buffered-range pattern) |

## ProgressCircle props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | — | Current progress value |
| `size` | `"sm" \| "md" \| "lg" \| number` | `"md"` | Diameter in pixels or named size |
| `tone` | `"neutral" \| "primary" \| "success" \| "warning" \| "danger"` | `"neutral"` | Stroke color |
| `showValue` | `boolean` | `false` | Render percentage inside the ring |
| `formatValue` | `(percent, value) => ReactNode` | — | Customize the text inside the ring |
| `label` | `ReactNode` | — | Caption rendered below the ring; also used as `aria-label` |
| `strokeWidth` | `number` | auto | Override the ring stroke width |

## ProgressCircleStack props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `rings` | `Array<{ value; tone?; label? }>` | — | 2–4 concentric rings |
| `size` | `number` | `120` | Outer diameter in pixels |
| `gap` | `number` | `6` | Spacing between rings in pixels |

## What's new in 0.4.0

- **`sections` on `ProgressBar`** — divide the bar into coloured proportional segments via `sections?: Array<{ value: number; tone?: ProgressTone; label?: string }>`. Each segment fills proportionally to its `value` relative to the sum of all values. Segments animate in sequentially on mount (staggered left-to-right). Non-breaking: absent = existing single-fill behaviour.
- **`bufferValue` on `ProgressBar`** — render a translucent ghost fill behind the active fill (video-player buffered-range pattern). Pass `bufferValue={n}` alongside `value`. CSS class `rprog-buffer`, variable `--rprog-buffer-bg`. Transitions at a slower speed to feel "buffered". Non-breaking.
- **`ProgressCircleStack` component** — concentric activity rings (Apple Watch style). Props: `rings: Array<{ value: number; tone?: ProgressTone; label?: string }>` (2–4 rings), `size?` (default 120), `gap?` (px between rings, default 6). CSS class `rprog-stack`. Rings animate in with increasing delay per ring. Respects `prefers-reduced-motion`.

## What's new in 0.3.0

- **`animateValue` on `ProgressBar`** — the displayed percentage counts up/down smoothly using `requestAnimationFrame` with a cubic ease-out. Automatically disabled under `prefers-reduced-motion`.
- **`formatValue` on `ProgressCircle`** — customize the text drawn inside the ring (mirrors the existing `ProgressBar` prop).
- **`label` on `ProgressCircle`** — when set, the SVG is wrapped in a flex column container with a caption below the ring, and the string is also forwarded as `aria-label`.

## License

MIT
