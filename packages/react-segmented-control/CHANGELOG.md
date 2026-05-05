# @mshafiqyajid/react-segmented-control

## 0.2.0

### Minor Changes

- b382828: Form-input contract parity (non-breaking):

  - `error?: ReactNode` — flips tone to danger and renders below the track.
  - `invalid?: boolean` — force the invalid state without inline error text. Lands `data-invalid="true"` on the root and `aria-invalid="true"` on the track.
  - `required?: boolean` — surfaces `aria-required` on the track and `required` on the hidden input.
  - `name?: string` — when set, renders a `<input type="hidden">` carrying `String(value)` so the segmented control posts via native form submission.
  - `id?: string` — overrides the wrapper id used for label association.
  - New CSS: `.rsc-error`, `.rsc-root[data-invalid="true"] .rsc-track` border swap, dark-mode tokens `--rsc-error-fg` and `--rsc-border-invalid`.

## 0.1.2

### Patch Changes

- 0d8d416: Add react-tooltip package; update npm homepage to docs site for all packages

## 0.1.1

### Patch Changes

- 99a05f0: Fix dark mode theme sync; remove prefers-color-scheme auto-detection

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
