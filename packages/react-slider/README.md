# @mshafiqyajid/react-slider

Headless slider hook and styled component for React. Accessible, keyboard-friendly, single and range mode, fully typed.

**[Full docs →](https://docs.shafiqyajid.com/react/slider/)**

## Install

```bash
npm install @mshafiqyajid/react-slider
```

## Headless usage

```tsx
import { useSlider } from "@mshafiqyajid/react-slider";

function MySlider() {
  const { trackProps, thumbProps, rangeProps } = useSlider({
    defaultValue: 40,
    min: 0,
    max: 100,
    step: 1,
  });

  return (
    <div {...trackProps} style={{ position: "relative", height: 4 }}>
      <div {...rangeProps} />
      <div {...thumbProps[0]} />
    </div>
  );
}
```

## Styled usage

```tsx
import { SliderStyled } from "@mshafiqyajid/react-slider/styled";
import "@mshafiqyajid/react-slider/styles.css";

function App() {
  return (
    <SliderStyled
      defaultValue={40}
      tone="primary"
      size="md"
      showValue
      marks={[0, 25, 50, 75, 100]}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number \| [number, number] \| number[]` | — | Controlled value (single, range, or multi-thumb) |
| `defaultValue` | `number \| [number, number] \| number[]` | `0` | Uncontrolled initial |
| `onChange` | `(value) => void` | — | Fires on change |
| `min` / `max` / `step` | `number` | `0 / 100 / 1` | Range bounds and step |
| `range` | `boolean` | `false` | Two-thumb range mode (shorthand) |
| `marks` | `boolean \| number[] \| Mark[]` | — | Tick marks. Pass `[{ value, label }]` for labels. |
| `snapToMarks` | `boolean` | `false` | Snap to nearest mark on drag end / keyboard commit |
| `scale` | `"linear" \| "log"` | `"linear"` | Map linear track position to a logarithmic scale |
| `scaleBase` | `number` | `10` | Base for log scale |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Track and thumb size |
| `tone` | `"neutral" \| "primary" \| "success" \| "danger"` | `"primary"` | Color |
| `showValue` | `boolean` | `false` | Show the current value(s) always |
| `showValueOnInteraction` | `boolean` | `false` | Show value bubble only on hover/active |
| `formatValue` | `(v: number) => ReactNode` | — | Custom bubble renderer |
| `disabled` | `boolean` | `false` | Disable interaction |

## License

MIT

## Form integration

```tsx
<form>
  <SliderStyled
    name="volume"
    label="Volume"
    hint="0–100"
    defaultValue={50}
    required
    error={errors.volume}
  />

  {/* range mode emits two hidden inputs: `${name}` and `${name}-end` */}
  <SliderStyled
    name="price"
    range
    defaultValue={[10, 90]}
    label="Price range"
  />
</form>
```

| Prop | Type | Description |
|---|---|---|
| `name` | `string` | Renders hidden input(s) for the current value(s). Range mode emits `${name}` + `${name}-end`. |
| `id` | `string` | Wrapper id |
| `required` | `boolean` | aria-required on the track + required on the hidden inputs |
| `error` / `invalid` | `ReactNode` / `boolean` | Sets `data-invalid` on the root, `aria-invalid` on the track, swaps the active track fill to the error color |
| `label` / `hint` | `ReactNode` | Above / below the track |

## What's new in 0.4.0

- **Multi-thumb (3+ values)** — pass `value: number[]` with 3 or more elements to render that many independent thumbs. Each thumb is draggable and cannot cross its neighbours (`min` of each thumb is the previous thumb's value + step, `max` is the next thumb's value − step).
- **`snapToMarks` prop** — when `true` and `marks` is set, the thumb snaps to the nearest mark value on drag end and keyboard commit. The snap is animated via the spring CSS transition.
- **`scale: "log"` prop** — maps the linear 0–100 visual track position to a logarithmic scale between `min` and `max`. Configure the base with `scaleBase` (default `10`).
- **Spring thumb motion** — on drag release the thumb now springs slightly past the target then settles (`cubic-bezier(0.34, 1.56, 0.64, 1)`). During an active drag the transition is disabled for immediate feedback.
- **Drag-managed tooltip** — the value bubble fades in on drag start and fades out 800 ms after drag end. Respects `prefers-reduced-motion`.

## What's new in 0.3.0

- **Animated value bubble** — `showValueOnInteraction: true` shows the bubble only on thumb hover/active with smooth opacity + translate transition.
- **Labelled marks** — `marks` now accepts `number[]` or `{ value, label }[]` (in addition to the existing `boolean`); labels render below each tick.
- **`formatValue: (value) => ReactNode`** — custom renderer for the bubble.
- **`orientation: "horizontal" | "vertical"`** — adds `data-orientation="vertical"` for vertical-layout styling.
- **`onCommit: (value) => void`** — fires only on pointer release / keyboard commit, not every step.
