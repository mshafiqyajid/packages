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
      placement="bottom"
    >
      <button>Click me</button>
    </PopoverStyled>
  );
}
```

## License

MIT
