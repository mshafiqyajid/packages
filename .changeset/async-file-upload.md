---
"@mshafiqyajid/react-file-upload": minor
---

Async uploader (non-breaking):

- `uploader: (file, ctx) => Promise<T>` runs per accepted file. `ctx` carries `{ signal, onProgress(fraction) }` so consumers can wire `XMLHttpRequest`/`fetch` with abort + progress.
- New options: `autoUpload` (default true when `uploader` set), `concurrency` (default 3), `onUpload(item)` lifecycle callback.
- New result fields on `useFileUpload`: `uploads: UploadItem[]`, `retryUpload(id)`, `abortUpload(id)`, `abortAll()`. The existing `files: File[]`, `removeFile`, `clearFiles` still work — `removeFile` and `clearFiles` now also abort matching in-flight uploads.
- `UploadItem` shape: `{ id, file, status: "queued" | "uploading" | "success" | "error" | "aborted", progress: 0..1, result?, error? }`.
- Styled component renders a progress bar in each file row, `rfu-thumb-progress` overlay on image thumbnails, a "Retry" button on errored items, and lands `data-status` on each row for CSS hooks. `renderPreview` now receives the matching `UploadItem` as a third argument.
- Aborts all in-flight uploads on unmount.
- New CSS rules / variables exposed as classes: `.rfu-file-row[data-status]`, `.rfu-file-row-bar`, `.rfu-file-row-bar-fill`, `.rfu-file-row-pct`, `.rfu-file-row-status--success`, `.rfu-file-row-status--error`, `.rfu-thumb-progress`, `.rfu-retry`.
- New exported types: `UploadItem`, `UploadStatus`, `UploadContext`, `Uploader`.
