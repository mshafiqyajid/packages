# @mshafiqyajid/react-toast

A toast notification system for React with a context-free pub/sub API.

**[Full docs →](https://docs.shafiqyajid.com/react/toast/)**

## Install

```bash
npm install @mshafiqyajid/react-toast
```

## Quick start (styled)

```tsx
import { ToastProvider } from "@mshafiqyajid/react-toast/styled";
import "@mshafiqyajid/react-toast/styles.css";
import { useToast } from "@mshafiqyajid/react-toast";

function App() {
  return (
    <>
      <ToastProvider position="bottom-right" duration={4000} />
      <Page />
    </>
  );
}

function Page() {
  const { toast } = useToast();
  return (
    <button onClick={() => toast.success("Saved!")}>
      Save
    </button>
  );
}
```

## API

### `useToast()`

Returns `{ toast, dismiss, dismissAll }`.

```ts
const { toast, dismiss, dismissAll } = useToast();

// Basic
const id = toast("Hello world");
const id = toast("Custom", { type: "success", duration: 3000 });

// Convenience methods
toast.success("Saved successfully");
toast.error("Something went wrong");
toast.warning("Low disk space");
toast.info("Update available");
toast.loading("Saving…");

// Promise-driven lifecycle (loading → success | error)
toast.promise(saveProfile(), {
  loading: "Saving profile…",
  success: (user) => `Saved ${user.name}`,
  error:   (err)  => `Failed: ${(err as Error).message}`,
});

// Update an existing toast in-place (no close/reopen)
const id = toast.loading("Uploading…");
toast.update(id, { message: "Upload complete!", type: "success" });

// Channel routing — only appears in <ToastProvider channel="notifications">
toast.channel("notifications").success("New message received");

// Persistent toast (no auto-dismiss)
toast("This stays until dismissed", { duration: 0 });

// Progress ring
toast("Doing work…", { duration: 6000, showProgress: true });

// Dismiss
dismiss(id);
dismissAll();
```

### `toast` (standalone)

Also exported as a top-level binding so non-React code can fire toasts:

```ts
import { toast } from "@mshafiqyajid/react-toast";
toast.error("Caught outside React");
```

### `useToasts()`

Returns the current list of active toasts. Use this to build a custom renderer.

```ts
const toasts = useToasts();
```

### Toast options

Pass as the second argument to `toast(message, options)`:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `type` | `"neutral" \| "success" \| "error" \| "warning" \| "info" \| "loading"` | `"neutral"` | Visual variant |
| `title` | `string` | — | Bold heading rendered above the message |
| `duration` | `number` (ms) | `4000` | Auto-dismiss timeout. `0` or `Infinity` keeps the toast open forever. |
| `action` | `{ label, onClick }` | — | Action button rendered in the toast |
| `id` | `string` | — | Pre-supplied id, useful for updating an existing toast |
| `showProgress` | `boolean` | — | When `true` and `duration > 0`, shows a circular SVG countdown ring instead of the flat bar. |
| `channel` | `string` | `"default"` | Route to a specific `<ToastProvider channel="...">`. |

Example with title + action:

```ts
toast("Profile updated", {
  type: "success",
  title: "Saved",
  action: { label: "Undo", onClick: () => revert() },
  duration: 6000,
});
```

### `<ToastProvider>`

Place once near the root of your app. Renders toasts into a `document.body` portal.

| Prop | Type | Default |
|------|------|---------|
| `position` | `"top-left" \| "top-center" \| "top-right" \| "bottom-left" \| "bottom-center" \| "bottom-right"` | `"bottom-right"` |
| `maxToasts` | `number` | `5` |
| `duration` | `number` (ms) | `4000` |
| `channel` | `string` | `"default"` | Only renders toasts dispatched to this channel. |

## Dark mode

Set `data-theme="dark"` on any ancestor element:

```html
<html data-theme="dark">
```

## License

MIT

## What's new in 0.4.0

- **`toast.update(id, partial)`** — update an existing toast in-place without closing it. Pass any subset of `{ message, type, title, duration, action, showProgress }`. The body fades in briefly on change. Ideal for "Uploading… → Upload complete!" patterns. Every `toast.*` call returns the id.
- **Persistent toasts** — `duration: 0` (or `Infinity`) keeps a toast open forever; no auto-dismiss. Existing `toast.loading()` already uses `Infinity`.
- **Progress ring** — set `showProgress: true` on any toast with `duration > 0` to show a circular SVG countdown ring (`rtoast-ring` CSS class) in place of the flat progress bar.
- **Channel routing** — `<ToastProvider channel="notifications" />` renders only toasts sent to that channel. Use `toast.channel("notifications").success("…")` to target it. Default channel is `"default"` — existing code without a channel is unchanged.

## What's new in 0.3.0

- **Swipe-to-dismiss** — touch-drag a toast horizontally to dismiss; threshold ~80 px. Per-toast opt-out via `dismissibleSwipe: false`.
- **Undo with countdown ring** — toasts with `undo: () => void` render a circular SVG progress that counts down from `duration`; clicking it cancels and dismisses.
- **Pause-on-hover** — hovering any toast pauses *every* toast's auto-dismiss timer. `<ToastProvider pauseOnHover>` (default `true`).
- **`action.variant`** — `action: { label, onClick, variant?: "primary" | "outline" | "ghost" }`.
- **Draggable region** — `<ToastProvider draggable positionStorageKey="...">` exposes a small handle; users can drag the entire stack to a different corner; the choice is persisted.
