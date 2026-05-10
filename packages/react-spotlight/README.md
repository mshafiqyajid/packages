# @mshafiqyajid/react-spotlight

Onboarding spotlight overlay with a cutout that highlights a specific target element. Full-screen overlay with SVG mask, focus trap, keyboard navigation, smooth motion, and dark mode.

**[Full docs →](https://docs.shafiqyajid.com/react/spotlight/)**

## Install

```bash
npm install @mshafiqyajid/react-spotlight
```

## Quick start

```tsx
import { SpotlightStyled } from "@mshafiqyajid/react-spotlight/styled";
import "@mshafiqyajid/react-spotlight/styles.css";
import { useRef, useState } from "react";

function App() {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button ref={buttonRef} onClick={() => setOpen(true)}>
        Start tour
      </button>

      <SpotlightStyled
        target={buttonRef}
        open={open}
        onOpenChange={setOpen}
        placement="bottom"
      >
        <div>
          <h3>Welcome!</h3>
          <p>This button starts the tour.</p>
          <button onClick={() => setOpen(false)}>Got it</button>
        </div>
      </SpotlightStyled>
    </>
  );
}
```

## Headless usage

```tsx
import { useSpotlight } from "@mshafiqyajid/react-spotlight";
import { useRef } from "react";

function MySpotlight() {
  const targetRef = useRef<HTMLButtonElement>(null);
  const { isOpen, open, close, spotlightProps, overlayProps } = useSpotlight({
    target: targetRef,
    placement: "bottom",
  });

  return (
    <>
      <button ref={targetRef} onClick={open}>Highlight me</button>
      {isOpen && (
        <div {...overlayProps}>
          <div {...spotlightProps}>
            <button onClick={close}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}
```

## License

MIT
