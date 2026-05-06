# @mshafiqyajid/react-checkbox

Headless checkbox hook and styled component for React. Indeterminate state, accessible, keyboard-friendly, fully typed.

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

<CheckboxStyled label="I agree to the terms" tone="primary" />
```

## Indeterminate

Pass `"indeterminate"` (or `defaultChecked="indeterminate"`) for tri-state. Clicking from the indeterminate state moves to checked.

```tsx
<CheckboxStyled checked="indeterminate" onChange={(c) => /* ... */} />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `checked` | `boolean \| "indeterminate"` | — | Controlled state |
| `defaultChecked` | `boolean \| "indeterminate"` | `false` | Uncontrolled initial state |
| `onChange` | `(checked: boolean) => void` | — | Called on toggle (always emits boolean — never `"indeterminate"`) |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Size |
| `tone` | `"neutral" \| "primary" \| "success" \| "danger"` | `"primary"` | Color when checked |
| `label` | `ReactNode` | — | Label |
| `labelPosition` | `"left" \| "right"` | `"right"` | Label side |
| `disabled` | `boolean` | `false` | Disable |

## License

MIT
