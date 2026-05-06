---
"@mshafiqyajid/react-toast": patch
---

Fix toast layout when both `undo` (with countdown ring) and the close button were rendered: the close button stacked underneath the Undo button instead of sitting beside it.

Cause: the toast item is a 3-column CSS grid (`1.25rem 1fr auto`); `.rtoast-undo` flowed into row 1 column 3 and `.rtoast-close` had `grid-column: 3` so the auto-flow pushed it to row 2.

Fix: wrap the Undo button + close button in a single right-side `.rtoast-actions` flex container that occupies grid column 3. Both buttons now sit inline at the top-right, aligned consistently with or without an Undo action.

Also tightened the Undo pill spacing and shrank the countdown ring slightly so the inline row is more compact.
