import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type ClipboardEvent,
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
  /** Strip style/class/script + disallow unknown tags on paste. Default true. */
  sanitizePaste?: boolean;
  /** Allowed tag whitelist for paste sanitization. Default: a curated set. */
  allowedTags?: string[];
  /** Custom paste handler — receives the raw paste text/html, returns the HTML to insert. Bypasses the built-in sanitizer when provided. */
  transformPaste?: (data: { html: string; text: string }) => string;
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
    onPaste: (e: ClipboardEvent<HTMLDivElement>) => void;
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

const DEFAULT_ALLOWED_TAGS = [
  "p", "br", "div", "span",
  "b", "strong", "i", "em", "u", "s", "strike", "del", "code",
  "ul", "ol", "li",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "a", "blockquote", "pre",
];

function sanitizeHtml(html: string, allowedTags: string[]): string {
  if (typeof window === "undefined") return html;
  const tpl = document.createElement("template");
  tpl.innerHTML = html;
  const allowed = new Set(allowedTags.map((t) => t.toLowerCase()));

  const walk = (node: Node) => {
    if (node.nodeType !== 1) return;
    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();
    if (!allowed.has(tag)) {
      // unwrap — replace with its children
      const parent = el.parentNode;
      if (!parent) return;
      while (el.firstChild) parent.insertBefore(el.firstChild, el);
      parent.removeChild(el);
      return;
    }
    // strip dangerous attributes
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      if (name === "style" || name === "class" || name.startsWith("on")) {
        el.removeAttribute(attr.name);
      }
      if (name === "href" && tag === "a") {
        const v = attr.value.trim().toLowerCase();
        if (v.startsWith("javascript:") || v.startsWith("data:")) {
          el.removeAttribute(attr.name);
        }
      }
    }
    Array.from(el.childNodes).forEach(walk);
  };

  Array.from(tpl.content.childNodes).forEach(walk);
  return tpl.innerHTML;
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
  sanitizePaste = true,
  allowedTags = DEFAULT_ALLOWED_TAGS,
  transformPaste,
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

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLDivElement>) => {
      if (disabled || readOnly) return;
      if (!sanitizePaste && !transformPaste) return; // let the browser handle it

      const html = e.clipboardData.getData("text/html");
      const text = e.clipboardData.getData("text/plain");

      let inserted: string;
      if (transformPaste) {
        inserted = transformPaste({ html, text });
      } else if (html) {
        inserted = sanitizeHtml(html, allowedTags);
      } else {
        // Plain-text paste: escape and preserve newlines as <br>.
        inserted = text
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/\n/g, "<br>");
      }

      e.preventDefault();
      try {
        // execCommand still works in all browsers and integrates with undo stack.
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        document.execCommand("insertHTML", false, inserted);
      } catch {
        // fallback: direct DOM insertion
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          range.deleteContents();
          const tpl = document.createElement("template");
          tpl.innerHTML = inserted;
          range.insertNode(tpl.content);
        }
      }
      handleChange();
    },
    [disabled, readOnly, sanitizePaste, allowedTags, transformPaste, handleChange],
  );

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
    onPaste: handlePaste,
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
