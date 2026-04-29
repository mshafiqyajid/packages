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
