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

// Dismiss
dismiss(id);
dismissAll();
```

### `useToasts()`

Returns the current list of active toasts. Use this to build a custom renderer.

```ts
const toasts = useToasts();
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
