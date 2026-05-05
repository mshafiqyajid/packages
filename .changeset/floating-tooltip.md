---
"@mshafiqyajid/react-tooltip": minor
---

Floating-UI parity (non-breaking):

- Extended `placement` to `-start | -end` aligned variants for all four sides.
- New props: `offset` (default 8), `collisionPadding` (default 8), `flip` (default true), `shift` (default true), `strategy` (`"absolute"` | `"fixed"`).
- `data-placement` now reflects the resolved (post-flip) placement.
- Exports `TooltipSide`, `TooltipAlign`, `TooltipStrategy`.
