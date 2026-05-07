import {
  forwardRef,
  useEffect,
  useRef,
  useImperativeHandle,
  type ReactNode,
  type CSSProperties,
} from "react";
import {
  type TimelineItem,
  type TimelineOrientation,
  type TimelineStatus,
  type TimelineFilter,
  type UseTimelineResult,
  useTimeline,
} from "../useTimeline";

// Re-export item type so styled consumers don't need a deeper import.
export type {
  TimelineItem,
  TimelineOrientation,
  TimelineStatus,
} from "../useTimeline";

export type TimelineSize = "sm" | "md" | "lg";
export type TimelineTone = "neutral" | "primary" | "success" | "danger";
export type TimelineConnector = "line" | "dashed" | "none";
export type TimelineAlign = "left" | "right" | "center" | "alternate";
export type TimelineDensity = "compact" | "comfortable" | "spacious";
export type TimelineDotVariant = "outline" | "solid" | "ring";
export type TimelineSpacing = "uniform" | "time";

export interface TimelineStatusIcons {
  /** Override the built-in ✓ for items with status="completed". */
  completed?: ReactNode;
  /** Override the built-in ✕ for items with status="error". */
  error?: ReactNode;
  /** Override the built-in ⚠ for items with status="warning". */
  warning?: ReactNode;
  /** Render an icon inside the dot for items with status="active" (suppresses the pulse ring). */
  active?: ReactNode;
  /** Render an icon for items with status="default" — handy for stepper-style timelines (e.g. step number). */
  default?: ReactNode;
}

export interface TimelineRenderItemContext<TData = unknown> {
  item: TimelineItem<TData>;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  isActive: boolean;
  isDisabled: boolean;
  isExpanded: boolean;
  status: TimelineStatus;
  toggle: () => void;
}

export interface TimelineHandle {
  scrollToId: (id: string, options?: ScrollIntoViewOptions) => void;
  focusItem: (id: string) => void;
  expand: (id: string) => void;
  collapse: (id: string) => void;
  toggle: (id: string) => void;
}

export interface TimelineStyledProps<TData = unknown> {
  items: TimelineItem<TData>[];
  orientation?: TimelineOrientation;
  size?: TimelineSize;
  tone?: TimelineTone;
  connector?: TimelineConnector;
  /** Vertical only — `"alternate"` zigzags content side by side. */
  align?: TimelineAlign;
  density?: TimelineDensity;
  dotVariant?: TimelineDotVariant;
  /** Mark a single item as `aria-current="step"`. */
  activeId?: string;
  /** Render this item as a pending tail with spinner + dashed connector. */
  pendingId?: string;
  /** Override the built-in status icons (✓ / ✕ / ⚠) globally for this timeline. Per-item `item.icon` still wins. */
  statusIcons?: TimelineStatusIcons;
  /** Replace the spinner used for the `pendingId` item. */
  pendingIcon?: ReactNode;
  /** Reverse render order (newest first). */
  reverse?: boolean;
  /** Filter by string match (title/description/date) or predicate. */
  filter?: TimelineFilter<TData>;
  /** Group consecutive items. `"groupId"` reads `item.groupId`. */
  groupBy?: "groupId" | ((item: TimelineItem<TData>) => string);
  groupLabels?: Record<string, ReactNode>;
  /** Layout: equal gaps (`"uniform"`, default) or proportional to `item.timestamp` (`"time"`). */
  spacing?: TimelineSpacing;
  /** Pre-expanded ids (uncontrolled). */
  defaultExpanded?: string[];
  /** Controlled expanded ids. Pair with `onExpandedChange`. */
  expanded?: string[];
  onExpandedChange?: (ids: string[]) => void;
  /** "single" allows one open at a time. Default: "multiple". */
  expansionMode?: "single" | "multiple";
  /** Animate items in on mount (CSS-driven, respects prefers-reduced-motion). */
  animate?: boolean;
  /**
   * Fill the connector line proportionally. 0–100. Uses `::after` on `.rtl-connector`
   * elements and animates on change. CSS var `--rtl-progress-color` overrides the fill color.
   */
  progress?: number;
  /**
   * When true, each item starts invisible and fades/slides in via IntersectionObserver
   * as it enters the viewport. Items stagger by index × 80 ms.
   * Graceful fallback: if IntersectionObserver is unavailable, all items show immediately.
   * Respects `prefers-reduced-motion`.
   */
  animateOnMount?: boolean;
  /** Click handler for non-disabled items (fires alongside expand toggle). */
  onItemClick?: (item: TimelineItem<TData>) => void;
  /** Called when the sentinel after the last item enters the viewport. */
  onLoadMore?: () => void;
  /** Render-prop body override. */
  renderItem?: (ctx: TimelineRenderItemContext<TData>) => ReactNode;
  className?: string;
}

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1.5 5l2.5 2.5 4.5-5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M1 1l6 6M7 1L1 7" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 2v2.5M4 6v.25" />
    </svg>
  );
}

function PendingSpinner() {
  return (
    <svg className="rtl-spinner" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.18" strokeWidth="2.5" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 4.5l3 3 3-3" />
    </svg>
  );
}

function statusIcon(status: TimelineStatus, override?: TimelineStatusIcons): ReactNode {
  // Per-status override (consumer wins).
  if (override && override[status] !== undefined) return override[status];
  // Built-in defaults.
  if (status === "completed") return <CheckIcon />;
  if (status === "error") return <CloseIcon />;
  if (status === "warning") return <WarningIcon />;
  return null;
}

function TimelineStyledImpl<TData>(
  props: TimelineStyledProps<TData>,
  ref: React.Ref<TimelineHandle>,
) {
  const {
    items,
    orientation = "vertical",
    size = "md",
    tone = "neutral",
    connector = "line",
    align = "left",
    density = "comfortable",
    dotVariant = "outline",
    activeId,
    pendingId,
    statusIcons,
    pendingIcon,
    reverse,
    filter,
    groupBy,
    groupLabels,
    spacing = "uniform",
    defaultExpanded,
    expanded,
    onExpandedChange,
    expansionMode = "multiple",
    animate = false,
    progress,
    animateOnMount = false,
    onItemClick,
    onLoadMore,
    renderItem,
    className,
  } = props;

  const tl: UseTimelineResult<TData> = useTimeline<TData>({
    items,
    orientation,
    activeId,
    pendingId,
    reverse,
    filter,
    groupBy,
    groupLabels,
    defaultExpanded,
    expanded,
    onExpandedChange,
    expansionMode,
    onLoadMore,
  });

  useImperativeHandle(
    ref,
    () => ({
      scrollToId: tl.scrollToId,
      focusItem: tl.focusItem,
      expand: tl.expand,
      collapse: tl.collapse,
      toggle: tl.toggle,
    }),
    [tl],
  );

  const animatedItemsRef = useRef<Map<string, HTMLLIElement>>(new Map());

  useEffect(() => {
    if (!animateOnMount) return;
    if (typeof IntersectionObserver === "undefined") {
      animatedItemsRef.current.forEach((node) => {
        node.setAttribute("data-aom-visible", "true");
      });
      return;
    }
    const prefersReduced =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      animatedItemsRef.current.forEach((node) => {
        node.setAttribute("data-aom-visible", "true");
      });
      return;
    }

    const nodes = Array.from(animatedItemsRef.current.entries());
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).setAttribute("data-aom-visible", "true");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.1 },
    );
    nodes.forEach(([, node]) => observer.observe(node));
    return () => observer.disconnect();
  }, [animateOnMount]);

  const rootProps = tl.getRootProps();

  const renderItemBody = (item: TimelineItem<TData>, idx: number) => {
    const status: TimelineStatus = item.status ?? "default";
    const isFirst = idx === 0;
    const isLast = idx === tl.visibleItems.length - 1;
    const isActive = activeId === item.id || status === "active";
    const isDisabled = Boolean(item.disabled);
    const isPending = pendingId === item.id;
    const expandable = item.details != null && !isDisabled;
    const expanded = tl.isExpanded(item.id);
    const itemPropsResult = tl.getItemProps(item.id);
    const dotProps = tl.getDotProps(item.id);
    const togglePropsResult = expandable ? tl.getToggleProps(item.id) : null;

    const handleClick = (e: React.MouseEvent<HTMLLIElement>) => {
      if (isDisabled) return;
      onItemClick?.(item);
      itemPropsResult.onClick?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLLIElement>) => {
      if (isDisabled) return;
      itemPropsResult.onKeyDown?.(e);
    };

    if (item.isHeader) {
      return (
        <li
          key={item.id}
          className="rtl-group-header"
          role="separator"
          data-first={isFirst || undefined}
          data-last={isLast || undefined}
        >
          {item.title}
        </li>
      );
    }

    const liStyle: CSSProperties = {
      ...itemPropsResult.style,
      ["--rtl-stagger-index" as string]: idx.toString(),
      ...(animateOnMount && { ["--rtl-aom-delay" as string]: `${idx * 80}ms` }),
    };

    const aomRef = animateOnMount
      ? (node: HTMLLIElement | null) => {
          if (node) animatedItemsRef.current.set(item.id, node);
          else animatedItemsRef.current.delete(item.id);
        }
      : undefined;

    if (renderItem) {
      return (
        <li
          {...itemPropsResult}
          ref={(node) => {
            (itemPropsResult.ref as (n: HTMLLIElement | null) => void)(node);
            aomRef?.(node);
          }}
          key={item.id}
          className="rtl-item"
          data-aom={animateOnMount || undefined}
          onClick={onItemClick ? handleClick : itemPropsResult.onClick}
          onKeyDown={handleKeyDown}
          style={liStyle}
        >
          {renderItem({
            item,
            index: idx,
            isFirst,
            isLast,
            isActive,
            isDisabled,
            isExpanded: expanded,
            status,
            toggle: () => tl.toggle(item.id),
          })}
        </li>
      );
    }

    const defaultIcon = statusIcon(status, statusIcons);
    const pendingNode = pendingIcon ?? <PendingSpinner />;

    return (
      <li
        {...itemPropsResult}
        ref={(node) => {
          (itemPropsResult.ref as (n: HTMLLIElement | null) => void)(node);
          aomRef?.(node);
        }}
        key={item.id}
        className="rtl-item"
        data-aom={animateOnMount || undefined}
        onClick={onItemClick ? handleClick : itemPropsResult.onClick}
        onKeyDown={handleKeyDown}
        style={liStyle}
      >
        {item.opposite != null && (
          <div className="rtl-opposite">{item.opposite}</div>
        )}

        <div className="rtl-rail">
          <div className="rtl-dot" {...dotProps}>
            {item.dot != null ? (
              item.dot
            ) : isPending ? (
              pendingNode
            ) : (
              <>
                {/* Suppress the pulse ring when consumer supplies a custom active icon. */}
                {isActive && statusIcons?.active === undefined && (
                  <span className="rtl-dot-pulse" aria-hidden="true" />
                )}
                {(item.icon != null || defaultIcon != null) && (
                  <span className="rtl-icon">{item.icon ?? defaultIcon}</span>
                )}
              </>
            )}
          </div>
          {!isLast && (
            <div className="rtl-connector" aria-hidden="true" data-pending={isPending || undefined} />
          )}
        </div>

        <div className="rtl-body">
          <div className="rtl-header-row">
            <div className="rtl-title-block">
              {item.date != null && <time className="rtl-date">{item.date}</time>}
              <p className="rtl-title">{item.title}</p>
            </div>
            {expandable && togglePropsResult && (
              <button
                {...togglePropsResult}
                className="rtl-toggle"
                aria-label={expanded ? "Collapse" : "Expand"}
              >
                <ChevronIcon />
              </button>
            )}
          </div>
          {item.description != null && <p className="rtl-description">{item.description}</p>}
          {expandable && (
            <div
              className="rtl-details-wrap"
              data-expanded={expanded || undefined}
            >
              <div
                id={`rtl-details-${item.id}`}
                className="rtl-details"
                role="region"
                aria-labelledby={`rtl-item-${item.id}`}
              >
                {item.details}
              </div>
            </div>
          )}
        </div>
      </li>
    );
  };

  // Build flat render order so global isFirst/isLast and stagger index work
  // even with grouping.
  const orderedItems = tl.visibleItems;
  const orderedById = new Map(orderedItems.map((it, i) => [it.id, i]));

  return (
    <ol
      ref={rootProps.ref}
      role={rootProps.role}
      aria-orientation={rootProps["aria-orientation"]}
      onKeyDown={rootProps.onKeyDown}
      data-orientation={rootProps["data-orientation"]}
      data-size={size}
      data-tone={tone}
      data-connector={connector}
      data-align={orientation === "vertical" ? align : undefined}
      data-density={density}
      data-dot-variant={dotVariant}
      data-spacing={spacing}
      data-animate={animate || undefined}
      className={["rtl-timeline", className].filter(Boolean).join(" ")}
      style={
        progress != null
          ? ({ ["--rtl-progress" as string]: `${Math.min(100, Math.max(0, progress))}%` } as CSSProperties)
          : undefined
      }
    >
      {tl.groups.map((group) => {
        const renderedItems = group.items.map((item) =>
          renderItemBody(item, orderedById.get(item.id) ?? 0),
        );

        if (groupBy && group.label) {
          return (
            <li key={`grp-${group.id}`} className="rtl-group">
              <div className="rtl-group-label" role="separator">
                {group.label}
              </div>
              <ol className="rtl-group-list">{renderedItems}</ol>
            </li>
          );
        }
        return renderedItems;
      })}
      {onLoadMore && (
        <li
          ref={tl.loadMoreSentinelRef as React.Ref<HTMLLIElement>}
          className="rtl-sentinel"
          aria-hidden="true"
        />
      )}
    </ol>
  );
}

export const TimelineStyled = forwardRef(TimelineStyledImpl) as <TData = unknown>(
  props: TimelineStyledProps<TData> & { ref?: React.Ref<TimelineHandle> },
) => ReturnType<typeof TimelineStyledImpl>;
