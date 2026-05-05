import {
  useCallback,
  useRef,
  useState,
  useEffect,
  type DragEvent,
  type ChangeEvent,
  type HTMLAttributes,
  type RefObject,
  type CSSProperties,
} from "react";

export interface RejectedFile {
  file: File;
  reasons: string[];
}

export interface FileUploadResult {
  accepted: File[];
  rejected: RejectedFile[];
}

export type UploadStatus = "queued" | "uploading" | "success" | "error" | "aborted";

export interface UploadContext {
  signal: AbortSignal;
  onProgress: (fraction: number) => void;
}

export interface UploadItem<TResult = unknown> {
  id: string;
  file: File;
  status: UploadStatus;
  /** Fraction 0..1, set via context.onProgress. */
  progress: number;
  result?: TResult;
  error?: Error;
}

export type Uploader<TResult = unknown> = (
  file: File,
  ctx: UploadContext,
) => Promise<TResult>;

export interface UseFileUploadOptions<TResult = unknown> {
  multiple?: boolean;
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  onFiles?: (result: FileUploadResult) => void;
  disabled?: boolean;
  /** When provided, accepted files are uploaded automatically. */
  uploader?: Uploader<TResult>;
  /** Default true when an uploader is provided. */
  autoUpload?: boolean;
  /** Concurrent uploads. Default: 3 */
  concurrency?: number;
  /** Fires whenever an upload item transitions state. */
  onUpload?: (item: UploadItem<TResult>) => void;
}

export interface FileInputProps {
  type: "file";
  multiple: boolean;
  accept: string | undefined;
  disabled: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  style: CSSProperties;
  tabIndex: number;
  "aria-hidden": true;
}

export interface UseFileUploadResult<TResult = unknown> {
  getRootProps: () => HTMLAttributes<HTMLElement>;
  getInputProps: () => FileInputProps;
  inputRef: RefObject<HTMLInputElement>;
  isDragOver: boolean;
  isDragReject: boolean;
  files: File[];
  uploads: UploadItem<TResult>[];
  removeFile: (index: number) => void;
  clearFiles: () => void;
  open: () => void;
  /** Restart an upload that errored, was aborted, or completed. */
  retryUpload: (id: string) => void;
  /** Abort an in-flight upload (status → "aborted"). */
  abortUpload: (id: string) => void;
  /** Abort all in-flight uploads. */
  abortAll: () => void;
}

function matchesAccept(file: File, accept: string): boolean {
  const tokens = accept.split(",").map((t) => t.trim());
  return tokens.some((token) => {
    if (token.startsWith(".")) {
      return file.name.toLowerCase().endsWith(token.toLowerCase());
    }
    if (token.endsWith("/*")) {
      const baseType = token.slice(0, -2);
      return file.type.startsWith(baseType + "/");
    }
    return file.type === token;
  });
}

function validateFile(
  file: File,
  options: Pick<UseFileUploadOptions, "accept" | "maxSize">,
): string[] {
  const reasons: string[] = [];
  if (options.accept && !matchesAccept(file, options.accept)) {
    reasons.push("File type not accepted");
  }
  if (options.maxSize !== undefined && file.size > options.maxSize) {
    reasons.push(`File exceeds maximum size of ${options.maxSize} bytes`);
  }
  return reasons;
}

let _idCounter = 0;
function nextId(): string {
  return `up-${++_idCounter}-${Date.now()}`;
}

export function useFileUpload<TResult = unknown>(
  options: UseFileUploadOptions<TResult> = {},
): UseFileUploadResult<TResult> {
  const {
    multiple = false,
    accept,
    maxSize,
    maxFiles,
    onFiles,
    disabled = false,
    uploader,
    autoUpload = uploader !== undefined,
    concurrency = 3,
    onUpload,
  } = options;

  const [files, setFiles] = useState<File[]>([]);
  const [uploads, setUploads] = useState<UploadItem<TResult>[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDragReject, setIsDragReject] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const controllersRef = useRef<Map<string, AbortController>>(new Map());
  const inFlightRef = useRef(0);
  const queueRef = useRef<Array<{ id: string; file: File }>>([]);
  const uploadsRef = useRef<UploadItem<TResult>[]>([]);
  const uploaderRef = useRef(uploader);
  const onUploadRef = useRef(onUpload);
  const concurrencyRef = useRef(concurrency);
  uploaderRef.current = uploader;
  onUploadRef.current = onUpload;
  concurrencyRef.current = concurrency;

  const writeUploads = useCallback((next: UploadItem<TResult>[]) => {
    uploadsRef.current = next;
    setUploads(next);
  }, []);

  const updateUpload = useCallback(
    (id: string, partial: Partial<UploadItem<TResult>>) => {
      const next = uploadsRef.current.map((u) =>
        u.id === id ? { ...u, ...partial } : u,
      );
      writeUploads(next);
      const item = next.find((u) => u.id === id);
      if (item) onUploadRef.current?.(item);
    },
    [writeUploads],
  );

  const startNextInQueue = useCallback(() => {
    const fn = uploaderRef.current;
    if (!fn) return;
    while (inFlightRef.current < concurrencyRef.current && queueRef.current.length > 0) {
      const next = queueRef.current.shift()!;
      const { id, file } = next;

      const controller = new AbortController();
      controllersRef.current.set(id, controller);
      inFlightRef.current += 1;

      updateUpload(id, { status: "uploading", progress: 0 });

      const ctx: UploadContext = {
        signal: controller.signal,
        onProgress: (fraction) =>
          updateUpload(id, { progress: Math.max(0, Math.min(1, fraction)) }),
      };

      const finishOk = (result: TResult) => {
        controllersRef.current.delete(id);
        inFlightRef.current -= 1;
        if (!controller.signal.aborted) {
          updateUpload(id, { status: "success", progress: 1, result });
        }
        startNextInQueue();
      };
      const finishErr = (err: unknown) => {
        controllersRef.current.delete(id);
        inFlightRef.current -= 1;
        if (controller.signal.aborted) {
          updateUpload(id, { status: "aborted" });
        } else {
          updateUpload(id, {
            status: "error",
            error: err instanceof Error ? err : new Error(String(err)),
          });
        }
        startNextInQueue();
      };

      try {
        const promise = fn(file, ctx);
        promise.then(finishOk, finishErr);
      } catch (err) {
        finishErr(err);
      }
    }
  }, [updateUpload]);

  const enqueueUpload = useCallback(
    (id: string, file: File) => {
      if (!uploaderRef.current) return;
      queueRef.current.push({ id, file });
      startNextInQueue();
    },
    [startNextInQueue],
  );

  const processFiles = useCallback(
    (incoming: File[]) => {
      const accepted: File[] = [];
      const rejected: RejectedFile[] = [];

      for (const file of incoming) {
        const reasons = validateFile(file, { accept, maxSize });
        if (reasons.length === 0) {
          accepted.push(file);
        } else {
          rejected.push({ file, reasons });
        }
      }

      let trimmedAccepted = accepted;
      setFiles((prev) => {
        const combined = multiple ? [...prev, ...accepted] : accepted;
        const final = maxFiles !== undefined ? combined.slice(0, maxFiles) : combined;
        // Figure out which of the freshly accepted files actually made it in.
        if (multiple) {
          const overflow = combined.length - final.length;
          trimmedAccepted = overflow > 0 ? accepted.slice(0, accepted.length - overflow) : accepted;
        } else {
          trimmedAccepted = final;
        }
        return final;
      });

      if (uploaderRef.current && autoUpload) {
        const newUploads: UploadItem<TResult>[] = trimmedAccepted.map((file) => ({
          id: nextId(),
          file,
          status: "queued",
          progress: 0,
        }));
        const next = multiple
          ? [...uploadsRef.current, ...newUploads]
          : newUploads;
        writeUploads(next);
        for (const u of newUploads) enqueueUpload(u.id, u.file);
      } else if (!multiple && trimmedAccepted.length > 0) {
        // Reset uploads when single-file mode replaces the file
        writeUploads([]);
      }

      onFiles?.({ accepted, rejected });
    },
    [accept, maxSize, maxFiles, multiple, onFiles, autoUpload, enqueueUpload],
  );

  const checkDragReject = useCallback(
    (items: DataTransferItemList | null): boolean => {
      if (!items || !accept) return false;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (!item) continue;
        if (item.kind !== "file") continue;
        const fakeFile = { type: item.type, name: "" } as File;
        if (accept && !matchesAccept(fakeFile, accept)) {
          return true;
        }
      }
      return false;
    },
    [accept],
  );

  const onDragEnter = useCallback(
    (e: DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;
      setIsDragOver(true);
      setIsDragReject(checkDragReject(e.dataTransfer.items));
    },
    [disabled, checkDragReject],
  );

  const onDragOver = useCallback(
    (e: DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;
      setIsDragOver(true);
    },
    [disabled],
  );

  const onDragLeave = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if ((e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
      return;
    }
    setIsDragOver(false);
    setIsDragReject(false);
  }, []);

  const onDrop = useCallback(
    (e: DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      setIsDragReject(false);
      if (disabled) return;
      const droppedFiles = Array.from(e.dataTransfer.files);
      if (droppedFiles.length > 0) {
        processFiles(multiple ? droppedFiles : droppedFiles.slice(0, 1));
      }
    },
    [disabled, multiple, processFiles],
  );

  const onClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      if (disabled) return;
      inputRef.current?.click();
    },
    [disabled],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      if (disabled) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        inputRef.current?.click();
      }
    },
    [disabled],
  );

  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const selected = Array.from(e.target.files ?? []);
      if (selected.length > 0) {
        processFiles(selected);
      }
      e.target.value = "";
    },
    [processFiles],
  );

  const removeFile = useCallback(
    (index: number) => {
      setFiles((prev) => {
        const removed = prev[index];
        if (!removed) return prev;
        // Also abort + remove the matching upload item (first match by file ref).
        const matchIdx = uploadsRef.current.findIndex((u) => u.file === removed);
        if (matchIdx !== -1) {
          const item = uploadsRef.current[matchIdx]!;
          const ctrl = controllersRef.current.get(item.id);
          if (ctrl) {
            ctrl.abort();
            controllersRef.current.delete(item.id);
          }
          writeUploads(uploadsRef.current.filter((_, i) => i !== matchIdx));
        }
        return prev.filter((_, i) => i !== index);
      });
    },
    [writeUploads],
  );

  const clearFiles = useCallback(() => {
    controllersRef.current.forEach((c) => c.abort());
    controllersRef.current.clear();
    queueRef.current = [];
    inFlightRef.current = 0;
    setFiles([]);
    writeUploads([]);
  }, [writeUploads]);

  const abortUpload = useCallback((id: string) => {
    const ctrl = controllersRef.current.get(id);
    if (ctrl) ctrl.abort();
  }, []);

  const abortAll = useCallback(() => {
    controllersRef.current.forEach((c) => c.abort());
  }, []);

  const retryUpload = useCallback(
    (id: string) => {
      if (!uploaderRef.current) return;
      const item = uploadsRef.current.find((u) => u.id === id);
      if (!item) return;
      if (item.status === "queued" || item.status === "uploading") return;
      const next = uploadsRef.current.map((u) =>
        u.id === id ? { ...u, status: "queued" as const, progress: 0, error: undefined } : u,
      );
      writeUploads(next);
      queueRef.current.push({ id, file: item.file });
      startNextInQueue();
    },
    [startNextInQueue, writeUploads],
  );

  const open = useCallback(() => {
    if (disabled) return;
    inputRef.current?.click();
  }, [disabled]);

  // Abort everything on unmount
  useEffect(() => {
    return () => {
      controllersRef.current.forEach((c) => c.abort());
      controllersRef.current.clear();
    };
  }, []);

  const getRootProps = useCallback(
    (): HTMLAttributes<HTMLElement> => ({
      onDragEnter,
      onDragOver,
      onDragLeave,
      onDrop,
      onClick,
      onKeyDown,
      role: "button",
      tabIndex: disabled ? -1 : 0,
      "aria-disabled": disabled ? true : undefined,
    }),
    [onDragEnter, onDragOver, onDragLeave, onDrop, onClick, onKeyDown, disabled],
  );

  const getInputProps = useCallback(
    (): FileInputProps => ({
      type: "file",
      multiple,
      accept,
      disabled,
      onChange,
      style: { display: "none" },
      tabIndex: -1,
      "aria-hidden": true,
    }),
    [multiple, accept, disabled, onChange],
  );

  return {
    getRootProps,
    getInputProps,
    inputRef,
    isDragOver,
    isDragReject,
    files,
    uploads,
    removeFile,
    clearFiles,
    open,
    retryUpload,
    abortUpload,
    abortAll,
  };
}
