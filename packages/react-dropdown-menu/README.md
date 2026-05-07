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
      trigger={<button>Options</button>}
      placement="bottom-start"
      offset={4}
      collisionPadding={12}
      flip
      shift
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

## Submenus

```tsx
<DropdownMenuStyled
  trigger={<button>File</button>}
  items={[
    { label: "New", onClick: () => create() },
    {
      label: "Open recent",
      items: [
        { label: "report.pdf", onClick: () => open("report.pdf") },
        { label: "notes.md",   onClick: () => open("notes.md") },
        { divider: true },
        { label: "Clear",      onClick: () => clearRecents() },
      ],
    },
    { divider: true },
    { label: "Quit", onClick: () => quit() },
  ]}
/>
```

Parent rows render a chevron and a hover/click-driven flyout. Keyboard: `→` opens the submenu, `←` returns to the parent, `Enter` / `Space` activates.

## Positioning

| Prop | Type | Default | Description |
|---|---|---|---|
| `placement` | `top \| bottom \| left \| right` plus each with `-start` / `-end` | `"bottom-start"` | Preferred side and alignment |
| `offset` | `number` | `4` | Gap between trigger and menu |
| `collisionPadding` | `number` | `8` | Viewport edge margin for flip / shift |
| `flip` | `boolean` | `true` | Auto-flip to opposite side near edges |
| `shift` | `boolean` | `true` | Push back into view along the cross-axis |
| `strategy` | `"absolute" \| "fixed"` | `"absolute"` | Positioning strategy |

`data-placement` on the menu reflects the resolved (post-flip) placement.

## License

MIT

## What's new in 0.4.0

### Checkbox and radio items

```tsx
<DropdownMenuStyled
  trigger={<button>Options</button>}
  items={[
    { label: "Bold",   kind: "checkbox", checked: true,  onClick: toggle },
    { label: "Italic", kind: "checkbox", checked: false, onClick: toggle },
    { divider: true },
    { label: "Small",  kind: "radio", group: "Size", checked: false, onClick: () => setSize("sm") },
    { label: "Medium", kind: "radio", group: "Size", checked: true,  onClick: () => setSize("md") },
    { label: "Large",  kind: "radio", group: "Size", checked: false, onClick: () => setSize("lg") },
  ]}
/>
```

- `kind?: "item" | "checkbox" | "radio"` — default `"item"`.
- Checkbox: `role="menuitemcheckbox"`, checkmark when `checked`.
- Radio: `role="menuitemradio"`, dot when `checked`. Items sharing a `group` string get a `<div role="group" aria-label={group}>` wrapper.
- CSS classes: `rdrop-item-check` (checkbox rows), `rdrop-item-radio` (radio rows), `rdrop-item-indicator` (the SVG icon).

### Keyboard shortcut display

```tsx
{ label: "Save", shortcut: "⌘S", onClick: save }
```

Renders a right-aligned `<kbd class="rdrop-kbd">` in the item row. Pure display — no hotkey wiring.

### Async `loadItems`

```tsx
<DropdownMenuStyled
  trigger={<button>Actions</button>}
  loadItems={async () => {
    const res = await fetch("/api/actions");
    return res.json();
  }}
  loadingText="Loading…"
  errorText="Failed to load"
/>
```

- Fires once per open session (resets when menu closes).
- Shows a spinner row while pending (`rdrop-loading` class).
- Shows `errorText` row on rejection (`rdrop-error` class).

### Motion

- Submenu slides in from the side with `translate3d` and 160ms ease (left vs. right direction-aware).
- `prefers-reduced-motion` disables all transitions and animations.

## What's new in 0.3.0

- **Nested submenus** — `DropdownMenuItem` accepts `items?: DropdownMenuItem[]`. Parent rows render a chevron and a hover/click flyout. → opens the submenu, ← returns, Enter/Space activates. Submenus inherit `size` / `collisionPadding` / `flip` / `shift` / `strategy` from the parent menu.

## 0.3.1 — submenu polish

- 4 px gap between the parent menu and the submenu (was flush) plus a subtle entry transition. Fixes the no-padding feedback on the initial submenu release.
