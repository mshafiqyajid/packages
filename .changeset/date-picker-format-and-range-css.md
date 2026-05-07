---
"@mshafiqyajid/react-date-picker": patch
---

fix(date-picker): two more range/format fixes.

**Date format corruption** (`"5ay"` instead of `"May"`): `formatDate` was doing sequential `.replace()` calls, so the shorter `M` token matched the `M` inside the already-substituted month name (e.g. `"May"` → `"5ay"`). Switched to a single-pass regex replacer so each character is only processed once.

**Range highlight missing in portaled calendar**: range-start/end/in-range CSS for `tone="neutral"` only targeted `.rdp-root[data-tone="neutral"]`. The portaled calendar renders via `createPortal` outside `.rdp-root`, so the rules never applied. Added matching `.rdp-calendar[data-tone="neutral"]` selectors to cover both inline and portaled variants (mirrors what already existed for `tone="primary"`).
