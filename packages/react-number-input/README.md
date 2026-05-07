# @mshafiqyajid/react-number-input

Headless numeric input hook and styled component for React. Increment/decrement, keyboard, scroll wheel, currency/percent formatting, accessible, fully typed.

**[Full docs →](https://docs.shafiqyajid.com/react/number-input/)**

## Install

```bash
npm install @mshafiqyajid/react-number-input
```

## What's new in 0.4.0

- **Hold-to-repeat with acceleration** — configurable `repeat` prop (`initialDelay`, `interval`, `accel`). The step interval shortens each repeat by the `accel` multiplier (default 0.9×).
- **`scrubable` label drag** — set `scrubable` on `NumberInputStyled` to make the label a drag handle. Drag left to decrease, right to increase, at a rate of one `step` per `scrubPixels` pixels (default 4). Uses `setPointerCapture` for reliable tracking.
- **`largeStep` prop** — alias for `bigStep`; sets the step size for `Shift+Arrow` / `PageUp` / `PageDown`.
- **Digit scroll animation** — value changes via stepper buttons animate the input digit up or down. Respects `prefers-reduced-motion`.

## Headless usage

```tsx
import { useNumberInput } from "@mshafiqyajid/react-number-input";

function MyNumberInput() {
  const { inputProps, incrementProps, decrementProps, formattedValue } =
    useNumberInput({ defaultValue: 0, min: 0, max: 100, step: 1 });

  return (
    <div>
      <button {...decrementProps}>−</button>
      <input {...inputProps} />
      <button {...incrementProps}>+</button>
    </div>
  );
}
```

## Styled usage

```tsx
import { NumberInputStyled } from "@mshafiqyajid/react-number-input/styled";
import "@mshafiqyajid/react-number-input/styles.css";

function App() {
  return (
    <NumberInputStyled
      label="Price"
      defaultValue={1234}
      min={0}
      format="currency"
      currency="USD"
      locale="en-US"
      tone="primary"
      size="md"
      scrubable
      repeat={{ initialDelay: 500, interval: 80, accel: 0.9 }}
    />
  );
}
```

## Keyboard + interaction

| Input | Action |
|-------|--------|
| `↑` / `↓` | Step by `step` (default 1) |
| `Shift + ↑/↓` | Step by `largeStep` / `bigStep` (default `step × 10`) |
| `PageUp` / `PageDown` | Step by `largeStep` / `bigStep` |
| `Home` / `End` | Jump to `min` / `max` (when set) |
| Mouse wheel (when `wheelEnabled`) | Step on focused input |
| Hold the +/− button | Repeats with acceleration (configurable via `repeat`) |
| Drag label left/right (`scrubable`) | Decrease/increase by one `step` per `scrubPixels` px |

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `bigStep` | `number` | `step × 10` | Step size for Shift+Arrow / PageUp / PageDown |
| `largeStep` | `number` | `step × 10` | Alias for `bigStep` |
| `wheelEnabled` | `boolean` | `true` | Allow mouse wheel to step value when input is focused |
| `repeat` | `RepeatOptions` | `{ initialDelay: 500, interval: 80, accel: 0.9 }` | Hold-to-repeat configuration |
| `scrubable` | `boolean` | `false` | Make the label a horizontal drag handle *(styled only)* |
| `scrubPixels` | `number` | `4` | Pixels of drag per one `step` change *(styled only)* |

### `RepeatOptions`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `initialDelay` | `number` | `500` | ms before repeat begins |
| `interval` | `number` | `80` | ms between repeat fires |
| `accel` | `number` | `0.9` | Interval multiplier per repeat (< 1 = faster) |

## License

MIT
