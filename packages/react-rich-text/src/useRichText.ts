import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type ClipboardEvent,
  type KeyboardEvent,
  type RefObject,
} from "react";

export type ShortcutAction =
  | "bold"
  | "italic"
  | "underline"
  | "strikethrough"
  | "link"
  | "undo"
  | "redo"
  | "h1"
  | "h2";

export type ShortcutMap = Partial<Record<ShortcutAction, string | string[]>>;

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
  /** Hard cap on the number of plain-text characters. */
  maxChars?: number;
  /** Hard cap on the number of whitespace-separated words. */
  maxWords?: number;
  /** Fired when an input would exceed `maxChars` / `maxWords` and is suppressed. */
  onMaxReached?: (kind: "chars" | "words") => void;
  /** Auto-link URLs after a space or newline. Default false. */
  autoLink?: boolean;
  /** Pattern used by `autoLink`. Defaults to a basic http(s) URL matcher. */
  autoLinkPattern?: RegExp;
  /** Hook fires when one of these shortcut keys is pressed (see `editorProps.onKeyDown`). */
  onShortcut?: (action: ShortcutAction, event: KeyboardEvent<HTMLDivElement>) => void;
  /** Resolved shortcut map. The styled component sets defaults; consumers usually pass via the styled `shortcuts` prop. */
  shortcuts?: ShortcutMap | false;
}

export interface UseRichTextResult {
  editorProps: {
    ref: RefObject<HTMLDivElement>;
    contentEditable: boolean | "true" | "false" | "inherit" | "plaintext-only";
    suppressContentEditableWarning: boolean;
    onInput: () => void;
    onKeyUp: () => void;
    onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => void;
    onMouseUp: () => void;
    onSelect: () => void;
    onFocus: (() => void) | undefined;
    onBlur: (() => void) | undefined;
    onPaste: (e: ClipboardEvent<HTMLDivElement>) => void;
    onBeforeInput: (e: any) => void;
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
  /** Plain-text character count (whitespace collapsed). */
  chars: number;
  /** Whitespace-separated word count. */
  words: number;
}

const DEFAULT_ALLOWED_TAGS = [
  "p", "br", "div", "span",
  "b", "strong", "i", "em", "u", "s", "strike", "del", "code",
  "ul", "ol", "li",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "a", "blockquote", "pre",
];

const DEFAULT_AUTO_LINK_PATTERN = /(https?:\/\/[^\s<>"']+[^\s<>"'.,;:!?)])/i;

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

function htmlToPlain(html: string): string {
  if (!html) return "";
  if (typeof window === "undefined") {
    return html
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  const tpl = document.createElement("template");
  tpl.innerHTML = html;
  const text = tpl.content.textContent ?? "";
  return text.replace(/\s+/g, " ").trim();
}

function countWordsChars(html: string): { words: number; chars: number } {
  const text = htmlToPlain(html);
  const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
  return { words, chars: text.length };
}

/**
 * Match a shortcut spec like "Mod+B", "Cmd+K", "Ctrl+Shift+Z", "Mod+Shift+Z"
 * against a KeyboardEvent. `Mod` resolves to Cmd on Mac, Ctrl elsewhere.
 */
function matchShortcut(
  spec: string,
  e: { key: string; metaKey: boolean; ctrlKey: boolean; shiftKey: boolean; altKey: boolean },
  isMac: boolean,
): boolean {
  const parts = spec.split("+").map((p) => p.trim().toLowerCase()).filter(Boolean);
  if (parts.length === 0) return false;
  let needCmd = false;
  let needCtrl = false;
  let needShift = false;
  let needAlt = false;
  let key = "";
  for (const part of parts) {
    if (part === "mod") {
      if (isMac) needCmd = true;
      else needCtrl = true;
    } else if (part === "cmd" || part === "meta") {
      needCmd = true;
    } else if (part === "ctrl" || part === "control") {
      needCtrl = true;
    } else if (part === "shift") {
      needShift = true;
    } else if (part === "alt" || part === "option") {
      needAlt = true;
    } else {
      key = part;
    }
  }
  if (needCmd !== e.metaKey) return false;
  if (needCtrl !== e.ctrlKey) return false;
  if (needShift !== e.shiftKey) return false;
  if (needAlt !== e.altKey) return false;
  return e.key.toLowerCase() === key;
}

function matchShortcutAny(
  specs: string | string[] | undefined,
  e: { key: string; metaKey: boolean; ctrlKey: boolean; shiftKey: boolean; altKey: boolean },
  isMac: boolean,
): boolean {
  if (!specs) return false;
  const arr = Array.isArray(specs) ? specs : [specs];
  return arr.some((s) => matchShortcut(s, e, isMac));
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
  maxChars,
  maxWords,
  onMaxReached,
  autoLink = false,
  autoLinkPattern = DEFAULT_AUTO_LINK_PATTERN,
  onShortcut,
  shortcuts,
}: UseRichTextOptions = {}): UseRichTextResult {
  const editorRef = useRef<HTMLDivElement>(null);
  const isControlled = value !== undefined;

  const [html, setHtml] = useState<string>(
    isControlled ? (value ?? "") : defaultValue,
  );
  const [counts, setCounts] = useState(() => countWordsChars(isControlled ? (value ?? "") : defaultValue));
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
    setCounts(countWordsChars(newHtml));
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
      setCounts(countWordsChars(value ?? ""));
    }
  }, [isControlled, value]);

  // Seed uncontrolled initial HTML into the DOM on mount
  useEffect(() => {
    if (isControlled) return;
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML === "" && defaultValue) {
      editorRef.current.innerHTML = defaultValue;
      setHtml(defaultValue);
      setCounts(countWordsChars(defaultValue));
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

      // If inserting would exceed maxChars/maxWords, suppress.
      if (typeof maxChars === "number" || typeof maxWords === "number") {
        const projectedHtml = (editorRef.current?.innerHTML ?? "") + inserted;
        const projected = countWordsChars(projectedHtml);
        if (typeof maxChars === "number" && projected.chars > maxChars) {
          e.preventDefault();
          onMaxReached?.("chars");
          return;
        }
        if (typeof maxWords === "number" && projected.words > maxWords) {
          e.preventDefault();
          onMaxReached?.("words");
          return;
        }
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
    [disabled, readOnly, sanitizePaste, allowedTags, transformPaste, handleChange, maxChars, maxWords, onMaxReached],
  );

  const handleBeforeInput = useCallback(
    (e: any) => {
      if (disabled || readOnly) return;
      const ev = e as InputEvent & { inputType?: string; data?: string | null };
      const inputType = ev.inputType ?? "";
      // Always allow deletes / format changes.
      if (inputType.startsWith("delete") || inputType.startsWith("history")) return;

      // Cap enforcement: count current + insertion data length.
      if (typeof maxChars === "number" || typeof maxWords === "number") {
        const currentText = htmlToPlain(editorRef.current?.innerHTML ?? "");
        const data = typeof ev.data === "string" ? ev.data : "";
        if (data.length > 0) {
          const projectedText = (currentText + data).replace(/\s+/g, " ").trim();
          if (typeof maxChars === "number" && projectedText.length > maxChars) {
            ev.preventDefault?.();
            onMaxReached?.("chars");
            return;
          }
          if (typeof maxWords === "number") {
            const w = projectedText ? projectedText.split(/\s+/).filter(Boolean).length : 0;
            if (w > maxWords) {
              ev.preventDefault?.();
              onMaxReached?.("words");
              return;
            }
          }
        }
      }

      // Auto-link on space/enter.
      if (autoLink && (inputType === "insertText" || inputType === "insertParagraph" || inputType === "insertLineBreak")) {
        const trigger = inputType === "insertText" ? ev.data : "\n";
        const isSpace = trigger === " " || trigger === " ";
        const isNewline = inputType !== "insertText";
        if (isSpace || isNewline) {
          // Defer to after the character is inserted so selection lands cleanly.
          queueMicrotask(() => {
            tryAutoLink(autoLinkPattern);
            handleChange();
          });
        }
      }
    },
    [disabled, readOnly, maxChars, maxWords, onMaxReached, autoLink, autoLinkPattern, handleChange],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (disabled || readOnly) return;
      if (shortcuts === false) return;
      if (!shortcuts) return;
      const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent || "");
      const evLike = {
        key: e.key,
        metaKey: e.metaKey,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        altKey: e.altKey,
      };
      for (const action of Object.keys(shortcuts) as ShortcutAction[]) {
        const spec = shortcuts[action];
        if (matchShortcutAny(spec, evLike, isMac)) {
          e.preventDefault();
          onShortcut?.(action, e);
          // Default actions for built-in formatting; link/h1/h2 require richer
          // handling so the styled component handles those via onShortcut.
          switch (action) {
            case "bold":
              execCommand("bold");
              break;
            case "italic":
              execCommand("italic");
              break;
            case "underline":
              execCommand("underline");
              break;
            case "strikethrough":
              execCommand("strikeThrough");
              break;
            case "undo":
              execCommand("undo");
              break;
            case "redo":
              execCommand("redo");
              break;
            case "h1":
              execCommand("formatBlock", "<h1>");
              break;
            case "h2":
              execCommand("formatBlock", "<h2>");
              break;
            case "link":
              // Hand off to consumer (styled component renders the popover).
              break;
          }
          return;
        }
      }
    },
    [disabled, readOnly, shortcuts, execCommand, onShortcut],
  );

  const editorProps: UseRichTextResult["editorProps"] = {
    ref: editorRef,
    contentEditable: getContentEditableValue(disabled, readOnly),
    suppressContentEditableWarning: true,
    onInput: handleChange,
    onKeyUp: updateFormatState,
    onKeyDown: handleKeyDown,
    onMouseUp: updateFormatState,
    onSelect: updateFormatState,
    onFocus: onFocus,
    onBlur: onBlur,
    onPaste: handlePaste,
    onBeforeInput: handleBeforeInput,
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
    chars: counts.chars,
    words: counts.words,
  };
}

/**
 * After the user types a space/newline, scan the previous word for the
 * autoLink pattern and wrap it in `<a href>` if found. Best-effort — bails out
 * on anything unexpected so it never blocks editing.
 */
function tryAutoLink(pattern: RegExp) {
  try {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    const node = range.startContainer;
    if (node.nodeType !== Node.TEXT_NODE) return;
    const textNode = node as Text;
    const offset = range.startOffset;
    const text = textNode.data;
    // Find the boundary of the just-completed word (left of the cursor, skipping
    // the trailing space/newline character).
    let end = offset - 1;
    while (end > 0 && /\s/.test(text[end - 1] ?? "")) end -= 1;
    if (end <= 0) return;
    let start = end;
    while (start > 0 && !/\s/.test(text[start - 1] ?? "")) start -= 1;
    const word = text.slice(start, end);
    const matchExec = pattern.exec(word);
    if (!matchExec) return;
    const matched = matchExec[0];
    if (!matched) return;
    const matchStart = start + matchExec.index;
    const matchEnd = matchStart + matched.length;
    // Don't auto-link if we're already inside an <a>.
    let parent: Node | null = textNode.parentNode;
    while (parent) {
      if (parent.nodeType === 1 && (parent as HTMLElement).tagName === "A") return;
      parent = parent.parentNode;
    }
    const before = text.slice(0, matchStart);
    const after = text.slice(matchEnd);
    const a = document.createElement("a");
    a.href = matched;
    a.textContent = matched;
    const afterNode = document.createTextNode(after);
    const beforeNode = document.createTextNode(before);
    const grandparent = textNode.parentNode;
    if (!grandparent) return;
    grandparent.insertBefore(beforeNode, textNode);
    grandparent.insertBefore(a, textNode);
    grandparent.insertBefore(afterNode, textNode);
    grandparent.removeChild(textNode);
    // Restore caret to end of `after`.
    const newRange = document.createRange();
    newRange.setStart(afterNode, after.length);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);
  } catch {
    // ignore — auto-link is best-effort
  }
}
