import {
  forwardRef,
  useId,
  useRef,
  useState,
  useEffect,
  useCallback,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useMention } from "../useMention";
import type { MentionTrigger, MentionSuggestion } from "../useMention";

export type MentionSize = "sm" | "md" | "lg";

export interface MentionStyledProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  triggers?: MentionTrigger[];
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  rows?: number;
  label?: string;
  hint?: string;
  error?: string;
  size?: MentionSize;
  className?: string;
  style?: CSSProperties;
  onMentionAdd?: (triggerChar: string, suggestion: MentionSuggestion) => void;
  highlightMentions?: boolean;
  getMentionClass?: (triggerChar: string) => string;
}

function defaultGetMentionClass(triggerChar: string): string {
  if (triggerChar === "@") return "rmen-mention--at";
  if (triggerChar === "#") return "rmen-mention--hash";
  return "rmen-mention--default";
}

interface TextSegment {
  text: string;
  isMention: boolean;
  triggerChar: string;
}

function parseSegments(text: string, triggerChars: string[]): TextSegment[] {
  if (triggerChars.length === 0 || !text) return [{ text, isMention: false, triggerChar: "" }];

  const escaped = triggerChars.map((c) => c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("");
  const pattern = new RegExp(`(?:^|(?<=[ \t\n]))[${escaped}]\\S+`, "g");

  const segments: TextSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index), isMention: false, triggerChar: "" });
    }
    const token = match[0];
    segments.push({ text: token, isMention: true, triggerChar: token[0] ?? "" });
    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), isMention: false, triggerChar: "" });
  }

  return segments;
}

function HighlightLayer({
  value,
  triggerChars,
  getMentionClass,
  textareaRef,
}: {
  value: string;
  triggerChars: string[];
  getMentionClass: (triggerChar: string) => string;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}): ReactNode {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    const overlay = overlayRef.current;
    if (!textarea || !overlay) return;

    const syncStyles = () => {
      const computed = window.getComputedStyle(textarea);
      overlay.style.font = computed.font;
      overlay.style.fontSize = computed.fontSize;
      overlay.style.fontFamily = computed.fontFamily;
      overlay.style.fontWeight = computed.fontWeight;
      overlay.style.lineHeight = computed.lineHeight;
      overlay.style.letterSpacing = computed.letterSpacing;
      overlay.style.padding = computed.padding;
      overlay.style.borderWidth = computed.borderWidth;
      overlay.style.borderStyle = computed.borderStyle;
      overlay.style.borderColor = "transparent";
      overlay.style.boxSizing = computed.boxSizing;
    };

    syncStyles();

    const ro = new ResizeObserver(syncStyles);
    ro.observe(textarea);
    return () => ro.disconnect();
  }, [textareaRef]);

  const handleScroll = useCallback(() => {
    const textarea = textareaRef.current;
    const overlay = overlayRef.current;
    if (!textarea || !overlay) return;
    overlay.scrollTop = textarea.scrollTop;
    overlay.scrollLeft = textarea.scrollLeft;
  }, [textareaRef]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.addEventListener("scroll", handleScroll, { passive: true });
    return () => textarea.removeEventListener("scroll", handleScroll);
  }, [textareaRef, handleScroll]);

  const segments = parseSegments(value, triggerChars);

  return (
    <div ref={overlayRef} className="rmen-highlight-layer" aria-hidden="true">
      {segments.map((seg, i) =>
        seg.isMention ? (
          <mark
            key={i}
            className={`rmen-mention ${getMentionClass(seg.triggerChar)}`}
          >
            {seg.text}
          </mark>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </div>
  );
}

interface DropdownPos {
  top: number;
  left: number;
}

function measureCaretPosition(
  textarea: HTMLTextAreaElement,
  caretIndex: number,
): { top: number; left: number } {
  const mirror = document.createElement("div");
  const computed = window.getComputedStyle(textarea);

  const mirrorStyles: Partial<CSSStyleDeclaration> = {
    position: "absolute",
    visibility: "hidden",
    overflow: "hidden",
    whiteSpace: "pre-wrap",
    wordWrap: "break-word",
    width: `${textarea.offsetWidth}px`,
    font: computed.font,
    letterSpacing: computed.letterSpacing,
    lineHeight: computed.lineHeight,
    padding: computed.padding,
    border: computed.border,
    boxSizing: computed.boxSizing,
  };

  Object.assign(mirror.style, mirrorStyles);

  const textBefore = textarea.value.slice(0, caretIndex);
  mirror.textContent = textBefore;

  const caretSpan = document.createElement("span");
  caretSpan.textContent = "|";
  mirror.appendChild(caretSpan);

  document.body.appendChild(mirror);
  const mirrorRect = mirror.getBoundingClientRect();
  const spanRect = caretSpan.getBoundingClientRect();
  document.body.removeChild(mirror);

  const textareaRect = textarea.getBoundingClientRect();

  const top =
    textareaRect.top +
    (spanRect.top - mirrorRect.top) -
    textarea.scrollTop;
  const left =
    textareaRect.left +
    (spanRect.left - mirrorRect.left) -
    textarea.scrollLeft;

  return { top, left };
}

export const MentionStyled = forwardRef<HTMLTextAreaElement, MentionStyledProps>(
  function MentionStyled(
    {
      value,
      defaultValue,
      onChange,
      triggers,
      disabled = false,
      readOnly = false,
      placeholder,
      rows = 3,
      label,
      hint,
      error,
      size = "md",
      className,
      style,
      onMentionAdd,
      highlightMentions = true,
      getMentionClass = defaultGetMentionClass,
    },
    forwardedRef,
  ) {
    const textareaId = useId();
    const labelId = useId();
    const hintId = useId();
    const errId = useId();

    const internalRef = useRef<HTMLTextAreaElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [mounted, setMounted] = useState(false);
    const [dropdownPos, setDropdownPos] = useState<DropdownPos>({ top: -9999, left: -9999 });
    const [resolvedPlacement, setResolvedPlacement] = useState<"above" | "below">("below");

    useEffect(() => {
      setMounted(true);
    }, []);

    const mention = useMention({
      value,
      defaultValue,
      onChange,
      triggers,
      disabled,
      readOnly,
      onMentionAdd,
    });

    const setRef = useCallback(
      (node: HTMLTextAreaElement | null) => {
        (internalRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
        if (typeof forwardedRef === "function") {
          forwardedRef(node);
        } else if (forwardedRef) {
          (forwardedRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
        }
      },
      [forwardedRef],
    );

    const updateDropdownPosition = useCallback(() => {
      const textarea = internalRef.current;
      if (!textarea) return;

      const caretPos =
        textarea.selectionStart ??
        mention.textareaProps.value.length;

      const { top, left } = measureCaretPosition(textarea, caretPos);
      const lineHeightStr = window.getComputedStyle(textarea).lineHeight;
      const lineHeight =
        lineHeightStr === "normal"
          ? parseFloat(window.getComputedStyle(textarea).fontSize) * 1.5
          : parseFloat(lineHeightStr);

      const dropdownHeight =
        dropdownRef.current?.offsetHeight ?? 220;

      const spaceBelow = window.innerHeight - top - lineHeight - 8;
      const above = spaceBelow < dropdownHeight && top > dropdownHeight;

      setResolvedPlacement(above ? "above" : "below");
      setDropdownPos({
        top: above ? top - dropdownHeight - 2 : top + lineHeight + 2,
        left,
      });
    }, [mention.textareaProps.value]);

    useEffect(() => {
      if (!mention.isOpen) return;
      requestAnimationFrame(() => updateDropdownPosition());
    }, [mention.isOpen, mention.query, updateDropdownPosition]);

    useEffect(() => {
      if (!mention.isOpen) return;
      const onUpdate = () => updateDropdownPosition();
      window.addEventListener("scroll", onUpdate, { passive: true });
      window.addEventListener("resize", onUpdate, { passive: true });
      return () => {
        window.removeEventListener("scroll", onUpdate);
        window.removeEventListener("resize", onUpdate);
      };
    }, [mention.isOpen, updateDropdownPosition]);

    useEffect(() => {
      if (!mention.isOpen) return;
      const handleClick = (e: MouseEvent) => {
        const textarea = internalRef.current;
        const dropdown = dropdownRef.current;
        if (
          textarea &&
          !textarea.contains(e.target as Node) &&
          dropdown &&
          !dropdown.contains(e.target as Node)
        ) {
          mention.close();
        }
      };
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }, [mention.isOpen, mention.close]);

    const hasError = !!error;
    const describedBy =
      hasError ? errId : hint ? hintId : undefined;

    const rootClass = ["rmen-root", className].filter(Boolean).join(" ");
    const triggerChars = (triggers ?? []).map((t) => t.char);
    const showHighlight = highlightMentions && !disabled && !readOnly;

    return (
      <div
        className={rootClass}
        style={style}
        data-size={size}
        data-disabled={disabled ? "true" : undefined}
        data-readonly={readOnly ? "true" : undefined}
        data-invalid={hasError ? "true" : undefined}
        data-open={mention.isOpen ? "true" : undefined}
      >
        {label && (
          <label className="rmen-label" id={labelId} htmlFor={textareaId}>
            {label}
          </label>
        )}

        <div className="rmen-control">
          {showHighlight && (
            <HighlightLayer
              value={mention.value}
              triggerChars={triggerChars}
              getMentionClass={getMentionClass}
              textareaRef={internalRef}
            />
          )}
          <textarea
            {...mention.textareaProps}
            id={textareaId}
            ref={setRef}
            className="rmen-textarea"
            placeholder={placeholder}
            rows={rows}
            disabled={disabled}
            readOnly={readOnly}
            aria-invalid={hasError || undefined}
            aria-describedby={describedBy}
            aria-labelledby={label ? labelId : undefined}
          />
        </div>

        {(hint || hasError) && (
          <span
            id={hasError ? errId : hintId}
            className="rmen-hint"
            data-error={hasError ? "true" : undefined}
            role={hasError ? "alert" : undefined}
          >
            {error ?? hint}
          </span>
        )}

        {mounted &&
          createPortal(
            <div
              ref={dropdownRef}
              className="rmen-dropdown"
              data-open={mention.isOpen ? "true" : undefined}
              data-placement={resolvedPlacement}
              style={{
                position: "fixed",
                top: dropdownPos.top,
                left: dropdownPos.left,
              }}
            >
              <ul {...mention.dropdownProps} className="rmen-listbox">
                {mention.isLoading && mention.suggestions.length === 0 ? (
                  <li className="rmen-loading" aria-busy="true" aria-label="Loading suggestions">
                    <span className="rmen-spinner" aria-hidden="true" />
                  </li>
                ) : mention.suggestions.length === 0 && mention.isOpen ? (
                  <li className="rmen-empty" aria-disabled="true">
                    No suggestions
                  </li>
                ) : (
                  mention.suggestions.map((suggestion, index) => {
                    const itemProps = mention.getItemProps(index);
                    const isActive = index === mention.activeSuggestion;
                    const activeTrigger = triggers?.find(
                      (t) => t.char === mention.triggerChar,
                    );
                    const customRender = activeTrigger?.renderSuggestion;
                    return (
                      <li
                        key={suggestion.id}
                        {...itemProps}
                        className="rmen-item"
                        data-active={isActive ? "true" : undefined}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          mention.selectSuggestion(index);
                        }}
                      >
                        {customRender ? (
                          customRender(suggestion, isActive)
                        ) : (
                          <>
                            {suggestion.avatar ? (
                              <img
                                className="rmen-avatar"
                                src={suggestion.avatar}
                                alt=""
                                aria-hidden="true"
                              />
                            ) : (
                              <span className="rmen-avatar-placeholder" aria-hidden="true">
                                {suggestion.label.slice(0, 2)}
                              </span>
                            )}
                            <span className="rmen-item-body">
                              <span className="rmen-item-label">{suggestion.label}</span>
                              {suggestion.description && (
                                <span className="rmen-item-description">
                                  {suggestion.description}
                                </span>
                              )}
                            </span>
                          </>
                        )}
                      </li>
                    );
                  })
                )}
              </ul>
              {mention.isOpen && mention.suggestions.length > 0 && (
                <div className="rmen-dropdown-hint" aria-hidden="true">
                  ↑↓ navigate · Enter select · Esc dismiss
                </div>
              )}
            </div>,
            document.body,
          )}
      </div>
    );
  },
);
