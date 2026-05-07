---
"@mshafiqyajid/react-badge": minor
---

Add `BadgeAnchor` component, count flip animation, and pop-on-mount animation.

- **`BadgeAnchor`** — wraps any child and pins a `BadgeStyled` to the top-right corner via `position: absolute`. Accepts `badge`, `offset` (`x`/`y`, default `-6`), and `className` props.
- **Count flip** — when `count` changes, `.rbadge-count` animates the incoming digit in from below (count up) or from above (count down) over 220ms. Driven by `data-dir="up"|"down"` set by a React effect.
- **Pop on mount** — `.rbadge-badge` plays a `scale(0) → scale(1.2) → scale(1)` spring bounce on first render via `data-mounted="true"` set after mount.
- All animations respect `prefers-reduced-motion`.
