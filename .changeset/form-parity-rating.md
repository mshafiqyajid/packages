---
"@mshafiqyajid/react-rating": minor
---

Form-input contract parity (non-breaking):

- `error?: ReactNode` and `invalid?: boolean` — flips tone to danger, lands `data-invalid="true"` on the wrapper and `aria-invalid="true"` on the radiogroup.
- `required?: boolean` — surfaces `aria-required` on the radiogroup and `required` on the hidden input.
- `name?: string` — renders `<input type="hidden">` carrying the current numeric value so the rating posts via native form submission.
- `id?: string` — overrides the wrapper id used for label association.
- Stars wired with `aria-labelledby` / `aria-describedby` to the rendered `label` / `hint` / `error`.
- New CSS: `.rrt-error`, dark-mode token `--rrt-error-fg`.
