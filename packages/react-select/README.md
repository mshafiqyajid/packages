# @mshafiqyajid/react-select

A custom select/dropdown with search for React. Headless hook + styled component. Accessible, keyboard-friendly, multi-select, searchable, portalled dropdown, fully typed.

**[Full docs →](https://docs.shafiqyajid.com/react/select/)**

## Installation

```bash
npm install @mshafiqyajid/react-select
```

## Usage

### Headless hook

```tsx
import { useSelect } from "@mshafiqyajid/react-select";

const items = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
];

function MySelect() {
  const [value, setValue] = React.useState<string | string[]>("");
  const select = useSelect({
    items,
    value,
    onChange: setValue,
    searchable: true,
  });

  return (
    <div>
      <button {...select.triggerProps}>
        {select.selectedItems[0]?.label ?? "Pick one"}
      </button>
      {select.isOpen && (
        <ul {...select.listboxProps}>
          {select.filteredItems.map((item) => (
            <li key={item.value} {...select.getItemProps(item)}>
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### Styled component

```tsx
import { SelectStyled } from "@mshafiqyajid/react-select/styled";
import "@mshafiqyajid/react-select/styles.css";

const items = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
];

function App() {
  const [value, setValue] = React.useState("");

  return (
    <SelectStyled
      items={items}
      value={value}
      onChange={setValue}
      placeholder="Pick a fruit"
      searchable
      tone="primary"
    />
  );
}
```

## API

### `useSelect(options)`

| Option | Type | Default | Description |
|---|---|---|---|
| `items` | `SelectItem[]` | — | Array of `{ value, label, disabled? }` |
| `value` | `string \| string[]` | — | Controlled value |
| `onChange` | `(value) => void` | — | Change handler |
| `multiple` | `boolean` | `false` | Allow multiple selections |
| `searchable` | `boolean` | `false` | Enable type-to-search |

Returns `{ triggerProps, listboxProps, getItemProps, isOpen, searchValue, setSearchValue, filteredItems, selectedItems }`.

### `<SelectStyled>`

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `SelectItem[]` | — | Options |
| `value` | `string \| string[]` | — | Controlled value |
| `onChange` | `(value) => void` | — | Change handler |
| `placeholder` | `string` | `"Select…"` | Placeholder text |
| `multiple` | `boolean` | `false` | Multi-select mode |
| `searchable` | `boolean` | `false` | Show search input |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Trigger size |
| `tone` | `"neutral" \| "primary" \| "success" \| "danger"` | `"neutral"` | Color tone |
| `disabled` | `boolean` | `false` | Disable the control |
| `clearable` | `boolean` | `false` | Show clear button |
| `placement` | `"auto" \| "top" \| "bottom"` | `"auto"` | Listbox side. `"auto"` picks bottom unless there isn't room |
| `offset` | `number` | `4` | Gap between trigger and listbox |
| `collisionPadding` | `number` | `8` | Viewport edge margin used by flip |
| `flip` | `boolean` | `true` | Auto-flip when there's no room |
| `strategy` | `"absolute" \| "fixed"` | `"absolute"` | Positioning strategy |

`data-placement="top" | "bottom"` lands on the dropdown so consumers can flip arrow direction or radius. Listbox width still tracks the trigger — left/right placements aren't applicable.

## Keyboard navigation

- `Enter` / `Space` — open dropdown
- `ArrowDown` / `ArrowUp` — move focus through items
- `Enter` — select focused item
- `Escape` — close dropdown
- Typing — filter items when `searchable` is true

## Dark mode

Dark mode uses `[data-theme="dark"]` on an ancestor element — not `@media (prefers-color-scheme: dark)`:

```html
<div data-theme="dark">
  <SelectStyled ... />
</div>
```

## License

MIT © Shafiq Yajid
