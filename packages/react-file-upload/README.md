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

## Links

- [Documentation](https://docs.shafiqyajid.com/react/file-upload/)
- [Issues](https://github.com/mshafiqyajid/packages/issues)
