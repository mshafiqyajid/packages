---
"@mshafiqyajid/react-date-picker": patch
---

fix(date-picker): two layout/behaviour fixes.

**Multi-month layout** (`numberOfMonths > 1`): the calendar popover now expands to fit all month grids side by side. Previously the `width: 280px` constraint clipped the second and third calendars.

**Range hover preview**: hovering over a date after clicking the first date in range mode now shows the in-range highlight and marks the hover target as `data-range-end`. Previously the hover endpoint received no styling and the preview was invisible. Reverse-direction hover (hovering before the anchor) correctly swaps start/end roles.
