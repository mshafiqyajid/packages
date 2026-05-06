---
"@mshafiqyajid/react-command-palette": patch
"@mshafiqyajid/react-stepper": patch
"@mshafiqyajid/react-tree": patch
"@mshafiqyajid/react-date-picker": patch
---

Smooth motion polish across all four packages:

- Shared motion tokens (`--*-duration-fast` / `--*-duration` / `--*-duration-slow` / `--*-ease` / `--*-ease-spring`) for consistent timing across every interactive surface.
- Every hover, active, focus, and selection cue now has a transition. Reduced-motion users still get instant state changes.

Per-package highlights:

- **react-command-palette**: animated overlay backdrop blur, slower spring panel reveal, item hover/active gain a subtle lift + glow ring, group + empty-state fade-in.
- **react-stepper** (also fixes layout bug): horizontal trigger now top-aligns the indicator with the title (was centered against the 2-line label block, pushing the circle below the title). Connector now animates a coloured fill on completion. Active indicator gains a soft glow ring. Content panel + error message fade-in on transition.
- **react-tree**: rows fade-in when parents expand. Hover/selection use a small `translateX` lift. Chevron rotation now uses a spring ease. Selection-state icon scales gently.
- **react-date-picker**: calendar pop-in with translate + scale. Day cells scale on hover/active. Selected day gains a soft shadow. Quick-pick chips lift on hover, time inputs use shared focus ring transition.
