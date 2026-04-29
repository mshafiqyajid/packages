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
      trigger="Options"
      placement="bottom-start"
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

## License

MIT
