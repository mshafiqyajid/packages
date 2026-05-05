---
"@mshafiqyajid/react-otp-input": minor
---

Form-input contract parity (non-breaking):

- `name?: string` — renders `<input type="hidden">` carrying the joined OTP value so the input posts via native form submission. Works in both controlled and uncontrolled modes (the styled component now mirrors the live value internally).
- `id?: string` — overrides the wrapper id used for label association.
- `data-invalid="true"` now also lands on the wrapper root (in addition to the slot group), making the contract consistent with the other input packages.
