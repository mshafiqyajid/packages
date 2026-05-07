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

## What's new in 0.3.0

### `confirm` guard

Pass `confirm` to intercept the toggle before it is committed. If it returns `false` or a Promise that resolves to `false` (or rejects), the switch reverts. While the Promise is pending, the track crossfades to a neutral grey and `aria-busy="true"` is set.

```tsx
<SwitchStyled
  label="Delete account"
  confirm={async (next) => {
    const ok = await showConfirmDialog(`Turn ${next ? "on" : "off"}?`);
    return ok;
  }}
  onChange={async (next) => { /* only called if confirm resolves true */ }}
/>
```

### Track labels — `onLabel` / `offLabel`

Render text or icons inside the track halves. Opacity-transition hides the label behind the thumb's shadow zone and reveals it in the opposite half.

```tsx
<SwitchStyled onLabel="ON" offLabel="OFF" />
<SwitchStyled onLabel={<CheckIcon />} offLabel={<XIcon />} />
```

CSS classes: `rsw-track-label rsw-track-label--on` / `rsw-track-label--off`.

### Thumb icon slots — `thumbIconOn` / `thumbIconOff`

Render an icon inside the thumb circle that cross-fades (180 ms ease) between on and off states.

```tsx
<SwitchStyled thumbIconOn={<SunIcon />} thumbIconOff={<MoonIcon />} />
```

CSS classes: `rsw-thumb-icon`, `rsw-thumb-icon__on`, `rsw-thumb-icon__off`.

Both spinner and thumb icons respect `prefers-reduced-motion`.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `checked` | `boolean` | — | Controlled checked state |
| `defaultChecked` | `boolean` | `false` | Uncontrolled initial state |
| `onChange` | `(v: boolean) => void \| Promise<void>` | — | Called on toggle. Return a Promise to drive a pending state automatically; reverts on rejection. |
| `confirm` | `(next: boolean) => boolean \| Promise<boolean>` | — | Guard called before committing. Return/resolve `false` to cancel. A Promise triggers pending state while awaiting. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Size |
| `tone` | `"neutral" \| "primary" \| "success" \| "danger"` | `"primary"` | Color when on |
| `label` | `ReactNode` | — | Label text |
| `labelPosition` | `"left" \| "right"` | `"right"` | Label side |
| `loading` | `boolean` | `false` | Force spinner in thumb. Auto-set when onChange returns a Promise. |
| `disabled` | `boolean` | `false` | Disable the switch |
| `onLabel` | `ReactNode` | — | Content rendered inside track on the "on" side |
| `offLabel` | `ReactNode` | — | Content rendered inside track on the "off" side |
| `thumbIconOn` | `ReactNode` | — | Icon inside thumb when on; cross-fades with thumbIconOff |
| `thumbIconOff` | `ReactNode` | — | Icon inside thumb when off; cross-fades with thumbIconOn |

## License

MIT
