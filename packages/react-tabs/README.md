# @mshafiqyajid/react-tabs

Headless tabs hook and styled component for React. Accessible, keyboard-friendly, animated, SSR-safe, fully typed.

**[Full docs →](https://docs.shafiqyajid.com/react/tabs/)**

## Installation

```bash
npm install @mshafiqyajid/react-tabs
```

## Quick start — styled component

```tsx
import { TabsStyled } from "@mshafiqyajid/react-tabs/styled";
import "@mshafiqyajid/react-tabs/styles.css";

const tabs = [
  { value: "account", label: "Account", content: <div>Account settings</div> },
  { value: "security", label: "Security", content: <div>Security settings</div> },
  { value: "billing", label: "Billing", content: <div>Billing info</div>, disabled: true },
];

export function App() {
  return <TabsStyled tabs={tabs} defaultValue="account" />;
}
```

## Quick start — headless hook

```tsx
import { useTabs } from "@mshafiqyajid/react-tabs";

function MyTabs() {
  const { getTabProps, getPanelProps, activeValue } = useTabs({
    defaultValue: "account",
  });

  return (
    <div>
      <div role="tablist">
        <button {...getTabProps("account")}>Account</button>
        <button {...getTabProps("security")}>Security</button>
      </div>
      <div {...getPanelProps("account")}>Account content</div>
      <div {...getPanelProps("security")}>Security content</div>
    </div>
  );
}
```

## Props — `TabsStyled`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tabs` | `TabItem[]` | required | Array of tab definitions |
| `variant` | `"line" \| "solid" \| "pill"` | `"line"` | Visual style of the tab indicator |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Size of tabs |
| `tone` | `"neutral" \| "primary"` | `"neutral"` | Color tone |
| `defaultValue` | `string` | — | Initial active tab (uncontrolled) |
| `value` | `string` | — | Controlled active tab |
| `onChange` | `(value: string) => void` | — | Called when tab changes |

### `TabItem`

```ts
interface TabItem {
  value: string;
  label: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}
```

## Props — `useTabs`

| Option | Type | Description |
|--------|------|-------------|
| `defaultValue` | `string` | Initial active tab (uncontrolled) |
| `value` | `string` | Controlled active tab |
| `onChange` | `(value: string) => void` | Called when tab changes |
| `tabs` | `{ value: string; disabled?: boolean }[]` | Tab definitions for keyboard navigation |

### Returns

| Key | Type | Description |
|-----|------|-------------|
| `activeValue` | `string \| undefined` | Currently active tab value |
| `getTabProps` | `(value: string) => object` | Spread onto each tab button |
| `getPanelProps` | `(value: string) => object` | Spread onto each panel |

## Keyboard navigation

| Key | Action |
|-----|--------|
| `ArrowRight` / `ArrowDown` | Move to next tab |
| `ArrowLeft` / `ArrowUp` | Move to previous tab |
| `Home` | Move to first tab |
| `End` | Move to last tab |

## Dark mode

Add `data-theme="dark"` to a parent element (or `data-rtab-theme="dark"` for component-scoped dark mode). Never uses `@media (prefers-color-scheme: dark)`.

```html
<div data-theme="dark">
  <!-- TabsStyled inherits dark mode here -->
</div>
```

## License

MIT

## What's new in 0.4.0

- **Closeable tabs (new API)** — `tab.closeable?: boolean` renders a × button with `aria-label="Close <label>"` and `class="rtab-close"`. Pair with `onClose(value)`. The closed tab animates its width to 0 before calling the handler.
- **Overflow scroll arrows fade** — scroll arrows now always exist in the DOM and fade in/out via opacity when content overflows, for a smoother experience than conditional rendering.
- **Drag-reorder (new API)** — `reorderable: true` + `onReorder(fromIndex, toIndex)`. Reports numeric indices instead of the full values array. The `sortable` / `onReorder(values[])` API remains unchanged.
- **`activationMode` prop** — alias for `activation`. `"automatic"` (default) activates on arrow key; `"manual"` moves focus only — Enter/Space activates.
- **Drop indicator** — a thin line appears before the drop-target tab during drag-reorder.
- **`style` prop** — the root `<div>` now accepts a `style` prop.

## What's new in 0.3.0

- **Closeable tabs** — `tab.closable?: boolean` renders a × button; pair with `onTabClose(value)`.
- **Scrollable overflow** — `scrollable: true` keeps tabs on one line and renders chevron scroll buttons at the edges instead of wrapping.
- **Drag-to-reorder** — `sortable: true` + `onReorder(values: string[])`. HTML5 DnD, no external dep.
- **Keyboard typeahead** — letters jump to the first matching tab whose label starts with the buffer (600 ms reset).
- **`scrollActiveIntoView`** — default `true` when `scrollable`. Keeps the active tab in the viewport on activation.
