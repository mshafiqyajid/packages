# @mshafiqyajid/react-segmented-control

**[Full docs →](https://docs.shafiqyajid.com/react/segmented-control/)**

A polished iOS-style segmented control for React — with a buttery sliding indicator that follows the active segment. Comes in two flavors:

- **Styled** — `<SegmentedControlStyled>` with variants (solid / pill / underline), sizes, tones, full a11y.
- **Headless** — `useSegmentedControl()` hook + unstyled `<SegmentedControl>` primitive. Bring your own UI.

Generic over option type (works with strings, numbers, or full objects). Full keyboard nav. Zero dependencies. SSR-safe. Fully typed. ESM + CJS.

## Install

```bash
npm install @mshafiqyajid/react-segmented-control
```

Peer dependency: `react >= 17`.

## Quick start

### Styled (recommended)

```tsx
import { SegmentedControlStyled } from "@mshafiqyajid/react-segmented-control/styled";
import "@mshafiqyajid/react-segmented-control/styles.css";

export function ViewSwitcher() {
  const [view, setView] = useState("week");
  return (
    <SegmentedControlStyled
      options={["day", "week", "month"]}
      value={view}
      onChange={setView}
      tone="primary"
    />
  );
}
```

### Headless

```tsx
import { SegmentedControl } from "@mshafiqyajid/react-segmented-control";

<SegmentedControl
  options={["Code", "Preview", "Tests"]}
  defaultValue="Preview"
  onChange={(v) => console.log(v)}
/>
```

### Hook (full custom UI)

```tsx
import { useSegmentedControl } from "@mshafiqyajid/react-segmented-control";

function CustomTabs() {
  const { options, rootProps, indicatorStyle } = useSegmentedControl({
    options: ["Code", "Preview", "Tests"],
  });

  return (
    <div {...rootProps} style={indicatorStyle} className="my-tabs">
      <span className="my-indicator" /> {/* uses --rsc-indicator-x / --rsc-indicator-width */}
      {options.map((o) => (
        <button key={o.index} {...o.buttonProps}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
```

## Recipes

### Variants

```tsx
<SegmentedControlStyled options={["A", "B", "C"]} variant="solid" />     {/* default */}
<SegmentedControlStyled options={["A", "B", "C"]} variant="pill" />
<SegmentedControlStyled options={["A", "B", "C"]} variant="underline" />
```

### Sizes and tones

```tsx
<SegmentedControlStyled options={["A","B"]} size="sm" tone="success" />
<SegmentedControlStyled options={["A","B"]} size="md" tone="primary" />
<SegmentedControlStyled options={["A","B"]} size="lg" tone="danger"  />
```

### Full width

Stretches to its parent and distributes segments evenly.

```tsx
<SegmentedControlStyled options={["Newest", "Top", "Following"]} fullWidth />
```

### Disabled options

```tsx
<SegmentedControlStyled
  options={[
    "Free",
    "Pro",
    { value: "Enterprise", disabled: true },
  ]}
/>
```

Disabled options are skipped by arrow keys and ignore clicks.

### Object options with custom labels

```tsx
<SegmentedControlStyled
  options={[
    { value: "asc",  label: "↑ Ascending" },
    { value: "desc", label: "↓ Descending" },
  ]}
/>
```

### Generic over any value type

```tsx
type Sort = { field: "name" | "date"; dir: "asc" | "desc" };

<SegmentedControlStyled<Sort>
  options={[
    { value: { field: "name", dir: "asc" }, label: "Name ↑" },
    { value: { field: "date", dir: "desc" }, label: "Date ↓" },
  ]}
  defaultValue={{ field: "name", dir: "asc" }}
  equals={(a, b) => a.field === b.field && a.dir === b.dir}
/>
```

### Theme via CSS variables

```css
.brand-segmented {
  --rsc-bg-track: #fef3c7;
  --rsc-bg-indicator: #f59e0b;
  --rsc-fg-active: #ffffff;
  --rsc-radius: 14px;
}
```

```tsx
<SegmentedControlStyled options={["A", "B", "C"]} className="brand-segmented" />
```

Force a theme without `prefers-color-scheme`:

```tsx
<div data-rsc-theme="dark">
  <SegmentedControlStyled options={["A", "B", "C"]} />
</div>
```

## API

### `<SegmentedControlStyled>`

| Prop           | Type                                              | Default     | Description                                                              |
| -------------- | ------------------------------------------------- | ----------- | ------------------------------------------------------------------------ |
| `options`      | `Array<T \| { value: T; label?; disabled? }>`     | —           | Required. Strings/numbers auto-wrapped; pass objects for labels/disabled. |
| `value`        | `T`                                               | —           | Controlled value.                                                        |
| `defaultValue` | `T`                                               | first opt   | Uncontrolled initial value.                                              |
| `onChange`     | `(value: T) => void`                              | —           | Fires when the active value changes.                                     |
| `disabled`     | `boolean`                                         | `false`     | Disable the entire control.                                              |
| `equals`       | `(a: T, b: T) => boolean`                         | `Object.is` | Custom equality for object/complex values.                               |
| `variant`      | `"solid" \| "pill" \| "underline"`                | `"solid"`   | Visual style.                                                            |
| `size`         | `"sm" \| "md" \| "lg"`                            | `"md"`      | Size.                                                                    |
| `tone`         | `"neutral" \| "primary" \| "success" \| "danger"` | `"primary"` | Color theme.                                                             |
| `fullWidth`    | `boolean`                                         | `false`     | Stretch to container width.                                              |
| `label`        | `ReactNode`                                       | —           | Label rendered above.                                                    |
| `hint`         | `ReactNode`                                       | —           | Helper text below.                                                       |

### `useSegmentedControl(options)`

Returns `{ value, options, rootProps, indicatorStyle, setValue }`:

- `options[i].buttonProps` — spread onto your `<button>` to wire it up.
- `rootProps` — spread onto the wrapper for `role="radiogroup"`.
- `indicatorStyle` — apply to the wrapper. Sets CSS vars `--rsc-indicator-x`, `--rsc-indicator-width`, and `--rsc-indicator-ready` (0/1).

### `<SegmentedControl>` (headless primitive)

Same options as the hook, plus:

- `renderOption?: (state) => ReactNode` — replace the default button per option.
- `showIndicator?: boolean` — toggle the `.rsc-indicator` span (default `true`).
- `optionProps?: ...` — extra props applied to every default-rendered button.
- `children?: ({ options, value, setValue, indicatorStyle }) => ReactNode` — full custom render.

## CSS variables

Override on `.rsc-root`, on the track via `className`, or on `:root`:

| Variable                  | Default       | Description                       |
| ------------------------- | ------------- | --------------------------------- |
| `--rsc-bg-track`          | `#f4f4f5`     | Track background                  |
| `--rsc-bg-indicator`      | `#ffffff`     | Indicator (sliding pill) color    |
| `--rsc-fg-active`         | `#18181b`     | Active segment label color        |
| `--rsc-fg-inactive`       | `#52525b`     | Inactive segment label color      |
| `--rsc-shadow-indicator`  | subtle        | Indicator drop shadow             |
| `--rsc-ring`              | indigo glow   | Focus ring                        |
| `--rsc-radius`            | `9px`         | Track corner radius               |
| `--rsc-radius-inner`      | `7px`         | Indicator/segment corner radius   |
| `--rsc-padding`           | `3px`         | Track inner padding               |
| `--rsc-segment-padding-y` | `0.4rem`      | Vertical segment padding          |
| `--rsc-segment-padding-x` | `0.85rem`     | Horizontal segment padding        |
| `--rsc-font-size`         | `0.85rem`     | Segment font size                 |
| `--rsc-duration`          | `320ms`       | Indicator slide duration          |
| `--rsc-ease-spring`       | spring curve  | Indicator slide easing            |

The styled component automatically:

- Switches palette under `prefers-color-scheme: dark`
- Disables animations under `prefers-reduced-motion: reduce`
- Uses `ResizeObserver` to keep the indicator aligned when fonts/layout change
- Forwards `ref` to the track `<div>`

## Browser support

Modern evergreen browsers. Uses `ResizeObserver` (universally supported) for indicator measurement. SSR-safe — falls back to `useEffect` on the server.

## License

MIT © Shafiq Yajid
