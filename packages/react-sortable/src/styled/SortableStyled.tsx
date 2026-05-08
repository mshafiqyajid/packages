import {
  forwardRef,
  useCallback,
  type ReactNode,
  type CSSProperties,
} from "react";
import type React from "react";
import { useSortable } from "../useSortable";
import type { SortableItem, ItemState } from "../useSortable";

export interface SortableStyledProps<T extends SortableItem = SortableItem> {
  items: T[];
  onReorder: (items: T[]) => void;
  orientation?: "vertical" | "horizontal";
  handle?: boolean;
  disabled?: boolean;
  animationDuration?: number;
  renderItem: (item: T, state: ItemState) => ReactNode;
  className?: string;
  style?: CSSProperties;
}

const GripIcon = () => (
  <svg
    className="rsort-handle-icon"
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="currentColor"
    aria-hidden="true"
  >
    <circle cx="4.5" cy="2.5" r="1.25" />
    <circle cx="9.5" cy="2.5" r="1.25" />
    <circle cx="4.5" cy="7" r="1.25" />
    <circle cx="9.5" cy="7" r="1.25" />
    <circle cx="4.5" cy="11.5" r="1.25" />
    <circle cx="9.5" cy="11.5" r="1.25" />
  </svg>
);

function SortableStyledInner<T extends SortableItem = SortableItem>(
  {
    items,
    onReorder,
    orientation = "vertical",
    handle = true,
    disabled = false,
    animationDuration = 200,
    renderItem,
    className,
    style,
  }: SortableStyledProps<T>,
  forwardedRef: React.Ref<HTMLDivElement>,
) {
  const {
    containerProps,
    getItemProps,
    getItemState,
    liveRegionText,
  } = useSortable({
    items,
    onReorder,
    orientation,
    disabled,
    animationDuration,
  });

  const { ref: hookRef, ...restContainerProps } = containerProps;

  const mergedRef = useCallback(
    (el: HTMLDivElement | null) => {
      hookRef(el);
      if (typeof forwardedRef === "function") {
        forwardedRef(el);
      } else if (forwardedRef) {
        (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current =
          el;
      }
    },
    [hookRef, forwardedRef],
  );

  const cssVarStyle: CSSProperties = {
    "--rsort-duration": `${animationDuration}ms`,
    ...style,
  } as CSSProperties;

  return (
    <div
      ref={mergedRef}
      {...restContainerProps}
      className={[
        "rsort-container",
        `rsort-container--${orientation}`,
        disabled ? "rsort-container--disabled" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={cssVarStyle}
      data-orientation={orientation}
    >
      {items.map((item) => {
        const itemProps = getItemProps(item);
        const itemState = getItemState(item);
        const { handleProps, isDragging: itemIsDragging, isOver } = itemState;

        return (
          <div
            key={item.id}
            {...itemProps}
            className="rsort-item"
            data-active={itemIsDragging ? "true" : undefined}
            data-over={isOver ? "true" : undefined}
            data-disabled={disabled ? "true" : undefined}
          >
            {handle && !disabled && (
              <span
                className="rsort-handle"
                aria-hidden={handleProps["aria-hidden"]}
                tabIndex={handleProps.tabIndex}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  if (handleProps.onPointerDown) {
                    handleProps.onPointerDown(
                      e as unknown as React.PointerEvent<HTMLElement>,
                    );
                  }
                }}
              >
                <GripIcon />
              </span>
            )}
            <span className="rsort-item-content">
              {renderItem(item, itemState)}
            </span>
          </div>
        );
      })}
      <div
        role="status"
        aria-live="assertive"
        aria-atomic="true"
        className="rsort-live-region"
      >
        {liveRegionText}
      </div>
    </div>
  );
}

export const SortableStyled = forwardRef(SortableStyledInner) as <
  T extends SortableItem = SortableItem,
>(
  props: SortableStyledProps<T> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement | null;
