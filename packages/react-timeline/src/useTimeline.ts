import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type RefObject,
} from "react";

export type TimelineOrientation = "vertical" | "horizontal";
export type TimelineStatus =
  | "default"
  | "active"
  | "completed"
  | "error"
  | "warning";

export interface TimelineItem<TData = unknown> {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  /** Date / timestamp shown alongside the title. */
  date?: ReactNode;
  /** Right-side content in vertical layout (or above-rail in horizontal). */
  opposite?: ReactNode;
  /** Expandable detail body. When present, the item becomes toggleable. */
  details?: ReactNode;
  /** Inline icon rendered inside the dot. Falls back to a status icon. */
  icon?: ReactNode;
  status?: TimelineStatus;
  /** Group items with the same id under a shared header. */
  groupId?: string;
  /** Used by `spacing="time"` to position the item proportionally. */
  timestamp?: Date | number;
  /** Disable interaction; item renders muted and ignores click/keys. */
  disabled?: boolean;
  /** Replace the default dot with custom content. */
  dot?: ReactNode;
  /** Render as a section heading instead of a regular item (legacy). */
  isHeader?: boolean;
  /** Free-form payload exposed on render-prop callbacks. */
  data?: TData;
}

export interface TimelineGroup<TData = unknown> {
  id: string;
  label: ReactNode;
  items: TimelineItem<TData>[];
}

export type TimelineFilter<TData> =
  | string
  | ((item: TimelineItem<TData>) => boolean);

export interface UseTimelineOptions<TData = unknown> {
  items: TimelineItem<TData>[];
  orientation?: TimelineOrientation;
  /** Pre-expanded item ids (uncontrolled). */
  defaultExpanded?: string[];
  /** Controlled expanded ids. Must pair with `onExpandedChange`. */
  expanded?: string[];
  onExpandedChange?: (ids: string[]) => void;
  /** "single" allows one open at a time. Default: "multiple". */
  expansionMode?: "single" | "multiple";
  /** Filter by string (matches title/description/date) or predicate. */
  filter?: TimelineFilter<TData>;
  /**
   * Group consecutive items. `"groupId"` reads `item.groupId`.
   * Pass a function for custom grouping (e.g. by date bucket).
   */
  groupBy?: "groupId" | ((item: TimelineItem<TData>) => string);
  /** Map of group id → label. Falls back to the group id. */
  groupLabels?: Record<string, ReactNode>;
  /** Render newest first. */
  reverse?: boolean;
  /** When set, the matching item renders as a pending tail (spinner + dashed connector). */
  pendingId?: string;
  /** Mark a single item as `aria-current="step"`. */
  activeId?: string;
  /** Fired when the IntersectionObserver sentinel reaches the viewport bottom. */
  onLoadMore?: () => void;
}

export interface TimelineRootProps {
  ref: RefObject<HTMLOListElement>;
  role: "list";
  "aria-orientation": TimelineOrientation;
  onKeyDown: (e: ReactKeyboardEvent<HTMLOListElement>) => void;
  "data-orientation": TimelineOrientation;
}

export interface TimelineItemPropsResult {
  ref: (node: HTMLLIElement | null) => void;
  id: string;
  role: "listitem";
  tabIndex: number;
  "aria-current": "step" | undefined;
  "aria-disabled": true | undefined;
  "aria-expanded": boolean | undefined;
  onFocus: () => void;
  onClick?: (e: ReactMouseEvent<HTMLLIElement>) => void;
  onKeyDown?: (e: ReactKeyboardEvent<HTMLLIElement>) => void;
  "data-index": number;
  "data-first": boolean;
  "data-last": boolean;
  "data-status": TimelineStatus;
  "data-disabled": true | undefined;
  "data-pending": true | undefined;
  "data-expanded": true | undefined;
  "data-expandable": true | undefined;
  style?: CSSProperties;
}

export interface TimelineToggleProps {
  type: "button";
  "aria-expanded": boolean;
  "aria-controls": string;
  onClick: (e: ReactMouseEvent<HTMLButtonElement>) => void;
  disabled: boolean;
}

export interface TimelineDotProps {
  "data-status": TimelineStatus;
  "data-pending": true | undefined;
  "aria-hidden": true;
}

export interface UseTimelineResult<TData = unknown> {
  /** Items after filter / reverse. */
  visibleItems: TimelineItem<TData>[];
  /** When `groupBy` is set, items grouped under headers; otherwise a single group. */
  groups: TimelineGroup<TData>[];
  /** Currently expanded ids. */
  expandedIds: string[];
  /** Currently focused id (driven by keyboard nav). */
  focusedId: string | null;
  /** The item rendered as the pending tail, if any. */
  pendingItem: TimelineItem<TData> | null;
  isExpanded: (id: string) => boolean;
  expand: (id: string) => void;
  collapse: (id: string) => void;
  toggle: (id: string) => void;
  /** Programmatically focus an item by id. */
  focusItem: (id: string) => void;
  /** Scroll an item into view. */
  scrollToId: (id: string, options?: ScrollIntoViewOptions) => void;
  /**
   * Per-item style for `spacing="time"`. Returns an empty object when
   * timestamps are absent or layout is uniform — safe to spread always.
   */
  getTimeOffset: (id: string) => CSSProperties;
  getRootProps: () => TimelineRootProps;
  getItemProps: (id: string) => TimelineItemPropsResult;
  getToggleProps: (id: string) => TimelineToggleProps;
  getDotProps: (id: string) => TimelineDotProps;
  /** Attach to a sentinel element after the list to trigger `onLoadMore`. */
  loadMoreSentinelRef: RefObject<HTMLElement>;
  orientation: TimelineOrientation;
}

function defaultMatch(item: TimelineItem, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const hay = [item.title, item.description, item.date]
    .map((v) => (typeof v === "string" ? v : v != null ? String(v) : ""))
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}

function applyFilter<TData>(
  items: TimelineItem<TData>[],
  filter: TimelineFilter<TData> | undefined,
): TimelineItem<TData>[] {
  if (filter == null) return items;
  if (typeof filter === "function") return items.filter(filter);
  if (typeof filter === "string") {
    if (!filter.trim()) return items;
    return items.filter((item) => defaultMatch(item, filter));
  }
  return items;
}

function buildGroups<TData>(
  items: TimelineItem<TData>[],
  groupBy: UseTimelineOptions<TData>["groupBy"],
  labels: Record<string, ReactNode> | undefined,
): TimelineGroup<TData>[] {
  if (!groupBy) {
    return [{ id: "__all__", label: "", items }];
  }
  const fn =
    typeof groupBy === "function"
      ? groupBy
      : (item: TimelineItem<TData>) => item.groupId ?? "__ungrouped__";
  const out: TimelineGroup<TData>[] = [];
  let current: TimelineGroup<TData> | null = null;
  for (const item of items) {
    const key = fn(item);
    if (!current || current.id !== key) {
      current = {
        id: key,
        label: labels?.[key] ?? key,
        items: [],
      };
      out.push(current);
    }
    current.items.push(item);
  }
  return out;
}

function computeTimeOffsets<TData>(items: TimelineItem<TData>[]): Record<string, number> {
  const stamps = items
    .map((it) => {
      if (it.timestamp == null) return null;
      const ms = it.timestamp instanceof Date ? it.timestamp.getTime() : it.timestamp;
      return Number.isFinite(ms) ? ms : null;
    });
  const valid = stamps.filter((v): v is number => v !== null);
  if (valid.length < 2) return {};
  const min = Math.min(...valid);
  const max = Math.max(...valid);
  const span = max - min;
  if (span === 0) return {};
  const out: Record<string, number> = {};
  for (let i = 0; i < items.length; i++) {
    const ts = stamps[i];
    const item = items[i];
    if (ts == null || !item) continue;
    out[item.id] = (ts - min) / span; // 0..1
  }
  return out;
}

export function useTimeline<TData = unknown>({
  items,
  orientation = "vertical",
  defaultExpanded,
  expanded,
  onExpandedChange,
  expansionMode = "multiple",
  filter,
  groupBy,
  groupLabels,
  reverse = false,
  pendingId,
  activeId,
  onLoadMore,
}: UseTimelineOptions<TData>): UseTimelineResult<TData> {
  const isControlled = expanded !== undefined;
  const [internalExpanded, setInternalExpanded] = useState<string[]>(
    defaultExpanded ?? [],
  );
  const expandedIds = isControlled ? expanded! : internalExpanded;

  const setExpanded = useCallback(
    (next: string[]) => {
      if (!isControlled) setInternalExpanded(next);
      onExpandedChange?.(next);
    },
    [isControlled, onExpandedChange],
  );

  const isExpanded = useCallback(
    (id: string) => expandedIds.includes(id),
    [expandedIds],
  );

  const expand = useCallback(
    (id: string) => {
      if (expandedIds.includes(id)) return;
      const next =
        expansionMode === "single" ? [id] : [...expandedIds, id];
      setExpanded(next);
    },
    [expandedIds, expansionMode, setExpanded],
  );

  const collapse = useCallback(
    (id: string) => {
      if (!expandedIds.includes(id)) return;
      setExpanded(expandedIds.filter((x) => x !== id));
    },
    [expandedIds, setExpanded],
  );

  const toggle = useCallback(
    (id: string) => {
      if (expandedIds.includes(id)) collapse(id);
      else expand(id);
    },
    [expandedIds, expand, collapse],
  );

  const visibleItems = useMemo(() => {
    let out = applyFilter(items, filter);
    if (reverse) out = [...out].reverse();
    return out;
  }, [items, filter, reverse]);

  const groups = useMemo(
    () => buildGroups(visibleItems, groupBy, groupLabels),
    [visibleItems, groupBy, groupLabels],
  );

  const pendingItem = useMemo(() => {
    if (!pendingId) return null;
    return visibleItems.find((it) => it.id === pendingId) ?? null;
  }, [pendingId, visibleItems]);

  const timeOffsets = useMemo(
    () => computeTimeOffsets(visibleItems),
    [visibleItems],
  );

  const getTimeOffset = useCallback(
    (id: string): CSSProperties => {
      const v = timeOffsets[id];
      if (v == null) return {};
      return { ["--rtl-time-offset" as string]: v.toString() };
    },
    [timeOffsets],
  );

  // ---- Refs + keyboard nav ------------------------------------------------
  const rootRef = useRef<HTMLOListElement>(null);
  const itemRefs = useRef<Map<string, HTMLLIElement>>(new Map());
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const registerItem = useCallback((id: string, node: HTMLLIElement | null) => {
    if (node) itemRefs.current.set(id, node);
    else itemRefs.current.delete(id);
  }, []);

  const focusItem = useCallback((id: string) => {
    const node = itemRefs.current.get(id);
    if (node) {
      node.focus();
      setFocusedId(id);
    }
  }, []);

  const scrollToId = useCallback(
    (id: string, options: ScrollIntoViewOptions = { behavior: "smooth", block: "center" }) => {
      const node = itemRefs.current.get(id);
      if (node) node.scrollIntoView(options);
    },
    [],
  );

  const handleRootKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLOListElement>) => {
      const order = visibleItems.map((it) => it.id);
      if (order.length === 0) return;
      const first = order[0];
      const last = order[order.length - 1];
      if (!first || !last) return;
      const currentId = focusedId ?? first;
      const idx = order.indexOf(currentId);
      const nextKey = orientation === "horizontal" ? "ArrowRight" : "ArrowDown";
      const prevKey = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp";

      if (e.key === nextKey) {
        e.preventDefault();
        const target = order[Math.min(order.length - 1, idx + 1)];
        if (target) focusItem(target);
      } else if (e.key === prevKey) {
        e.preventDefault();
        const target = order[Math.max(0, idx - 1)];
        if (target) focusItem(target);
      } else if (e.key === "Home") {
        e.preventDefault();
        focusItem(first);
      } else if (e.key === "End") {
        e.preventDefault();
        focusItem(last);
      }
    },
    [visibleItems, focusedId, orientation, focusItem],
  );

  // ---- IntersectionObserver for onLoadMore --------------------------------
  const sentinelRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!onLoadMore || typeof IntersectionObserver === "undefined") return;
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) onLoadMore();
        }
      },
      { rootMargin: "0px 0px 200px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [onLoadMore]);

  // ---- Prop getters -------------------------------------------------------
  const getRootProps = useCallback((): TimelineRootProps => ({
    ref: rootRef,
    role: "list",
    "aria-orientation": orientation,
    "data-orientation": orientation,
    onKeyDown: handleRootKeyDown,
  }), [orientation, handleRootKeyDown]);

  const getItemProps = useCallback(
    (id: string): TimelineItemPropsResult => {
      const idx = visibleItems.findIndex((it) => it.id === id);
      const item = visibleItems[idx];
      const isFirst = idx === 0;
      const isLast = idx === visibleItems.length - 1;
      const status: TimelineStatus = item?.status ?? "default";
      const disabled = Boolean(item?.disabled);
      const pending = pendingItem?.id === id;
      const expandable = item?.details != null && !disabled;
      const expanded = isExpanded(id);
      const isActiveStep = activeId === id || status === "active";

      return {
        ref: (node) => registerItem(id, node),
        id: `rtl-item-${id}`,
        role: "listitem",
        tabIndex: disabled ? -1 : focusedId === id ? 0 : -1,
        "aria-current": isActiveStep ? "step" : undefined,
        "aria-disabled": disabled || undefined,
        "aria-expanded": expandable ? expanded : undefined,
        onFocus: () => setFocusedId(id),
        onClick: expandable
          ? () => toggle(id)
          : undefined,
        onKeyDown: expandable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggle(id);
              }
            }
          : undefined,
        "data-index": idx,
        "data-first": isFirst,
        "data-last": isLast,
        "data-status": status,
        "data-disabled": disabled || undefined,
        "data-pending": pending || undefined,
        "data-expanded": expanded || undefined,
        "data-expandable": expandable || undefined,
        style: getTimeOffset(id),
      };
    },
    [
      visibleItems,
      pendingItem,
      activeId,
      focusedId,
      isExpanded,
      registerItem,
      toggle,
      getTimeOffset,
    ],
  );

  const getToggleProps = useCallback(
    (id: string): TimelineToggleProps => {
      const item = visibleItems.find((it) => it.id === id);
      const expandable = item?.details != null && !item?.disabled;
      const expanded = isExpanded(id);
      return {
        type: "button",
        "aria-expanded": expanded,
        "aria-controls": `rtl-details-${id}`,
        onClick: (e) => {
          e.stopPropagation();
          toggle(id);
        },
        disabled: !expandable,
      };
    },
    [visibleItems, isExpanded, toggle],
  );

  const getDotProps = useCallback(
    (id: string): TimelineDotProps => {
      const item = visibleItems.find((it) => it.id === id);
      const status: TimelineStatus = item?.status ?? "default";
      const pending = pendingItem?.id === id;
      return {
        "data-status": status,
        "data-pending": pending || undefined,
        "aria-hidden": true,
      };
    },
    [visibleItems, pendingItem],
  );

  return {
    visibleItems,
    groups,
    expandedIds,
    focusedId,
    pendingItem,
    isExpanded,
    expand,
    collapse,
    toggle,
    focusItem,
    scrollToId,
    getTimeOffset,
    getRootProps,
    getItemProps,
    getToggleProps,
    getDotProps,
    loadMoreSentinelRef: sentinelRef,
    orientation,
  };
}
