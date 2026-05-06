---
"@mshafiqyajid/react-date-picker": minor
---

react-date-picker — adds time picker + quick-pick chips:

- **`showTime`** — when `mode="single"`, renders an HH:mm input below the calendar grid. Edits set hours/minutes (and seconds when `showSeconds`) on the selected `Date`. Pair with `timeStep` to control the input's `step` attribute (default 60 seconds, or 1 second when `showSeconds`).
- **`showSeconds`** — include seconds in the time input (`HH:mm:ss`).
- **`timeStep`** — HTML `<input type="time">` `step` attribute (defaults to 60 / 1 based on `showSeconds`).
- **`quickPicks`** — array of `{ label, apply: () => Date | RangeValue }` chips rendered above the calendar. Click a chip to fire `onChange` (and close the popover for single-mode). Useful for "Today / This week / Last 30 days / This month" presets.

Date and time are stored on the same `Date` value — no separate state. Both additions are styled with package-prefixed CSS vars and respect `prefers-reduced-motion`.
