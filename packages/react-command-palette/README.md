# @mshafiqyajid/react-command-palette

⌘K command palette for React. Headless `useCommandPalette` hook + styled component. Fuzzy match, sections, recent items, keyboard nav, global hotkey. Zero dependencies, fully typed.

**[Full docs →](https://docs.shafiqyajid.com/react/command-palette/)**

## Install

```bash
npm install @mshafiqyajid/react-command-palette
```

## Quick start (styled)

```tsx
import { CommandPaletteStyled } from "@mshafiqyajid/react-command-palette/styled";
import "@mshafiqyajid/react-command-palette/styles.css";

const items = [
  { id: "new",    label: "New file",      group: "File", shortcut: "⌘N" },
  { id: "open",   label: "Open recent",   group: "File", keywords: ["history"] },
  { id: "find",   label: "Find in files", group: "Edit", shortcut: "⌘F" },
  { id: "settings", label: "Open settings", group: "App" },
];

<CommandPaletteStyled
  items={items}
  onSelect={(item) => console.log(item.id)}
  recentStorageKey="my-app-cmd-recent"
/>
```

The palette opens automatically on **⌘K** / **Ctrl+K** (configurable via `hotkey`). Up/Down arrows move, Enter selects, Esc closes.

## Headless

```tsx
import { useCommandPalette } from "@mshafiqyajid/react-command-palette";

const cmd = useCommandPalette({ items, onSelect });

return (
  <>
    {cmd.isOpen && (
      <div role="dialog">
        <input {...cmd.inputProps} placeholder="Type a command…" />
        <ul {...cmd.listProps}>
          {cmd.groups.map((g) => (
            <section key={g.id}>
              <h4>{g.label}</h4>
              {g.items.map((item) => (
                <li key={item.id} {...cmd.getItemProps(item)}>{item.label}</li>
              ))}
            </section>
          ))}
        </ul>
      </div>
    )}
  </>
);
```

## Features

- **Global hotkey** — ⌘K / Ctrl+K opens by default; pass `hotkey={null}` to disable.
- **Fuzzy match** — case-insensitive substring on `label`, `hint`, and `keywords[]`. Pass a custom `filter` for fuzzy/scoring algorithms.
- **Sections** — items grouped by `group` field; "Recent" section auto-renders when empty query + `recentStorageKey`.
- **Recent items** — track the last 5 selections per `recentStorageKey` (localStorage).
- **Keyboard nav** — ArrowUp / ArrowDown / Home / End / Enter / Esc.
- **A11y** — combobox + listbox roles, `aria-activedescendant`, `aria-expanded`, modal dialog when open.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `CommandItem[]` | — | Required. Items to render. |
| `onSelect` | `(item) => void` | — | Fires on Enter / click. |
| `defaultOpen` | `boolean` | `false` | Initial open state |
| `open` / `onOpenChange` | controlled state pair | — | Controlled open state |
| `defaultQuery` | `string` | `""` | Initial search value |
| `filter` | `(item, query) => boolean` | substring match | Custom filter |
| `recentStorageKey` | `string` | — | Persists last 5 selections |
| `hotkey` | `{ key, meta?, ctrl?, shift? } \| null` | `{ key: "k", meta: true, ctrl: true }` | Global open shortcut |
| `placeholder` | `string` | `"Type a command…"` | Search input placeholder |
| `emptyText` | `ReactNode` | `"No results."` | When nothing matches |
| `emptyState` | `(query) => ReactNode` | — | Custom empty state — receives the active query. Overrides `emptyText`. |
| `loading` | `boolean` | `false` | Show a loading row instead of items. Use with async filtering. |
| `loadingText` | `ReactNode` | `"Loading…"` | Loading row text |
| `highlightMatches` | `boolean` | `true` | Bolden matched query characters in labels |
| `footer` | `ReactNode` | — | Footer slot (keyboard hints, etc) |

### CommandItem

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Required, unique |
| `label` | `string` | Required, also matched by filter |
| `hint` | `string?` | Secondary text + matched by filter |
| `icon` | `ReactNode?` | Left-side icon |
| `shortcut` | `string?` | Right-side keyboard hint, e.g. "⌘N" |
| `group` | `string?` | Sections items together |
| `disabled` | `boolean?` | Skipped by keyboard nav, can't fire `onSelect` |
| `keywords` | `string[]?` | Extra search terms |
| `data` | `T?` | Free-form payload |

## License

MIT
