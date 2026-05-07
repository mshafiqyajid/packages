---
"@mshafiqyajid/react-stepper": patch
---

fix(stepper): horizontal sm size layout — labels no longer wrap, descriptions hidden in sm

In horizontal `size="sm"` mode the step labels had no `white-space: nowrap`, causing single words to stack vertically and the connector line to visually cross the label text. Fixes:

- `white-space: nowrap; overflow: hidden; text-overflow: ellipsis` on both label and description.
- Descriptions are hidden (`display: none`) in `size="sm"` horizontal — too cramped; still shown in `size="md"` and `size="lg"`.
- Label font-size reduced to `0.78rem` in sm horizontal to match the compact indicator.
