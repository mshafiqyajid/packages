---
"@mshafiqyajid/react-rating": minor
---

Async submit support (non-breaking):

- `onChange` may now return a `Promise<void>`. While the promise is in flight, the rating becomes non-interactive (`aria-busy="true"`, `data-pending="true"` on the radiogroup root).
- If the promise rejects, the optimistic value is reverted to the previous value (uncontrolled mode).
- New result field on `useRating`: `isPending`.
