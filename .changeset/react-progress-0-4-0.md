---
"@mshafiqyajid/react-progress": minor
---

Add `sections` segmented bar, `bufferValue` ghost track, and `ProgressCircleStack` concentric rings component.

- `sections?: Array<{ value; tone?; label? }>` on `ProgressBar` — divides the bar into proportional coloured segments that animate in sequentially on mount (stagger left-to-right). Non-breaking: absent = existing single-fill behaviour.
- `bufferValue?: number` on `ProgressBar` — renders a translucent ghost fill behind the active fill (video-player buffered-range pattern). Transitions at a slower speed than the active fill. Non-breaking.
- `ProgressCircleStack` — new exported component rendering 2–4 concentric `ProgressCircle` rings (Apple Watch activity rings). Props: `rings`, `size` (default 120), `gap` (default 6px). Rings animate in with increasing delay per ring. All new motion respects `prefers-reduced-motion`.
