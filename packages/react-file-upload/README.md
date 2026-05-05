# @mshafiqyajid/react-file-upload

Headless file upload hook and styled drag-and-drop component for React. Accessible, fully typed, zero runtime dependencies.

## Install

```bash
npm install @mshafiqyajid/react-file-upload
```

## Headless usage

```tsx
import { useFileUpload } from "@mshafiqyajid/react-file-upload";

function MyUploader() {
  const { getRootProps, getInputProps, isDragOver, files, removeFile } =
    useFileUpload({
      multiple: true,
      accept: "image/*",
      maxSize: 5 * 1024 * 1024,
      onFiles: ({ accepted, rejected }) => {
        console.log("accepted", accepted);
        console.log("rejected", rejected);
      },
    });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      {isDragOver ? "Drop files here" : "Drag files or click to browse"}
      <ul>
        {files.map((f, i) => (
          <li key={i}>
            {f.name} <button onClick={() => removeFile(i)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Styled usage

```tsx
import { FileUploadStyled } from "@mshafiqyajid/react-file-upload/styled";
import "@mshafiqyajid/react-file-upload/styles.css";

function App() {
  return (
    <FileUploadStyled
      multiple
      accept="image/*"
      maxSize={5 * 1024 * 1024}
      variant="dropzone"
      size="md"
      showPreview
      onFiles={({ accepted }) => console.log(accepted)}
    />
  );
}
```

## Async uploader (with progress, abort, retry)

Pass an `uploader` to upload accepted files automatically. Each file becomes an `UploadItem` with `status: "queued" | "uploading" | "success" | "error" | "aborted"` and a `progress` you control by calling `ctx.onProgress(fraction)`. Files honor `ctx.signal` for abort.

```tsx
<FileUploadStyled
  multiple
  uploader={async (file, { signal, onProgress }) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    signal.addEventListener("abort", () => xhr.abort());

    return await new Promise<{ url: string }>((resolve, reject) => {
      xhr.onload = () => resolve(JSON.parse(xhr.responseText));
      xhr.onerror = () => reject(new Error("upload failed"));
      xhr.open("POST", "/api/upload");
      const fd = new FormData();
      fd.append("file", file);
      xhr.send(fd);
    });
  }}
  concurrency={3}
  onUpload={(item) => console.log(item.status, item.progress)}
/>
```

Headless consumers also get `uploads`, `retryUpload(id)`, `abortUpload(id)`, and `abortAll()`.

## Links

- [Documentation](https://docs.shafiqyajid.com/react/file-upload/)
- [Issues](https://github.com/mshafiqyajid/packages/issues)
