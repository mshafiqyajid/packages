# @mshafiqyajid/react-otp-input

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
