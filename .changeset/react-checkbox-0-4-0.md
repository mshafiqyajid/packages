---
"@mshafiqyajid/react-checkbox": minor
---

Add `CheckboxGroup` component, `useCheckboxTree` hook, and animated SVG checkmark draw.

- `CheckboxGroup` (exported from `./styled`): fieldset-based group that manages a `string[]` selection; child `CheckboxStyled` items with a `value` prop automatically inherit `name`, `disabled`, and `invalid` from the group.
- `useCheckboxTree` (exported from root): hook for tree-structured checkbox hierarchies with parent indeterminate/checked inference and `toggleAll`.
- Animated SVG checkmark: the check path draws via `stroke-dashoffset` over 180 ms ease-out; the indeterminate bar morphs in similarly. Both honour `prefers-reduced-motion`.
