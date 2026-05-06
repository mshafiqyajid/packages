# @mshafiqyajid/react-text-input

Headless text input hook and styled component for React. Supports text/email/password/url with size, tone, prefix/suffix slots, and a clear button.

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
  type="email"
  placeholder="you@example.com"
  clearable
/>
```

## Validation

Pass `error` to flip tone to danger and show a message under the field.

```tsx
<TextInputStyled
  type="email"
  value={email}
  onChange={setEmail}
  error={!email.includes("@") ? "Invalid email" : undefined}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | — | Controlled value |
| `defaultValue` | `string` | `""` | Uncontrolled initial value |
| `onChange` | `(value: string) => void` | — | Called on every change |
| `type` | `"text" \| "email" \| "password" \| "url" \| "search" \| "tel"` | `"text"` | HTML input type |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Size |
| `tone` | `"neutral" \| "primary" \| "success" \| "danger"` | `"neutral"` | Color |
| `block` | `boolean` | `false` | Full-width |
| `clearable` | `boolean` | `false` | Show clear (✕) button |
| `prefix` | `ReactNode` | — | Slot before the input |
| `suffix` | `ReactNode` | — | Slot after the input |
| `hint` | `ReactNode` | — | Helper text below the field |
| `error` | `ReactNode` | — | Error message — auto-applies danger tone |
| `disabled` | `boolean` | `false` | Disable |
| `readOnly` | `boolean` | `false` | Read only |

## License

MIT
