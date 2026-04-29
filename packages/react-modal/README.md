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
