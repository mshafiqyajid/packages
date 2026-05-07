---
"@mshafiqyajid/react-toast": minor
---

Add `toast.update()`, persistent toasts, `showProgress` ring, and channel routing.

- **`toast.update(id, partial)`** — update message, type, title, duration, action, or showProgress on an existing toast without closing it. Body fades briefly on change.
- **Persistent toasts** — `duration: 0` (or `Infinity`) keeps a toast open indefinitely; no auto-dismiss.
- **`showProgress: boolean`** — when `true` and `duration > 0`, renders a circular SVG countdown ring (`rtoast-ring`) instead of the flat progress bar.
- **Channel routing** — `<ToastProvider channel="notifications" />` renders only toasts sent via `toast.channel("notifications").success("…")`. Default channel is `"default"`, so all existing code is unchanged.
