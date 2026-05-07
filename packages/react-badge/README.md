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
| `maxCount` | `number` | — |
| `pulse` | `boolean` | `false` |
| `uppercase` | `boolean` | `false` |
| `dismissible` | `boolean` | `false` |
| `onDismiss` | `() => void` | — |
| `icon` | `ReactNode` | — |
| `hideOnZero` | `boolean` | `false` |
| `showZero` | `boolean` | `false` |

`hideOnZero` renders nothing when `count === 0` and there is no other content (handy for unread counters). `showZero` overrides it.

## BadgeAnchor

`BadgeAnchor` wraps any child element and pins a `BadgeStyled` in the top-right corner.

```tsx
import { BadgeAnchor, BadgeStyled } from "@mshafiqyajid/react-badge/styled";
import "@mshafiqyajid/react-badge/styles.css";

function App() {
  return (
    <BadgeAnchor badge={<BadgeStyled count={3} tone="danger" variant="solid" />}>
      <button>Inbox</button>
    </BadgeAnchor>
  );
}
```

| Prop | Type | Default |
|---|---|---|
| `badge` | `ReactNode` | — |
| `offset` | `{ x?: number; y?: number }` | `{ x: -6, y: -6 }` |
| `className` | `string` | — |

## What's new in 0.4.0

- **`BadgeAnchor`** component — pins any badge to a child element's top-right corner.
- **Count flip animation** — digits animate in/out (up or down direction) when `count` changes. 220ms ease, respects `prefers-reduced-motion`.
- **Pop on mount** — badges with content play a spring-scale bounce on first render. Respects `prefers-reduced-motion`.

## License

MIT
