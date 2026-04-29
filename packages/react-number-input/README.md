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

## License

MIT
