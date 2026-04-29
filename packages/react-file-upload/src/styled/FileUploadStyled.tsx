import { forwardRef, useId, useState, useEffect } from "react";
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
  uploadText?: string;
  browseText?: string;
  renderPreview?: (file: File, onRemove: () => void) => React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

function getExt(file: File): string {
  return file.name.split(".").pop()?.toUpperCase() ?? "FILE";
}

function UploadIcon({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  );
}

function FileTypeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function ImagePreviewItem({ file, onRemove }: { file: File; onRemove: () => void }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  return (
    <li className="rfu-thumb-item">
      <div className="rfu-thumb-wrap">
        {url && <img src={url} alt={file.name} className="rfu-thumb-img" />}
        <button type="button" className="rfu-thumb-remove" onClick={onRemove} aria-label={`Remove ${file.name}`}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
      </div>
      <span className="rfu-thumb-name">{file.name}</span>
    </li>
  );
}

function FileRowItem({ file, onRemove }: { file: File; onRemove: () => void }) {
  return (
    <li className="rfu-file-row">
      <span className="rfu-file-row-icon"><FileTypeIcon /></span>
      <span className="rfu-file-row-ext">{getExt(file)}</span>
      <span className="rfu-file-row-info">
        <span className="rfu-file-row-name" title={file.name}>{file.name}</span>
        <span className="rfu-file-row-size">{formatBytes(file.size)}</span>
      </span>
      <button type="button" className="rfu-file-row-remove" onClick={onRemove} aria-label={`Remove ${file.name}`}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
      </button>
    </li>
  );
}

export const FileUploadStyled = forwardRef<HTMLDivElement, FileUploadStyledProps>(
  function FileUploadStyled(
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
      uploadText,
      browseText,
      renderPreview,
      className,
      style,
    },
    ref,
  ) {
    const instanceId = useId();
    const { getRootProps, getInputProps, inputRef, isDragOver, isDragReject, files, removeFile, open } =
      useFileUpload({ multiple, accept, maxSize, maxFiles, onFiles, disabled });

    const hasFiles = files.length > 0;
    const imageFiles = files.filter(isImageFile);
    const otherFiles = files.filter((f) => !isImageFile(f));

    const mainLabel = uploadText ?? (isDragReject ? "File type not accepted" : isDragOver ? "Release to upload" : "Drop files here");
    const subLabel = browseText ?? "browse";

    if (variant === "button") {
      return (
        <div ref={ref} className={["rfu-root", className].filter(Boolean).join(" ")} data-variant="button" data-size={size} data-disabled={disabled ? "true" : undefined} style={style}>
          <input ref={inputRef} {...getInputProps()} id={instanceId} />
          <button type="button" className="rfu-btn-trigger" onClick={open} disabled={disabled}>
            <UploadIcon size={16} />
            <span>{multiple ? "Choose files" : "Choose file"}</span>
          </button>
          {hasFiles && (
            <ul className="rfu-file-rows">
              {files.map((file, i) =>
                renderPreview ? (
                  <li key={`${file.name}-${i}`}>{renderPreview(file, () => removeFile(i))}</li>
                ) : (
                  <FileRowItem key={`${file.name}-${i}`} file={file} onRemove={() => removeFile(i)} />
                )
              )}
            </ul>
          )}
        </div>
      );
    }

    return (
      <div ref={ref} className={["rfu-root", className].filter(Boolean).join(" ")} data-variant="dropzone" data-size={size} data-disabled={disabled ? "true" : undefined} style={style}>
        <div
          {...getRootProps()}
          className={["rfu-dropzone", isDragReject ? "rfu-dropzone--reject" : ""].filter(Boolean).join(" ")}
          data-drag-over={isDragOver ? "true" : undefined}
          data-drag-reject={isDragReject ? "true" : undefined}
          data-disabled={disabled ? "true" : undefined}
        >
          <input ref={inputRef} {...getInputProps()} id={instanceId} />
          <div className="rfu-dz-icon-wrap" data-drag-over={isDragOver ? "true" : undefined}>
            <UploadIcon size={size === "sm" ? 28 : size === "lg" ? 48 : 36} />
          </div>
          <p className="rfu-dz-label">{mainLabel}</p>
          <p className="rfu-dz-sub">
            or{" "}
            <button type="button" className="rfu-dz-browse" onClick={open} disabled={disabled} tabIndex={-1}>
              {subLabel}
            </button>
            {(maxSize !== undefined || maxFiles !== undefined) && (
              <span className="rfu-dz-constraints">
                {maxSize !== undefined && <span className="rfu-dz-chip">max {formatBytes(maxSize)}</span>}
                {maxFiles !== undefined && <span className="rfu-dz-chip">up to {maxFiles} file{maxFiles !== 1 ? "s" : ""}</span>}
              </span>
            )}
          </p>
          {accept && (
            <p className="rfu-dz-accept">
              {accept.split(",").map((t) => t.trim()).filter(Boolean).map((t) => (
                <span key={t} className="rfu-dz-chip">{t}</span>
              ))}
            </p>
          )}
        </div>

        {hasFiles && showPreview && imageFiles.length > 0 && (
          <ul className="rfu-thumb-grid">
            {imageFiles.map((file, i) =>
              renderPreview ? (
                <li key={`${file.name}-${i}`}>{renderPreview(file, () => removeFile(files.indexOf(file)))}</li>
              ) : (
                <ImagePreviewItem key={`${file.name}-${i}`} file={file} onRemove={() => removeFile(files.indexOf(file))} />
              )
            )}
          </ul>
        )}

        {hasFiles && otherFiles.length > 0 && (
          <ul className="rfu-file-rows">
            {otherFiles.map((file, i) =>
              renderPreview ? (
                <li key={`${file.name}-${i}`}>{renderPreview(file, () => removeFile(files.indexOf(file)))}</li>
              ) : (
                <FileRowItem key={`${file.name}-${i}`} file={file} onRemove={() => removeFile(files.indexOf(file))} />
              )
            )}
          </ul>
        )}

        {hasFiles && !showPreview && (
          <ul className="rfu-file-rows">
            {files.map((file, i) =>
              renderPreview ? (
                <li key={`${file.name}-${i}`}>{renderPreview(file, () => removeFile(i))}</li>
              ) : (
                <FileRowItem key={`${file.name}-${i}`} file={file} onRemove={() => removeFile(i)} />
              )
            )}
          </ul>
        )}
      </div>
    );
  },
);
