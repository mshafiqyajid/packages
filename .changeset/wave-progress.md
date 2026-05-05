---
"@mshafiqyajid/react-progress": minor
---

Progress polish (non-breaking):

- `segments?: number` — render the bar as N discrete cells (e.g. 5 of 10 filled) instead of a continuous fill. `data-segmented="true"` lands on the root.
- `formatValue(percent, value)` — customize the value display.
- New CSS class `.rprog-bar-segment` and a `rprog-segment-pop` keyframe.
