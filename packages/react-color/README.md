# @mshafiqyajid/react-color

**[Full docs →](https://docs.shafiqyajid.com/react/color/)**

A tiny, modern color picker for React. Drop-in replacement for [`react-color`](https://www.npmjs.com/package/react-color) — without the 7 heavy dependencies, without the bloated 37 KB bundle, with first-class TypeScript.

**Zero dependencies. ~11 KB. SSR-safe. Fully typed. React 17–19.**

## Why this exists

`react-color` (1.9M weekly downloads) was last published in **June 2022** and ships with lodash, lodash-es, material-colors, reactcss, tinycolor2, @icons/material, and prop-types. This package replaces all of that with pure TypeScript math and one CSS file.

## Install

```bash
npm install @mshafiqyajid/react-color
```

Peer dependency: `react >= 17`.

## Quick start

```tsx
import { HexColorPicker } from "@mshafiqyajid/react-color/styled";
import "@mshafiqyajid/react-color/styles.css";

export function MyPicker() {
  const [color, setColor] = useState("#6366f1");
  return <HexColorPicker value={color} onChange={setColor} />;
}
```

## Picker components

All pickers accept `value` (controlled) or `defaultValue` (uncontrolled), `onChange`, `showAlpha`, `showHexInput`, and any standard `<div>` props.

### HexColorPicker

```tsx
<HexColorPicker
  value={hex}               // "#rrggbb" or "#rrggbbaa"
  onChange={(hex) => …}
  showAlpha                 // adds alpha slider, outputs "#rrggbbaa"
/>
```

### RgbaColorPicker

```tsx
<RgbaColorPicker
  value={{ r: 99, g: 102, b: 241, a: 1 }}
  onChange={({ r, g, b, a }) => …}
/>
```

### HslaColorPicker

```tsx
<HslaColorPicker
  value={{ h: 239, s: 84, l: 67, a: 1 }}
  onChange={({ h, s, l, a }) => …}
/>
```

### Options (all pickers)

| Prop           | Type                    | Default   | Description                                |
| -------------- | ----------------------- | --------- | ------------------------------------------ |
| `value`        | format-specific         | —         | Controlled color value.                    |
| `defaultValue` | format-specific         | white     | Uncontrolled initial value.                |
| `onChange`     | `(color) => void`       | —         | Fires on every pointer move.               |
| `showAlpha`    | `boolean`               | `false`   | Show the alpha slider.                     |
| `showHexInput` | `boolean`               | `true`    | Show the hex text input.                   |

## Headless API

Build your own picker UI using the hook and primitives.

```tsx
import {
  useColorPicker,
  SaturationField,
  HueSlider,
  AlphaSlider,
  HexInput,
} from "@mshafiqyajid/react-color";

function MyPicker({ value, onChange }) {
  const picker = useColorPicker({ value, onChange });

  return (
    <div>
      <SaturationField picker={picker} className="my-sat" />
      <HueSlider picker={picker} className="my-hue" />
      <AlphaSlider picker={picker} hsva={picker.hsva} className="my-alpha" />
      <HexInput hsva={picker.hsva} onChange={picker.setHsva} />
    </div>
  );
}
```

The hook returns:
- `hsva` — current color in HSVA space
- `setHsva(hsva)` — programmatically set
- `saturationFieldProps` — spread onto your 2D saturation field div
- `hueSliderProps` — spread onto your hue strip div
- `alphaSliderProps` — spread onto your alpha strip div
- `sbPosition` — `{ left, top }` as % for the saturation handle
- `huePosition` — hue handle position as %
- `alphaPosition` — alpha handle position as %

## Color utilities

All pure functions, no side effects, no DOM.

```tsx
import {
  parseHex,        // "#ff0000" → { r, g, b, a }
  rgbaToHex,       // { r, g, b, a } → "#ff0000"
  hsvaToHex,       // { h, s, v, a } → "#ff0000"
  hsvaToRgba,      // { h, s, v, a } → { r, g, b, a }
  hsvaToHsla,      // { h, s, v, a } → { h, s, l, a }
  toHsva,          // any supported format → HsvaColor
  hsvToRgb,
  rgbToHsv,
  hslToHsv,
  hsvToHsl,
} from "@mshafiqyajid/react-color";
```

## CSS variables

Override on `.rcp-picker` or a wrapper class:

| Variable                 | Default   | Description                      |
| ------------------------ | --------- | -------------------------------- |
| `--rcp-width`            | `240px`   | Picker width                     |
| `--rcp-saturation-height`| `160px`   | Saturation field height          |
| `--rcp-slider-height`    | `12px`    | Hue/alpha strip height           |
| `--rcp-handle-size`      | `18px`    | Circular handle diameter         |
| `--rcp-bg`               | `#ffffff` | Picker background                |
| `--rcp-input-bg`         | `#f4f4f5` | Hex input background             |
| `--rcp-radius`           | `10px`    | Outer radius                     |
| `--rcp-radius-inner`     | `6px`     | Field / input inner radius       |

Dark mode applies automatically under `prefers-color-scheme: dark`. Force it with `data-rcp-theme="dark"` on any ancestor.

## Browser support

Evergreen browsers. SSR-safe (no DOM access at import time). Uses `setPointerCapture` for smooth drag across the saturation field (universally supported).

## License

MIT © Shafiq Yajid
