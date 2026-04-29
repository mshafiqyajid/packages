import { forwardRef, useId } from "react";
import { useFileUpload } from "../useFileUpload";
import type { FileUploadResult } from "../useFileUpload";

export type FileUploadVariant = "dropzone" | "button";
export type FileUploadSize = "sm" | "md" | "lg";

export interface FileUploadStyledProps {
  multiple?: boolean;
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  onFiles?: (result: FileUploadResult) => void;
  disabled?: boolean;
  variant?: FileUploadVariant;
  size?: FileUploadSize;
  showPreview?: boolean;
  className?: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

function FileIcon() {
  return (
    <svg
      className="rfu-icon"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg
      className="rfu-upload-icon"
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  );
}

function RemoveIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export const FileUploadStyled = forwardRef<
  HTMLDivElement,
  FileUploadStyledProps
>(function FileUploadStyled(
  {
    multiple = false,
    accept,
    maxSize,
    maxFiles,
    onFiles,
    disabled = false,
    variant = "dropzone",
    size = "md",
    showPreview = true,
    className,
  },
  ref,
) {
  const instanceId = useId();
  const {
    getRootProps,
    getInputProps,
    inputRef,
    isDragOver,
    isDragReject,
    files,
    removeFile,
    open,
  } = useFileUpload({ multiple, accept, maxSize, maxFiles, onFiles, disabled });

  const hasFiles = files.length > 0;
  const inputProps = getInputProps();

  if (variant === "button") {
    return (
      <div
        ref={ref}
        className={["rfu-root", className].filter(Boolean).join(" ")}
        data-variant="button"
        data-size={size}
        data-disabled={disabled ? "true" : undefined}
      >
        <input ref={inputRef} {...inputProps} id={instanceId} />
        <button
          type="button"
          className="rfu-button-trigger"
          onClick={open}
          disabled={disabled}
          aria-controls={instanceId}
        >
          <UploadIcon />
          <span>Choose {multiple ? "files" : "file"}</span>
        </button>
        {hasFiles && (
          <ul className="rfu-file-list" role="list">
            {files.map((file, i) => (
              <FileListItem
                key={`${file.name}-${i}`}
                file={file}
                index={i}
                showPreview={showPreview}
                onRemove={removeFile}
              />
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={["rfu-root", className].filter(Boolean).join(" ")}
      data-variant="dropzone"
      data-size={size}
      data-disabled={disabled ? "true" : undefined}
    >
      <div
        {...getRootProps()}
        className="rfu-dropzone"
        data-drag-over={isDragOver ? "true" : undefined}
        data-drag-reject={isDragReject ? "true" : undefined}
        data-disabled={disabled ? "true" : undefined}
      >
        <input ref={inputRef} {...inputProps} id={instanceId} />
        <UploadIcon />
        <p className="rfu-dropzone-label">
          {isDragReject
            ? "Some files are not accepted"
            : isDragOver
              ? "Drop files here"
              : "Drag & drop files here"}
        </p>
        <p className="rfu-dropzone-hint">
          or{" "}
          <span className="rfu-dropzone-browse" role="button" tabIndex={-1}>
            browse
          </span>
          {maxSize !== undefined && ` — max ${formatBytes(maxSize)}`}
          {maxFiles !== undefined &&
            `, up to ${maxFiles} file${maxFiles !== 1 ? "s" : ""}`}
        </p>
      </div>
      {hasFiles && (
        <ul className="rfu-file-list" role="list">
          {files.map((file, i) => (
            <FileListItem
              key={`${file.name}-${i}`}
              file={file}
              index={i}
              showPreview={showPreview}
              onRemove={removeFile}
            />
          ))}
        </ul>
      )}
    </div>
  );
});

interface FileListItemProps {
  file: File;
  index: number;
  showPreview: boolean;
  onRemove: (index: number) => void;
}

function FileListItem({
  file,
  index,
  showPreview,
  onRemove,
}: FileListItemProps) {
  const isImage = isImageFile(file);
  const previewUrl = isImage && showPreview ? URL.createObjectURL(file) : null;

  return (
    <li className="rfu-file-item">
      <span className="rfu-file-thumb" aria-hidden="true">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt=""
            className="rfu-file-preview"
            onLoad={() => URL.revokeObjectURL(previewUrl)}
          />
        ) : (
          <FileIcon />
        )}
      </span>
      <span className="rfu-file-info">
        <span className="rfu-file-name" title={file.name}>
          {file.name}
        </span>
        <span className="rfu-file-meta">
          {formatBytes(file.size)}
          {file.type && <span className="rfu-file-type">{file.type}</span>}
        </span>
      </span>
      <button
        type="button"
        className="rfu-file-remove"
        onClick={() => onRemove(index)}
        aria-label={`Remove ${file.name}`}
      >
        <RemoveIcon />
      </button>
    </li>
  );
}
