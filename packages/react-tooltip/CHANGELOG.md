# @mshafiqyajid/react-tooltip

## 0.2.0

### Minor Changes

- 9710a32: Floating-UI parity (non-breaking):

  - Extended `placement` to `-start | -end` aligned variants for all four sides.
  - New props: `offset` (default 8), `collisionPadding` (default 8), `flip` (default true), `shift` (default true), `strategy` (`"absolute"` | `"fixed"`).
  - `data-placement` now reflects the resolved (post-flip) placement.
  - Exports `TooltipSide`, `TooltipAlign`, `TooltipStrategy`.

## 0.1.0

### Minor Changes

- 0d8d416: Add react-tooltip package; update npm homepage to docs site for all packages
