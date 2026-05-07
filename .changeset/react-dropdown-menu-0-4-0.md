---
"@mshafiqyajid/react-dropdown-menu": minor
---

Add checkbox/radio items, shortcut display, async loadItems, and submenu slide motion.

- `kind?: "item" | "checkbox" | "radio"` on `DropdownMenuItem`. Checkbox renders `role="menuitemcheckbox"` with a checkmark; radio renders `role="menuitemradio"` with a dot. Radio items sharing a `group` string are wrapped in `<ul role="group" aria-label={group}>`.
- `shortcut?: string` — renders a right-aligned `<kbd class="rdrop-kbd">` in the item row (pure display, no hotkey wiring).
- `loadItems?: () => Promise<DropdownMenuItem[]>` on `DropdownMenuStyledProps` — fires on open, shows a spinner row (`rdrop-loading`) while pending, and shows `errorText` (default `"Failed to load"`) on rejection. One fetch per open session.
- Submenu entry now uses `translate3d` with 160ms ease for left and right directions; `prefers-reduced-motion` disables all animations.
