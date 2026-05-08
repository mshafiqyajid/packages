---
"@mshafiqyajid/react-sheet": patch
---

Fix close button (and all interactive children) not responding to clicks when swipeToDismiss is enabled. setPointerCapture on the panel was intercepting pointer events for child buttons. Now skips drag initiation when pointerdown originates from a button, link, input, or other interactive element.
