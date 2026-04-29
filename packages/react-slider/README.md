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
    />
  );
}
```

## License

MIT
