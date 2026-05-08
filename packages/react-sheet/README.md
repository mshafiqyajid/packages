# @mshafiqyajid/react-sheet

Accessible bottom/side sheet with snap points and swipe-to-dismiss.

**[Full docs →](https://docs.shafiqyajid.com/react/sheet/)**

## Features

- Bottom, top, left, and right sheet positions
- Swipe-to-dismiss with configurable threshold
- Optional snap points for multi-stop sheets
- Focus trap and body scroll lock
- Escape key to close
- Smooth spring slide-in/out animations
- Reduced-motion: fade only, no slide
- Dark mode via `[data-theme="dark"]`
- Headless hook + styled component
- Zero dependencies (peer: React ≥ 17)

## Install

```bash
npm install @mshafiqyajid/react-sheet
```

## Styled component

```tsx
import { useState } from "react";
import { SheetStyled } from "@mshafiqyajid/react-sheet/styled";
import "@mshafiqyajid/react-sheet/styles.css";

function App() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Open sheet</button>

      <SheetStyled
        open={open}
        onOpenChange={setOpen}
        title="Options"
        footer={
          <button onClick={() => setOpen(false)}>Done</button>
        }
      >
        <p>Sheet content goes here.</p>
      </SheetStyled>
    </>
  );
}
```

## Side variants

```tsx
<SheetStyled open={open} onOpenChange={setOpen} side="right" title="Settings">
  <p>Slides in from the right.</p>
</SheetStyled>

<SheetStyled open={open} onOpenChange={setOpen} side="top" title="Notifications">
  <p>Slides down from the top.</p>
</SheetStyled>
```

## Snap points

```tsx
<SheetStyled
  open={open}
  onOpenChange={setOpen}
  snapPoints={["40vh", "80vh"]}
  defaultSnapPoint="40vh"
  onSnapPointChange={(snap) => console.log("snapped to", snap)}
>
  <p>Drag up to expand, drag down past threshold to dismiss.</p>
</SheetStyled>
```

## Headless hook

```tsx
import { useSheet } from "@mshafiqyajid/react-sheet";

function MySheet() {
  const { isOpen, open, close, sheetProps, overlayProps, handleProps, dragY } = useSheet({
    swipeToDismiss: true,
    swipeThreshold: 60,
  });

  return (
    <>
      <button onClick={open}>Open</button>
      {isOpen && (
        <div {...overlayProps} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)" }}>
          <div
            {...sheetProps}
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              background: "#fff",
              borderRadius: "16px 16px 0 0",
              padding: "1rem",
              transform: dragY > 0 ? `translateY(${dragY}px)` : undefined,
            }}
          >
            <div {...handleProps} style={{ width: 40, height: 5, background: "#ccc", borderRadius: 9999, margin: "0 auto 1rem" }} />
            <p>Custom headless sheet.</p>
            <button onClick={close}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}
```

## API

### `SheetStyled` props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | — | Controlled open state |
| `defaultOpen` | `boolean` | `false` | Uncontrolled default open state |
| `onOpenChange` | `(open: boolean) => void` | — | Called when open state changes |
| `onAfterOpen` | `() => void` | — | Fires after open transition completes |
| `onAfterClose` | `() => void` | — | Fires after close transition completes |
| `side` | `"bottom" \| "top" \| "left" \| "right"` | `"bottom"` | Which edge the sheet slides from |
| `snapPoints` | `(string \| number)[]` | — | Snap heights/widths e.g. `["40vh", "80vh"]` |
| `defaultSnapPoint` | `string \| number` | — | Initial snap point |
| `onSnapPointChange` | `(snap: string \| number) => void` | — | Called when snap point changes |
| `swipeToDismiss` | `boolean` | `true` | Allow drag-to-dismiss |
| `swipeThreshold` | `number` | `50` | Pixel drag distance to trigger dismiss |
| `closeOnOverlayClick` | `boolean` | `true` | Close when clicking the overlay |
| `closeOnEsc` | `boolean` | `true` | Close on Escape key |
| `showHandle` | `boolean` | `true` | Show the drag handle pill |
| `title` | `ReactNode` | — | Sheet heading |
| `description` | `ReactNode` | — | Accessible description |
| `footer` | `ReactNode` | — | Footer content |
| `children` | `ReactNode` | — | Body content |
| `initialFocusRef` | `RefObject<HTMLElement>` | — | Element to focus on open |
| `finalFocusRef` | `RefObject<HTMLElement>` | — | Element to focus on close |
| `lockBodyScroll` | `boolean` | `true` | Lock body scroll while open |
| `container` | `HTMLElement \| null` | `document.body` | Portal target |
| `className` | `string` | — | Extra class on the panel |
| `style` | `CSSProperties` | — | Inline style on the panel |
| `ref` | forwarded | — | Forwarded to the panel `div` |

### `useSheet` options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `open` | `boolean` | — | Controlled open state |
| `defaultOpen` | `boolean` | `false` | Uncontrolled default |
| `onOpenChange` | `(open: boolean) => void` | — | Open state change callback |
| `closeOnEsc` | `boolean` | `true` | Close on Escape key |
| `swipeToDismiss` | `boolean` | `true` | Track pointer drag |
| `swipeThreshold` | `number` | `50` | Pixels to trigger dismiss |
| `lockBodyScroll` | `boolean` | `true` | Lock body scroll |

### `useSheet` return value

| Key | Type | Description |
|-----|------|-------------|
| `isOpen` | `boolean` | Current open state |
| `open` | `() => void` | Open the sheet |
| `close` | `() => void` | Close the sheet |
| `toggle` | `() => void` | Toggle open/closed |
| `sheetProps` | `SheetProps` | Spread onto the panel element |
| `overlayProps` | `OverlayProps` | Spread onto the overlay element |
| `handleProps` | `HandleProps` | Spread onto the drag handle element |
| `dragY` | `number` | Current drag offset in pixels |

## CSS custom properties

| Variable | Default | Description |
|----------|---------|-------------|
| `--rsh-fg` | `#18181b` | Foreground text color |
| `--rsh-fg-muted` | `#71717a` | Muted text color |
| `--rsh-bg` | `#ffffff` | Panel background |
| `--rsh-bg-header` | `#fafafa` | Header background |
| `--rsh-bg-footer` | `#fafafa` | Footer background |
| `--rsh-border` | `#e4e4e7` | Border color |
| `--rsh-overlay-bg` | `rgba(0,0,0,0.45)` | Overlay backdrop color |
| `--rsh-radius` | `16px` | Panel corner radius |
| `--rsh-handle-bg` | `#d4d4d8` | Drag handle color |
| `--rsh-duration-panel` | `350ms` | Panel slide duration |
| `--rsh-duration-overlay` | `220ms` | Overlay fade duration |

## License

MIT
