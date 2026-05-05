# @mshafiqyajid/react-switch

## 0.2.0

### Minor Changes

- f8ca726: Async toggle support (non-breaking):

  - `onChange` may now return a `Promise<void>`. While the promise is in flight, the switch shows the spinner thumb (sets `data-loading="true"` + `data-pending="true"`), reports `aria-busy="true"`, and ignores further clicks.
  - If the promise rejects, the optimistic checked state is reverted automatically (uncontrolled mode) — controlled callers continue to manage their own state.
  - New result field on `useSwitch`: `isPending`. The existing `loading` prop still works to force the spinner regardless of any in-flight promise.

## 0.1.0

### Minor Changes

- 9bb89cb: Initial public release of react-switch, react-badge, react-avatar, react-progress, react-slider, react-popover, react-dropdown-menu, and react-timeline
