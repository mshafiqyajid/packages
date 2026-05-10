import { forwardRef, type ReactNode, type CSSProperties } from "react";
import { useSplit, type SplitOrientation } from "../useSplit";

export interface SplitStyledProps {
  orientation?: SplitOrientation;
  defaultSizes?: number[];
  sizes?: number[];
  onResize?: (sizes: number[]) => void;
  onResizeEnd?: (sizes: number[]) => void;
  minSize?: number | number[];
  maxSize?: number | number[];
  resizerSize?: number;
  disabled?: boolean;
  collapsible?: boolean | boolean[];
  collapsed?: boolean[];
  defaultCollapsed?: boolean[];
  onCollapseChange?: (collapsed: boolean[]) => void;
  snapPoints?: number[];
  persistent?: string;
  children: ReactNode[];
  className?: string;
  style?: CSSProperties;
}

function resolveCollapsibleForPane(
  collapsible: boolean | boolean[] | undefined,
  index: number,
): boolean {
  if (collapsible === undefined) return false;
  if (typeof collapsible === "boolean") return collapsible;
  return collapsible[index] ?? false;
}

function CollapseButton({
  orientation,
  collapsedA,
  collapsedB,
  onCollapseA,
  onCollapseB,
}: {
  orientation: SplitOrientation;
  collapsedA: boolean;
  collapsedB: boolean;
  onCollapseA: () => void;
  onCollapseB: () => void;
}) {
  const isHorizontal = orientation === "horizontal";

  let chevronDir: "left" | "right" | "up" | "down";
  let onClick: () => void;
  let label: string;

  if (collapsedA) {
    chevronDir = isHorizontal ? "right" : "down";
    onClick = onCollapseA;
    label = "Expand pane";
  } else if (collapsedB) {
    chevronDir = isHorizontal ? "left" : "up";
    onClick = onCollapseB;
    label = "Expand pane";
  } else {
    chevronDir = isHorizontal ? "left" : "up";
    onClick = onCollapseA;
    label = "Collapse pane";
  }

  const rotate: Record<string, string> = {
    right: "rotate(0deg)",
    left: "rotate(180deg)",
    down: "rotate(90deg)",
    up: "rotate(270deg)",
  };

  return (
    <button
      type="button"
      className="rspl-collapse-btn"
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={{ transform: `translate(-50%, -50%) ${rotate[chevronDir]}` }}
    >
      <svg
        width="10"
        height="10"
        viewBox="0 0 10 10"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M6.5 2L3.5 5L6.5 8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export const SplitStyled = forwardRef<HTMLDivElement, SplitStyledProps>(
  function SplitStyled(
    {
      orientation = "horizontal",
      defaultSizes,
      sizes,
      onResize,
      onResizeEnd,
      minSize = 10,
      maxSize = 90,
      resizerSize = 6,
      disabled = false,
      collapsible,
      collapsed: collapsedProp,
      defaultCollapsed,
      onCollapseChange,
      snapPoints,
      persistent,
      children,
      className,
      style: styleProp,
    },
    ref,
  ) {
    const childArray = Array.isArray(children) ? children : [children];
    const paneCount = childArray.length;

    const {
      containerProps,
      getPaneProps,
      getResizerProps,
      isDragging,
      collapsed,
      collapse,
    } = useSplit({
      orientation,
      defaultSizes,
      sizes,
      onResize,
      onResizeEnd,
      minSize,
      maxSize,
      resizerSize,
      disabled,
      collapsible,
      collapsed: collapsedProp,
      defaultCollapsed,
      onCollapseChange,
      snapPoints,
      persistent,
    });

    return (
      <div
        ref={ref}
        {...containerProps}
        className={["rspl-root", className].filter(Boolean).join(" ")}
        style={{ ...containerProps.style, ...styleProp }}
        data-orientation={orientation}
        data-dragging={isDragging ? "true" : undefined}
        data-disabled={disabled || undefined}
        {...Object.fromEntries(
          collapsed.map((c, i) => [`data-collapsed-${i}`, c ? "true" : undefined]).filter(([, v]) => v !== undefined)
        )}
      >
        {childArray.flatMap((child, i) => {
          const paneProps = getPaneProps(i);
          const canCollapseA = resolveCollapsibleForPane(collapsible, i);
          const canCollapseB = i + 1 < paneCount ? resolveCollapsibleForPane(collapsible, i + 1) : false;
          const showCollapseBtn = i < paneCount - 1 && (canCollapseA || canCollapseB);

          const pane = (
            <div
              key={`pane-${i}`}
              {...paneProps}
              className="rspl-pane"
              data-pane-index={i}
              data-collapsed={collapsed[i] ? "true" : undefined}
              style={{
                ...paneProps.style,
                transition: isDragging ? "none" : undefined,
              }}
            >
              {child}
            </div>
          );

          if (i < paneCount - 1) {
            const resizer = (
              <div
                key={`resizer-${i}`}
                {...getResizerProps(i)}
                className="rspl-resizer"
                data-orientation={orientation}
              >
                {showCollapseBtn && (
                  <CollapseButton
                    orientation={orientation}
                    collapsedA={collapsed[i] ?? false}
                    collapsedB={collapsed[i + 1] ?? false}
                    onCollapseA={() => collapse(i)}
                    onCollapseB={() => collapse(i + 1)}
                  />
                )}
              </div>
            );
            return [pane, resizer];
          }

          return [pane];
        })}
      </div>
    );
  },
);
