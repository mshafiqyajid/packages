---
"@mshafiqyajid/react-chart": patch
---

Fix tooltip regression on Bar / Line / Pie charts that shipped in 1.0.0.

The 1.0 release added an unscoped `.rchart-tooltip` rule for AreaChart/ScatterChart that overrode the original Bar / Line / Pie tooltip's `top/left` pixel positioning — tooltips on those charts displayed at the top of the container instead of next to the hovered element.

**Fix:** scoped every Area/Scatter-specific tooltip selector under `.rchart-area` or `.rchart-scatter`. The original Bar / Line / Pie tooltip now positions correctly again.

**Polish bundled in the same patch:**

- Tooltip pop-in animation on every chart type — 140 ms cubic-bezier translate + scale, respects `prefers-reduced-motion`.
- Tabular-num value alignment + slightly larger font.
- Bigger arrow tail with a subtle drop-shadow so it doesn't look detached from the body.
- Hover polish on Bar / Pie / Line dots:
  - Bars: `brightness(1.08)` + small drop-shadow on hover (was just `opacity 0.8`).
  - Pie slices: `brightness(1.06)` + drop-shadow + smoother transition curve.
  - Dots: cubic-bezier `r` transition + drop-shadow on hover.
- All hover transitions disabled under `prefers-reduced-motion`.
