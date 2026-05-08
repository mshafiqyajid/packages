import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ButtonHTMLAttributes,
} from "react";

export interface UseCodeBlockOptions {
  code: string;
  language?: string;
  showCopy?: boolean;
  copyLabel?: string;
  copiedLabel?: string;
  onCopy?: () => void;
}

export interface UseCodeBlockResult {
  rootProps: HTMLAttributes<HTMLDivElement>;
  copyProps: ButtonHTMLAttributes<HTMLButtonElement>;
  isCopied: boolean;
}

async function writeToClipboard(text: string): Promise<void> {
  if (
    typeof navigator !== "undefined" &&
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === "function" &&
    typeof window !== "undefined" &&
    window.isSecureContext
  ) {
    await navigator.clipboard.writeText(text);
    return;
  }

  if (typeof document === "undefined") {
    throw new Error("Clipboard is not available in this environment");
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "0";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";
  document.body.appendChild(textarea);
  textarea.select();
  textarea.setSelectionRange(0, text.length);

  try {
    const execFn = (document as unknown as Record<string, unknown>)["execCommand"] as ((cmd: string) => boolean) | undefined;
    const successful = execFn?.("copy") ?? false;
    if (!successful) throw new Error("Copy command was rejected");
  } finally {
    document.body.removeChild(textarea);
  }
}

export function useCodeBlock(options: UseCodeBlockOptions): UseCodeBlockResult {
  const {
    code,
    language = "text",
    showCopy = true,
    copyLabel = "Copy",
    copiedLabel = "Copied!",
    onCopy,
  } = options;

  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await writeToClipboard(code);
      if (!mountedRef.current) return;
      setIsCopied(true);
      onCopy?.();
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        if (mountedRef.current) setIsCopied(false);
        timeoutRef.current = null;
      }, 2000);
    } catch {
      // Silently fail — copy not critical
    }
  }, [code, onCopy]);

  const rootProps: HTMLAttributes<HTMLDivElement> = {
    role: "region",
    "aria-label": `Code block: ${language}`,
  };

  const copyProps: ButtonHTMLAttributes<HTMLButtonElement> = {
    type: "button",
    "aria-label": isCopied ? copiedLabel : copyLabel,
    "aria-pressed": isCopied,
    onClick: () => {
      void handleCopy();
    },
  };

  if (!showCopy) {
    return {
      rootProps,
      copyProps: {},
      isCopied: false,
    };
  }

  return { rootProps, copyProps, isCopied };
}
