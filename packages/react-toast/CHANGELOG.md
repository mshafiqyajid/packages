# @mshafiqyajid/react-toast

## 0.2.1

### Patch Changes

- fc93c26: docs: sync README with current API surface (no code changes).

  The README is bundled into the npm tarball at publish time, so updates to README.md only reach npm with a republish. This patch-bump republishes 14 packages whose READMEs had drifted behind props/features that already shipped — so the npm package pages now match the current API.

  What's covered per package:

  - **number-input**: `bigStep`, `wheelEnabled`, hold-to-repeat, keyboard table.
  - **tag-input**: `pasteDelimiters`, `transform`, `backspaceEditsLastTag`; corrected `tagVariant` values (`subtle`, not `soft`).
  - **phone-input**: `preferredCountries`, `searchable`, `searchPlaceholder`, `disableCountrySelector`.
  - **color**: `presets`, `disabled`.
  - **color-input**: `presets`, `recentColors`, `onRecentColorsChange`, `recentColorsLimit`, `eyeDropper`, `format="hsl"`.
  - **progress**: `segments`, `formatValue`.
  - **avatar**: `autoColor`, `showLoading`.
  - **badge**: `maxCount`, `pulse`, `uppercase`, `hideOnZero`, `showZero`.
  - **copy-button**: `errorLabel`.
  - **rich-text**: `sanitizePaste`, `allowedTags`, `transformPaste`.
  - **file-upload**: full Props table (`variant`, `multiple`, `accept`, `maxSize`, `maxFiles`, `uploader`, `concurrency`, `autoUpload`, callbacks, `renderPreview`).
  - **switch**: full Props table including async-pending semantics.
  - **slider**: full Props table (`range`, `marks`, `transform`, etc.).
  - **toast**: Toast options table (`type`, `title`, `duration`, `action`, `id`).

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
