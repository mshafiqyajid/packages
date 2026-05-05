# @mshafiqyajid/react-rating

## 0.3.0

### Minor Changes

- b382828: Form-input contract parity (non-breaking):

  - `error?: ReactNode` and `invalid?: boolean` — flips tone to danger, lands `data-invalid="true"` on the wrapper and `aria-invalid="true"` on the radiogroup.
  - `required?: boolean` — surfaces `aria-required` on the radiogroup and `required` on the hidden input.
  - `name?: string` — renders `<input type="hidden">` carrying the current numeric value so the rating posts via native form submission.
  - `id?: string` — overrides the wrapper id used for label association.
  - Stars wired with `aria-labelledby` / `aria-describedby` to the rendered `label` / `hint` / `error`.
  - New CSS: `.rrt-error`, dark-mode token `--rrt-error-fg`.

## 0.2.0

### Minor Changes

- f8ca726: Async submit support (non-breaking):

  - `onChange` may now return a `Promise<void>`. While the promise is in flight, the rating becomes non-interactive (`aria-busy="true"`, `data-pending="true"` on the radiogroup root).
  - If the promise rejects, the optimistic value is reverted to the previous value (uncontrolled mode).
  - New result field on `useRating`: `isPending`.

## 0.1.2

### Patch Changes

- 0d8d416: Add react-tooltip package; update npm homepage to docs site for all packages

## 0.1.1

### Patch Changes

- 99a05f0: Fix dark mode theme sync; remove prefers-color-scheme auto-detection

## 0.1.0

### Minor Changes

- 8fedaf2: Initial public release.

  - `useRating()` headless hook — controlled/uncontrolled, half-step or full-step, exposes per-item `fill` (0/0.5/1) and `itemProps` to spread onto your own element. Returns `value`, `hoverValue`, `displayValue`, `setValue`, `clear`.
  - `<Rating>` headless primitive — default star icons with stacked empty/filled layers and CSS-clip half-fill. Pass `icon` for custom shapes, `renderIcon` for full per-star control, or a render-prop `children` for everything.
  - `<RatingStyled>` polished component with sizes (sm / md / lg), tones (neutral / primary / success / warning / danger), `showValue`, `formatValue`, `label`, `hint`.
  - Half-step interaction: hover/click left half = `+0.5`, right half = full. Toggle off with `allowHalf={false}`.
  - Hover preview separate from committed value — `onHover` fires during hover, `onChange` fires on commit.
  - Clearable: re-clicking the active value sets to 0 (toggle with `clearable={false}`).
  - Full keyboard nav: ←/→/↑/↓, Home/End, Space/Enter, with roving `tabIndex`.
  - Strict a11y: `role="radiogroup"` on root, `role="radio"` per star, `aria-checked`, `aria-readonly`, `aria-disabled`.
  - Themable via CSS variables, dark-mode aware (auto + explicit `data-rrt-theme`), respects `prefers-reduced-motion`.
  - ESM + CJS, full TypeScript types, zero dependencies, SSR-safe.
