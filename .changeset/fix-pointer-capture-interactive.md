---
"@mshafiqyajid/react-modal": patch
"@mshafiqyajid/react-carousel": patch
"@mshafiqyajid/react-toast": patch
---

Fix swipe/drag gesture handlers intercepting clicks on interactive elements. Buttons, links, and inputs inside the carousel track, modal sheet, and toast no longer have their click events blocked by pointer capture.
