# @mshafiqyajid/react-dropdown-menu

Headless dropdown menu hook and styled component for React. Accessible, keyboard-friendly, portal-based, smart flip positioning, SSR-safe, fully typed.

**[Full docs →](https://docs.shafiqyajid.com/react/dropdown-menu/)**

## Installation

```bash
npm install @mshafiqyajid/react-dropdown-menu
```

## Headless usage

```tsx
import { useDropdownMenu } from "@mshafiqyajid/react-dropdown-menu";

function MyMenu() {
  const { triggerProps, menuProps, getItemProps, isOpen, activeIndex } =
    useDropdownMenu({ closeOnSelect: true });

  const items = ["Edit", "Duplicate", "Delete"];

  return (
    <div>
      <button {...triggerProps}>Options</button>
      {isOpen && (
        <ul {...menuProps}>
          {items.map((item, i) => (
            <li key={item} {...getItemProps(i)}>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## Styled usage

```tsx
import { DropdownMenuStyled } from "@mshafiqyajid/react-dropdown-menu/styled";
import "@mshafiqyajid/react-dropdown-menu/styles.css";

function App() {
  return (
    <DropdownMenuStyled
      trigger={<button>Options</button>}
      placement="bottom-start"
      offset={4}
      collisionPadding={12}
      flip
      shift
      size="md"
      items={[
        { label: "Edit", onClick: () => console.log("edit") },
        { label: "Duplicate" },
        { divider: true },
        { label: "Delete", onClick: () => console.log("delete") },
      ]}
    />
  );
}
```

## Submenus

```tsx
<DropdownMenuStyled
  trigger={<button>File</button>}
  items={[
    { label: "New", onClick: () => create() },
    {
      label: "Open recent",
      items: [
        { label: "report.pdf", onClick: () => open("report.pdf") },
        { label: "notes.md",   onClick: () => open("notes.md") },
        { divider: true },
        { label: "Clear",      onClick: () => clearRecents() },
      ],
    },
    { divider: true },
    { label: "Quit", onClick: () => quit() },
  ]}
/>
```

Parent rows render a chevron and a hover/click-driven flyout. Keyboard: `→` opens the submenu, `←` returns to the parent, `Enter` / `Space` activates.

## Positioning

| Prop | Type | Default | Description |
|---|---|---|---|
| `placement` | `top \| bottom \| left \| right` plus each with `-start` / `-end` | `"bottom-start"` | Preferred side and alignment |
| `offset` | `number` | `4` | Gap between trigger and menu |
| `collisionPadding` | `number` | `8` | Viewport edge margin for flip / shift |
| `flip` | `boolean` | `true` | Auto-flip to opposite side near edges |
| `shift` | `boolean` | `true` | Push back into view along the cross-axis |
| `strategy` | `"absolute" \| "fixed"` | `"absolute"` | Positioning strategy |

`data-placement` on the menu reflects the resolved (post-flip) placement.

## License

MIT

## What's new in 0.3.0

- **Nested submenus** — `DropdownMenuItem` accepts `items?: DropdownMenuItem[]`. Parent rows render a chevron and a hover/click flyout. → opens the submenu, ← returns, Enter/Space activates. Submenus inherit `size` / `collisionPadding` / `flip` / `shift` / `strategy` from the parent menu.

## 0.3.1 — submenu polish

- 4 px gap between the parent menu and the submenu (was flush) plus a subtle entry transition. Fixes the no-padding feedback on the initial submenu release.
