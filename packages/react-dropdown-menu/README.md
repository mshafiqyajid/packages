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
