import {
  useCallback,
  useRef,
  useState,
  type DragEvent,
  type ChangeEvent,
  type HTMLAttributes,
  type InputHTMLAttributes,
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

export interface UseFileUploadOptions {
  multiple?: boolean;
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  onFiles?: (result: FileUploadResult) => void;
  disabled?: boolean;
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

export interface UseFileUploadResult {
  getRootProps: () => HTMLAttributes<HTMLElement>;
  getInputProps: () => FileInputProps;
  inputRef: RefObject<HTMLInputElement>;
  isDragOver: boolean;
  isDragReject: boolean;
  files: File[];
  removeFile: (index: number) => void;
  clearFiles: () => void;
  open: () => void;
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

export function useFileUpload(
  options: UseFileUploadOptions = {},
): UseFileUploadResult {
  const {
    multiple = false,
    accept,
    maxSize,
    maxFiles,
    onFiles,
    disabled = false,
  } = options;

  const [files, setFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDragReject, setIsDragReject] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

      setFiles((prev) => {
        const combined = multiple ? [...prev, ...accepted] : accepted;
        if (maxFiles !== undefined) {
          return combined.slice(0, maxFiles);
        }
        return combined;
      });

      onFiles?.({ accepted, rejected });
    },
    [accept, maxSize, maxFiles, multiple, onFiles],
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

  const onDragLeave = useCallback(
    (e: DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if ((e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
        return;
      }
      setIsDragOver(false);
      setIsDragReject(false);
    },
    [],
  );

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

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  const open = useCallback(() => {
    if (disabled) return;
    inputRef.current?.click();
  }, [disabled]);

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
    removeFile,
    clearFiles,
    open,
  };
}
