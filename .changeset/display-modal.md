---
"@mshafiqyajid/react-modal": minor
---

Modal polish (non-breaking):

- `open` prop alongside the existing `isOpen` (alias — both work).
- `description` prop renders below the title and links via `aria-describedby`.
- `initialFocusRef` — focus a specific element when the modal opens (instead of the first focusable child).
- `finalFocusRef` — focus a specific element when the modal closes (instead of restoring previous focus).
- `onAfterOpen` / `onAfterClose` lifecycle callbacks fire after the open/close transitions complete.
- `preventClose: (reason) => boolean` — return false to veto a close. Reason: `"esc" | "overlay" | "close-button" | "programmatic"`.
- `lockBodyScroll` — opt out of body scroll lock when the modal is open.
- `container` prop overrides the portal target (default: `document.body`).
- `data-state="open" | "closed"` lands on both the overlay and panel for CSS hooks.
- New exported type: `CloseReason`.
