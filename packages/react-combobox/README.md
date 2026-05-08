# @mshafiqyajid/react-combobox

Searchable combobox with async loading, option grouping, and creatable option support. Headless hook + styled drop-in component.

**[Full docs →](https://docs.shafiqyajid.com/react/combobox/)**

## Install

```bash
npm install @mshafiqyajid/react-combobox
```

## Quick start

```tsx
import { useState } from "react";
import { ComboboxStyled } from "@mshafiqyajid/react-combobox/styled";
import "@mshafiqyajid/react-combobox/styles.css";

const options = [
  { value: "react",   label: "React" },
  { value: "vue",     label: "Vue" },
  { value: "svelte",  label: "Svelte" },
];

function App() {
  const [value, setValue] = useState<string | null>(null);
  return (
    <ComboboxStyled
      options={options}
      value={value}
      onChange={setValue}
      placeholder="Search frameworks…"
      clearable
    />
  );
}
```

## Async loading

```tsx
<ComboboxStyled
  value={value}
  onChange={setValue}
  loadOptions={async (query) => {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    return res.json(); // ComboboxOption[]
  }}
  debounceMs={300}
  loadingText="Searching…"
  emptyText="No results"
/>
```

## Grouped options

```tsx
const options = [
  { value: "react",  label: "React",  group: "Frontend" },
  { value: "vue",    label: "Vue",    group: "Frontend" },
  { value: "django", label: "Django", group: "Backend" },
];

<ComboboxStyled options={options} value={value} onChange={setValue} />
```

## Creatable

```tsx
<ComboboxStyled
  options={options}
  value={value}
  onChange={setValue}
  creatable
  createLabel={(q) => `Add "${q}"`}
  onCreateOption={(q) => console.log("Create:", q)}
/>
```

## Headless

```tsx
import { useCombobox } from "@mshafiqyajid/react-combobox";

const { inputProps, listboxProps, getOptionProps, isOpen, filteredOptions } = useCombobox({
  options,
  value,
  onChange,
});

return (
  <>
    <input {...inputProps} placeholder="Search…" />
    {isOpen && (
      <ul {...listboxProps}>
        {filteredOptions.map((opt, i) => (
          <li key={opt.value} {...getOptionProps(opt, i)}>{opt.label}</li>
        ))}
      </ul>
    )}
  </>
);
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string \| null` | — | Controlled value |
| `defaultValue` | `string` | — | Uncontrolled initial value |
| `onChange` | `(v: string \| null) => void` | — | Called when selection changes |
| `options` | `ComboboxOption[]` | `[]` | Static option list |
| `loadOptions` | `(q: string) => Promise<ComboboxOption[]>` | — | Async option loader |
| `debounceMs` | `number` | `300` | Debounce delay for `loadOptions` |
| `placeholder` | `string` | `"Search…"` | Input placeholder |
| `emptyText` | `string` | `"No options"` | Text when no matches |
| `loadingText` | `string` | `"Loading…"` | Text while loading |
| `errorText` | `string` | — | Text on load error |
| `creatable` | `boolean` | `false` | Allow creating new options |
| `createLabel` | `(q: string) => string` | — | Custom create option label |
| `onCreateOption` | `(v: string) => void` | — | Called when user creates an option |
| `clearable` | `boolean` | `true` | Show clear button when selected |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Size variant |
| `tone` | `"neutral" \| "primary" \| "success" \| "danger"` | `"neutral"` | Color tone |
| `disabled` | `boolean` | `false` | Disable the combobox |
| `readOnly` | `boolean` | `false` | Make input read-only |
| `required` | `boolean` | `false` | Mark as required |
| `invalid` | `boolean` | `false` | Show error state |
| `label` | `string` | — | Label text |
| `hint` | `string` | — | Hint text below control |
| `error` | `string` | — | Error message below control |
| `placement` | `"auto" \| "top" \| "bottom"` | `"auto"` | Dropdown placement |
| `offset` | `number` | `4` | Gap between control and dropdown |
| `flip` | `boolean` | `true` | Flip when there's not enough room |
| `renderOption` | `(opt, state) => ReactNode` | — | Custom option renderer |

## ComboboxOption shape

```ts
interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
}
```

## License

MIT
