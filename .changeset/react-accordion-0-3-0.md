---
"@mshafiqyajid/react-accordion": minor
---

feat(accordion): add variant, lazy, renderHeader, nested support, spring motion (0.3.0)

- **`variant` prop** — `"bordered"` (default, unchanged), `"separated"` (card-per-item with gap), `"flush"` (no borders/radius for embedding in a card)
- **`lazy` prop** — when `true`, panel content only mounts after first expand; stays mounted on collapse (opt-in for expensive content like forms/charts). Per-item `forceMount?: boolean` always mounts regardless
- **`renderHeader` slot** — per-item `renderHeader?: ({ isOpen, toggle }) => ReactNode` replaces the trigger button's inner content; button shell and ARIA attrs are preserved. `title` is the fallback
- **Nested accordions** — a child `<AccordionStyled>` inside a parent item's `content` now works without CSS conflicts; inner `.racc-content` animation is isolated from outer
- **Motion** — chevron uses spring easing (`cubic-bezier(0.34, 1.56, 0.64, 1)`) on open and fast ease-in on close; panel open/close transitions are asymmetric; `prefers-reduced-motion` zeroes all durations
