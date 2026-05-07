---
"@mshafiqyajid/react-chart": patch
---

fix(chart): tooltip position and lollipop mode

**Tooltip animation clobbered position** — the `rchart-tooltip-in` keyframes ended at `transform: translate(0,0) scale(1)`, overriding the inline `transform: translate(-50%, -100%)` used to centre and lift the tooltip above its anchor. The keyframes now bake in the base transform so they end at `translate(-50%, -100%) scale(1)`.

**Line chart tooltip pointed at circle top instead of centre** — `y` was set to `elRect.top - rootRect.top` (top edge of the hit circle). Changed to `+ elRect.height / 2` so the arrow points at the circle centre.

**Lollipop mode had no tooltip** — the `<g>` element rendered for lollipop bars had `onClick` but no `onMouseEnter`/`onMouseLeave`. Added tooltip handlers that derive the SVG-to-root coordinate conversion from the SVG viewBox scale so the tooltip positions correctly over the lollipop dot.
