# @mshafiqyajid/react-checkbox

Headless checkbox hook and styled component for React. Indeterminate state, helper description, error state, card variant, accessible, keyboard-friendly, fully typed.

**[Full docs →](https://docs.shafiqyajid.com/react/checkbox/)**

## Install

```bash
npm install @mshafiqyajid/react-checkbox
```

## Headless usage

```tsx
import { useCheckbox } from "@mshafiqyajid/react-checkbox";

function MyCheckbox() {
  const { checkboxProps, isChecked } = useCheckbox({ defaultChecked: false });
  return <button {...checkboxProps}>{isChecked ? "✓" : ""}</button>;
}
```

## Styled usage

```tsx
import { CheckboxStyled } from "@mshafiqyajid/react-checkbox/styled";
import "@mshafiqyajid/react-checkbox/styles.css";

<CheckboxStyled
  label="I agree to the terms"
  description="You can revoke this any time in settings."
  required
  tone="primary"
/>
```

## Indeterminate

Pass `"indeterminate"` (or `defaultChecked="indeterminate"`) for tri-state. Clicking from indeterminate moves to checked.

```tsx
<CheckboxStyled checked="indeterminate" onChange={(c) => /* ... */} />
```

## Card variant

`card` renders the row inside a bordered, clickable card — handy for large form options.

```tsx
<CheckboxStyled
  card
  label="Email me product updates"
  description="At most twice a month — never spam."
/>
```

## Validation

Pass an `error` message to flip tone to danger and render a message under the row.

```tsx
<CheckboxStyled
  checked={agree}
  onChange={setAgree}
  label="I accept the terms"
  required
  error={!agree ? "You must accept to continue" : undefined}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `checked` | `boolean \| "indeterminate"` | — | Controlled state |
| `defaultChecked` | `boolean \| "indeterminate"` | `false` | Uncontrolled initial state |
| `onChange` | `(checked: boolean) => void` | — | Always emits boolean |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Size |
| `tone` | `"neutral" \| "primary" \| "success" \| "danger"` | `"primary"` | Color when checked |
| `label` | `ReactNode` | — | Label |
| `description` | `ReactNode` | — | Helper text below the label |
| `error` | `ReactNode` | — | Error message — flips tone to danger |
| `labelPosition` | `"left" \| "right"` | `"right"` | Label side |
| `card` | `boolean` | `false` | Bordered card with whole-row click |
| `required` | `boolean` | `false` | Append a red asterisk to the label |
| `disabled` | `boolean` | `false` | Disable |

## License

MIT
