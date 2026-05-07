import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  useRichText,
  type ShortcutAction,
  type ShortcutMap,
  type UseRichTextOptions,
} from "../useRichText";
import { LinkPopover } from "./LinkPopover";
import { BubbleMenu } from "./BubbleMenu";

export type RichTextSize = "sm" | "md" | "lg";
export type RichTextTone = "neutral" | "primary";
export type ToolbarItem =
  | "bold"
  | "italic"
  | "underline"
  | "strikethrough"
  | "h1"
  | "h2"
  | "ul"
  | "ol"
  | "blockquote"
  | "link"
  | "clear";

const DEFAULT_TOOLBAR_ITEMS: ToolbarItem[] = [
  "bold",
  "italic",
  "underline",
  "strikethrough",
  "h1",
  "h2",
  "ul",
  "ol",
  "blockquote",
  "link",
  "clear",
];

const TOOLBAR_GROUPS: ToolbarItem[][] = [
  ["bold", "italic", "underline", "strikethrough"],
  ["h1", "h2"],
  ["ul", "ol", "blockquote"],
  ["link", "clear"],
];

function getActiveGroups(items: ToolbarItem[]): ToolbarItem[][] {
  return TOOLBAR_GROUPS.map((group) =>
    group.filter((item) => items.includes(item)),
  ).filter((group) => group.length > 0);
}

const TOOLBAR_LABELS: Record<ToolbarItem, string> = {
  bold: "Bold",
  italic: "Italic",
  underline: "Underline",
  strikethrough: "Strikethrough",
  h1: "H1",
  h2: "H2",
  ul: "Bullet list",
  ol: "Numbered list",
  blockquote: "Blockquote",
  link: "Link",
  clear: "Clear formatting",
};

function ToolbarIcon({ item }: { item: ToolbarItem }) {
  switch (item) {
    case "bold":
      return <strong aria-hidden="true">B</strong>;
    case "italic":
      return <em aria-hidden="true">I</em>;
    case "underline":
      return <span aria-hidden="true" style={{ textDecoration: "underline" }}>U</span>;
    case "strikethrough":
      return <span aria-hidden="true" style={{ textDecoration: "line-through" }}>S</span>;
    case "h1":
      return <span aria-hidden="true">H1</span>;
    case "h2":
      return <span aria-hidden="true">H2</span>;
    case "ul":
      return <span aria-hidden="true">&#8226;&#8226;</span>;
    case "ol":
      return <span aria-hidden="true">1.</span>;
    case "blockquote":
      return <span aria-hidden="true">&#10075;</span>;
    case "link":
      return <span aria-hidden="true">&#128279;</span>;
    case "clear":
      return <span aria-hidden="true">&#10005;</span>;
  }
}

function isItemActive(
  item: ToolbarItem,
  states: {
    isBold: boolean;
    isItalic: boolean;
    isUnderline: boolean;
    isStrikethrough: boolean;
  },
): boolean {
  switch (item) {
    case "bold":
      return states.isBold;
    case "italic":
      return states.isItalic;
    case "underline":
      return states.isUnderline;
    case "strikethrough":
      return states.isStrikethrough;
    default:
      return false;
  }
}

const DEFAULT_SHORTCUTS: ShortcutMap = {
  bold: "Mod+B",
  italic: "Mod+I",
  underline: "Mod+U",
  link: "Mod+K",
};

export interface LinkPromptArgs {
  initialUrl: string;
  initialText?: string;
  isEdit: boolean;
  onSubmit: (url: string, opts?: { newTab?: boolean }) => void;
  onCancel: () => void;
}

export interface RichTextStyledProps extends Omit<UseRichTextOptions, "shortcuts"> {
  size?: RichTextSize;
  tone?: RichTextTone;
  placeholder?: string;
  minHeight?: string;
  maxHeight?: string;
  showToolbar?: boolean;
  toolbarItems?: ToolbarItem[];
  className?: string;
  wordCount?: boolean;
  spellCheck?: boolean;
  allowedTags?: string[];
  /** Built-in keyboard shortcuts. `true` for the defaults (Mod+B/I/U/K), `false` to disable, or a partial map to override. Default `true`. */
  shortcuts?: boolean | ShortcutMap;
  /** Use the inline popover (default) or the legacy `window.prompt` for adding/editing links. */
  defaultLinkPrompt?: "popover" | "prompt";
  /** Render-prop override for the link prompt UI. */
  renderLinkPrompt?: (args: LinkPromptArgs) => ReactNode;
  /** Floating bubble menu on non-empty selection. Default `false`. */
  bubbleMenu?: boolean | { items?: ToolbarItem[]; offset?: number };

  // Form-input parity
  /** Hidden-input name so the editor participates in `<form>` submissions. */
  name?: string;
  /** id for the editor; also used to wire up the `<label>`. */
  id?: string;
  /** Mark the editor as required. Renders a red asterisk on the label. */
  required?: boolean;
  /** Mark the editor as invalid. Sets data-invalid + aria-invalid. */
  invalid?: boolean;
  /** Error message rendered below the editor. Implies `invalid`. */
  error?: ReactNode;
  /** Hint message rendered below the editor when no error is present. */
  hint?: ReactNode;
  /** Label rendered above the editor. */
  label?: ReactNode;
}

function sanitize(html: string, allowed: string[]): string {
  return html.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g, (match, tag) =>
    allowed.includes(tag.toLowerCase()) ? match : "",
  );
}

const FORMATTING_BUBBLE_ITEMS: ToolbarItem[] = ["bold", "italic", "underline", "link"];

interface SelectionInfo {
  rect: DOMRect;
  text: string;
  isInLink: boolean;
  linkEl: HTMLAnchorElement | null;
}

function getEditorSelectionInfo(editor: HTMLDivElement | null): SelectionInfo | null {
  if (!editor) return null;
  if (typeof window === "undefined") return null;
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const range = sel.getRangeAt(0);
  if (!editor.contains(range.commonAncestorContainer)) return null;
  const text = sel.toString();
  // Find any wrapping <a>
  let node: Node | null = range.startContainer;
  let linkEl: HTMLAnchorElement | null = null;
  while (node && node !== editor) {
    if (node.nodeType === 1 && (node as HTMLElement).tagName === "A") {
      linkEl = node as HTMLAnchorElement;
      break;
    }
    node = node.parentNode;
  }
  const rect = range.getBoundingClientRect();
  return { rect, text, isInLink: !!linkEl, linkEl };
}

interface LinkPromptState {
  rect: { top: number; left: number; bottom: number; right: number; width: number; height: number };
  initialUrl: string;
  initialNewTab: boolean;
  isEdit: boolean;
  // The Range to restore before applying the command.
  savedRange: Range | null;
  linkEl: HTMLAnchorElement | null;
}

export const RichTextStyled = forwardRef<HTMLDivElement, RichTextStyledProps>(
  function RichTextStyled(
    {
      size = "md",
      tone = "neutral",
      placeholder,
      minHeight = "120px",
      maxHeight,
      showToolbar = true,
      toolbarItems = DEFAULT_TOOLBAR_ITEMS,
      className,
      wordCount: showWordCount = false,
      spellCheck,
      allowedTags,
      shortcuts = true,
      defaultLinkPrompt = "popover",
      renderLinkPrompt,
      bubbleMenu = false,
      name,
      id: idProp,
      required = false,
      invalid = false,
      error,
      hint,
      label,
      ...hookOptions
    },
    ref,
  ) {
    const generatedId = useId();
    const editorId = idProp ?? generatedId;
    const labelId = useId();
    const hintId = useId();
    const errId = useId();

    const isInvalid = invalid || !!error;

    const [counts, setCounts] = useState({ words: 0, chars: 0 });

    // Resolve the shortcut map.
    const resolvedShortcuts: ShortcutMap | false = useMemo(() => {
      if (shortcuts === false) return false;
      if (shortcuts === true) return DEFAULT_SHORTCUTS;
      return { ...DEFAULT_SHORTCUTS, ...shortcuts };
    }, [shortcuts]);

    const [linkPrompt, setLinkPrompt] = useState<LinkPromptState | null>(null);

    const wrapperRef = useRef<HTMLDivElement | null>(null);

    const originalOnChange = hookOptions.onChange;
    const wrappedOnChange = useCallback((html: string) => {
      let finalHtml = html;
      if (allowedTags) {
        finalHtml = sanitize(html, allowedTags);
      }
      const text = finalHtml
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      const words = text ? text.split(" ").filter(Boolean).length : 0;
      const chars = text.length;
      setCounts({ words, chars });
      originalOnChange?.(finalHtml);
    }, [allowedTags, originalOnChange]);

    const handleShortcut = useCallback(
      (action: ShortcutAction) => {
        if (action === "link") {
          openLinkPrompt();
        }
        hookOptions.onShortcut?.(action, undefined as never);
      },
      // openLinkPrompt is stable enough — defined below; eslint-disable
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [hookOptions.onShortcut],
    );

    const {
      editorProps,
      execCommand,
      isBold,
      isItalic,
      isUnderline,
      isStrikethrough,
      html,
      chars,
      words,
    } = useRichText({
      ...hookOptions,
      onChange: wrappedOnChange,
      shortcuts: resolvedShortcuts,
      onShortcut: handleShortcut,
    });

    // Sync hook-derived counts when the user passes wordCount.
    useEffect(() => {
      setCounts({ words, chars });
    }, [words, chars]);

    const activeGroups = getActiveGroups(toolbarItems);

    const editorStyle: CSSProperties = {
      minHeight,
      ...(maxHeight ? { maxHeight, overflowY: "auto" } : {}),
    };

    const { disabled, readOnly } = hookOptions;

    // ----------------------------------------------------------------------
    // Link prompt
    // ----------------------------------------------------------------------
    function openLinkPrompt() {
      const editor = editorProps.ref.current;
      if (!editor) return;
      const info = getEditorSelectionInfo(editor);
      const usePrompt = defaultLinkPrompt === "prompt" && !renderLinkPrompt;
      if (usePrompt) {
        const initial = info?.linkEl?.getAttribute("href") ?? "";
        const url = window.prompt("Enter URL", initial);
        if (url === null) return;
        if (url === "" && info?.isInLink) {
          execCommand("unlink");
          return;
        }
        if (url) execCommand("createLink", url);
        return;
      }
      const rect = info?.rect ?? editor.getBoundingClientRect();
      // Save current selection so we can restore it before applying the command.
      const sel = window.getSelection();
      const savedRange = sel && sel.rangeCount > 0 ? sel.getRangeAt(0).cloneRange() : null;
      setLinkPrompt({
        rect: {
          top: rect.top,
          left: rect.left,
          bottom: rect.bottom,
          right: rect.right,
          width: rect.width,
          height: rect.height,
        },
        initialUrl: info?.linkEl?.getAttribute("href") ?? "",
        initialNewTab: info?.linkEl?.getAttribute("target") === "_blank",
        isEdit: !!info?.isInLink,
        savedRange,
        linkEl: info?.linkEl ?? null,
      });
    }

    function restoreSelection(state: LinkPromptState) {
      if (!state.savedRange) return;
      const sel = window.getSelection();
      if (!sel) return;
      sel.removeAllRanges();
      sel.addRange(state.savedRange);
      editorProps.ref.current?.focus();
    }

    function applyLink(state: LinkPromptState, url: string, opts: { newTab?: boolean }) {
      restoreSelection(state);
      // Use createLink, then walk the editor to set target= on the new <a>
      // (createLink doesn't accept attributes directly).
      execCommand("createLink", url);
      if (opts.newTab) {
        const editor = editorProps.ref.current;
        if (editor) {
          const links = editor.querySelectorAll(`a[href="${cssEscape(url)}"]`);
          links.forEach((a) => {
            a.setAttribute("target", "_blank");
            a.setAttribute("rel", "noopener noreferrer");
          });
        }
      } else if (state.isEdit && state.linkEl) {
        state.linkEl.removeAttribute("target");
        state.linkEl.removeAttribute("rel");
      }
      setLinkPrompt(null);
    }

    function removeLink(state: LinkPromptState) {
      restoreSelection(state);
      execCommand("unlink");
      setLinkPrompt(null);
    }

    // ----------------------------------------------------------------------
    // Toolbar action dispatch
    // ----------------------------------------------------------------------
    const dispatchToolbarItem = useCallback(
      (item: ToolbarItem) => {
        switch (item) {
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
          case "h1":
            execCommand("formatBlock", "<h1>");
            break;
          case "h2":
            execCommand("formatBlock", "<h2>");
            break;
          case "ul":
            execCommand("insertUnorderedList");
            break;
          case "ol":
            execCommand("insertOrderedList");
            break;
          case "blockquote":
            execCommand("formatBlock", "<blockquote>");
            break;
          case "link":
            openLinkPrompt();
            break;
          case "clear":
            execCommand("removeFormat");
            break;
        }
      },
      // openLinkPrompt is stable per render
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [execCommand],
    );

    // ----------------------------------------------------------------------
    // Bubble menu
    // ----------------------------------------------------------------------
    const bubbleEnabled = bubbleMenu !== false && !!bubbleMenu;
    const bubbleConfig = typeof bubbleMenu === "object" && bubbleMenu ? bubbleMenu : {};
    const bubbleItems = bubbleConfig.items ?? FORMATTING_BUBBLE_ITEMS;
    const bubbleOffset = bubbleConfig.offset ?? 8;

    const [bubbleRect, setBubbleRect] = useState<DOMRect | null>(null);

    useEffect(() => {
      if (!bubbleEnabled) return;
      const editor = editorProps.ref.current;
      if (!editor) return;

      function update() {
        const editor = editorProps.ref.current;
        if (!editor) {
          setBubbleRect(null);
          return;
        }
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
          setBubbleRect(null);
          return;
        }
        const range = sel.getRangeAt(0);
        if (!editor.contains(range.commonAncestorContainer)) {
          setBubbleRect(null);
          return;
        }
        const rect = range.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) {
          setBubbleRect(null);
          return;
        }
        setBubbleRect(rect);
      }

      function onSelectionChange() {
        update();
      }
      function onScroll() {
        setBubbleRect(null);
      }

      document.addEventListener("selectionchange", onSelectionChange);
      window.addEventListener("scroll", onScroll, true);
      return () => {
        document.removeEventListener("selectionchange", onSelectionChange);
        window.removeEventListener("scroll", onScroll, true);
      };
    }, [bubbleEnabled, editorProps.ref]);

    const showBubble = bubbleEnabled && bubbleRect && !disabled && !readOnly;

    // ----------------------------------------------------------------------
    // Render
    // ----------------------------------------------------------------------
    const finalCounts = showWordCount ? { words, chars } : counts;

    return (
      <div
        className={[
          "rrt2-root",
          `rrt2-root--${size}`,
          `rrt2-root--${tone}`,
          disabled ? "rrt2-root--disabled" : "",
          readOnly ? "rrt2-root--readonly" : "",
          isInvalid ? "rrt2-root--invalid" : "",
          className ?? "",
        ]
          .filter(Boolean)
          .join(" ")}
        data-size={size}
        data-tone={tone}
        data-disabled={disabled ? "true" : undefined}
        data-readonly={readOnly ? "true" : undefined}
        data-invalid={isInvalid ? "true" : undefined}
      >
        {label && (
          <label className="rrt2-label" id={labelId} htmlFor={editorId}>
            {label}
            {required && <span className="rrt2-required" aria-hidden="true"> *</span>}
          </label>
        )}
        <div
          ref={(el) => {
            wrapperRef.current = el;
            if (typeof ref === "function") ref(el);
            else if (ref)
              (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
          }}
          className="rrt2-shell"
        >
          {showToolbar && (
            <div className="rrt2-toolbar" role="toolbar" aria-label="Text formatting">
              {activeGroups.map((group, groupIndex) => (
                <span key={groupIndex} className="rrt2-toolbar__group">
                  {group.map((item) => {
                    const active = isItemActive(item, {
                      isBold,
                      isItalic,
                      isUnderline,
                      isStrikethrough,
                    });
                    return (
                      <button
                        key={item}
                        type="button"
                        className={[
                          "rrt2-toolbar__btn",
                          active ? "rrt2-toolbar__btn--active" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        data-active={active ? "true" : undefined}
                        aria-label={TOOLBAR_LABELS[item]}
                        aria-pressed={active}
                        disabled={disabled}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          dispatchToolbarItem(item);
                        }}
                      >
                        <ToolbarIcon item={item} />
                      </button>
                    );
                  })}
                </span>
              ))}
            </div>
          )}
          <div className="rrt2-editor-wrap" data-placeholder={placeholder}>
            <div
              {...editorProps}
              id={editorId}
              className="rrt2-editor"
              style={editorStyle}
              role="textbox"
              aria-multiline="true"
              aria-label={typeof label === "string" ? undefined : "Rich text editor"}
              aria-labelledby={label ? labelId : undefined}
              aria-describedby={
                error ? errId : hint ? hintId : undefined
              }
              aria-invalid={isInvalid || undefined}
              aria-required={required || undefined}
              spellCheck={spellCheck ?? true}
            />
          </div>
          {showWordCount && (
            <div className="rrt2-wordcount" aria-live="polite">
              {finalCounts.words} words · {finalCounts.chars} chars
            </div>
          )}
        </div>
        {(hint || error) && (
          <span
            id={error ? errId : hintId}
            className={error ? "rrt2-message rrt2-message--error" : "rrt2-message"}
            role={error ? "alert" : undefined}
          >
            {error ?? hint}
          </span>
        )}
        {name && <input type="hidden" name={name} value={html} />}

        {/* Link popover */}
        {linkPrompt && renderLinkPrompt && (
          <>{renderLinkPrompt({
            initialUrl: linkPrompt.initialUrl,
            isEdit: linkPrompt.isEdit,
            onSubmit: (url, opts) => applyLink(linkPrompt, url, opts ?? {}),
            onCancel: () => setLinkPrompt(null),
          })}</>
        )}
        {linkPrompt && !renderLinkPrompt && (
          <LinkPopover
            rect={linkPrompt.rect}
            initialUrl={linkPrompt.initialUrl}
            initialNewTab={linkPrompt.initialNewTab}
            isEdit={linkPrompt.isEdit}
            onSubmit={(url, opts) => applyLink(linkPrompt, url, opts)}
            onRemove={
              linkPrompt.isEdit
                ? () => removeLink(linkPrompt)
                : undefined
            }
            onCancel={() => setLinkPrompt(null)}
          />
        )}

        {/* Bubble menu */}
        {showBubble && bubbleRect && (
          <BubbleMenu rect={bubbleRect} offset={bubbleOffset}>
            {bubbleItems.map((item) => {
              const active = isItemActive(item, {
                isBold,
                isItalic,
                isUnderline,
                isStrikethrough,
              });
              return (
                <button
                  key={item}
                  type="button"
                  className={[
                    "rrt2-bubble-btn",
                    active ? "rrt2-bubble-btn--active" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-label={TOOLBAR_LABELS[item]}
                  aria-pressed={active}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    dispatchToolbarItem(item);
                  }}
                >
                  <ToolbarIcon item={item} />
                </button>
              );
            })}
          </BubbleMenu>
        )}
      </div>
    );
  },
);

/** Minimal CSS.escape polyfill for selector building. */
function cssEscape(value: string): string {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(value);
  }
  return value.replace(/["\\]/g, "\\$&");
}
