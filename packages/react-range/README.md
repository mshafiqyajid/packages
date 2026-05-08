# @mshafiqyajid/react-range

Accessible single and range slider with marks, tooltips, and keyboard control.

**[Full docs →](https://docs.shafiqyajid.com/react/range/)**

## Install

```bash
npm install @mshafiqyajid/react-range
```

## Quick start

```tsx
import { RangeStyled } from "@mshafiqyajid/react-range/styled";
import "@mshafiqyajid/react-range/styles.css";

// Single slider
const [volume, setVolume] = useState(40);
<RangeStyled
  mode="single"
  value={volume}
  onChange={setVolume}
  tone="primary"
  label="Volume"
  showTooltip="drag"
/>

// Range slider
const [range, setRange] = useState<[number, number]>([20, 80]);
<RangeStyled
  mode="range"
  value={range}
  onChange={setRange}
  tone="primary"
  label="Price range"
/>
```

## Marks

```tsx
// Auto-marks from step
<RangeStyled mode="single" min={0} max={100} step={25} marks />

// Custom marks with labels
<RangeStyled
  mode="range"
  min={0}
  max={100}
  marks={[
    { value: 0, label: "Low" },
    { value: 50, label: "Mid" },
    { value: 100, label: "High" },
  ]}
/>
```

## Tooltip formatting

```tsx
<RangeStyled
  mode="single"
  value={price}
  onChange={setPrice}
  showTooltip="always"
  tooltipFormat={(v) => `$${v}`}
/>
```

## Form field

```tsx
<RangeStyled
  mode="range"
  label="Budget"
  hint="Set your min and max budget"
  required
  value={range}
  onChange={setRange}
  onChangeEnd={handleCommit}
/>

// With error
<RangeStyled
  mode="range"
  label="Price"
  error="Range too wide"
  value={range}
  onChange={setRange}
/>
```

## Tones

```tsx
<RangeStyled mode="single" tone="primary" />
<RangeStyled mode="single" tone="success" />
<RangeStyled mode="single" tone="warning" />
<RangeStyled mode="single" tone="danger" />
<RangeStyled mode="single" tone="neutral" />
```

## Headless usage

```tsx
import { useRange } from "@mshafiqyajid/react-range";

const { value, rootProps, trackProps, getThumbProps, getTrackFillProps } = useRange({
  defaultValue: [20, 80],
  min: 0,
  max: 100,
  mode: "range",
});

return (
  <div {...rootProps} className="my-range">
    <div {...trackProps} className="track">
      <div className="rail" />
      <div {...getTrackFillProps()} className="fill" />
      {[0, 1].map((i) => (
        <div key={i} {...getThumbProps(i)} className="thumb" />
      ))}
    </div>
  </div>
);
```

## API

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `number \| [number, number]` | — | Controlled value |
| `defaultValue` | `number \| [number, number]` | `min` / `[min, max]` | Uncontrolled initial value |
| `onChange` | `(v) => void` | — | Fires on every change |
| `onChangeEnd` | `(v) => void` | — | Fires on pointer release or keyboard commit |
| `min` | `number` | `0` | Minimum value |
| `max` | `number` | `100` | Maximum value |
| `step` | `number` | `1` | Step increment |
| `mode` | `"single" \| "range"` | `"range"` | Single thumb or dual thumb |
| `disabled` | `boolean` | `false` | Disable interaction |
| `inverted` | `boolean` | `false` | Invert fill direction |
| `showTooltip` | `"always" \| "drag" \| "never"` | `"drag"` | Tooltip visibility |
| `tooltipFormat` | `(v: number) => string` | — | Format the tooltip value |
| `marks` | `boolean \| { value, label? }[]` | `false` | Tick marks; `true` derives from `step` |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Track and thumb size |
| `tone` | `"neutral" \| "primary" \| "success" \| "warning" \| "danger"` | `"primary"` | Fill color |
| `label` | `string` | — | Label above the slider |
| `hint` | `string` | — | Helper text below |
| `error` | `string` | — | Error text — sets `data-invalid` and `data-tone="danger"` |
| `required` | `boolean` | — | Mark as required |
| `invalid` | `boolean` | — | Force invalid state without error text |
| `className` | `string` | — | Extra class on root div |
| `style` | `CSSProperties` | — | Inline style on root div |

## Keyboard

| Key | Action |
|---|---|
| `ArrowRight` / `ArrowUp` | +1 step |
| `ArrowLeft` / `ArrowDown` | -1 step |
| `Shift + Arrow` | ±10% of range |
| `Home` | Jump to min |
| `End` | Jump to max |

## License

MIT
