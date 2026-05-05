# @mshafiqyajid/react-avatar

## 0.2.0

### Minor Changes

- 321da95: Avatar polish (non-breaking):

  - `autoColor` — derive a stable background color from `name` via a deterministic hash + 10-color palette. Only applies when no explicit `color` is set and the image is absent or errored.
  - `showLoading` — render a shimmering skeleton overlay while the image loads. Drops to the fallback chain on error. Lands `data-loading="true"` on the root.
  - New CSS class `.rav-skeleton` + `--rav-skeleton-bg` / `--rav-skeleton-shine` tokens, dark-mode variants included.

## 0.1.0

### Minor Changes

- 9bb89cb: Initial public release of react-switch, react-badge, react-avatar, react-progress, react-slider, react-popover, react-dropdown-menu, and react-timeline
