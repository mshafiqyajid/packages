# @mshafiqyajid/react-accordion

## 0.3.0

### Minor Changes

- 615a68c: feat(accordion): add variant, lazy, renderHeader, nested support, spring motion (0.3.0)

  - **`variant` prop** — `"bordered"` (default, unchanged), `"separated"` (card-per-item with gap), `"flush"` (no borders/radius for embedding in a card)
  - **`lazy` prop** — when `true`, panel content only mounts after first expand; stays mounted on collapse (opt-in for expensive content like forms/charts). Per-item `forceMount?: boolean` always mounts regardless
  - **`renderHeader` slot** — per-item `renderHeader?: ({ isOpen, toggle }) => ReactNode` replaces the trigger button's inner content; button shell and ARIA attrs are preserved. `title` is the fallback
  - **Nested accordions** — a child `<AccordionStyled>` inside a parent item's `content` now works without CSS conflicts; inner `.racc-content` animation is isolated from outer
  - **Motion** — chevron uses spring easing (`cubic-bezier(0.34, 1.56, 0.64, 1)`) on open and fast ease-in on close; panel open/close transitions are asymmetric; `prefers-reduced-motion` zeroes all durations

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
