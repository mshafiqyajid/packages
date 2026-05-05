---
"@mshafiqyajid/react-segmented-control": minor
---

Form-input contract parity (non-breaking):

- `error?: ReactNode` — flips tone to danger and renders below the track.
- `invalid?: boolean` — force the invalid state without inline error text. Lands `data-invalid="true"` on the root and `aria-invalid="true"` on the track.
- `required?: boolean` — surfaces `aria-required` on the track and `required` on the hidden input.
- `name?: string` — when set, renders a `<input type="hidden">` carrying `String(value)` so the segmented control posts via native form submission.
- `id?: string` — overrides the wrapper id used for label association.
- New CSS: `.rsc-error`, `.rsc-root[data-invalid="true"] .rsc-track` border swap, dark-mode tokens `--rsc-error-fg` and `--rsc-border-invalid`.
