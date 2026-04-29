import { forwardRef, useRef, type CSSProperties } from "react";
import { useRichText, type UseRichTextOptions } from "../useRichText";

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

function execCommandForItem(
  item: ToolbarItem,
  execCmd: (command: string, value?: string) => void,
) {
  switch (item) {
    case "bold":
      execCmd("bold");
      break;
    case "italic":
      execCmd("italic");
      break;
    case "underline":
      execCmd("underline");
      break;
    case "strikethrough":
      execCmd("strikeThrough");
      break;
    case "h1":
      execCmd("formatBlock", "<h1>");
      break;
    case "h2":
      execCmd("formatBlock", "<h2>");
      break;
    case "ul":
      execCmd("insertUnorderedList");
      break;
    case "ol":
      execCmd("insertOrderedList");
      break;
    case "blockquote":
      execCmd("formatBlock", "<blockquote>");
      break;
    case "link": {
      const url = window.prompt("Enter URL");
      if (url) execCmd("createLink", url);
      break;
    }
    case "clear":
      execCmd("removeFormat");
      break;
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

export interface RichTextStyledProps extends UseRichTextOptions {
  size?: RichTextSize;
  tone?: RichTextTone;
  placeholder?: string;
  minHeight?: string;
  maxHeight?: string;
  showToolbar?: boolean;
  toolbarItems?: ToolbarItem[];
  className?: string;
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
      ...hookOptions
    },
    ref,
  ) {
    const {
      editorProps,
      execCommand,
      isBold,
      isItalic,
      isUnderline,
      isStrikethrough,
    } = useRichText(hookOptions);

    const wrapperRef = useRef<HTMLDivElement>(null);

    const activeGroups = getActiveGroups(toolbarItems);

    const editorStyle: CSSProperties = {
      minHeight,
      ...(maxHeight ? { maxHeight, overflowY: "auto" } : {}),
    };

    const { disabled, readOnly } = hookOptions;

    return (
      <div
        ref={(el) => {
          (wrapperRef as React.MutableRefObject<HTMLDivElement | null>).current =
            el;
          if (typeof ref === "function") ref(el);
          else if (ref)
            (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
        }}
        className={[
          "rrt2-root",
          `rrt2-root--${size}`,
          `rrt2-root--${tone}`,
          disabled ? "rrt2-root--disabled" : "",
          readOnly ? "rrt2-root--readonly" : "",
          className ?? "",
        ]
          .filter(Boolean)
          .join(" ")}
        data-size={size}
        data-tone={tone}
        data-disabled={disabled ? "true" : undefined}
        data-readonly={readOnly ? "true" : undefined}
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
                        execCommandForItem(item, execCommand);
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
            className="rrt2-editor"
            style={editorStyle}
            role="textbox"
            aria-multiline="true"
            aria-label="Rich text editor"
          />
        </div>
      </div>
    );
  },
);
