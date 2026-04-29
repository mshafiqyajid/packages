# @mshafiqyajid/react-color-input

**[Full docs →](https://docs.shafiqyajid.com/react/color-input/)**

A headless color input hook and styled component for React. Provides a text input combined with a color swatch that opens a popover picker — hue slider, gradient canvas, hex input, and preset swatches.

## Installation

```bash
npm install @mshafiqyajid/react-color-input
```

## Usage

### Styled component (quick start)

```tsx
import { ColorInputStyled } from "@mshafiqyajid/react-color-input/styled";
import "@mshafiqyajid/react-color-input/styles.css";

function App() {
  const [color, setColor] = useState("#6366f1");
  return (
    <ColorInputStyled
      value={color}
      onChange={setColor}
      label="Brand color"
      size="md"
      tone="neutral"
    />
  );
}
```

### Headless hook

```tsx
import { useColorInput } from "@mshafiqyajid/react-color-input";

function MyColorInput() {
  const { inputProps, swatchProps, isOpen, isValid } = useColorInput({
    defaultValue: "#6366f1",
    onChange: (hex) => console.log(hex),
  });

  return (
    <div>
      <button {...swatchProps} style={{ background: inputProps.value }} />
      <input {...inputProps} />
      {!isValid && <span>Invalid hex</span>}
      {isOpen && <div>Picker goes here</div>}
    </div>
  );
}
```

## Props — `ColorInputStyled`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | — | Controlled hex value |
| `defaultValue` | `string` | `"#000000"` | Uncontrolled default |
| `onChange` | `(value: string) => void` | — | Called with valid hex on change |
| `disabled` | `boolean` | `false` | Disables the input |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Input size |
| `tone` | `"neutral" \| "primary" \| "danger"` | `"neutral"` | Visual tone |
| `label` | `string` | — | Label above the input |
| `hint` | `string` | — | Helper text below |
| `error` | `string` | — | Error message (sets danger tone) |
| `format` | `"hex" \| "rgb"` | `"hex"` | Display format in text input |
| `showCopyButton` | `boolean` | `false` | Show copy-to-clipboard button |

## Dark mode

Add `data-theme="dark"` to any ancestor element.

## License

MIT
