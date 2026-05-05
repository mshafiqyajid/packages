# @mshafiqyajid/react-otp-input

**[Full docs →](https://docs.shafiqyajid.com/react/otp-input/)**

A tiny, beautifully styled OTP / verification-code input for React. Comes in two flavors:

- **Styled** — `<OTPInputStyled>` with variants, sizes, tones, animated focus ring, masking, and full a11y.
- **Headless** — `useOTP()` hook + unstyled `<OTPInput>` primitive. Bring your own UI.

Smart paste (paste a 6-digit code anywhere → fills all slots). Full keyboard navigation. Zero dependencies. SSR-safe. Fully typed. ESM + CJS.

## Install

```bash
npm install @mshafiqyajid/react-otp-input
```

Peer dependency: `react >= 17`.

## Quick start

### Styled (recommended)

```tsx
import { OTPInputStyled } from "@mshafiqyajid/react-otp-input/styled";
import "@mshafiqyajid/react-otp-input/styles.css";

export function Verify() {
  return (
    <OTPInputStyled
      length={6}
      tone="primary"
      onComplete={(code) => verifyCode(code)}
      autoFocus
    />
  );
}
```

### Headless

```tsx
import { OTPInput } from "@mshafiqyajid/react-otp-input";

export function Verify() {
  return (
    <OTPInput
      length={6}
      onComplete={(code) => verifyCode(code)}
      style={{ display: "flex", gap: 8 }}
    />
  );
}
```

### Hook (full custom UI)

```tsx
import { useOTP } from "@mshafiqyajid/react-otp-input";

function Verify() {
  const { slots, value, isComplete } = useOTP({
    length: 6,
    onComplete: (code) => verifyCode(code),
  });

  return (
    <div className="my-otp">
      {slots.map((slot) => (
        <input key={slot.index} {...slot.inputProps} className="my-slot" />
      ))}
    </div>
  );
}
```

## Recipes

### Variants and tones

```tsx
<OTPInputStyled length={6} variant="solid"     tone="primary" />
<OTPInputStyled length={6} variant="outline"   tone="success" />
<OTPInputStyled length={6} variant="underline" tone="danger"  />
```

### Sizes

```tsx
<OTPInputStyled length={6} size="sm" />
<OTPInputStyled length={6} size="md" />   {/* default */}
<OTPInputStyled length={6} size="lg" />
```

### Group separator (formatted display)

```tsx
{/* renders "123 - 456" */}
<OTPInputStyled length={6} groupSize={3} />

{/* custom separator */}
<OTPInputStyled length={6} groupSize={3} separator={<span>·</span>} />
```

### Masking (password-style)

```tsx
<OTPInputStyled length={6} mask />
{/* or with a custom char */}
<OTPInputStyled length={6} mask maskChar="*" />
```

### Custom pattern (alphanumeric, regex, function)

```tsx
<OTPInputStyled length={6} pattern="alphanumeric" />
<OTPInputStyled length={4} pattern={/^[A-F0-9]$/} />
<OTPInputStyled length={4} pattern={(c) => "abc123".includes(c)} />
```

### Label, hint, and error

```tsx
<OTPInputStyled
  length={6}
  label="Enter the code from your email"
  hint="We sent a 6-digit code to ada@example.com"
  error={status === "wrong" ? "That code didn't match. Try again." : undefined}
/>
```

### Controlled

```tsx
const [code, setCode] = useState("");
<OTPInputStyled length={6} value={code} onChange={setCode} />
```

### Theme via CSS variables

The styled component is themed entirely with CSS variables. Override globally or scope per-element:

```css
.brand-otp {
  --rotp-border-active: #6366f1;
  --rotp-border-filled: #18181b;
  --rotp-radius: 12px;
  --rotp-slot-size: 3rem;
}
```

```tsx
<OTPInputStyled length={6} className="brand-otp" />
```

Force a theme without `prefers-color-scheme`:

```tsx
<div data-rotp-theme="dark">
  <OTPInputStyled length={6} />  {/* always dark */}
</div>
```

## API

### `<OTPInputStyled>`

| Prop           | Type                                                 | Default     | Description                                                              |
| -------------- | ---------------------------------------------------- | ----------- | ------------------------------------------------------------------------ |
| `length`       | `number`                                             | `6`         | Number of slots.                                                         |
| `value`        | `string`                                             | —           | Controlled value.                                                        |
| `defaultValue` | `string`                                             | `""`        | Uncontrolled initial value.                                              |
| `onChange`     | `(value: string) => void`                            | —           | Fires whenever the value changes.                                        |
| `onComplete`   | `(value: string) => void`                            | —           | Fires when every slot is filled.                                         |
| `pattern`      | `"numeric" \| "alphanumeric" \| "any" \| RegExp \| (c) => boolean` | `"numeric"` | Allowed characters.                                                      |
| `uppercase`    | `boolean`                                            | `true`      | Uppercase letters before insertion.                                      |
| `autoFocus`    | `boolean`                                            | `false`     | Focus the first empty slot on mount.                                     |
| `disabled`     | `boolean`                                            | `false`     | Disable all slots.                                                       |
| `readOnly`     | `boolean`                                            | `false`     | User can copy but not edit.                                              |
| `variant`      | `"solid" \| "outline" \| "underline"`                | `"solid"`   | Visual style.                                                            |
| `size`         | `"sm" \| "md" \| "lg"`                               | `"md"`      | Size.                                                                    |
| `tone`         | `"neutral" \| "primary" \| "success" \| "danger"`    | `"neutral"` | Color theme. Auto-flips to `"danger"` when `error` is set.               |
| `mask`         | `boolean`                                            | `false`     | Show `maskChar` instead of the typed character.                          |
| `maskChar`     | `string`                                             | `"•"`       | Character to render when masking.                                        |
| `groupSize`    | `number`                                             | —           | Insert a separator after every N slots (e.g. `3` → "123-456").           |
| `separator`    | `ReactNode`                                          | dash        | Element to render as separator when `groupSize` is set.                  |
| `label`        | `ReactNode`                                          | —           | Label above the inputs (associated via `aria-labelledby`).               |
| `hint`         | `ReactNode`                                          | —           | Helper text below.                                                       |
| `error`        | `ReactNode`                                          | —           | Error text. Sets `aria-invalid`, flips `tone` to `"danger"`, plays a shake animation. |

### `useOTP(options?)`

Returns `{ value, isComplete, slots, clear, setValue, focusSlot }`. Each `slot` includes an `inputProps` object you spread onto your `<input>`:

```tsx
const { slots } = useOTP({ length: 6 });
slots.map((s) => <input key={s.index} {...s.inputProps} />);
```

### `<OTPInput>` (headless primitive)

Same options as `useOTP`, plus:

- `renderSlot?: (slot) => ReactNode` — replace the default `<input>` with your own.
- `children?: ({ slots, value, isComplete, clear }) => ReactNode` — full custom render.
- `inputProps?: ...` — extra props applied to every default-rendered input.

## CSS variables (styled)

Override on `.rotp-root`, on a wrapper class, or `:root`:

| Variable                | Default           | Description                  |
| ----------------------- | ----------------- | ---------------------------- |
| `--rotp-fg`             | `#18181b`         | Text color                   |
| `--rotp-bg`             | `#ffffff`         | Slot background              |
| `--rotp-border`         | `#e4e4e7`         | Resting border               |
| `--rotp-border-hover`   | `#d4d4d8`         | Hover border                 |
| `--rotp-border-active`  | `#6366f1`         | Focused border               |
| `--rotp-border-filled`  | `#18181b`         | Filled-slot border           |
| `--rotp-ring`           | indigo glow       | Focus ring                   |
| `--rotp-error-fg`       | `#dc2626`         | Error text color             |
| `--rotp-radius`         | `8px`             | Slot corner radius           |
| `--rotp-slot-size`      | `2.75rem`         | Slot width/height            |
| `--rotp-slot-font-size` | `1.125rem`        | Slot font size               |
| `--rotp-gap`            | `0.5rem`          | Gap between slots            |
| `--rotp-duration`       | `200ms`           | Transition duration          |

The styled component automatically:

- Switches palette under `prefers-color-scheme: dark`
- Disables animations under `prefers-reduced-motion: reduce`
- Forwards `ref` to the container `<div>`
- Sets `inputMode="numeric"` for numeric patterns (better mobile keyboard)
- Sets `autoComplete="one-time-code"` on the first slot for iOS / Android SMS autofill

## Browser support

Modern evergreen browsers. SSR-safe — does nothing at import time.

## License

MIT © Shafiq Yajid

## Form integration

```tsx
<form>
  <OTPInputStyled
    length={6}
    name="code"
    label="Verification code"
    error={errors.code}
    required
  />
</form>
```

| Prop | Type | Description |
|---|---|---|
| `name` | `string` | Renders a hidden input with the joined OTP value (works controlled or uncontrolled — the styled component mirrors the live value) |
| `id` | `string` | Wrapper id used for label association |

The other contract props (`label`, `hint`, `error`, `invalid`, `required`) were already supported. With `name`, the input is now a drop-in for native HTML forms.
