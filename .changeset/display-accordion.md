---
"@mshafiqyajid/react-accordion": minor
---

Disclosure polish (non-breaking):

- Controlled API: `value` (`number | number[] | null`) + `onValueChange` on the styled component. Hook accepts `value` (`string | string[] | null`) + `onValueChange`. Single mode → string | null, multiple → string[].
- `collapsible` (single mode) — allow re-clicking the open item to close it. Default `true`.
- Per-item `disabled` field on `AccordionItem`. Plus a global `disabled` prop. Greyed out, non-interactive, `aria-disabled` + `data-disabled`.
- `onOpenChange(index, isOpen)` per-item callback fires after open/close.
- `expandAll()` / `collapseAll()` programmatic helpers exposed via the new `apiRef` imperative handle (also accessible from `useAccordion`).
- `tone="success" | "danger"` extends the existing palette.
- Triggers and panels now expose `data-state="open" | "closed"`.
- New exported types: `AccordionImperative`.
