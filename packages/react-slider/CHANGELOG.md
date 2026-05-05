# @mshafiqyajid/react-slider

## 0.2.0

### Minor Changes

- b382828: Form-input contract parity (non-breaking):

  - `label`, `hint`, `error` slots, plus `invalid` and `required` flags.
  - `name?: string` — renders a `<input type="hidden">` for the current value so the slider posts via native form submission. Range mode emits two hidden inputs: `${name}` and `${name}-end`.
  - `id?: string` — overrides the wrapper id used for label association.
  - Track gains `aria-invalid`, `aria-required`, `aria-labelledby`, `aria-describedby` wiring.
  - Root lands `data-invalid="true"` when `invalid` or `error` is set; track active fill switches to the error color.
  - New CSS classes / tokens: `.rslider-label`, `.rslider-hint`, `.rslider-error`, `--rslider-label-fg`, `--rslider-hint-fg`, `--rslider-error-fg`. Dark-mode variants included.

## 0.1.0

### Minor Changes

- 9bb89cb: Initial public release of react-switch, react-badge, react-avatar, react-progress, react-slider, react-popover, react-dropdown-menu, and react-timeline
