---
"@mshafiqyajid/react-color-input": minor
---

Recent colors (non-breaking):

- `recentColors: string[]` — controlled list rendered as a row above the presets in the popover. Auto-tracks the last N committed colors when uncontrolled.
- `onRecentColorsChange(colors)` — fires whenever the list changes (most recent first, deduped).
- `recentColorsLimit: number` (default 12) — caps the recent strip.
