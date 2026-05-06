import { forwardRef, type ReactNode } from "react";
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

export const TreeStyled = forwardRef<HTMLDivElement, TreeStyledProps>(
  function TreeStyled(props, _ref) {
    const { size = "md", tone = "primary", renderLabel, showGuides = true, className, ...hookOpts } = props;
    void _ref;
    const tree = useTree(hookOpts);

    return (
      <div
        className={["rtree-root", className].filter(Boolean).join(" ")}
        data-size={size}
        data-tone={tone}
        data-guides={showGuides || undefined}
      >
        <ul {...(tree.getRootProps() as unknown as React.HTMLAttributes<HTMLUListElement>)} className="rtree-list">
          {tree.visibleNodes.map(({ node, depth, hasChildren, isLoading }) => {
            const nodeProps = tree.getNodeProps(node, depth);
            const toggleProps = tree.getToggleProps(node);
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
                  {node.icon && <span className="rtree-icon" aria-hidden="true">{node.icon}</span>}
                  <span className="rtree-label">
                    {renderLabel ? renderLabel(node, depth) : node.label}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  },
);
