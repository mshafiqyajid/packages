import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
} from "react";
import { useCodeBlock } from "../useCodeBlock";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CodeBlockSize = "sm" | "md" | "lg";
export type CodeBlockRadius = "none" | "sm" | "md" | "lg";

export interface CodeBlockStyledProps {
  code: string;
  language?: string;
  /** "auto" follows [data-theme] on document root; any other string is a Shiki theme name. */
  theme?: "auto" | string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
  diff?: boolean;
  showCopy?: boolean;
  copyLabel?: string;
  copiedLabel?: string;
  onCopy?: () => void;
  title?: string;
  showLanguageLabel?: boolean;
  maxHeight?: string | number;
  wrap?: boolean;
  size?: CodeBlockSize;
  radius?: CodeBlockRadius;
  className?: string;
  style?: CSSProperties;
  /** Clamp visible lines; shows a fade and expand button when set. */
  maxLines?: number;
  /** Show expand/collapse button when maxLines is set. Defaults to true. */
  expandable?: boolean;
  /** Render a macOS-style terminal header bar instead of the regular header. */
  terminal?: boolean;
  /** Lines (1-based) to focus; all other lines are dimmed to 0.3 opacity. */
  focusLines?: number[];
  /** Small colored pill badge shown in the header next to the language label. */
  badge?: string;
  /** Override the monospace font stack. Accepts any valid CSS font-family value. */
  fontFamily?: string;
}

// ---------------------------------------------------------------------------
// Shiki types (minimal — only what we use)
// ---------------------------------------------------------------------------
interface ShikiHighlighter {
  codeToHtml(
    code: string,
    opts: {
      lang: string;
      themes?: { light: string; dark: string };
      theme?: string;
    },
  ): string;
}

// ---------------------------------------------------------------------------
// Theme detection
// ---------------------------------------------------------------------------

const LIGHT_THEME = "github-light";
const DARK_THEME  = "github-dark-default";

function getDocumentTheme(): "light" | "dark" {
  if (typeof document === "undefined") return "light";
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

function resolveShikiTheme(theme: string, docTheme: "light" | "dark"): string {
  if (theme === "auto") return docTheme === "dark" ? DARK_THEME : LIGHT_THEME;
  return theme;
}

// ---------------------------------------------------------------------------
// Shiki loader (cached promise, lazy)
// ---------------------------------------------------------------------------

let _shikiPromise: Promise<ShikiHighlighter | null> | null = null;
const _highlighterCache = new Map<string, string>();

function getShiki(): Promise<ShikiHighlighter | null> {
  if (_shikiPromise) return _shikiPromise;
  _shikiPromise = (async () => {
    try {
      const shikiModule = await import("shiki");
      if (typeof shikiModule.createHighlighter === "function") {
        return (await shikiModule.createHighlighter({
          themes: [LIGHT_THEME, DARK_THEME],
          langs: [],
        })) as ShikiHighlighter;
      }
      // Shiki v0.x fallback
      if (typeof (shikiModule as Record<string, unknown>)["getHighlighter"] === "function") {
        const fn = (shikiModule as Record<string, unknown>)["getHighlighter"] as (o: unknown) => Promise<ShikiHighlighter>;
        return fn({ themes: [LIGHT_THEME, DARK_THEME], langs: [] });
      }
      return null;
    } catch {
      return null;
    }
  })();
  return _shikiPromise;
}

async function highlightCode(
  code: string,
  lang: string,
  theme: string,
  docTheme: "light" | "dark",
): Promise<string | null> {
  const resolvedTheme = resolveShikiTheme(theme, docTheme);
  const cacheKey = `${resolvedTheme}|${lang}|${code}`;
  if (_highlighterCache.has(cacheKey)) {
    return _highlighterCache.get(cacheKey) ?? null;
  }

  const shiki = await getShiki();
  if (!shiki) return null;

  try {
    const hl = shiki as unknown as {
      loadLanguage?: (lang: string) => Promise<void>;
      getLoadedLanguages?: () => string[];
    };
    if (hl.loadLanguage && hl.getLoadedLanguages) {
      const loaded = hl.getLoadedLanguages();
      if (!loaded.includes(lang) && lang !== "text" && lang !== "plaintext") {
        try { await hl.loadLanguage(lang); } catch { /* unsupported lang */ }
      }
    }

    const html = shiki.codeToHtml(code, { lang, theme: resolvedTheme });
    _highlighterCache.set(cacheKey, html);
    return html;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Line parser (plain text — used when Shiki is unavailable)
// ---------------------------------------------------------------------------

interface ParsedLine {
  content: string;
  diffType: "add" | "remove" | null;
}

function parseLines(code: string, diff: boolean): ParsedLine[] {
  return code.split("\n").map((line) => {
    if (diff && line.startsWith("+")) {
      return { content: line.slice(1), diffType: "add" };
    }
    if (diff && line.startsWith("-")) {
      return { content: line.slice(1), diffType: "remove" };
    }
    return { content: line, diffType: null };
  });
}

// ---------------------------------------------------------------------------
// Tick SVG icon
// ---------------------------------------------------------------------------
function TickIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      className="rcblk-tick-icon"
    >
      <path
        d="M2 7.5L5.5 11L12 3.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      className="rcblk-copy-icon"
    >
      <rect
        x="4.5"
        y="4.5"
        width="8"
        height="8"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path
        d="M9.5 4.5V2.5A1 1 0 0 0 8.5 1.5H2A1 1 0 0 0 1 2.5V9A1 1 0 0 0 2 10H4.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Chevron icons for expand/collapse
// ---------------------------------------------------------------------------
function ChevronDownIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 4L6 8L10 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronUpIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 8L6 4L10 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Main styled component
// ---------------------------------------------------------------------------

export const CodeBlockStyled = forwardRef<HTMLDivElement, CodeBlockStyledProps>(
  function CodeBlockStyled(
    {
      code,
      language = "text",
      theme = "auto",
      showLineNumbers = false,
      highlightLines = [],
      diff = false,
      showCopy = true,
      copyLabel = "Copy",
      copiedLabel = "Copied!",
      onCopy,
      title,
      showLanguageLabel = true,
      maxHeight,
      wrap = false,
      size = "md",
      radius = "md",
      className,
      style,
      maxLines,
      expandable = true,
      terminal = false,
      focusLines,
      badge,
      fontFamily,
    },
    ref,
  ) {
    const { rootProps, copyProps, isCopied } = useCodeBlock({
      code,
      language,
      showCopy,
      copyLabel,
      copiedLabel,
      onCopy,
    });

    const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null);
    const [docTheme, setDocTheme] = useState<"light" | "dark">(getDocumentTheme);
    const [isExpanded, setIsExpanded] = useState(false);
    const mountedRef = useRef(true);

    useEffect(() => {
      mountedRef.current = true;
      return () => { mountedRef.current = false; };
    }, []);

    // Watch [data-theme] changes on document root
    useEffect(() => {
      if (typeof document === "undefined") return;
      const observer = new MutationObserver(() => {
        setDocTheme(getDocumentTheme());
      });
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });
      return () => observer.disconnect();
    }, []);

    // Trigger Shiki highlight whenever code, language, theme, or docTheme changes
    useEffect(() => {
      let cancelled = false;
      setHighlightedHtml(null);

      void highlightCode(code, language, theme, docTheme).then((html) => {
        if (!cancelled && mountedRef.current) setHighlightedHtml(html);
      });

      return () => { cancelled = true; };
    }, [code, language, theme, docTheme]);

    const isCollapsed = maxLines !== undefined && !isExpanded;
    const hasFocus = focusLines !== undefined && focusLines.length > 0;

    // When terminal is true it replaces the regular header entirely
    const hasRegularHeader = !terminal && !!(title || showLanguageLabel || badge);

    const preStyle: CSSProperties = {};
    if (maxHeight !== undefined) {
      preStyle.maxHeight = typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight;
    }

    // Build root attributes
    const rootAttrs: HTMLAttributes<HTMLDivElement> = {
      ...rootProps,
      "data-language": language,
      "data-diff": diff ? "true" : undefined,
      "data-wrap": wrap ? "true" : undefined,
      "data-has-title": title ? "true" : undefined,
      "data-size": size,
      "data-radius": radius,
      "data-collapsed": isCollapsed ? "true" : undefined,
      "data-terminal": terminal ? "true" : undefined,
      "data-has-focus": hasFocus ? "true" : undefined,
      "data-has-badge": badge ? "true" : undefined,
    } as HTMLAttributes<HTMLDivElement>;

    const displayLang = language !== "text" ? language : undefined;

    return (
      <div
        ref={ref}
        {...rootAttrs}
        className={`rcblk-root${className ? ` ${className}` : ""}`}
        style={fontFamily ? { ...style, "--rcblk-font-family": fontFamily } as CSSProperties : style}
      >
        {terminal && (
          <div className="rcblk-terminal-bar">
            <span className="rcblk-terminal-dots" aria-hidden="true">
              <span className="rcblk-terminal-dot rcblk-terminal-dot--red" />
              <span className="rcblk-terminal-dot rcblk-terminal-dot--yellow" />
              <span className="rcblk-terminal-dot rcblk-terminal-dot--green" />
            </span>
            {title && <span className="rcblk-terminal-title">{title}</span>}
          </div>
        )}

        {hasRegularHeader && (
          <div className="rcblk-header">
            {title && (
              <span className="rcblk-title">{title}</span>
            )}
            {badge && <span className="rcblk-badge">{badge}</span>}
            {showLanguageLabel && displayLang && (
              <span className="rcblk-lang-label">{displayLang}</span>
            )}
          </div>
        )}

        {/* Header with badge only (no title, terminal off) */}
        {!terminal && !hasRegularHeader && badge && (
          <div className="rcblk-header">
            <span className="rcblk-badge">{badge}</span>
            {showLanguageLabel && displayLang && (
              <span className="rcblk-lang-label">{displayLang}</span>
            )}
          </div>
        )}

        <div className="rcblk-body" style={{ position: "relative" }}>
          <div
            className="rcblk-body-inner"
            style={isCollapsed ? { overflow: "hidden", position: "relative" } : undefined}
          >
            {highlightedHtml ? (
              <ShikiOutput
                html={highlightedHtml}
                code={code}
                diff={diff}
                showLineNumbers={showLineNumbers}
                highlightLines={highlightLines}
                preStyle={preStyle}
                maxLines={isCollapsed ? maxLines : undefined}
                focusLines={focusLines}
              />
            ) : (
              <PlainOutput
                code={code}
                diff={diff}
                showLineNumbers={showLineNumbers}
                highlightLines={highlightLines}
                preStyle={preStyle}
                maxLines={isCollapsed ? maxLines : undefined}
                focusLines={focusLines}
              />
            )}
            {isCollapsed && <div className="rcblk-collapsed-fade" />}
          </div>

          {showCopy && (
            <button
              {...copyProps}
              aria-label={isCopied ? copiedLabel : copyLabel}
              className={`rcblk-copy-btn${isCopied ? " rcblk-copy-btn--copied" : ""}`}
            >
              {isCopied ? <TickIcon /> : <CopyIcon />}
            </button>
          )}
        </div>

        {maxLines !== undefined && expandable && (
          <button
            className="rcblk-expand-btn"
            onClick={() => setIsExpanded((v) => !v)}
            aria-expanded={isExpanded}
          >
            {isExpanded ? (
              <><ChevronUpIcon /> Collapse</>
            ) : (
              <><ChevronDownIcon /> Expand</>
            )}
          </button>
        )}
      </div>
    );
  },
);

// ---------------------------------------------------------------------------
// Plain text output (fallback when Shiki unavailable)
// ---------------------------------------------------------------------------

interface PlainOutputProps {
  code: string;
  diff: boolean;
  showLineNumbers: boolean;
  highlightLines: number[];
  preStyle?: CSSProperties;
  maxLines?: number;
  focusLines?: number[];
}

function PlainOutput({
  code,
  diff,
  showLineNumbers,
  highlightLines,
  preStyle,
  maxLines,
  focusLines,
}: PlainOutputProps) {
  const allLines = parseLines(code, diff);
  const lines = maxLines !== undefined ? allLines.slice(0, maxLines) : allLines;
  const hasFocus = focusLines !== undefined && focusLines.length > 0;

  return (
    <pre className="rcblk-pre" style={preStyle}>
      <code className="rcblk-code">
        {lines.map((line, idx) => {
          const lineNumber = idx + 1;
          const isHighlighted = highlightLines.includes(lineNumber);
          const isFocused = hasFocus ? (focusLines?.includes(lineNumber) ?? false) : undefined;
          return (
            <span
              key={idx}
              className="rcblk-line"
              data-diff-type={line.diffType ?? undefined}
              data-highlighted={isHighlighted ? "true" : undefined}
              data-focused={hasFocus && isFocused ? "true" : undefined}
              data-unfocused={hasFocus && !isFocused ? "true" : undefined}
            >
              {showLineNumbers && (
                <span className="rcblk-line-number" aria-hidden="true">
                  {lineNumber}
                </span>
              )}
              <span className="rcblk-line-content">{line.content}</span>
              {"\n"}
            </span>
          );
        })}
      </code>
    </pre>
  );
}

// ---------------------------------------------------------------------------
// Shiki HTML output — injects highlighted HTML, overlays diff/highlight
// ---------------------------------------------------------------------------

interface ShikiOutputProps {
  html: string;
  code: string;
  diff: boolean;
  showLineNumbers: boolean;
  highlightLines: number[];
  preStyle?: CSSProperties;
  maxLines?: number;
  focusLines?: number[];
}

function useShikiLines(html: string): string[] {
  const results: string[] = [];
  const marker = '<span class="line">';
  let pos = 0;

  while (pos < html.length) {
    const lineStart = html.indexOf(marker, pos);
    if (lineStart === -1) break;

    const contentStart = lineStart + marker.length;
    let depth = 1;
    let i = contentStart;

    while (i < html.length && depth > 0) {
      if (html[i] === "<") {
        if (html.startsWith("</span>", i)) {
          depth--;
          if (depth === 0) {
            results.push(html.slice(contentStart, i));
            pos = i + 7;
            break;
          }
          i += 7;
        } else if (html.startsWith("<span", i)) {
          depth++;
          i++;
        } else {
          i++;
        }
      } else {
        i++;
      }
    }

    if (depth > 0) break;
  }

  return results;
}

function ShikiOutput({
  html,
  code,
  diff,
  showLineNumbers,
  highlightLines,
  preStyle,
  maxLines,
  focusLines,
}: ShikiOutputProps) {
  const shikiLines = useShikiLines(html);

  if (shikiLines.length === 0) {
    // Shiki output doesn't have line spans — render raw and skip line decorations
    return (
      <div
        className="rcblk-shiki-raw"
        style={preStyle}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  const rawLines = code.split("\n");
  const displayLines = maxLines !== undefined ? shikiLines.slice(0, maxLines) : shikiLines;
  const hasFocus = focusLines !== undefined && focusLines.length > 0;

  return (
    <pre className="rcblk-pre" style={preStyle}>
      <code className="rcblk-code">
        {displayLines.map((lineHtml, idx) => {
          const lineNumber = idx + 1;
          const rawLine = rawLines[idx] ?? "";
          const isDiffAdd = diff && rawLine.startsWith("+");
          const isDiffRemove = diff && rawLine.startsWith("-");
          const isHighlighted = highlightLines.includes(lineNumber);
          const isFocused = hasFocus ? (focusLines?.includes(lineNumber) ?? false) : undefined;

          return (
            <span
              key={idx}
              className="rcblk-line"
              data-diff-type={
                isDiffAdd ? "add" : isDiffRemove ? "remove" : undefined
              }
              data-highlighted={isHighlighted ? "true" : undefined}
              data-focused={hasFocus && isFocused ? "true" : undefined}
              data-unfocused={hasFocus && !isFocused ? "true" : undefined}
            >
              {showLineNumbers && (
                <span className="rcblk-line-number" aria-hidden="true">
                  {lineNumber}
                </span>
              )}
              <span
                className="rcblk-line-content"
                dangerouslySetInnerHTML={{ __html: lineHtml }}
              />
              {"\n"}
            </span>
          );
        })}
      </code>
    </pre>
  );
}
