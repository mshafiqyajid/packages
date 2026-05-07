---
"@mshafiqyajid/react-slider": minor
---

Add multi-thumb (3+ values), snapToMarks, log scale, spring thumb motion, and drag-managed tooltip fade.

- `value: number[]` with 3+ elements renders that many independent thumbs; each thumb is bounded by its neighbours.
- `snapToMarks` — thumb snaps to the nearest mark on drag end / keyboard commit.
- `scale: "log"` with `scaleBase` — maps linear track position to a logarithmic value range.
- Spring easing (`cubic-bezier(0.34, 1.56, 0.64, 1)`) on thumb release; transition disabled during active drag.
- Value tooltip fades in on drag start and fades out 800 ms after drag end; both respect `prefers-reduced-motion`.
