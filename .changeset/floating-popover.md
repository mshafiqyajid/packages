---
"@mshafiqyajid/react-popover": minor
---

Floating-UI parity (non-breaking):

- Extended `placement` to include `-start` and `-end` aligned variants for all four sides: `top | bottom | left | right` plus `top-start | top-end | bottom-start | bottom-end | left-start | left-end | right-start | right-end`.
- New props: `offset` (gap from anchor; was already partially supported), `collisionPadding` (viewport edge margin used by flip and shift, default 8), `flip` (default true), `shift` (cross-axis push back into view, default true), `strategy` (`"absolute"` or `"fixed"`, default absolute).
- `data-placement` on the popover now reflects the *resolved* placement after auto-flip, so consumers can style top vs. bottom appearance correctly.
- Exports new types: `PopoverSide`, `PopoverAlign`, `PopoverStrategy`.
