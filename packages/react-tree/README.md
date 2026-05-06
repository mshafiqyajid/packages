# @mshafiqyajid/react-tree

Headless tree view hook and styled component for React. Expand/collapse, single or multi-select, async children loading, full keyboard navigation, indent guides. Zero dependencies, fully typed.

**[Full docs →](https://docs.shafiqyajid.com/react/tree/)**

## Install

```bash
npm install @mshafiqyajid/react-tree
```

## Quick start (styled)

```tsx
import { TreeStyled } from "@mshafiqyajid/react-tree/styled";
import "@mshafiqyajid/react-tree/styles.css";

const items = [
  {
    id: "src",
    label: "src",
    children: [
      { id: "components", label: "components", children: [
        { id: "Button.tsx", label: "Button.tsx" },
      ]},
      { id: "index.ts", label: "index.ts" },
    ],
  },
  { id: "package.json", label: "package.json" },
];

<TreeStyled
  items={items}
  defaultExpandedIds={["src"]}
  onSelectedChange={(id) => console.log(id)}
/>
```

## Async children

```tsx
<TreeStyled
  items={[{ id: "root", label: "root", children: undefined }]}
  loadChildren={async (node) => {
    const res = await fetch(`/api/children/${node.id}`);
    return res.json();
  }}
/>
```

When a node has `children: undefined` AND a `loadChildren` is set, expanding it triggers the loader. The chevron is replaced with a spinner during the request.

## Headless

```tsx
import { useTree } from "@mshafiqyajid/react-tree";

const tree = useTree({ items, defaultExpandedIds: ["src"] });

return (
  <ul {...tree.getRootProps()}>
    {tree.visibleNodes.map(({ node, depth, hasChildren }) => (
      <li key={node.id} {...tree.getNodeProps(node, depth)} style={{ paddingLeft: depth * 18 }}>
        {hasChildren && (
          <button {...tree.getToggleProps(node)}>
            {tree.isExpanded(node.id) ? "▾" : "▸"}
          </button>
        )}
        {node.label}
      </li>
    ))}
  </ul>
);
```

## Keyboard navigation

| Key | Action |
|-----|--------|
| `↓` / `↑` | Move focus between visible nodes |
| `→` | Expand collapsed parent / move to first child |
| `←` | Collapse expanded parent / move to parent |
| `Home` / `End` | Jump to first / last visible node |
| `Enter` / `Space` | Select the focused node |

## Features

- **Expand / collapse** — controlled (`expandedIds` + `onExpandedChange`) or uncontrolled (`defaultExpandedIds`).
- **Selection** — single (default) or `selectionMode: "multiple"`. Both controlled and uncontrolled.
- **Async children** — `loadChildren(node) => Promise<TreeNode[]>` fires on first expand of nodes with `children: undefined`.
- **Indent guides** — vertical 1px lines drawn between nesting levels (toggle with `showGuides`).
- **A11y** — full ARIA tree pattern (`role="tree"` / `treeitem`, `aria-expanded`, `aria-selected`, `aria-level`).

## Props (styled)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `TreeNode[]` | — | Required |
| `defaultExpandedIds` / `expandedIds` / `onExpandedChange` | controlled state | — | Expanded ids |
| `defaultSelectedId` / `selectedId` / `onSelectedChange` | controlled state | — | Single-selected id |
| `selectionMode` | `"single" \| "multiple"` | `"single"` | — |
| `selectedIds` / `onSelectedIdsChange` | controlled ids | — | Multi-selection (when `selectionMode === "multiple"`) |
| `loadChildren` | `(node) => Promise<TreeNode[]>` | — | Async children loader |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Row size |
| `tone` | `"neutral" \| "primary"` | `"primary"` | Accent |
| `showGuides` | `boolean` | `true` | Indent guide lines |
| `searchQuery` | `string` | `""` | Filter visible nodes by case-insensitive label match. Auto-expands matching ancestors. |
| `highlightMatches` | `boolean` | `true` | Bolden matched query characters in labels |
| `checkboxes` | `boolean` | `false` | Render a checkbox per node alongside the label |
| `renderLabel` | `(node, depth) => ReactNode` | — | Custom label renderer |
| `renderBadge` | `(node) => ReactNode` | — | Slot rendered after the label (e.g., count, status) |
| `emptyState` | `ReactNode` | auto | Shown when no nodes match the search |

### TreeNode

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Required, unique |
| `label` | `ReactNode` | Required |
| `children` | `TreeNode[] \| undefined` | `undefined` = leaf or async-loadable. `[]` = empty branch. |
| `icon` | `ReactNode?` | Left-side icon |
| `disabled` | `boolean?` | Greyed out, can't toggle/select |
| `data` | `T?` | Free-form payload |

## License

MIT
