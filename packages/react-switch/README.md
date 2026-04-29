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

## License

MIT
