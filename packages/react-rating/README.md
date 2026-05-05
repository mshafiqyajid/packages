# @mshafiqyajid/react-rating

**[Full docs →](https://docs.shafiqyajid.com/react/rating/)**

A polished star-rating component for React with half-step support, hover preview, and full keyboard nav. Comes in two flavors:

- **Styled** — `<RatingStyled>` with sizes, tones, label/hint, optional value display.
- **Headless** — `useRating()` hook + unstyled `<Rating>` primitive. Bring your own icons (hearts, thumbs, anything).

Zero dependencies. SSR-safe. Fully typed. ESM + CJS.

## Install

```bash
npm install @mshafiqyajid/react-rating
```

Peer dependency: `react >= 17`.

## Quick start

### Styled (recommended)

```tsx
import { RatingStyled } from "@mshafiqyajid/react-rating/styled";
import "@mshafiqyajid/react-rating/styles.css";

export function Review() {
  const [value, setValue] = useState(0);
  return (
    <RatingStyled
      count={5}
      value={value}
      onChange={setValue}
      tone="warning"
      showValue
    />
  );
}
```

### Headless

```tsx
import { Rating } from "@mshafiqyajid/react-rating";

<Rating count={5} defaultValue={3.5} onChange={setValue} />
```

### Hook (full custom UI)

```tsx
import { useRating } from "@mshafiqyajid/react-rating";

function CustomRating() {
  const { items, value, displayValue, rootProps } = useRating({ count: 5 });
  return (
    <div {...rootProps}>
      {items.map((item) => (
        <span key={item.index} {...item.itemProps} style={item.style}>
          {/* item.fill is 0, 0.5, or 1 — render however you like */}
        </span>
      ))}
    </div>
  );
}
```

## Recipes

### Sizes and tones

```tsx
<RatingStyled count={5} defaultValue={3.5} size="sm" tone="primary" />
<RatingStyled count={5} defaultValue={3.5} size="md" tone="warning" />   {/* default */}
<RatingStyled count={5} defaultValue={3.5} size="lg" tone="success" />
```

Available tones: `neutral`, `primary`, `success`, `warning` (golden — default), `danger`.

### Half-step interaction

By default, hovering or clicking the **left half** of a star sets a half-rating; the **right half** sets a full rating. Disable for full-step only:

```tsx
<RatingStyled count={5} allowHalf={false} />
```

### Read-only display

```tsx
<RatingStyled
  count={5}
  value={4.5}
  readOnly
  showValue
  label="Avg. rating"
  hint="Based on 248 reviews"
/>
```

### Custom icon (hearts, thumbs, anything)

Pass any SVG. The component clones it twice (empty + filled layers) and clips the filled copy automatically.

```tsx
<RatingStyled
  count={5}
  defaultValue={3}
  tone="danger"
  icon={
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 21s-7-4.35-7-10a4.5 4.5 0 0 1 8-2.83A4.5 4.5 0 0 1 19 11c0 5.65-7 10-7 10z" />
    </svg>
  }
/>
```

### Higher star count

```tsx
<RatingStyled count={10} defaultValue={7.5} size="sm" />
```

### Async submit (Promise-driven pending state)

Return a `Promise` from `onChange` to drive `data-pending` automatically. Stars are non-interactive while the promise is in flight; on rejection the value reverts.

```tsx
<RatingStyled
  count={5}
  defaultValue={0}
  onChange={async (next) => {
    await fetch("/api/reviews", {
      method: "POST",
      body: JSON.stringify({ stars: next }),
    });
  }}
/>
```

The hook also exposes `isPending`.

### Show value badge

```tsx
<RatingStyled
  count={5}
  defaultValue={3.5}
  showValue
  formatValue={(v, c) => `${v} / ${c}`}
/>
```

### Theme via CSS variables

```css
.brand-rating {
  --rrt-color-fill: #ec4899;
  --rrt-color-empty: #fce7f3;
  --rrt-icon-size: 2rem;
}
```

```tsx
<RatingStyled count={5} className="brand-rating" />
```

## API

### `<RatingStyled>`

| Prop          | Type                                                          | Default     | Description                                              |
| ------------- | ------------------------------------------------------------- | ----------- | -------------------------------------------------------- |
| `count`       | `number`                                                      | `5`         | Number of stars.                                         |
| `value`       | `number`                                                      | —           | Controlled value (0..count, in steps of 0.5 by default). |
| `defaultValue`| `number`                                                      | `0`         | Uncontrolled initial value.                              |
| `onChange`    | `(value: number) => void`                                     | —           | Fires on commit (click or keyboard).                     |
| `onHover`     | `(value: number \| null) => void`                             | —           | Fires during hover preview. `null` on pointer leave.     |
| `allowHalf`   | `boolean`                                                     | `true`      | Enable half-step values.                                 |
| `readOnly`    | `boolean`                                                     | `false`     | Display only — no interaction.                           |
| `disabled`    | `boolean`                                                     | `false`     | Disable interaction entirely.                            |
| `clearable`   | `boolean`                                                     | `true`      | Re-clicking the active value clears it to 0.             |
| `size`        | `"sm" \| "md" \| "lg"`                                        | `"md"`      | Size.                                                    |
| `tone`        | `"neutral" \| "primary" \| "success" \| "warning" \| "danger"` | `"warning"` | Color theme for filled stars.                            |
| `icon`        | `ReactNode`                                                   | star SVG    | Custom icon (single node, used for both layers).         |
| `showValue`   | `boolean`                                                     | `false`     | Display the numeric value next to the stars.             |
| `formatValue` | `(value, count) => ReactNode`                                 | —           | Customize the value display (default: `value.toFixed(1)`). |
| `label`       | `ReactNode`                                                   | —           | Label rendered above.                                    |
| `hint`        | `ReactNode`                                                   | —           | Helper text below.                                       |

### `useRating(options)`

Returns `{ value, hoverValue, displayValue, items, rootProps, setValue, clear }`:

- `items[i].itemProps` — spread onto your interactive element (`role="radio"`, keyboard handlers, pointer handlers).
- `items[i].fill` — 0 / 0.5 / 1 — the displayed fill amount (preview if hovering, committed value otherwise).
- `items[i].style` — sets `--rrt-fill` for CSS-based clipping.
- `rootProps` — spread onto the wrapper for `role="radiogroup"`.

### `<Rating>` (headless primitive)

Same options as the hook, plus:

- `renderIcon?: ({ index, fill, isHovered }) => ReactNode` — fully custom per-star rendering.
- `icon?: ReactNode` — single-node custom icon (used for both empty and filled layers).
- `children?: ({ items, value, hoverValue, displayValue, setValue, clear }) => ReactNode` — full render-prop.

## Keyboard nav

| Key                | Action                                            |
| ------------------ | ------------------------------------------------- |
| `←` / `↓`         | Decrease by step (0.5 or 1).                      |
| `→` / `↑`         | Increase by step.                                 |
| `Home`             | Set to 0.                                         |
| `End`              | Set to count (max).                               |
| `Space` / `Enter`  | Set to focused star (or clear if already active and clearable). |

## CSS variables

Override on `.rrt-wrap`, on the root via `className`, or on `:root`:

| Variable              | Default      | Description                       |
| --------------------- | ------------ | --------------------------------- |
| `--rrt-color-fill`    | `#f59e0b`    | Filled star color (varies by tone). |
| `--rrt-color-empty`   | `#d4d4d8`    | Empty star color.                 |
| `--rrt-color-hover-glow` | golden glow | Focus ring tint.                |
| `--rrt-icon-size`     | `1.5rem`     | Star size.                        |
| `--rrt-gap`           | `0.15rem`    | Gap between stars.                |
| `--rrt-duration`      | `200ms`      | Transition duration.              |

The styled component automatically:

- Switches palette under `prefers-color-scheme: dark`
- Disables animations under `prefers-reduced-motion: reduce`
- Forwards `ref` to the root `<div>`

## Browser support

Uses `clip-path` for half-fill (universally supported in evergreen browsers). SSR-safe — does nothing at import time.

## License

MIT © Shafiq Yajid

## Form integration

```tsx
<form>
  <RatingStyled
    name="stars"
    label="Rating"
    hint="Click to rate"
    defaultValue={0}
    required
    error={errors.stars}
  />
</form>
```

| Prop | Type | Description |
|---|---|---|
| `name` | `string` | Renders a hidden input with the numeric value |
| `id` | `string` | Wrapper id used for label association |
| `required` | `boolean` | aria-required on the radiogroup + required on the hidden input |
| `error` / `invalid` | `ReactNode` / `boolean` | Flips tone to danger and sets `data-invalid` |
