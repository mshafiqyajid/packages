# @mshafiqyajid/react-chip

Chip component with selection, dismissal, tones, and icon support. Headless hook + styled component, fully accessible, dark mode, animated.

**[Full docs →](https://docs.shafiqyajid.com/react/chip/)**

## Install

```bash
npm install @mshafiqyajid/react-chip
```

## Quick start

```tsx
import { ChipStyled } from "@mshafiqyajid/react-chip/styled";
import "@mshafiqyajid/react-chip/styles.css";

<ChipStyled tone="primary" variant="subtle">Label</ChipStyled>
<ChipStyled tone="success" selectable>Selectable</ChipStyled>
<ChipStyled tone="danger" dismissible>Dismissible</ChipStyled>
```

## Selectable chips

```tsx
const [selected, setSelected] = useState(false);

<ChipStyled
  tone="primary"
  selectable
  selected={selected}
  onSelect={setSelected}
>
  Toggle me
</ChipStyled>
```

## Dismissible chips

```tsx
<ChipStyled
  tone="neutral"
  dismissible
  onDismiss={() => console.log("dismissed")}
>
  Remove me
</ChipStyled>
```

## Headless usage

```tsx
import { useChip } from "@mshafiqyajid/react-chip";

function MyChip({ label }: { label: string }) {
  const { chipProps, dismissProps, isSelected, isDismissed, dismiss } = useChip({
    selectable: true,
    dismissible: true,
    onDismiss: () => console.log("gone"),
  });

  if (isDismissed) return null;

  return (
    <span {...chipProps} className="my-chip">
      {label}
      <button {...dismissProps}>×</button>
    </span>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"solid" \| "subtle" \| "outline" \| "soft"` | `"subtle"` | Visual style |
| `tone` | `"neutral" \| "primary" \| "success" \| "warning" \| "danger" \| "info"` | `"neutral"` | Color tone |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Size scale |
| `selectable` | `boolean` | `false` | Enable selection toggle |
| `selected` | `boolean` | — | Controlled selected state |
| `defaultSelected` | `boolean` | `false` | Uncontrolled initial selected state |
| `onSelect` | `(selected: boolean) => void` | — | Called when selection changes |
| `dismissible` | `boolean` | `false` | Show dismiss button |
| `onDismiss` | `() => void` | — | Called when chip is dismissed |
| `icon` | `ReactNode` | — | Leading icon |
| `iconRight` | `ReactNode` | — | Trailing icon |
| `avatar` | `ReactNode` | — | Leading avatar (takes priority over icon) |
| `disabled` | `boolean` | `false` | Disable all interactions |
| `children` | `ReactNode` | — | Chip label (required) |
| `className` | `string` | — | Extra class on the root element |
| `style` | `CSSProperties` | — | Inline style override |

## License

MIT
