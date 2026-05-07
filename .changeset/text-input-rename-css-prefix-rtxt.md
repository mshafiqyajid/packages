---
"@mshafiqyajid/react-text-input": major
---

Rename CSS prefix from `rti-` to `rtxt-` to resolve a collision with `react-tag-input`.

**Migration:** If you reference any `rti-` class names or CSS custom properties (e.g. `--rti-radius`, `.rti-root`) in your own stylesheets or tests, replace them with the `rtxt-` equivalents (e.g. `--rtxt-radius`, `.rtxt-root`). Import paths and component/hook APIs are unchanged.
