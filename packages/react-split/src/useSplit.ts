import {
  useState,
  useCallback,
  useRef,
  useEffect,
  type CSSProperties,
  type KeyboardEvent,
} from "react";

export type SplitOrientation = "horizontal" | "vertical";

export interface UseSplitOptions {
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
}

export interface ContainerProps {
  "data-orientation": SplitOrientation;
  "data-dragging"?: "true";
  [key: string]: unknown;
  style: CSSProperties;
}

export interface PaneProps {
  style: CSSProperties;
  "data-pane-index": number;
  "data-collapsed"?: "true";
}

export interface ResizerProps {
  role: "separator";
  tabIndex: number;
  "aria-orientation": SplitOrientation;
  "aria-valuenow": number;
  "aria-valuemin": number;
  "aria-valuemax": number;
  "aria-label": string;
  "aria-disabled"?: boolean;
  "data-resizer": "true";
  title: string;
  style: CSSProperties;
  onKeyDown: (e: KeyboardEvent<HTMLElement>) => void;
  onPointerDown: (e: React.PointerEvent<HTMLElement>) => void;
  onDoubleClick: () => void;
}

export interface UseSplitResult {
  containerProps: ContainerProps;
  getPaneProps: (index: number) => PaneProps;
  getResizerProps: (index?: number) => ResizerProps;
  sizes: number[];
  isDragging: boolean;
  collapsed: boolean[];
  collapse: (index: number, value?: boolean) => void;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function resolvePerPane(
  val: number | number[] | undefined,
  defaultVal: number,
  index: number,
): number {
  if (val === undefined) return defaultVal;
  if (typeof val === "number") return val;
  return val[index] ?? defaultVal;
}

function applySnapPoints(value: number, snapPoints: number[] | undefined): number {
  if (!snapPoints || snapPoints.length === 0) return value;
  for (const point of snapPoints) {
    if (Math.abs(value - point) <= 3) {
      return point;
    }
  }
  return value;
}

const STORAGE_PREFIX = "rspl:";

function readStorage(key: string, paneCount: number): number[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      Array.isArray(parsed) &&
      parsed.length === paneCount &&
      parsed.every((n) => typeof n === "number") &&
      Math.abs(parsed.reduce((s: number, n: number) => s + n, 0) - 100) < 0.01
    ) {
      return parsed as number[];
    }
  } catch {
    // ignore parse errors
  }
  return null;
}

function writeStorage(key: string, sizes: number[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(sizes));
  } catch {
    // ignore storage errors (private browsing, quota exceeded, etc.)
  }
}

function equalSizes(n: number): number[] {
  const base = Math.floor(100 / n);
  const remainder = 100 - base * n;
  return Array.from({ length: n }, (_, i) => (i === 0 ? base + remainder : base));
}

function clampNSizes(
  sizes: number[],
  minSizes: number[],
  maxSizes: number[],
  dragIndex: number,
  delta: number,
): number[] {
  const next = [...sizes];
  const othersSum = next.reduce(
    (sum, s, i) => (i === dragIndex || i === dragIndex + 1 ? sum : sum + s),
    0,
  );

  const rawA = (next[dragIndex] ?? 0) + delta;
  const rawB = (next[dragIndex + 1] ?? 0) - delta;
  const minA = minSizes[dragIndex] ?? 0;
  const maxA = maxSizes[dragIndex] ?? 100;
  const minB = minSizes[dragIndex + 1] ?? 0;
  const maxB = maxSizes[dragIndex + 1] ?? 100;

  // rawB is used only to signal intent; actual B is derived from remaining space
  void rawB;
  const clampedA = clamp(rawA, minA, Math.min(maxA, 100 - othersSum - minB));
  const clampedB = clamp(100 - othersSum - clampedA, minB, maxB);
  const finalA = clamp(100 - othersSum - clampedB, minA, maxA);

  next[dragIndex] = finalA;
  next[dragIndex + 1] = clampedB;
  return next;
}

export function useSplit({
  orientation = "horizontal",
  defaultSizes,
  sizes: controlledSizes,
  onResize,
  onResizeEnd,
  minSize = 10,
  maxSize = 90,
  resizerSize = 6,
  disabled = false,
  collapsible,
  collapsed: controlledCollapsed,
  defaultCollapsed,
  onCollapseChange,
  snapPoints,
  persistent,
}: UseSplitOptions = {}): UseSplitResult {
  const isControlled = controlledSizes !== undefined;
  const isCollapsedControlled = controlledCollapsed !== undefined;

  // Determine pane count from available sources
  const paneCount = controlledSizes?.length ?? defaultSizes?.length ?? 2;

  const resolvedDefaultSizes = defaultSizes ?? equalSizes(paneCount);
  const resolvedDefaultCollapsed = defaultCollapsed ?? Array<boolean>(paneCount).fill(false);

  const storedSizes = persistent ? readStorage(persistent, paneCount) : null;

  const clampInitialSizes = (s: number[]): number[] => {
    return s.map((v, i) => clamp(v, resolvePerPane(minSize, 10, i), resolvePerPane(maxSize, 90, i)));
  };

  const initialSizes = storedSizes ? clampInitialSizes(storedSizes) : resolvedDefaultSizes;

  const [internalSizes, setInternalSizes] = useState<number[]>(initialSizes);
  const [isDragging, setIsDragging] = useState(false);
  const [internalCollapsed, setInternalCollapsed] = useState<boolean[]>(resolvedDefaultCollapsed);

  const currentSizes: number[] = isControlled ? controlledSizes : internalSizes;
  const collapsed: boolean[] = isCollapsedControlled ? controlledCollapsed : internalCollapsed;

  const containerRef = useRef<HTMLElement | null>(null);
  const dragCleanupRef = useRef<(() => void) | null>(null);
  const prevSizesRef = useRef<number[]>(currentSizes);

  useEffect(() => {
    return () => {
      dragCleanupRef.current?.();
    };
  }, []);

  const updateSizes = useCallback(
    (next: number[]) => {
      if (!isControlled) setInternalSizes(next);
      onResize?.(next);
    },
    [isControlled, onResize],
  );

  const getMinSize = useCallback(
    (index: number) => resolvePerPane(minSize, 10, index),
    [minSize],
  );

  const getMaxSize = useCallback(
    (index: number) => resolvePerPane(maxSize, 90, index),
    [maxSize],
  );

  // 2-pane clamping (with snap point support)
  const clampSizes2 = useCallback(
    (a: number): number[] => {
      const snapped = applySnapPoints(a, snapPoints);
      const minA = getMinSize(0);
      const maxA = getMaxSize(0);
      const minB = getMinSize(1);
      const maxB = getMaxSize(1);
      const clampedA = clamp(snapped, minA, Math.min(maxA, 100 - minB));
      const clampedB = 100 - clampedA;
      if (clampedB < minB) {
        const fixedB = minB;
        return [clamp(100 - fixedB, minA, maxA), fixedB];
      }
      if (clampedB > maxB) {
        const fixedB = maxB;
        return [clamp(100 - fixedB, minA, maxA), fixedB];
      }
      return [clampedA, clampedB];
    },
    [getMinSize, getMaxSize, snapPoints],
  );

  const clampNSizesForDrag = useCallback(
    (sizes: number[], dragIndex: number, delta: number): number[] => {
      const minSizes = sizes.map((_, i) => getMinSize(i));
      const maxSizes = sizes.map((_, i) => getMaxSize(i));
      return clampNSizes(sizes, minSizes, maxSizes, dragIndex, delta);
    },
    [getMinSize, getMaxSize],
  );

  const collapse = useCallback(
    (index: number, value?: boolean) => {
      const paneCanCollapse =
        collapsible === true ||
        (Array.isArray(collapsible) && collapsible[index] === true);
      if (!paneCanCollapse) return;

      const next = [...collapsed];
      next[index] = value !== undefined ? value : !next[index];

      if (!isCollapsedControlled) setInternalCollapsed(next);
      onCollapseChange?.(next);

      if (next[index]) {
        const currentSizesSnap = isControlled ? controlledSizes! : internalSizes;
        prevSizesRef.current = currentSizesSnap;

        const collapsedSize = currentSizesSnap[index] ?? 0;
        const otherTotal = currentSizesSnap.reduce((s, v, i) => (i === index ? s : s + v), 0);
        const distributed = currentSizesSnap.map((v, i) => {
          if (i === index) return 0;
          return otherTotal > 0 ? v + (collapsedSize * v) / otherTotal : 100 / (paneCount - 1);
        });

        if (!isControlled) setInternalSizes(distributed);
        onResize?.(distributed);
        onResizeEnd?.(distributed);
      } else {
        const restored = prevSizesRef.current;
        if (!isControlled) setInternalSizes(restored);
        onResize?.(restored);
        onResizeEnd?.(restored);
        if (persistent) writeStorage(persistent, restored);
      }
    },
    [
      collapsed,
      isCollapsedControlled,
      collapsible,
      onCollapseChange,
      isControlled,
      controlledSizes,
      internalSizes,
      onResize,
      onResizeEnd,
      persistent,
      paneCount,
    ],
  );

  const handleKeyDown = useCallback(
    (dragIndex: number) => (e: KeyboardEvent<HTMLElement>) => {
      if (disabled) return;

      const sizeA = currentSizes[dragIndex] ?? 0;
      let next = sizeA;
      const step = e.shiftKey ? 5 : 1;

      switch (e.key) {
        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault();
          next = sizeA - step;
          break;
        case "ArrowRight":
        case "ArrowDown":
          e.preventDefault();
          next = sizeA + step;
          break;
        case "Home":
          e.preventDefault();
          next = getMinSize(dragIndex);
          break;
        case "End":
          e.preventDefault();
          next = 100 - getMinSize(dragIndex + 1);
          break;
        default:
          return;
      }

      const delta = next - sizeA;
      let clamped: number[];
      if (paneCount === 2) {
        clamped = clampSizes2(next);
      } else {
        clamped = clampNSizesForDrag(currentSizes, dragIndex, delta);
      }

      updateSizes(clamped);
      onResizeEnd?.(clamped);
      if (persistent) writeStorage(persistent, clamped);
    },
    [disabled, currentSizes, clampSizes2, clampNSizesForDrag, updateSizes, onResizeEnd, getMinSize, persistent, paneCount],
  );

  const handlePointerDown = useCallback(
    (dragIndex: number) => (e: React.PointerEvent<HTMLElement>) => {
      if (disabled) return;
      e.currentTarget.setPointerCapture(e.pointerId);

      const container = e.currentTarget.parentElement;
      if (!container) return;
      containerRef.current = container;

      setIsDragging(true);

      const isHorizontal = orientation === "horizontal";
      const resizerCount = paneCount - 1;
      const totalResizerPx = resizerCount * resizerSize;

      // Snapshot sizes at drag start so N-pane calculations are stable during drag
      const sizesAtDragStart = [...currentSizes];

      const computeNewSizes = (pointerEvent: PointerEvent, sizes: number[]): number[] => {
        const el = containerRef.current;
        if (!el) return sizes;

        const rect = el.getBoundingClientRect();
        let pointerPos: number;
        let totalPx: number;

        if (isHorizontal) {
          totalPx = rect.width - totalResizerPx;
          pointerPos = pointerEvent.clientX - rect.left;
        } else {
          totalPx = rect.height - totalResizerPx;
          pointerPos = pointerEvent.clientY - rect.top;
        }

        if (totalPx <= 0) return sizes;

        // Pixel position where pane[dragIndex] starts
        const paneStartPx =
          sizesAtDragStart.slice(0, dragIndex).reduce((s, v) => s + (v / 100) * totalPx, 0) +
          dragIndex * resizerSize;

        const newPaneAPx = pointerPos - paneStartPx - resizerSize / 2;
        const newPercent = (newPaneAPx / totalPx) * 100;

        if (paneCount === 2) {
          return clampSizes2(newPercent);
        }

        const delta = newPercent - (sizes[dragIndex] ?? 0);
        return clampNSizesForDrag(sizes, dragIndex, delta);
      };

      const handleMove = (moveEvent: PointerEvent) => {
        const clamped = computeNewSizes(moveEvent, currentSizes);
        if (!isControlled) setInternalSizes(clamped);
        onResize?.(clamped);
      };

      const handleUp = (upEvent: PointerEvent) => {
        setIsDragging(false);

        const clamped = computeNewSizes(upEvent, currentSizes);
        if (!isControlled) setInternalSizes(clamped);
        onResizeEnd?.(clamped);
        if (persistent) writeStorage(persistent, clamped);

        window.removeEventListener("pointermove", handleMove);
        window.removeEventListener("pointerup", handleUp);
        dragCleanupRef.current = null;
      };

      window.addEventListener("pointermove", handleMove);
      window.addEventListener("pointerup", handleUp, { once: true });

      dragCleanupRef.current = () => {
        window.removeEventListener("pointermove", handleMove);
        window.removeEventListener("pointerup", handleUp);
      };
    },
    [disabled, orientation, resizerSize, clampSizes2, clampNSizesForDrag, isControlled, onResize, onResizeEnd, currentSizes, persistent, paneCount],
  );

  const handleDoubleClick = useCallback(
    (dragIndex: number) => () => {
      if (disabled) return;
      // dragIndex is intentionally unused — equalize all panes regardless of which resizer was double-clicked
      void dragIndex;
      const equal = equalSizes(paneCount);
      updateSizes(equal);
      onResizeEnd?.(equal);
      if (persistent) writeStorage(persistent, equal);
    },
    [disabled, paneCount, updateSizes, onResizeEnd, persistent],
  );

  const isHorizontal = orientation === "horizontal";

  const collapsedAttrs: Record<string, string> = {};
  collapsed.forEach((c, i) => {
    if (c) collapsedAttrs[`data-collapsed-${i}`] = "true";
  });

  const containerProps: ContainerProps = {
    "data-orientation": orientation,
    ...(isDragging ? { "data-dragging": "true" as const } : {}),
    ...collapsedAttrs,
    style: {
      display: "flex",
      flexDirection: isHorizontal ? "row" : "column",
      width: "100%",
      height: "100%",
      overflow: "hidden",
      boxSizing: "border-box",
    },
  };

  const getPaneProps = (index: number): PaneProps => {
    const size = currentSizes[index] ?? 0;
    const isCollapsed = collapsed[index] ?? false;
    return {
      "data-pane-index": index,
      ...(isCollapsed ? { "data-collapsed": "true" as const } : {}),
      style: {
        flexBasis: isCollapsed ? "0%" : `${size}%`,
        flexGrow: 0,
        flexShrink: 0,
        overflow: "hidden",
        boxSizing: "border-box",
        minWidth: isHorizontal && isCollapsed ? 0 : undefined,
        minHeight: !isHorizontal && isCollapsed ? 0 : undefined,
      },
    };
  };

  const getResizerProps = (dragIndex = 0): ResizerProps => {
    const sizeA = currentSizes[dragIndex] ?? 0;
    return {
      role: "separator",
      tabIndex: disabled ? -1 : 0,
      "aria-orientation": orientation,
      "aria-valuenow": Math.round(sizeA),
      "aria-valuemin": getMinSize(dragIndex),
      "aria-valuemax": 100 - getMinSize(dragIndex + 1),
      "aria-label": "Resize panels",
      ...(disabled ? { "aria-disabled": true } : {}),
      "data-resizer": "true",
      title: "Double-click to equalize",
      style: {
        flexShrink: 0,
        flexGrow: 0,
        flexBasis: `${resizerSize}px`,
        ...(isHorizontal
          ? { width: `${resizerSize}px`, height: "100%", cursor: disabled ? "default" : "col-resize" }
          : { height: `${resizerSize}px`, width: "100%", cursor: disabled ? "default" : "row-resize" }),
        position: "relative",
        zIndex: 1,
        touchAction: "none",
        userSelect: "none",
      },
      onKeyDown: handleKeyDown(dragIndex),
      onPointerDown: handlePointerDown(dragIndex),
      onDoubleClick: handleDoubleClick(dragIndex),
    };
  };

  return {
    containerProps,
    getPaneProps,
    getResizerProps,
    sizes: currentSizes,
    isDragging,
    collapsed,
    collapse,
  };
}
