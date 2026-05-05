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
| `duration` | `number` (ms) | `4000` | Auto-dismiss timeout. `0` disables auto-dismiss. |
| `action` | `{ label, onClick }` | — | Action button rendered in the toast |
| `id` | `string` | — | Pre-supplied id, useful for updating an existing toast |

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

## Dark mode

Set `data-theme="dark"` on any ancestor element:

```html
<html data-theme="dark">
```

## License

MIT
