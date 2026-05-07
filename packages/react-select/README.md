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
| `loadOptions` | `(query: string) => Promise<SelectItem[]>` | — | Async loader (debounced, cancellable) |
| `debounceMs` | `number` | `300` | Debounce delay before `loadOptions` fires |

Returns `{ triggerProps, listboxProps, getItemProps, isOpen, searchValue, setSearchValue, filteredItems, selectedItems, isLoading, loadError }`.

### `<SelectStyled>`

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `SelectItemOrGroup[]` | — | Flat items or grouped items |
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
| `style` | `React.CSSProperties` | — | Inline styles on the root element |
| `renderItem` | `(item, { selected, active }) => ReactNode` | — | Custom option content |
| `renderEmpty` | `() => ReactNode` | — | Custom empty state |
| `renderTrigger` | `(selected, open) => ReactNode` | — | Custom trigger content |

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

## Async options (`loadOptions`)

```tsx
<SelectStyled
  items={[]}                       // seeds + provides labels for selected values
  value={value}
  onChange={setValue}
  loadOptions={async (query) => {
    const res = await fetch(`/api/users?q=${encodeURIComponent(query)}`);
    return res.json(); // SelectItem[]
  }}
  debounceMs={300}                 // default
  loadingText="Searching…"
  emptyText="No matches"
  errorText="Couldn’t load — try again"
/>
```

The hook debounces on `searchValue`, cancels stale requests via `AbortController`, and exposes `isLoading: boolean` + `loadError: Error | null`. Listbox lands `aria-busy="true"` while in flight.

## What's new in 0.4.0

### Grouped items

Pass a `SelectGroup[]` to `items` to render sticky group labels above each group:

```tsx
import { SelectStyled } from "@mshafiqyajid/react-select/styled";
import type { SelectGroup } from "@mshafiqyajid/react-select";

const groupedItems: SelectGroup[] = [
  {
    group: "Frontend",
    items: [
      { value: "react", label: "React" },
      { value: "vue",   label: "Vue" },
    ],
  },
  {
    group: "Backend",
    items: [
      { value: "express", label: "Express" },
    ],
  },
];

<SelectStyled items={groupedItems} value={value} onChange={setValue} searchable />
```

CSS classes: `rsel-group`, `rsel-group-label` (sticky). Groups and flat items must not be mixed in the same array.

### Render props

| Prop | Signature | Description |
|---|---|---|
| `renderItem` | `(item, { selected, active }) => ReactNode` | Replace option content. The `<li>`, keyboard, and selection logic stay managed. |
| `renderEmpty` | `() => ReactNode` | Replace the "No results" message. |
| `renderTrigger` | `(selected, open) => ReactNode` | Replace the trigger button's inner content. |

```tsx
<SelectStyled
  items={items}
  value={value}
  onChange={setValue}
  renderItem={(item, { selected }) => (
    <span>
      {selected ? "✓" : "○"} {item.label}
    </span>
  )}
  renderEmpty={() => <span>Nothing found 🔍</span>}
  renderTrigger={(sel, open) => (
    <span>{Array.isArray(sel) ? `${sel.length} selected` : sel?.label ?? "Pick one"}</span>
  )}
/>
```

### Motion

- List items slide-fade in on open with a CSS stagger (`animation-delay` per nth-child).
- Selected chips scale in via `@keyframes rsel-chip-in`.
- The async loading spinner rotates via `@keyframes rsel-spin`.
- All animations are disabled under `prefers-reduced-motion`.

### `style` prop

`SelectStyledProps` now accepts `style?: React.CSSProperties` so you can set width inline without a wrapper element.

## License

MIT © Shafiq Yajid
