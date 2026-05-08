# @mshafiqyajid/react-context-menu

Right-click context menu with sub-menus, keyboard navigation, first-letter jump, and portal positioning.

**[Full docs →](https://docs.shafiqyajid.com/react/context-menu/)**

## Install

```bash
npm install @mshafiqyajid/react-context-menu
```

## Quick start

```tsx
import { ContextMenuStyled } from "@mshafiqyajid/react-context-menu/styled";
import "@mshafiqyajid/react-context-menu/styles.css";

<ContextMenuStyled
  items={[
    { label: "Cut",   shortcut: "⌘X", onClick: () => handleCut() },
    { label: "Copy",  shortcut: "⌘C", onClick: () => handleCopy() },
    { label: "Paste", shortcut: "⌘V", onClick: () => handlePaste() },
    { type: "separator" },
    { label: "Delete", onClick: () => handleDelete(), disabled: true },
  ]}
>
  <div style={{ padding: "2rem", border: "1px dashed #ccc" }}>
    Right-click anywhere in this area
  </div>
</ContextMenuStyled>
```

## With sub-menus

```tsx
<ContextMenuStyled
  items={[
    { label: "New File",   onClick: () => createFile() },
    { label: "New Folder", onClick: () => createFolder() },
    { type: "separator" },
    {
      label: "Share",
      items: [
        { label: "Copy link",    onClick: () => copyLink() },
        { label: "Send by email",onClick: () => sendEmail() },
      ],
    },
    { type: "separator" },
    { label: "Delete", onClick: () => deleteItem() },
  ]}
>
  <div>Right-click me</div>
</ContextMenuStyled>
```

## With section labels

```tsx
<ContextMenuStyled
  items={[
    { type: "label", label: "Edit" },
    { label: "Cut",   onClick: () => cut() },
    { label: "Copy",  onClick: () => copy() },
    { type: "separator" },
    { type: "label", label: "Clipboard" },
    { label: "Paste", onClick: () => paste() },
  ]}
>
  <div>Right-click me</div>
</ContextMenuStyled>
```

## Headless usage

```tsx
import { useContextMenu } from "@mshafiqyajid/react-context-menu";
import { createPortal } from "react-dom";

const items = ["Cut", "Copy", "Paste"];

function MyContextMenu() {
  const { triggerProps, menuProps, getItemProps, isOpen } = useContextMenu({
    itemCount: items.length,
  });

  return (
    <>
      <div {...triggerProps} style={{ padding: "2rem" }}>
        Right-click here
      </div>
      {isOpen && createPortal(
        <div {...menuProps} className="my-menu">
          {items.map((label, i) => (
            <div key={label} {...getItemProps(i, { onClick: () => console.log(label) })}>
              {label}
            </div>
          ))}
        </div>,
        document.body,
      )}
    </>
  );
}
```

## Keyboard navigation

| Key | Action |
|-----|--------|
| `↓` / `↑` | Navigate items (skips disabled) |
| `Enter` / `Space` | Activate focused item |
| `→` | Open sub-menu |
| `←` / `Escape` (in sub-menu) | Close sub-menu |
| `Escape` | Close menu |
| Letter key | Jump to first item starting with that letter |

## ContextMenuStyled props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | The right-click target area |
| `items` | `ContextMenuItem[]` | — | Menu items array |
| `disabled` | `boolean` | `false` | Disable the context menu entirely |
| `open` | `boolean` | — | Controlled open state |
| `onOpenChange` | `(open: boolean) => void` | — | Callback when open state changes |
| `className` | `string` | — | Class on the trigger wrapper |
| `style` | `CSSProperties` | — | Style on the trigger wrapper |

## ContextMenuItem type

```ts
interface ContextMenuItem {
  type?: "item" | "separator" | "label";
  label?: string;
  icon?: ReactNode;
  shortcut?: string;
  disabled?: boolean;
  onClick?: () => void;
  items?: ContextMenuItem[]; // sub-menu
}
```

| Field | Description |
|-------|-------------|
| `type` | `"item"` (default), `"separator"` (horizontal rule), or `"label"` (section heading) |
| `label` | Text content of the item |
| `icon` | 16 × 16 icon rendered on the left |
| `shortcut` | Right-aligned shortcut badge (display only, e.g. `"⌘X"`) |
| `disabled` | Dims the item and prevents interaction |
| `onClick` | Callback fired when the item is activated |
| `items` | Nested items — renders a sub-menu on hover / `→` key |

## CSS variables

Override these on `:root` or a scoped ancestor:

```css
:root {
  --rctx-bg: #ffffff;
  --rctx-border: #e4e4e7;
  --rctx-shadow: 0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.07);
  --rctx-radius: 10px;
  --rctx-item-fg: #18181b;
  --rctx-item-bg-focused: #f4f4f5;
  --rctx-duration-in: 180ms;
  --rctx-duration-out: 120ms;
}
```

Dark mode is applied automatically when a `[data-theme="dark"]` ancestor is present.

## License

MIT
