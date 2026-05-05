# @mshafiqyajid/react-popover

Headless popover hook and styled component for React. Accessible, click or hover triggered, portal-based positioning, animated, SSR-safe, fully typed.

**[Full docs →](https://docs.shafiqyajid.com/react/popover/)**

## Installation

```bash
npm install @mshafiqyajid/react-popover
```

## Usage — Headless

```tsx
import { usePopover } from "@mshafiqyajid/react-popover";

function MyPopover() {
  const { triggerProps, popoverProps, isOpen } = usePopover({ placement: "bottom" });

  return (
    <>
      <button {...triggerProps}>Open</button>
      {isOpen && (
        <div {...popoverProps}>Popover content</div>
      )}
    </>
  );
}
```

## Usage — Styled

```tsx
import { PopoverStyled } from "@mshafiqyajid/react-popover/styled";
import "@mshafiqyajid/react-popover/styles.css";

function App() {
  return (
    <PopoverStyled
      content={<p>Rich content here</p>}
      title="Popover Title"
      placement="bottom-start"
      offset={8}
      collisionPadding={12}
      flip
      shift
      strategy="absolute"
    >
      <button>Click me</button>
    </PopoverStyled>
  );
}
```

## Positioning

| Prop | Type | Default | Description |
|---|---|---|---|
| `placement` | `top \| bottom \| left \| right` plus each with `-start` / `-end` | `"bottom"` | Preferred side and alignment |
| `offset` | `number` | `8` | Gap in px between trigger and popover |
| `collisionPadding` | `number` | `8` | Viewport edge margin for flip / shift |
| `flip` | `boolean` | `true` | Auto-flip to opposite side when there's no room |
| `shift` | `boolean` | `true` | Push back into view along the cross-axis |
| `strategy` | `"absolute" \| "fixed"` | `"absolute"` | Positioning strategy |

`data-placement` on the rendered popover reflects the **resolved** placement after flip — style by it (e.g. arrow direction, side-specific radius).

## License

MIT
