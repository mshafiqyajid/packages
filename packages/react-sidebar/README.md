# @mshafiqyajid/react-sidebar

Collapsible navigation sidebar with nested items, badges, icon-only mode, and full keyboard navigation.

**[Full docs →](https://docs.shafiqyajid.com/react/sidebar/)**

## Install

```bash
npm install @mshafiqyajid/react-sidebar
```

## Quick start

```tsx
import { SidebarStyled } from "@mshafiqyajid/react-sidebar/styled";
import "@mshafiqyajid/react-sidebar/styles.css";

const items = [
  {
    label: "Main",
    items: [
      { id: "dashboard", label: "Dashboard", icon: <DashboardIcon /> },
      {
        id: "projects",
        label: "Projects",
        icon: <FolderIcon />,
        children: [
          { id: "active", label: "Active" },
          { id: "archived", label: "Archived" },
        ],
      },
    ],
  },
];

function App() {
  return (
    <SidebarStyled
      items={items}
      activeId="dashboard"
      onItemClick={(id) => console.log("clicked", id)}
    />
  );
}
```

## Variants

```tsx
<SidebarStyled items={items} variant="bordered" />
<SidebarStyled items={items} variant="filled" />
<SidebarStyled items={items} variant="floating" />
```

## Controlled collapse

```tsx
const [collapsed, setCollapsed] = useState(false);

<SidebarStyled
  items={items}
  collapsed={collapsed}
  onCollapse={setCollapsed}
/>
```

## Header and footer slots

```tsx
<SidebarStyled
  items={items}
  header={<Logo />}
  footer={<UserAvatar />}
/>
```

## Headless hook

```tsx
import { useSidebar } from "@mshafiqyajid/react-sidebar";

function MyNav({ sections }) {
  const { isCollapsed, toggle, getItemProps, isExpanded, toggleSection } =
    useSidebar({ sections, onItemClick: (id) => navigate(id) });

  return (
    <nav data-collapsed={isCollapsed ? "" : undefined}>
      <button onClick={toggle}>Toggle</button>
      {sections.map((section) =>
        section.items.map((item) => (
          <div key={item.id} {...getItemProps(item)}>
            {item.label}
          </div>
        ))
      )}
    </nav>
  );
}
```

## API

### SidebarStyled props

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `SidebarSection[]` | — | Required. Navigation sections and items. |
| `collapsed` | `boolean` | — | Controlled collapsed state. |
| `defaultCollapsed` | `boolean` | `false` | Initial uncontrolled collapsed state. |
| `onCollapse` | `(collapsed: boolean) => void` | — | Fires when collapsed state changes. |
| `showCollapseButton` | `boolean` | `true` | Show the collapse/expand toggle button. |
| `variant` | `"default" \| "bordered" \| "filled" \| "floating"` | `"default"` | Visual variant. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Item size. |
| `activeId` | `string` | — | ID of the currently active item. |
| `onItemClick` | `(id: string, item: SidebarItem) => void` | — | Fires when a leaf item is clicked. |
| `header` | `ReactNode` | — | Slot rendered at the top of the sidebar. |
| `footer` | `ReactNode` | — | Slot rendered at the bottom of the sidebar. |
| `className` | `string` | — | Additional CSS class on the root `<nav>`. |
| `style` | `CSSProperties` | — | Inline style on the root `<nav>`. |
| `ref` | `Ref<HTMLElement>` | — | Forwarded to the `<nav>` element. |

### SidebarSection

```ts
interface SidebarSection {
  label?: string;         // Optional section heading
  items: SidebarItem[];
}
```

### SidebarItem

```ts
interface SidebarItem {
  id: string;
  label: string;
  icon?: ReactNode;
  href?: string;
  active?: boolean;
  disabled?: boolean;
  badge?: ReactNode;
  children?: SidebarItem[];
}
```

### useSidebar return values

| Name | Type | Description |
|---|---|---|
| `isCollapsed` | `boolean` | Whether the sidebar is currently collapsed. |
| `toggle` | `() => void` | Toggle collapsed state. |
| `expandedSections` | `string[]` | IDs of currently expanded nested sections. |
| `isExpanded` | `(id: string) => boolean` | Check if a nested section is expanded. |
| `toggleSection` | `(id: string) => void` | Expand/collapse a nested section. |
| `sidebarProps` | object | Spread onto the `<nav>` element. |
| `getItemProps` | `(item: SidebarItem) => object` | Spread onto each item element. |
| `getSectionProps` | `(sectionId, label?) => object` | Spread onto nested `<ul>` elements. |

## Keyboard navigation

| Key | Action |
|---|---|
| `↓` / `↑` | Move focus between visible items |
| `→` | Expand a collapsed nested section / focus first child |
| `←` | Collapse an expanded section / focus parent |
| `Enter` / `Space` | Activate item or toggle nested section |

## CSS variables

| Variable | Default | Description |
|---|---|---|
| `--rsb-bg` | `#ffffff` | Sidebar background |
| `--rsb-fg` | `#18181b` | Text color |
| `--rsb-accent` | `#6366f1` | Accent / active color |
| `--rsb-width-sm` | `200px` | Width at `size="sm"` |
| `--rsb-width-md` | `240px` | Width at `size="md"` |
| `--rsb-width-lg` | `280px` | Width at `size="lg"` |
| `--rsb-collapsed-width` | `56px` | Width when collapsed |
| `--rsb-duration-width` | `250ms` | Collapse animation duration |

Dark mode is applied via a `[data-theme="dark"]` ancestor.

## License

MIT
