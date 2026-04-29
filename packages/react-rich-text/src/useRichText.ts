import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type RefObject,
} from "react";

export interface UseRichTextOptions {
  value?: string;
  defaultValue?: string;
  onChange?: (html: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

export interface UseRichTextResult {
  editorProps: {
    ref: RefObject<HTMLDivElement>;
    contentEditable: boolean | "true" | "false" | "inherit" | "plaintext-only";
    suppressContentEditableWarning: boolean;
    onInput: () => void;
    onKeyUp: () => void;
    onMouseUp: () => void;
    onSelect: () => void;
    onFocus: (() => void) | undefined;
    onBlur: (() => void) | undefined;
    "aria-disabled": boolean | undefined;
    "aria-readonly": boolean | undefined;
  };
  execCommand: (command: string, value?: string) => void;
  queryCommandState: (command: string) => boolean;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isStrikethrough: boolean;
  html: string;
}

function getContentEditableValue(
  disabled: boolean,
  readOnly: boolean,
): "true" | "false" {
  if (disabled || readOnly) return "false";
  return "true";
}

export function useRichText({
  value,
  defaultValue = "",
  onChange,
  disabled = false,
  readOnly = false,
  onFocus,
  onBlur,
}: UseRichTextOptions = {}): UseRichTextResult {
  const editorRef = useRef<HTMLDivElement>(null);
  const isControlled = value !== undefined;

  const [html, setHtml] = useState<string>(
    isControlled ? (value ?? "") : defaultValue,
  );
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);

  const updateFormatState = useCallback(() => {
    try {
      setIsBold(document.queryCommandState("bold"));
      setIsItalic(document.queryCommandState("italic"));
      setIsUnderline(document.queryCommandState("underline"));
      setIsStrikethrough(document.queryCommandState("strikeThrough"));
    } catch {
      // queryCommandState can throw in some environments
    }
  }, []);

  const handleChange = useCallback(() => {
    if (!editorRef.current) return;
    const newHtml = editorRef.current.innerHTML;
    setHtml(newHtml);
    onChange?.(newHtml);
    updateFormatState();
  }, [onChange, updateFormatState]);

  // Sync controlled value to DOM
  useEffect(() => {
    if (!isControlled) return;
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value ?? "";
      setHtml(value ?? "");
    }
  }, [isControlled, value]);

  // Seed uncontrolled initial HTML into the DOM on mount
  useEffect(() => {
    if (isControlled) return;
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML === "" && defaultValue) {
      editorRef.current.innerHTML = defaultValue;
      setHtml(defaultValue);
    }
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const execCommand = useCallback(
    (command: string, val?: string) => {
      if (disabled || readOnly) return;
      editorRef.current?.focus();
      try {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        document.execCommand(command, false, val);
      } catch {
        // execCommand is deprecated but still works; ignore errors
      }
      handleChange();
    },
    [disabled, readOnly, handleChange],
  );

  const queryCommandState = useCallback((command: string): boolean => {
    try {
      return document.queryCommandState(command);
    } catch {
      return false;
    }
  }, []);

  const editorProps: UseRichTextResult["editorProps"] = {
    ref: editorRef,
    contentEditable: getContentEditableValue(disabled, readOnly),
    suppressContentEditableWarning: true,
    onInput: handleChange,
    onKeyUp: updateFormatState,
    onMouseUp: updateFormatState,
    onSelect: updateFormatState,
    onFocus: onFocus,
    onBlur: onBlur,
    "aria-disabled": disabled || undefined,
    "aria-readonly": readOnly || undefined,
  };

  return {
    editorProps,
    execCommand,
    queryCommandState,
    isBold,
    isItalic,
    isUnderline,
    isStrikethrough,
    html,
  };
}
