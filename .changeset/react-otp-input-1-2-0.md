---
"@mshafiqyajid/react-otp-input": minor
---

Add `mask` mode string prop, `useOTPResend` hook, bounce/shake motion, and `name` hidden input.

- **`mask` prop** now accepts `"always" | "after-blur" | "after-complete"` in addition to the existing `boolean`. `"after-blur"` masks once the field group loses focus; `"after-complete"` masks once all slots are filled. Masked cells receive the `rotp-cell--masked` CSS class. Backward-compatible: `mask={true}` still works as `"always"`.
- **`useOTPResend` hook** — exported from the root entry point. Accepts `{ onResend, cooldownMs? }` and returns `{ resend, canResend, secondsLeft, isPending }`. Handles async `onResend` promises, countdown timer, and in-flight guard.
- **Cell bounce animation** (`rotp-fill-bounce`) — each cell scales `0 → 1.1 → 1` when a digit is entered, powered by `@keyframes rotp-fill-bounce`.
- **Error shake animation** (`rotp-shake`) — all slots shake horizontally when `data-invalid="true"` is set.
- Both animations are suppressed under `prefers-reduced-motion: reduce`.
- **`name` prop** (already existed on `OTPInputStyled`) — renders `<input type="hidden">` so the OTP participates in native form submission. No change to behaviour; documented clearly.
