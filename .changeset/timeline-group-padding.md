---
"@mshafiqyajid/react-timeline": patch
---

Fix grouped timeline visuals — group header had no horizontal padding and used a solid white block that looked jarring against the surrounding page background. Reworked the group label to be a soft inset card:

- Real horizontal padding (`0.75rem`) so the label isn't flush against the rail.
- Soft `rgba` background + 1 px border — reads as a section heading regardless of page colour. Themeable via `--rtl-group-bg` / `--rtl-group-border`.
- 6 px border-radius and a small accent bar (uses the active tone) on the left edge so the header ties visually to the rail.
- 1.5 rem breathing room between consecutive groups (was 1 rem).
- `backdrop-filter: saturate(140%) blur(2px)` on the sticky header so content scrolling underneath stays legible — disabled under `prefers-reduced-motion`.
- Horizontal orientation now puts the label at the start of the row instead of full-width.

No API changes — pure CSS polish.
