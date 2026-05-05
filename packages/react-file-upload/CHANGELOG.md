# @mshafiqyajid/react-file-upload

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

- f8ca726: Async uploader (non-breaking):

  - `uploader: (file, ctx) => Promise<T>` runs per accepted file. `ctx` carries `{ signal, onProgress(fraction) }` so consumers can wire `XMLHttpRequest`/`fetch` with abort + progress.
  - New options: `autoUpload` (default true when `uploader` set), `concurrency` (default 3), `onUpload(item)` lifecycle callback.
  - New result fields on `useFileUpload`: `uploads: UploadItem[]`, `retryUpload(id)`, `abortUpload(id)`, `abortAll()`. The existing `files: File[]`, `removeFile`, `clearFiles` still work — `removeFile` and `clearFiles` now also abort matching in-flight uploads.
  - `UploadItem` shape: `{ id, file, status: "queued" | "uploading" | "success" | "error" | "aborted", progress: 0..1, result?, error? }`.
  - Styled component renders a progress bar in each file row, `rfu-thumb-progress` overlay on image thumbnails, a "Retry" button on errored items, and lands `data-status` on each row for CSS hooks. `renderPreview` now receives the matching `UploadItem` as a third argument.
  - Aborts all in-flight uploads on unmount.
  - New CSS rules / variables exposed as classes: `.rfu-file-row[data-status]`, `.rfu-file-row-bar`, `.rfu-file-row-bar-fill`, `.rfu-file-row-pct`, `.rfu-file-row-status--success`, `.rfu-file-row-status--error`, `.rfu-thumb-progress`, `.rfu-retry`.
  - New exported types: `UploadItem`, `UploadStatus`, `UploadContext`, `Uploader`.

## 0.1.0

### Minor Changes

- 0aecafe: Initial release of 10 new packages: date-picker (single/range calendar), file-upload (drag-and-drop), number-input (decimal/currency/percent), phone-input (country selector + dial code), color-input (hex/rgb/hsl picker), tag-input (chips + autocomplete), rich-text (contentEditable WYSIWYG), table (sort/filter/paginate), chart (SVG bar/line/pie), kanban (HTML5 DnD board).
