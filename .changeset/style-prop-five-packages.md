---
"@mshafiqyajid/react-accordion": patch
"@mshafiqyajid/react-badge": patch
"@mshafiqyajid/react-checkbox": patch
"@mshafiqyajid/react-switch": patch
"@mshafiqyajid/react-toast": patch
---

Add a `style?: CSSProperties` prop to five components for symmetry with the rest of the family. All apply to the root element and merge cleanly with the package's internal styling — no behaviour change, no defaults shifted.

- `AccordionStyled`
- `BadgeStyled`
- `CheckboxStyled`
- `SwitchStyled`
- `ToastProvider` (also gains a `className` prop for the portal region — useful for one-off offsets like `style={{ marginTop: 80 }}` to clear a sticky header).

`ModalStyled` and `CommandPaletteStyled` are intentionally left as `className`-only — they portal-render multiple slots (overlay + panel), where a single top-level `style` would be ambiguous. CSS variables remain the design surface there.
