# @mshafiqyajid/react-otp-input

## 1.0.0

### Major Changes

- 873a373: Align with cross-package form-control standard.

  **Breaking:**

  - Slot heights bumped to match the form-control scale: sm 36→32px, md 44→40px, lg 52→48px. Override with `--rotp-slot-size-sm/md/lg`.
  - Slot font-sizes adjusted for proportion: sm 16→15px, md 18→17px, lg 22.4→20px. Override with `--rotp-slot-font-size-sm/md/lg`.
  - Border-radius scale unchanged (already 6/8/10) but is now exposed via `--rotp-radius-sm/md/lg` tokens.

  **Added:**

  - New props: `invalid` (mark invalid without inline error text), `required` (sets `aria-required` on the group), `style` passthrough on the root.
  - Group element now exposes `data-invalid="true"` when `aria-invalid` is set.
  - New CSS variables: `--rotp-slot-size-sm/md/lg`, `--rotp-radius-sm/md/lg`, `--rotp-slot-font-size-sm/md/lg`, `--rotp-gap-sm/md/lg`, `--rotp-error-border`, `--rotp-error-ring`.
  - Invalid state now shows error border + error focus ring (driven by `data-invalid="true"`).

## 0.1.2

### Patch Changes

- 0d8d416: Add react-tooltip package; update npm homepage to docs site for all packages

## 0.1.1

### Patch Changes

- 99a05f0: Fix dark mode theme sync; remove prefers-color-scheme auto-detection

## 0.1.0

### Minor Changes

- 867dce9: Initial public release.

  - `useOTP()` headless hook with sanitized value, per-slot input props, completion callback, and helpers (clear, setValue, focusSlot).
  - `<OTPInput>` headless primitive with optional `renderSlot` and render-prop child.
  - `<OTPInputStyled>` polished component with variants (solid / outline / underline), sizes (sm / md / lg), tones (neutral / primary / success / danger), masking, group separators, label / hint / error states.
  - Smart paste fills multiple slots from a single paste event.
  - Full keyboard nav: arrow keys, home/end, backspace cascade, delete.
  - Numeric / alphanumeric / regex / function patterns. Auto-uppercase optional.
  - Themable via CSS variables, dark-mode aware, respects `prefers-reduced-motion`.
  - iOS / Android SMS autofill via `autoComplete="one-time-code"` on the first slot.
  - ESM + CJS, full TypeScript types, zero dependencies, SSR-safe.
