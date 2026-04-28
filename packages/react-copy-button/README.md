# @mshafiqyajid/react-copy-button

A tiny, beautifully styled copy-to-clipboard toolkit for React. Comes in two flavors:

- **Styled** — `<CopyButtonStyled>` with modern defaults: variants, sizes, tones, dark mode, animated copied state, async loading spinner, optional tooltip, full a11y.
- **Headless** — `useCopyToClipboard()` hook + unstyled `<CopyButton>` primitive. Bring your own UI.

Zero dependencies. SSR-safe. Fully typed. ESM + CJS.

## Install

```bash
npm install @mshafiqyajid/react-copy-button
```

Peer dependency: `react >= 17`.

## Quick start

### Styled (recommended)

```tsx
import { CopyButtonStyled } from "@mshafiqyajid/react-copy-button/styled";
import "@mshafiqyajid/react-copy-button/styles.css";

export function Example() {
  return <CopyButtonStyled text="hello world" tone="primary" />;
}
```

### Headless

```tsx
import { CopyButton } from "@mshafiqyajid/react-copy-button";

export function Example() {
  return (
    <CopyButton text="hello world" copiedLabel="Copied!">
      Copy
    </CopyButton>
  );
}
```

### Hook

```tsx
import { useCopyToClipboard } from "@mshafiqyajid/react-copy-button";

function MyButton() {
  const { copy, copied } = useCopyToClipboard({ resetAfter: 2000 });
  return (
    <button onClick={() => void copy("hello")}>
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}
```

## Recipes

### Variants and tones

```tsx
<CopyButtonStyled text="x" variant="solid"   tone="primary" />
<CopyButtonStyled text="x" variant="outline" tone="primary" />
<CopyButtonStyled text="x" variant="ghost"   tone="danger"  />
<CopyButtonStyled text="x" variant="subtle"  tone="success" />
```

### Sizes

```tsx
<CopyButtonStyled text="x" size="sm" />
<CopyButtonStyled text="x" size="md" />          {/* default */}
<CopyButtonStyled text="x" size="lg" />
<CopyButtonStyled text="x" size="icon" aria-label="Copy" />
```

### Async source with auto-loading spinner

```tsx
<CopyButtonStyled
  text={async () => fetchToken()}
  label="Generate & copy"
/>
```

The spinner shows automatically while the async function resolves. Override with `loading={true|false}` to control manually.

### Tooltip

```tsx
<CopyButtonStyled text="x" tooltip="Copy to clipboard (⌘C)" />
```

### Custom icons

```tsx
<CopyButtonStyled
  text="x"
  icon={{
    copy:  <MyCopyIcon />,
    check: <MyCheckIcon />,
  }}
/>

{/* hide the icon entirely */}
<CopyButtonStyled text="x" icon={false} />
```

### Render-prop (headless)

```tsx
<CopyButton text="abc-123">
  {({ copied, copy }) => (
    <button onClick={copy}>{copied ? "Done!" : "Copy"}</button>
  )}
</CopyButton>
```

### Theme via CSS variables

The styled button is themed entirely with CSS variables. Override globally or scope per-element:

```css
.brand-button {
  --rcb-bg: #6366f1;
  --rcb-bg-hover: #4f46e5;
  --rcb-fg: white;
  --rcb-radius: 999px;
}
```

```tsx
<CopyButtonStyled text="x" className="brand-button" />
```

You can also force a theme with the `data-rcb-theme` attribute on any ancestor:

```tsx
<div data-rcb-theme="dark">
  <CopyButtonStyled text="x" />  {/* always dark */}
</div>
```

Without `data-rcb-theme`, the component follows `prefers-color-scheme`.

## API

### `<CopyButtonStyled>`

| Prop             | Type                                            | Default     | Description                                                                |
| ---------------- | ----------------------------------------------- | ----------- | -------------------------------------------------------------------------- |
| `text`           | `string \| () => string \| Promise<string>`     | —           | Required. The text to copy.                                                |
| `label`          | `ReactNode`                                     | `"Copy"`    | Default-state label. Pass `""` for icon-only.                              |
| `copiedLabel`    | `ReactNode`                                     | `"Copied"`  | Label after a successful copy.                                             |
| `variant`        | `"solid" \| "outline" \| "ghost" \| "subtle"`   | `"solid"`   | Visual variant.                                                            |
| `size`           | `"sm" \| "md" \| "lg" \| "icon"`                | `"md"`      | Size. `"icon"` makes a square icon-only button (provide `aria-label`).     |
| `tone`           | `"neutral" \| "primary" \| "success" \| "danger"` | `"neutral"` | Color theme.                                                               |
| `fullWidth`      | `boolean`                                       | `false`     | Stretch to container width.                                                |
| `iconPosition`   | `"left" \| "right"`                             | `"left"`    | Icon side relative to label.                                               |
| `icon`           | `boolean \| { copy?, check? }`                  | `true`      | Toggle the icon, or pass custom copy/check icons.                          |
| `loading`        | `boolean \| "auto"`                             | `"auto"`    | Show spinner. `"auto"` = while async `text` resolves.                      |
| `tooltip`        | `ReactNode`                                     | —           | Tooltip on hover/focus.                                                    |
| `announceOnCopy` | `boolean \| string`                             | `true`      | Screen-reader announcement. Pass a string to customize.                    |
| `resetAfter`     | `number` (ms)                                   | `2000`      | Time before `copied` flips back. Set `0` to disable.                       |
| `onCopy`         | `(text: string) => void`                        | —           | Called after a successful copy.                                            |
| `onError`        | `(error: Error) => void`                        | —           | Called on copy failure.                                                    |

Also accepts all standard `<button>` HTML attributes (className, style, disabled, aria-*, etc.).

### `useCopyToClipboard(options?)`

| Option       | Type                     | Default | Description                                          |
| ------------ | ------------------------ | ------- | ---------------------------------------------------- |
| `resetAfter` | `number` (ms)            | `2000`  | Time before `copied` flips back. `0` disables.       |
| `onCopy`     | `(text: string) => void` | —       | Called after a successful copy with the text.        |
| `onError`    | `(error: Error) => void` | —       | Called on copy failure.                              |

Returns:

| Field    | Type                                                                      | Description                                          |
| -------- | ------------------------------------------------------------------------- | ---------------------------------------------------- |
| `copy`   | `(source: string \| () => string \| Promise<string>) => Promise<boolean>` | Copy. Resolves `true` on success.                    |
| `copied` | `boolean`                                                                 | `true` for `resetAfter` ms after a successful copy.  |
| `error`  | `Error \| null`                                                           | Last error, if any.                                  |
| `reset`  | `() => void`                                                              | Manually clear `copied` and `error`.                 |

### `<CopyButton>` (headless)

Standard `<button>` props (except `onCopy`/`onError`/`onClick`/`children` — repurposed) plus `useCopyToClipboard` options, plus:

| Prop          | Type                                                  | Description                                                   |
| ------------- | ----------------------------------------------------- | ------------------------------------------------------------- |
| `text`        | `string \| () => string \| Promise<string>`           | Required. The text to copy.                                   |
| `copiedLabel` | `ReactNode`                                           | Label shown while `copied` is `true`.                         |
| `children`    | `ReactNode \| ({ copied, error, copy }) => ReactNode` | Default: `"Copy"`. Pass a function for full custom rendering. |

The button receives `data-copied="true"` while in the copied state — handy for CSS styling.

## CSS variables (styled)

Override any of these on `.rcb-button`, on any wrapper class, or on `:root`:

| Variable               | Default (light)    | Description                  |
| ---------------------- | ------------------ | ---------------------------- |
| `--rcb-bg`             | `#18181b`          | Background                   |
| `--rcb-bg-hover`       | `#27272a`          | Hover background             |
| `--rcb-bg-active`      | `#09090b`          | Active background            |
| `--rcb-fg`             | `#fafafa`          | Foreground/text              |
| `--rcb-border`         | `transparent`      | Border color                 |
| `--rcb-border-width`   | `1px`              | Border width                 |
| `--rcb-ring`           | indigo glow        | Focus ring                   |
| `--rcb-success-bg`     | `#16a34a`          | Background while copied      |
| `--rcb-success-fg`     | `#ffffff`          | Foreground while copied      |
| `--rcb-radius`         | `8px`              | Corner radius                |
| `--rcb-padding-y`      | `0.5rem`           | Vertical padding             |
| `--rcb-padding-x`      | `0.95rem`          | Horizontal padding           |
| `--rcb-gap`            | `0.5rem`           | Icon ↔ label gap             |
| `--rcb-font-size`      | `0.875rem`         | Font size                    |
| `--rcb-font-weight`    | `500`              | Font weight                  |
| `--rcb-letter-spacing` | `0`                | Letter spacing               |
| `--rcb-line-height`    | `1.2`              | Line height                  |
| `--rcb-shadow`         | subtle             | Resting shadow               |
| `--rcb-shadow-hover`   | medium             | Hover shadow                 |
| `--rcb-shadow-active`  | inset              | Active shadow                |
| `--rcb-shadow-focus`   | ring               | Focus shadow                 |
| `--rcb-duration`       | `200ms`            | Transition duration          |
| `--rcb-ease`           | spring curve       | Transition easing            |
| `--rcb-icon-size`      | `1em`              | Icon size                    |

The styled component automatically:

- Switches palette under `prefers-color-scheme: dark`
- Disables animations under `prefers-reduced-motion: reduce`
- Announces copies to screen readers via a polite live region
- Forwards `ref` to the underlying `<button>`

## Browser support

Uses `navigator.clipboard.writeText` when available (secure contexts only). Falls back to `document.execCommand("copy")` otherwise. SSR-safe — does nothing at import time.

## License

MIT © Shafiq Yajid
