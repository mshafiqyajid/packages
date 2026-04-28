import { useCallback, useEffect, useRef, useState } from "react";

export type CopySource = string | (() => string | Promise<string>);

export interface UseCopyToClipboardOptions {
  resetAfter?: number;
  onCopy?: (text: string) => void;
  onError?: (error: Error) => void;
}

export interface UseCopyToClipboardResult {
  copy: (source: CopySource) => Promise<boolean>;
  copied: boolean;
  error: Error | null;
  reset: () => void;
}

async function resolveSource(source: CopySource): Promise<string> {
  if (typeof source === "string") return source;
  return await source();
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
    const successful = document.execCommand("copy");
    if (!successful) throw new Error("Copy command was rejected");
  } finally {
    document.body.removeChild(textarea);
  }
}

export function useCopyToClipboard(
  options: UseCopyToClipboardOptions = {},
): UseCopyToClipboardResult {
  const { resetAfter = 2000, onCopy, onError } = options;

  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);
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

  const reset = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setCopied(false);
    setError(null);
  }, []);

  const copy = useCallback(
    async (source: CopySource): Promise<boolean> => {
      try {
        const text = await resolveSource(source);
        await writeToClipboard(text);
        if (!mountedRef.current) return true;

        setError(null);
        setCopied(true);
        onCopy?.(text);

        if (resetAfter > 0) {
          if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => {
            if (mountedRef.current) setCopied(false);
            timeoutRef.current = null;
          }, resetAfter);
        }
        return true;
      } catch (rawError) {
        const err =
          rawError instanceof Error ? rawError : new Error(String(rawError));
        if (mountedRef.current) {
          setCopied(false);
          setError(err);
        }
        onError?.(err);
        return false;
      }
    },
    [resetAfter, onCopy, onError],
  );

  return { copy, copied, error, reset };
}
