# @mshafiqyajid/react-accordion

## 0.2.1

### Patch Changes

- 79ea049: Add a `style?: CSSProperties` prop to five components for symmetry with the rest of the family. All apply to the root element and merge cleanly with the package's internal styling — no behaviour change, no defaults shifted.

  - `AccordionStyled`
  - `BadgeStyled`
  - `CheckboxStyled`
  - `SwitchStyled`
  - `ToastProvider` (also gains a `className` prop for the portal region — useful for one-off offsets like `style={{ marginTop: 80 }}` to clear a sticky header).

  `ModalStyled` and `CommandPaletteStyled` are intentionally left as `className`-only — they portal-render multiple slots (overlay + panel), where a single top-level `style` would be ambiguous. CSS variables remain the design surface there.

## 0.2.0

### Minor Changes

- 1a6615d: Disclosure polish (non-breaking):

  - Controlled API: `value` (`number | number[] | null`) + `onValueChange` on the styled component. Hook accepts `value` (`string | string[] | null`) + `onValueChange`. Single mode → string | null, multiple → string[].
  - `collapsible` (single mode) — allow re-clicking the open item to close it. Default `true`.
  - Per-item `disabled` field on `AccordionItem`. Plus a global `disabled` prop. Greyed out, non-interactive, `aria-disabled` + `data-disabled`.
  - `onOpenChange(index, isOpen)` per-item callback fires after open/close.
  - `expandAll()` / `collapseAll()` programmatic helpers exposed via the new `apiRef` imperative handle (also accessible from `useAccordion`).
  - `tone="success" | "danger"` extends the existing palette.
  - Triggers and panels now expose `data-state="open" | "closed"`.
  - New exported types: `AccordionImperative`.

## 0.1.0

### Minor Changes

- d1c5eda: Initial public release of react-accordion, react-tabs, react-toast, react-select, and react-modal
