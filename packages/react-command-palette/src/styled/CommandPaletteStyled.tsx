import { forwardRef, useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useCommandPalette, type UseCommandPaletteOptions, type CommandItem } from "../useCommandPalette";

export interface CommandPaletteStyledProps<TData = unknown>
  extends UseCommandPaletteOptions<TData> {
  /** Placeholder for the search input. Default: "Type a command…" */
  placeholder?: string;
  /** Text shown when no items match. Default: "No results." */
  emptyText?: ReactNode;
  /** Custom render for the empty state — receives the current query. Overrides emptyText. */
  emptyState?: (query: string) => ReactNode;
  /** Show a loading row instead of the list. Use with async `onSearch`. */
  loading?: boolean;
  /** Loading message — default: "Loading…" */
  loadingText?: ReactNode;
  /** Bolden matched query characters in item labels. Default: true. */
  highlightMatches?: boolean;
  /** Footer content (keyboard hints, etc). */
  footer?: ReactNode;
  /** Class on the root portal container. */
  className?: string;
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlight(label: string, query: string): ReactNode {
  if (!query.trim()) return label;
  const re = new RegExp(`(${escapeRegExp(query.trim())})`, "ig");
  const parts = label.split(re);
  return parts.map((p, i) =>
    re.test(p) ? <mark key={i} className="rcmd-mark">{p}</mark> : <span key={i}>{p}</span>,
  );
}

function CommandPaletteImpl<TData>(
  props: CommandPaletteStyledProps<TData>,
  _ref: React.Ref<HTMLDivElement>,
) {
  const {
    placeholder = "Type a command…",
    emptyText = "No results.",
    emptyState,
    loading = false,
    loadingText = "Loading…",
    highlightMatches = true,
    footer,
    className,
    ...hookOpts
  } = props;
  void _ref;
  const cmd = useCommandPalette<TData>(hookOpts);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <>
      {cmd.isOpen && (
        <div
          className={["rcmd-overlay", className].filter(Boolean).join(" ")}
          onClick={cmd.close}
          role="presentation"
        >
          <div
            className="rcmd-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rcmd-input-wrap">
              <svg className="rcmd-search-icon" viewBox="0 0 16 16" aria-hidden="true">
                <circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input {...cmd.inputProps} className="rcmd-input" placeholder={placeholder} />
              {loading && <span className="rcmd-spinner" aria-hidden="true" />}
              <kbd className="rcmd-kbd">esc</kbd>
            </div>

            <ul {...cmd.listProps} className="rcmd-list">
              {loading ? (
                <li className="rcmd-loading" aria-live="polite">{loadingText}</li>
              ) : cmd.groups.length === 0 || cmd.filteredItems.length === 0 ? (
                <li className="rcmd-empty" aria-disabled="true">
                  {emptyState ? emptyState(cmd.query) : emptyText}
                </li>
              ) : (
                cmd.groups.map((group) => (
                  <li key={group.id} className="rcmd-group">
                    {group.label && (
                      <div className="rcmd-group-label" aria-hidden="true">{group.label}</div>
                    )}
                    <ul className="rcmd-group-list">
                      {group.items.map((item) => (
                        <CommandItemRow
                          key={item.id}
                          item={item}
                          cmd={cmd}
                          query={highlightMatches ? cmd.query : ""}
                        />
                      ))}
                    </ul>
                  </li>
                ))
              )}
            </ul>

            {footer && <div className="rcmd-footer">{footer}</div>}
          </div>
        </div>
      )}
    </>,
    document.body,
  );
}

function CommandItemRow<TData>({
  item,
  cmd,
  query,
}: {
  item: CommandItem<TData>;
  cmd: ReturnType<typeof useCommandPalette<TData>>;
  query: string;
}) {
  const props = cmd.getItemProps(item);
  return (
    <li
      {...props}
      className="rcmd-item"
      data-active={props["data-active"] || undefined}
      data-disabled={item.disabled || undefined}
    >
      {item.icon && <span className="rcmd-item-icon" aria-hidden="true">{item.icon}</span>}
      <span className="rcmd-item-label">{query ? highlight(item.label, query) : item.label}</span>
      {item.hint && <span className="rcmd-item-hint">{item.hint}</span>}
      {item.shortcut && <kbd className="rcmd-kbd rcmd-item-shortcut">{item.shortcut}</kbd>}
    </li>
  );
}

export const CommandPaletteStyled = forwardRef(CommandPaletteImpl) as <TData = unknown>(
  props: CommandPaletteStyledProps<TData> & { ref?: React.Ref<HTMLDivElement> },
) => ReturnType<typeof CommandPaletteImpl>;
