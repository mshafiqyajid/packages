# @mshafiqyajid/react-hover-card

Headless hover card hook and styled component for React. Mouse and keyboard triggered, smart auto-placement, open/close delay, portal-based positioning, animated, SSR-safe, fully typed.

**[Full docs →](https://docs.shafiqyajid.com/react/hover-card/)**

## Installation

```bash
npm install @mshafiqyajid/react-hover-card
```

## Usage — Headless

```tsx
import { useHoverCard } from "@mshafiqyajid/react-hover-card";

function MyHoverCard() {
  const { triggerProps, cardProps, isOpen } = useHoverCard({
    openDelay: 300,
    closeDelay: 100,
  });

  return (
    <>
      <a href="/profile" {...triggerProps}>@username</a>
      {isOpen && (
        <div {...cardProps} className="my-card">
          <p>Rich user profile content</p>
        </div>
      )}
    </>
  );
}
```

## Usage — Styled

```tsx
import { HoverCardStyled } from "@mshafiqyajid/react-hover-card/styled";
import "@mshafiqyajid/react-hover-card/styles.css";

function App() {
  return (
    <HoverCardStyled
      content={
        <div>
          <strong>@username</strong>
          <p>Joined January 2024 · 120 followers</p>
        </div>
      }
      openDelay={300}
      closeDelay={100}
      placement="auto"
    >
      <a href="/profile">@username</a>
    </HoverCardStyled>
  );
}
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `content` | `ReactNode` | — | Hover card body content |
| `children` | `ReactElement` | — | The trigger element |
| `openDelay` | `number` | `300` | ms before opening on hover/focus |
| `closeDelay` | `number` | `100` | ms before closing after mouse-leave/blur |
| `placement` | `"top" \| "bottom" \| "left" \| "right" \| "auto"` (each with optional `-start`/`-end`) | `"auto"` | Preferred placement side |
| `offset` | `number` | `8` | Gap in px between trigger and card |
| `collisionPadding` | `number` | `8` | Viewport edge margin for flip/shift |
| `flip` | `boolean` | `true` | Auto-flip to opposite side near edges |
| `shift` | `boolean` | `true` | Push back into view along cross-axis |
| `arrow` | `boolean` | `true` | Show arrow pointing to trigger |
| `strategy` | `"absolute" \| "fixed"` | `"absolute"` | Positioning strategy |
| `open` | `boolean` | — | Controlled open state |
| `defaultOpen` | `boolean` | `false` | Initial open state (uncontrolled) |
| `onOpenChange` | `(open: boolean) => void` | — | Callback when open state changes |
| `className` | `string` | — | Extra class on the card element |
| `style` | `React.CSSProperties` | — | Inline styles on the card element |

## CSS variables

| Variable | Default | Description |
|---|---|---|
| `--rhc-bg` | `#ffffff` | Card background |
| `--rhc-fg` | `#18181b` | Card text color |
| `--rhc-border` | `#e4e4e7` | Card border color |
| `--rhc-radius` | `10px` | Card border radius |
| `--rhc-shadow` | — | Card box shadow |
| `--rhc-duration-in` | `180ms` | Open transition duration |
| `--rhc-duration-out` | `120ms` | Close transition duration |
| `--rhc-min-width` | `220px` | Minimum card width |
| `--rhc-max-width` | `360px` | Maximum card width |
| `--rhc-padding` | `1rem` | Content padding |

## License

MIT
