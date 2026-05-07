---
"@mshafiqyajid/react-select": minor
---

**What's new in 0.4.0**

- **Grouped items** — pass `SelectGroup[]` to `items` to render sticky group labels (`rsel-group`, `rsel-group-label`). Keyboard navigation and search filter work across groups.
- **`renderItem` render prop** — customize option content while the hook keeps managing the `<li>` shell, keyboard focus, and selection logic.
- **`renderEmpty` render prop** — replace the default "No results" text with any ReactNode.
- **`renderTrigger` render prop** — replace the trigger button's inner content (receives `selected` and `open` state).
- **Motion polish** — list items slide-fade in on open with CSS stagger; selected chips scale in; the async loading spinner has a smooth rotation. All animations respect `prefers-reduced-motion`.
- **`style` prop** added to `SelectStyledProps` for inline sizing without a wrapper element.
- No breaking changes. All existing props and class names are unchanged.
