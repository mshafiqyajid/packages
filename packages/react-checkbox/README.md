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

## What's new in 0.4.0

### CheckboxGroup

Group multiple checkboxes into a controlled or uncontrolled fieldset. Each child `CheckboxStyled` with a `value` prop automatically participates in the group's selection array.

```tsx
import { CheckboxGroup, CheckboxStyled } from "@mshafiqyajid/react-checkbox/styled";
import "@mshafiqyajid/react-checkbox/styles.css";

function NotificationPrefs() {
  const [values, setValues] = useState(["email"]);
  return (
    <CheckboxGroup
      label="Notify me about…"
      hint="Choose the updates you want to receive."
      value={values}
      onChange={setValues}
    >
      <CheckboxStyled value="email" label="Email updates" />
      <CheckboxStyled value="sms" label="SMS alerts" />
      <CheckboxStyled value="push" label="Push notifications" />
    </CheckboxGroup>
  );
}
```

**CheckboxGroup props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | — | Shared name for child inputs |
| `value` | `string[]` | — | Controlled selection |
| `defaultValue` | `string[]` | `[]` | Uncontrolled initial selection |
| `onChange` | `(values: string[]) => void` | — | Called on every toggle |
| `disabled` | `boolean` | `false` | Disable all child checkboxes |
| `label` | `ReactNode` | — | Fieldset legend |
| `hint` | `ReactNode` | — | Helper text below legend |
| `error` | `ReactNode` | — | Error message below items |
| `invalid` | `boolean` | `false` | Mark all children invalid |
| `required` | `boolean` | `false` | Append a red asterisk to the legend |

### useCheckboxTree

Manages a tree of checkboxes where parent state is derived from children. A parent is `indeterminate` when some (not all) of its leaf descendants are checked; it is checked only when all are checked.

```tsx
import { useCheckboxTree } from "@mshafiqyajid/react-checkbox";
import { CheckboxStyled } from "@mshafiqyajid/react-checkbox/styled";

const nodes = [
  {
    id: "fruits",
    label: "Fruits",
    children: [
      { id: "apple", label: "Apple" },
      { id: "banana", label: "Banana" },
    ],
  },
];

function TreeExample() {
  const { getCheckboxProps, toggleAll } = useCheckboxTree(nodes);
  return (
    <div>
      <button onClick={toggleAll}>Toggle all</button>
      <CheckboxStyled label="Fruits" {...getCheckboxProps("fruits")} />
      <div style={{ paddingLeft: 24 }}>
        <CheckboxStyled label="Apple" {...getCheckboxProps("apple")} />
        <CheckboxStyled label="Banana" {...getCheckboxProps("banana")} />
      </div>
    </div>
  );
}
```

### Animated SVG checkmark draw

The checkmark path now draws via `stroke-dashoffset` over 180 ms ease-out when a checkbox is checked. The indeterminate bar morphs in similarly. Both honour `prefers-reduced-motion`.

## License

MIT
