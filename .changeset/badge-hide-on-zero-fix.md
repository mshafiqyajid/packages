---
"@mshafiqyajid/react-badge": patch
---

fix(badge): `hideOnZero` now hides the count element even when the badge has other content (children, icon, or dot).

Previously `hideOnZero` only removed the entire badge when there was no other content. A badge with children *and* `count={0}` still rendered the "0" count. The count element now respects `hideOnZero` independently of the badge itself.
