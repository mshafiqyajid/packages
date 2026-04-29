# @mshafiqyajid/react-badge

Headless badge hook and styled component for React. Accessible, dismissible, fully typed.

**[Full docs →](https://docs.shafiqyajid.com/react/badge/)**

## Install

```bash
npm install @mshafiqyajid/react-badge
```

## Headless usage

```tsx
import { useBadge } from "@mshafiqyajid/react-badge";

function MyBadge() {
  const { badgeProps, dismissProps, isDismissed } = useBadge({
    onDismiss: () => console.log("dismissed"),
  });

  if (isDismissed) return null;

  return (
    <span {...badgeProps}>
      New
      <button {...dismissProps}>×</button>
    </span>
  );
}
```

## Styled usage

```tsx
import { BadgeStyled } from "@mshafiqyajid/react-badge/styled";
import "@mshafiqyajid/react-badge/styles.css";

function App() {
  return (
    <BadgeStyled tone="primary" variant="solid" size="md" dismissible>
      New feature
    </BadgeStyled>
  );
}
```

## Props

| Prop | Type | Default |
|---|---|---|
| `variant` | `"solid" \| "subtle" \| "outline"` | `"subtle"` |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` |
| `tone` | `"neutral" \| "primary" \| "success" \| "warning" \| "danger" \| "info"` | `"neutral"` |
| `dot` | `boolean` | `false` |
| `count` | `number` | — |
| `dismissible` | `boolean` | `false` |
| `onDismiss` | `() => void` | — |
| `icon` | `ReactNode` | — |

## License

MIT
