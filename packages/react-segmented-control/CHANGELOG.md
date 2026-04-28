# @mshafiqyajid/react-segmented-control

## 0.1.0

### Minor Changes

- 21a1ebe: Initial public release.

  - `useSegmentedControl()` headless hook — generic over option type, returns per-option `buttonProps`, `indicatorStyle` (CSS vars for sliding indicator), `rootProps` for `role="radiogroup"`, and `setValue`.
  - `<SegmentedControl>` headless primitive with `renderOption`, `showIndicator`, and full render-prop child support.
  - `<SegmentedControlStyled>` polished component with variants (solid / pill / underline), sizes (sm / md / lg), tones (neutral / primary / success / danger), `fullWidth`, label / hint slots.
  - Buttery sliding indicator measured via `ResizeObserver` — survives font swaps and layout changes.
  - Full keyboard nav: ←/→/↑/↓ to move (skipping disabled), Home/End to jump to first/last.
  - Strict a11y: `role="radiogroup"`, `role="radio"`, roving `tabIndex`, `aria-checked`, `aria-disabled`.
  - Object options (`{ value, label, disabled }`) and custom `equals` for non-primitive values.
  - Themable via CSS variables, dark-mode aware (auto + explicit `data-rsc-theme`), respects `prefers-reduced-motion`.
  - ESM + CJS, full TypeScript types (generics flow through), zero dependencies, SSR-safe.
