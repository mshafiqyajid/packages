import {
  type HTMLAttributes,
  type ReactNode,
  forwardRef,
} from "react";
import {
  type RatingItemState,
  type UseRatingOptions,
  useRating,
} from "./useRating";

export interface RatingRenderProps {
  items: RatingItemState[];
  value: number;
  hoverValue: number | null;
  displayValue: number;
  setValue: (value: number) => void;
  clear: () => void;
}

type RootProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "defaultValue" | "onChange" | "role"
>;

export interface RatingIconRenderProps {
  index: number;
  /** Fill amount 0..1 — render the icon visually filled to this fraction. */
  fill: number;
  isHovered: boolean;
}

export interface RatingProps extends UseRatingOptions, RootProps {
  /**
   * Override the per-star rendering. By default, a star SVG is rendered with
   * a CSS gradient mask honoring `--rrt-fill`.
   */
  renderIcon?: (props: RatingIconRenderProps) => ReactNode;
  /**
   * A single icon node used for both the empty and filled layers. The
   * component clones it, masks the filled copy, and stacks them. Useful when
   * you want hearts / thumbs / custom shapes without writing the layering.
   */
  icon?: ReactNode;
  /** Full render-prop escape hatch. Replaces the default rendering entirely. */
  children?: (props: RatingRenderProps) => ReactNode;
}

function DefaultStar() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 2.5l2.92 6.55 7.08.62-5.34 4.66 1.62 6.97L12 17.77l-6.28 3.53 1.62-6.97L2 9.67l7.08-.62L12 2.5z" />
    </svg>
  );
}

export const Rating = forwardRef<HTMLDivElement, RatingProps>(function Rating(
  {
    count,
    value,
    defaultValue,
    onChange,
    onHover,
    allowHalf,
    readOnly,
    disabled,
    clearable,
    renderIcon,
    icon,
    children,
    className,
    ...rest
  },
  ref,
) {
  const r = useRating({
    count,
    value,
    defaultValue,
    onChange,
    onHover,
    allowHalf,
    readOnly,
    disabled,
    clearable,
  });

  if (children) {
    return (
      <div
        ref={ref}
        className={className}
        {...r.rootProps}
        {...rest}
      >
        {children({
          items: r.items,
          value: r.value,
          hoverValue: r.hoverValue,
          displayValue: r.displayValue,
          setValue: r.setValue,
          clear: r.clear,
        })}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={["rrt-root", className].filter(Boolean).join(" ")}
      {...r.rootProps}
      {...rest}
    >
      {r.items.map((item) => {
        const content = renderIcon
          ? renderIcon({
              index: item.index,
              fill: item.fill,
              isHovered: item.isHovered,
            })
          : (icon ?? <DefaultStar />);
        return (
          <span
            key={item.index}
            {...item.itemProps}
            ref={item.itemProps.ref as React.Ref<HTMLSpanElement>}
            className="rrt-item"
            data-fill={
              item.fill === 1 ? "full" : item.fill === 0.5 ? "half" : "empty"
            }
            data-hovered={item.isHovered ? "true" : undefined}
            style={item.style}
          >
            <span className="rrt-icon-empty" aria-hidden="true">
              {content}
            </span>
            <span className="rrt-icon-fill" aria-hidden="true">
              {content}
            </span>
          </span>
        );
      })}
    </div>
  );
});
