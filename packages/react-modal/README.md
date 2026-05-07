# @mshafiqyajid/react-modal

Headless modal hook and styled component for React. Accessible, focus-trapped, scroll-locked, animated, SSR-safe, fully typed.

**[Full docs →](https://docs.shafiqyajid.com/react/modal/)**

## Install

```bash
npm install @mshafiqyajid/react-modal
```

## Headless usage

```tsx
import { useModal } from "@mshafiqyajid/react-modal";

function Example() {
  const { isOpen, open, close, modalProps, overlayProps } = useModal();

  return (
    <>
      <button onClick={open}>Open modal</button>
      {isOpen && (
        <div {...overlayProps}>
          <div {...modalProps} aria-labelledby="title">
            <h2 id="title">Hello</h2>
            <button onClick={close}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}
```

## Styled usage

```tsx
import { ModalStyled } from "@mshafiqyajid/react-modal/styled";
import "@mshafiqyajid/react-modal/styles.css";

function Example() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>
      <ModalStyled
        isOpen={open}
        onClose={() => setOpen(false)}
        title="My Modal"
        size="md"
        variant="dialog"
      >
        <p>Modal content goes here.</p>
      </ModalStyled>
    </>
  );
}
```

## Props

### `useModal(options?)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `defaultOpen` | `boolean` | `false` | Initial open state |
| `onOpen` | `() => void` | — | Called when modal opens |
| `onClose` | `() => void` | — | Called when modal closes |
| `closeOnEsc` | `boolean` | `true` | Close on Escape key |

Returns: `isOpen`, `open()`, `close()`, `toggle()`, `modalProps`, `overlayProps`

### `ModalStyled`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | — | Controls visibility |
| `onClose` | `() => void` | — | Called when closed |
| `title` | `string` | — | Dialog title (sets aria-labelledby) |
| `children` | `ReactNode` | — | Dialog body content |
| `footer` | `ReactNode` | — | Optional footer content |
| `size` | `"sm" \| "md" \| "lg" \| "full"` | `"md"` | Dialog size |
| `variant` | `"dialog" \| "drawer-left" \| "drawer-right" \| "drawer-bottom"` | `"dialog"` | Display variant |
| `closeOnOverlayClick` | `boolean` | `true` | Close when clicking the backdrop |
| `closeOnEsc` | `boolean` | `true` | Close on Escape key |
| `showCloseButton` | `boolean` | `true` | Show the X close button in the header |

## Dark mode

Set `data-theme="dark"` on any ancestor element — no `prefers-color-scheme` queries are used.

```html
<div data-theme="dark">
  <!-- ModalStyled picks up dark tokens automatically -->
</div>
```

## License

MIT

## What's new in 0.4.0

- **`mobileVariant="sheet"`** — on viewports ≤ 640 px the modal renders as a bottom-sheet instead of a centred dialog. The panel slides up from the bottom with a drag handle bar at the top. Drag down > 40 % of panel height (or with high velocity) to dismiss. Respects `prefers-reduced-motion`. Desktop rendering is unchanged.
- **`confirmVariant="confirm"` shorthand** — renders a pre-wired footer without needing a custom `footer` prop. Use `confirmLabel`, `cancelLabel`, `onConfirm`, `onCancel`, and `confirmTone: "neutral" | "danger"` to configure it.
- **Async `preventClose`** — the guard can now return a `Promise<boolean>`. Resolving `true` cancels the close, enabling unsaved-changes checks or server-side validation.
- **[motion] Backdrop blur transition** — the overlay now transitions `backdrop-filter` from `blur(0)` to the target blur value on open/close (not just opacity). Dialog content enters by scaling from 0.96 to 1. Bottom-sheet uses `cubic-bezier(0.34, 1.56, 0.64, 1)` spring physics for snap-back on partial drags. All transitions respect `prefers-reduced-motion`.

## What's new in 0.3.0

- **Stacked modals** — depth-aware z-index + behind-scale-down effect. Open a second modal and the first scales/translates back automatically.
- **Transition variants** — `transition: "fade" | "zoom" | "slide-up" | "slide-down"` (default `"fade"`). Drawers keep their slide-from-edge transition.
- **`confirm()` programmatic utility** — `import { confirm } from "@mshafiqyajid/react-modal/styled"`. Self-mounts a one-off modal with `Cancel` / `Confirm` buttons (with `danger` variant). Returns `Promise<boolean>`.
- **Swipe-to-dismiss** — `swipeToDismiss?: boolean` (default `true` for `drawer-bottom`). Touch-drag down past 120 px to dismiss.
- **`closeOnSubmit?: boolean`** — when the modal contains a `<form>` and it submits successfully, auto-close (skipped if the consumer's onSubmit calls `e.preventDefault()`).
