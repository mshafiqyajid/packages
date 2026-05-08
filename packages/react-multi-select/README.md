# @mshafiqyajid/react-multi-select

Multi-selection dropdown with chips, search, select-all, and group support.

**[Full docs →](https://docs.shafiqyajid.com/react/multi-select/)**

## Install

```bash
npm install @mshafiqyajid/react-multi-select
```

## Quick start

```tsx
import { MultiSelectStyled } from "@mshafiqyajid/react-multi-select/styled";
import "@mshafiqyajid/react-multi-select/styles.css";
import { useState } from "react";

const options = [
  { value: "react",   label: "React" },
  { value: "vue",     label: "Vue" },
  { value: "svelte",  label: "Svelte" },
  { value: "angular", label: "Angular" },
];

export function Example() {
  const [value, setValue] = useState<string[]>([]);

  return (
    <MultiSelectStyled
      options={options}
      value={value}
      onChange={setValue}
      placeholder="Select frameworks…"
    />
  );
}
```

## With groups

```tsx
const options = [
  { value: "react",   label: "React",   group: "Frontend" },
  { value: "vue",     label: "Vue",     group: "Frontend" },
  { value: "svelte",  label: "Svelte",  group: "Frontend" },
  { value: "nextjs",  label: "Next.js", group: "Full-stack" },
  { value: "nuxt",    label: "Nuxt",    group: "Full-stack" },
];

<MultiSelectStyled
  options={options}
  value={value}
  onChange={setValue}
  placeholder="Select frameworks…"
/>
```

## Max selection limit

```tsx
<MultiSelectStyled
  options={options}
  value={value}
  onChange={setValue}
  maxSelected={3}
  placeholder="Pick up to 3…"
/>
```

## Trigger modes

```tsx
// Always show chips
<MultiSelectStyled options={options} value={value} onChange={setValue} triggerMode="chips" />

// Always show count badge
<MultiSelectStyled options={options} value={value} onChange={setValue} triggerMode="count" />

// Auto: chips up to maxChips (default 3), then count badge (default)
<MultiSelectStyled options={options} value={value} onChange={setValue} triggerMode="auto" maxChips={2} />
```

## Form control

```tsx
<MultiSelectStyled
  options={options}
  value={value}
  onChange={setValue}
  label="Frameworks"
  hint="Select all that apply"
  required
/>

// With validation error
<MultiSelectStyled
  options={options}
  value={value}
  onChange={setValue}
  label="Frameworks"
  error="Please select at least one framework"
  invalid
/>
```

## Headless hook

```tsx
import { useMultiSelect } from "@mshafiqyajid/react-multi-select";

const options = [
  { value: "react", label: "React" },
  { value: "vue",   label: "Vue" },
];

export function Custom() {
  const {
    triggerProps,
    listboxProps,
    getOptionProps,
    isOpen,
    selectedValues,
    toggleOption,
    selectAll,
    clearAll,
    isAllSelected,
    isIndeterminate,
  } = useMultiSelect({ options });

  return (
    <div>
      <button {...triggerProps}>
        {selectedValues.length ? `${selectedValues.length} selected` : "Select…"}
      </button>
      {isOpen && (
        <ul {...listboxProps}>
          {options.map((opt) => (
            <li key={opt.value} {...getOptionProps(opt)}>
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `MultiSelectOption[]` | — | Array of `{ value, label, group?, disabled? }` |
| `value` | `string[]` | — | Controlled selected values |
| `defaultValue` | `string[]` | `[]` | Uncontrolled initial selection |
| `onChange` | `(value: string[]) => void` | — | Called when selection changes |
| `placeholder` | `string` | `"Select options…"` | Placeholder text |
| `searchable` | `boolean` | `true` | Show search input in dropdown |
| `searchPlaceholder` | `string` | `"Search…"` | Search input placeholder |
| `emptyText` | `string` | `"No results."` | Shown when search has no matches |
| `showSelectAll` | `boolean` | `true` | Show select-all option |
| `maxSelected` | `number` | — | Maximum number of selections |
| `clearable` | `boolean` | `true` | Show clear-all button in trigger |
| `triggerMode` | `"chips" \| "count" \| "auto"` | `"auto"` | How selected values appear in trigger |
| `maxChips` | `number` | `3` | In "auto" mode: max chips before switching to count |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Size variant (32 / 40 / 48px height) |
| `tone` | `"neutral" \| "primary" \| "success" \| "danger"` | `"neutral"` | Color tone |
| `disabled` | `boolean` | `false` | Disable interaction |
| `required` | `boolean` | `false` | Mark as required |
| `invalid` | `boolean` | `false` | Show invalid/error state |
| `label` | `string` | — | Label above the trigger |
| `hint` | `string` | — | Helper text below the trigger |
| `error` | `string` | — | Error message (also sets invalid state) |
| `placement` | `"auto" \| "top" \| "bottom"` | `"auto"` | Dropdown placement |
| `renderOption` | `(option, state) => ReactNode` | — | Custom option renderer |
| `renderTrigger` | `(selected) => ReactNode` | — | Custom trigger content renderer |
| `className` | `string` | — | Additional class for root element |
| `style` | `CSSProperties` | — | Inline styles for root element |

## Data attributes

| Element | Attribute | Values |
|---------|-----------|--------|
| Root | `data-size` | `"sm"` \| `"md"` \| `"lg"` |
| Root | `data-tone` | `"neutral"` \| `"primary"` \| `"success"` \| `"danger"` |
| Root | `data-open` | `"true"` when open |
| Root | `data-disabled` | `"true"` when disabled |
| Root | `data-invalid` | `"true"` when invalid |
| Option | `data-selected` | `"true"` when selected |
| Option | `data-focused` | `"true"` when keyboard-focused |
| Option | `data-disabled` | `"true"` when disabled |

## CSS variables

All variables are prefixed with `--rmsel-`. Override on the root or a wrapper element.

```css
.my-select {
  --rmsel-border-focus: #8b5cf6;
  --rmsel-chip-bg: #ede9fe;
  --rmsel-chip-fg: #4c1d95;
}
```

## Keyboard navigation

| Key | Action |
|-----|--------|
| `ArrowDown` | Open dropdown / move focus down |
| `ArrowUp` | Open dropdown / move focus up |
| `Space` | Toggle focused option |
| `Enter` | Toggle focused option / open dropdown |
| `Escape` | Close dropdown |
| Type character | Filter options (when searchable) |
