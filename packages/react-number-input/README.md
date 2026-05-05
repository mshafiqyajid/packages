# @mshafiqyajid/react-number-input

Headless numeric input hook and styled component for React. Increment/decrement, keyboard, scroll wheel, currency/percent formatting, accessible, fully typed.

**[Full docs →](https://docs.shafiqyajid.com/react/number-input/)**

## Install

```bash
npm install @mshafiqyajid/react-number-input
```

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
    />
  );
}
```

## Keyboard + interaction

| Input | Action |
|-------|--------|
| `↑` / `↓` | Step by `step` (default 1) |
| `Shift + ↑/↓` | Step by `bigStep` (default `step × 10`) |
| `PageUp` / `PageDown` | Step by `bigStep` |
| `Home` / `End` | Jump to `min` / `max` (when set) |
| Mouse wheel (when `wheelEnabled`) | Step on focused input |
| Hold the +/− button | Repeats step (200 ms initial delay, ~50 ms cadence) |

## Props (additions)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `bigStep` | `number` | `step × 10` | Step size for Shift+Arrow / PageUp / PageDown |
| `wheelEnabled` | `boolean` | `false` | Allow mouse wheel to step value when input is focused |

## License

MIT
