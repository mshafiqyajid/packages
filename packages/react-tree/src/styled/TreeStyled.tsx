import { forwardRef, useMemo, type ReactNode } from "react";
import { useTree, _registerTreeNodeRef, type TreeNode, type UseTreeOptions } from "../useTree";

export type TreeSize = "sm" | "md" | "lg";
export type TreeTone = "neutral" | "primary";

export interface TreeStyledProps<TData = unknown> extends UseTreeOptions<TData> {
  size?: TreeSize;
  tone?: TreeTone;
  /** Render the label area for each node. Defaults to `node.label`. */
  renderLabel?: (node: TreeNode<TData>, depth: number) => ReactNode;
  /** Show a guide line down the indent column. Default: true. */
  showGuides?: boolean;
  /** Filter the tree by this query (case-insensitive substring match on label). */
  searchQuery?: string;
  /** Bolden matched query characters. Default: true. */
  highlightMatches?: boolean;
  /** Render a checkbox before each node — checked rows are tracked alongside `selectionMode`. Default: false. */
  checkboxes?: boolean;
  /** Custom badge slot rendered after the label (e.g. count, status). */
  renderBadge?: (node: TreeNode<TData>) => ReactNode;
  /** Empty state shown when search has no matches. */
  emptyState?: ReactNode;
  className?: string;
}

function ChevronIcon() {
  return (
    <svg className="rtree-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 4.5l3 3 3-3" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="rtree-spinner" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.18" strokeWidth="2.5" fill="none" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightLabel(label: ReactNode, query: string): ReactNode {
  if (!query.trim() || typeof label !== "string") return label;
  const re = new RegExp(`(${escapeRegExp(query.trim())})`, "ig");
  const parts = label.split(re);
  return parts.map((p, i) =>
    re.test(p) ? <mark key={i} className="rtree-mark">{p}</mark> : <span key={i}>{p}</span>,
  );
}

/** Walks the tree and keeps any branch whose subtree contains a label match. */
function filterTree<T>(nodes: TreeNode<T>[], query: string): {
  filtered: TreeNode<T>[];
  expandedSet: Set<string>;
} {
  const expandedSet = new Set<string>();
  const q = query.trim().toLowerCase();
  if (!q) return { filtered: nodes, expandedSet };

  function walk(list: TreeNode<T>[]): TreeNode<T>[] {
    const out: TreeNode<T>[] = [];
    for (const n of list) {
      const labelText = typeof n.label === "string" ? n.label.toLowerCase() : "";
      const matches = labelText.includes(q);
      const childMatches = n.children ? walk(n.children) : [];
      if (matches || childMatches.length > 0) {
        if (childMatches.length > 0) expandedSet.add(n.id);
        out.push({ ...n, children: childMatches.length > 0 ? childMatches : n.children });
      }
    }
    return out;
  }
  return { filtered: walk(nodes), expandedSet };
}

export const TreeStyled = forwardRef<HTMLDivElement, TreeStyledProps>(
  function TreeStyled(props, _ref) {
    const {
      size = "md",
      tone = "primary",
      renderLabel,
      showGuides = true,
      searchQuery = "",
      highlightMatches = true,
      checkboxes = false,
      renderBadge,
      emptyState,
      className,
      items: rawItems,
      defaultExpandedIds,
      ...hookOpts
    } = props;
    void _ref;

    const { filtered, expandedSet } = useMemo(
      () => filterTree(rawItems ?? [], searchQuery),
      [rawItems, searchQuery],
    );

    // When searching, auto-expand all branches that contain matches.
    const effectiveExpandedIds = useMemo(() => {
      if (!searchQuery.trim()) return defaultExpandedIds;
      const base = new Set(defaultExpandedIds ?? []);
      for (const id of expandedSet) base.add(id);
      return Array.from(base);
    }, [searchQuery, defaultExpandedIds, expandedSet]);

    const tree = useTree({
      ...hookOpts,
      items: filtered,
      defaultExpandedIds: effectiveExpandedIds,
    });

    const isMulti = (props.selectionMode ?? "single") === "multiple";

    const visibleCount = tree.visibleNodes.length;

    return (
      <div
        className={["rtree-root", className].filter(Boolean).join(" ")}
        data-size={size}
        data-tone={tone}
        data-guides={showGuides || undefined}
      >
        {visibleCount === 0 ? (
          <div className="rtree-empty">
            {emptyState ?? (searchQuery.trim() ? `No matches for “${searchQuery}”.` : "No items.")}
          </div>
        ) : (
          <ul {...(tree.getRootProps() as unknown as React.HTMLAttributes<HTMLUListElement>)} className="rtree-list">
            {tree.visibleNodes.map(({ node, depth, hasChildren, isLoading }) => {
              const nodeProps = tree.getNodeProps(node, depth);
              const toggleProps = tree.getToggleProps(node);
              const checked = isMulti
                ? tree.selectedIds.includes(node.id)
                : tree.selectedId === node.id;

              return (
                <li
                  key={node.id}
                  ref={(el) => _registerTreeNodeRef(tree, node.id, el)}
                  {...nodeProps}
                  className="rtree-item"
                  style={{ ["--rtree-depth" as string]: depth.toString() }}
                >
                  <div className="rtree-row">
                    {hasChildren ? (
                      <button
                        {...toggleProps}
                        className={[
                          "rtree-toggle",
                          tree.isExpanded(node.id) ? "rtree-toggle--open" : "",
                        ].filter(Boolean).join(" ")}
                      >
                        {isLoading ? <Spinner /> : <ChevronIcon />}
                      </button>
                    ) : (
                      <span className="rtree-toggle rtree-toggle--leaf" aria-hidden="true" />
                    )}
                    {checkboxes && (
                      <span
                        className="rtree-check"
                        data-checked={checked ? "true" : undefined}
                        aria-hidden="true"
                      >
                        {checked && (
                          <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true">
                            <path d="M2.5 6.5l2.3 2.3L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                          </svg>
                        )}
                      </span>
                    )}
                    {node.icon && <span className="rtree-icon" aria-hidden="true">{node.icon}</span>}
                    <span
                      className="rtree-label"
                      onClick={hasChildren ? toggleProps.onClick : undefined}
                      style={hasChildren ? { cursor: "pointer" } : undefined}
                    >
                      {renderLabel
                        ? renderLabel(node, depth)
                        : highlightMatches
                          ? highlightLabel(node.label, searchQuery)
                          : node.label}
                    </span>
                    {renderBadge && (
                      <span className="rtree-badge">{renderBadge(node)}</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  },
);
