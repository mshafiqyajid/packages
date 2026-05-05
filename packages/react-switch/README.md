# @mshafiqyajid/react-switch

Headless toggle switch hook and styled component for React. Accessible, keyboard-friendly, animated, fully typed.

**[Full docs →](https://docs.shafiqyajid.com/react/switch/)**

## Install

```bash
npm install @mshafiqyajid/react-switch
```

## Headless usage

```tsx
import { useSwitch } from "@mshafiqyajid/react-switch";

function MySwitch() {
  const { switchProps, isChecked } = useSwitch({ defaultChecked: false });
  return <button {...switchProps}>{isChecked ? "On" : "Off"}</button>;
}
```

## Styled usage

```tsx
import { SwitchStyled } from "@mshafiqyajid/react-switch/styled";
import "@mshafiqyajid/react-switch/styles.css";

function App() {
  return (
    <SwitchStyled
      label="Enable notifications"
      defaultChecked
      tone="primary"
      size="md"
    />
  );
}
```

## Async toggle

Return a `Promise` from `onChange` to drive the pending state automatically. The switch shows a spinner during the promise, blocks further clicks, and reverts the optimistic value on rejection.

```tsx
<SwitchStyled
  label="Email notifications"
  defaultChecked
  onChange={async (next) => {
    await fetch("/api/prefs/email", {
      method: "POST",
      body: JSON.stringify({ enabled: next }),
    });
  }}
/>
```

The hook also exposes `isPending` for headless consumers. The rendered switch lands `aria-busy="true"` + `data-pending="true"` while the promise is in flight.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `checked` | `boolean` | — | Controlled checked state |
| `defaultChecked` | `boolean` | `false` | Uncontrolled initial state |
| `onChange` | `(v: boolean) => void \| Promise<void>` | — | Called on toggle. Return a Promise to drive a pending state automatically; reverts on rejection. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Size |
| `tone` | `"neutral" \| "primary" \| "success" \| "danger"` | `"primary"` | Color when on |
| `label` | `ReactNode` | — | Label text |
| `labelPosition` | `"left" \| "right"` | `"right"` | Label side |
| `loading` | `boolean` | `false` | Force spinner in thumb. Auto-set when onChange returns a Promise. |
| `disabled` | `boolean` | `false` | Disable the switch |

## License

MIT
