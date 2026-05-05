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
| `value` | `number \| [number, number]` | — | Controlled value (single or range) |
| `defaultValue` | `number \| [number, number]` | `0` | Uncontrolled initial |
| `onChange` | `(value, reason?) => void` | — | Fires on change |
| `min` / `max` / `step` | `number` | `0 / 100 / 1` | Range bounds and step |
| `range` | `boolean` | `false` | Two-thumb range mode |
| `marks` | `number[] \| Mark[]` | — | Tick marks. Pass `[{ value, label }]` for labels. |
| `transform` | `"linear" \| (v) => v` | `"linear"` | Custom value transform (e.g. logarithmic) |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Track and thumb size |
| `tone` | `"neutral" \| "primary" \| "success" \| "danger"` | `"primary"` | Color |
| `showValue` | `boolean` | `false` | Show the current value(s) |
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
