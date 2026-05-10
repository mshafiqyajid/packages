---
"@mshafiqyajid/react-drawer": patch
---

Fix close button and interactive elements not responding when swipeable is enabled. The swipe gesture handler no longer captures pointer events that originate on buttons, links, or inputs, allowing clicks on those elements to fire normally.
