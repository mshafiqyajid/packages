---
"@mshafiqyajid/react-dropdown-menu": minor
---

Floating-UI parity (non-breaking):

- Extended `placement` to all four sides with `-start` / `-end` alignment: previously only `bottom-start | bottom-end | top-start | top-end`; now also `left | right` (and aligned variants), plus center alignment for left/right.
- New props: `offset` (default 4), `collisionPadding` (default 8), `flip` (default true), `shift` (default true), `strategy` (`"absolute"` | `"fixed"`).
- `data-placement` reflects the resolved (post-flip) placement.
- Exports `DropdownMenuSide`, `DropdownMenuAlign`, `DropdownMenuStrategy`.
