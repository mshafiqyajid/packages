# @mshafiqyajid/react-text-input

Headless text input hook and styled component for React. Supports text/email/password/url with size, tone, prefix/suffix slots, label, hint, error, success, loading, password reveal, and a clear button.

**[Full docs →](https://docs.shafiqyajid.com/react/text-input/)**

## Install

```bash
npm install @mshafiqyajid/react-text-input
```

## Headless usage

```tsx
import { useTextInput } from "@mshafiqyajid/react-text-input";

function MyField() {
  const { inputProps, value } = useTextInput({ defaultValue: "" });
  return <input {...inputProps} placeholder="Type here" />;
}
```

## Styled usage

```tsx
import { TextInputStyled } from "@mshafiqyajid/react-text-input/styled";
import "@mshafiqyajid/react-text-input/styles.css";

<TextInputStyled
  label="Email"
  required
  type="email"
  placeholder="you@example.com"
  clearable
/>
```

## Validation

Pass `error` to flip tone to danger and show a message under the field. Pass `success` for the opposite — green border + check.

```tsx
<TextInputStyled
  label="Email"
  type="email"
  value={email}
  onChange={setEmail}
  error={!email.includes("@") ? "Invalid email" : undefined}
  success={email.length > 0 && email.includes("@")}
/>
```

## Password reveal

```tsx
<TextInputStyled
  label="Password"
  type="password"
  passwordToggle
  required
/>
```

## Character counter

When `maxLength` is set, a counter appears automatically. Pass `showCount={false}` to hide it, or `showCount` without a max to show just the running length.

```tsx
<TextInputStyled
  label="Bio"
  maxLength={120}
  hint="Keep it short."
/>
```

## Prefix / suffix

```tsx
<TextInputStyled
  prefix={<span>$</span>}
  suffix={<span>USD</span>}
  placeholder="0.00"
/>
```

## Loading state

Show a spinner suffix while async work is in flight (e.g., debounced server validation).

```tsx
<TextInputStyled label="Username" loading={isCheckingAvailability} />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | — | Controlled value |
| `defaultValue` | `string` | `""` | Uncontrolled initial value |
| `onChange` | `(value: string) => void` | — | Called on every change |
| `type` | `"text" \| "email" \| "password" \| "url" \| "search" \| "tel"` | `"text"` | Input type |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Size |
| `tone` | `"neutral" \| "primary" \| "success" \| "danger"` | `"neutral"` | Color |
| `label` | `ReactNode` | — | Label rendered above the field |
| `required` | `boolean` | `false` | Append a red asterisk to the label |
| `block` | `boolean` | `false` | Full-width |
| `clearable` | `boolean` | `false` | Show clear (✕) button |
| `passwordToggle` | `boolean` | `false` | Show eye toggle for `type="password"` |
| `loading` | `boolean` | `false` | Show spinner suffix |
| `success` | `boolean` | `false` | Apply success tone + check icon |
| `prefix` | `ReactNode` | — | Slot before the input |
| `suffix` | `ReactNode` | — | Slot after the input |
| `hint` | `ReactNode` | — | Helper text below the field |
| `error` | `ReactNode` | — | Error message — auto-applies danger tone |
| `maxLength` | `number` | — | Max characters; auto-shows counter |
| `showCount` | `boolean` | auto | Show/hide character counter |
| `disabled` | `boolean` | `false` | Disable |
| `readOnly` | `boolean` | `false` | Read only |

## License

MIT
