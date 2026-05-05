# @mshafiqyajid/react-toast

## 0.2.0

### Minor Changes

- f8ca726: Async lifecycle support (non-breaking):

  - `toast.promise(promise, { loading, success, error })` — Sonner-style: shows a loading toast immediately, transitions to success or error in place when the promise settles. `success` and `error` accept either a string or a function that receives the value/error.
  - `toast.loading(message, options?)` convenience for stand-alone loading toasts. Defaults to `Infinity` duration.
  - `toast.dismiss(id?)` — passing no id dismisses all (`useToast().toast.dismiss()` works alongside the existing `dismiss` / `dismissAll` returns).
  - New `"loading"` toast type. Renders a CSS spinner (`.rtoast-spinner`) instead of the static icon. Loading toasts get a primary/indigo border accent. Dark variant included.
  - `toastStore.update(id, partial)` for in-place updates; `toastStore.add(...)` accepts an explicit `id` and replaces an existing toast when matched.
  - `toast` is now also exported as a top-level binding for use outside React.
  - New exported type: `ToastPromiseMessages<T>`.

## 0.1.0

### Minor Changes

- d1c5eda: Initial public release of react-accordion, react-tabs, react-toast, react-select, and react-modal
