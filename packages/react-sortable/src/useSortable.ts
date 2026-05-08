import {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
  type KeyboardEvent,
} from "react";
import type React from "react";

export interface SortableItem {
  id: string | number;
  [key: string]: unknown;
}

export interface UseSortableOptions<T extends SortableItem = SortableItem> {
  items: T[];
  onReorder: (items: T[]) => void;
  orientation?: "vertical" | "horizontal";
  handle?: boolean;
  disabled?: boolean;
  animationDuration?: number;
}

export interface ItemState {
  isDragging: boolean;
  isOver: boolean;
  handleProps: React.HTMLAttributes<HTMLElement> & { "aria-hidden": boolean };
}

export interface ItemProps {
  role: "option";
  "aria-roledescription": string;
  "aria-grabbed": boolean;
  tabIndex: number;
  "data-active"?: string;
  "data-sortable-id": string;
  onPointerDown: (e: React.PointerEvent<HTMLElement>) => void;
  onKeyDown: (e: KeyboardEvent<HTMLElement>) => void;
}

export interface ContainerProps {
  role: "listbox";
  "aria-orientation": "vertical" | "horizontal";
  "data-dragging"?: string;
  "aria-label": string;
  ref: (el: HTMLElement | null) => void;
}

export interface GhostPos {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface UseSortableResult<T extends SortableItem = SortableItem> {
  items: T[];
  previewItems: T[];
  containerProps: ContainerProps;
  getItemProps: (item: T) => ItemProps;
  getItemState: (item: T) => ItemState;
  handleProps: (item: T) => React.HTMLAttributes<HTMLElement> & { "aria-hidden": boolean };
  activeId: string | number | null;
  isDragging: boolean;
  dragIndex: number | null;
  ghostPos: GhostPos;
  liveRegionText: string;
}

function reorder<T>(arr: T[], fromIndex: number, toIndex: number): T[] {
  const next = [...arr];
  const [moved] = next.splice(fromIndex, 1);
  if (moved === undefined) return arr;
  next.splice(toIndex, 0, moved);
  return next;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function useSortable<T extends SortableItem = SortableItem>({
  items,
  onReorder,
  orientation = "vertical",
  handle = true,
  disabled = false,
  animationDuration: _animationDuration = 200,
}: UseSortableOptions<T>): UseSortableResult<T> {
  const [activeId, setActiveId] = useState<string | number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [ghostPos, setGhostPos] = useState<GhostPos>({ x: 0, y: 0, width: 0, height: 0 });
  const [keyboardActiveId, setKeyboardActiveIdState] = useState<string | number | null>(null);
  const [liveRegionText, setLiveRegionText] = useState("");

  const keyboardActiveIdRef = useRef<string | number | null>(null);
  const setKeyboardActiveId = useCallback((id: string | number | null) => {
    keyboardActiveIdRef.current = id;
    setKeyboardActiveIdState(id);
  }, []);

  const itemsRef = useRef(items);
  itemsRef.current = items;
  const onReorderRef = useRef(onReorder);
  onReorderRef.current = onReorder;
  const orientationRef = useRef(orientation);
  orientationRef.current = orientation;

  const containerRef = useRef<HTMLElement | null>(null);
  const originalItemsRef = useRef<T[]>([]);
  const pointerOffsetRef = useRef({ x: 0, y: 0 });
  const activeIdRef = useRef<string | number | null>(null);
  const overIndexRef = useRef<number | null>(null);
  const dragCleanupRef = useRef<(() => void) | null>(null);

  const isDragging = activeId !== null;
  const dragIndex = activeId !== null ? items.findIndex((it) => it.id === activeId) : null;

  // Live preview: reorder items to show where the dragged item will land
  const previewItems = useMemo<T[]>(() => {
    if (activeId === null || overIndex === null || dragIndex === null || dragIndex === overIndex) {
      return items;
    }
    return reorder(items, dragIndex, overIndex);
  }, [items, activeId, overIndex, dragIndex]);

  const announce = useCallback((text: string) => setLiveRegionText(text), []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dragCleanupRef.current?.();
      document.body.style.removeProperty("cursor");
    };
  }, []);

  const startDrag = useCallback(
    (e: React.PointerEvent<HTMLElement>, itemId: string | number) => {
      if (disabled) return;
      e.preventDefault();
      e.stopPropagation();

      const captureEl = e.currentTarget as HTMLElement;
      captureEl.setPointerCapture(e.pointerId);

      if (!containerRef.current) return;
      const allEls = Array.from(
        containerRef.current.querySelectorAll<HTMLElement>("[data-sortable-id]"),
      );
      const itemEl = allEls.find((el) => el.dataset["sortableId"] === String(itemId));
      if (!itemEl) return;

      const rect = itemEl.getBoundingClientRect();
      pointerOffsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };

      const startIndex = itemsRef.current.findIndex((it) => it.id === itemId);
      originalItemsRef.current = [...itemsRef.current];
      activeIdRef.current = itemId;
      overIndexRef.current = startIndex;

      setGhostPos({ x: rect.left, y: rect.top, width: rect.width, height: rect.height });
      document.body.style.cursor = "grabbing";

      // Add listeners synchronously — never miss a pointerup even on fast click-release
      const handleMove = (ev: PointerEvent) => {
        ev.preventDefault();
        const offset = pointerOffsetRef.current;
        setGhostPos((prev) => ({
          ...prev,
          x: ev.clientX - offset.x,
          y: ev.clientY - offset.y,
        }));

        // Midpoint hit-test: find which slot the pointer maps to
        if (!containerRef.current) return;
        const els = Array.from(
          containerRef.current.querySelectorAll<HTMLElement>("[data-sortable-id]"),
        );
        const o = orientationRef.current;
        let newIndex = Math.max(0, els.length - 1);
        for (let i = 0; i < els.length; i++) {
          const r = els[i]!.getBoundingClientRect();
          const mid = o === "vertical" ? r.top + r.height / 2 : r.left + r.width / 2;
          const pos = o === "vertical" ? ev.clientY : ev.clientX;
          if (pos <= mid) {
            newIndex = i;
            break;
          }
        }
        overIndexRef.current = newIndex;
        setOverIndex(newIndex);
      };

      const handleUp = () => {
        window.removeEventListener("pointermove", handleMove);
        document.body.style.removeProperty("cursor");

        const savedActiveId = activeIdRef.current;
        const savedOverIndex = overIndexRef.current;
        activeIdRef.current = null;
        overIndexRef.current = null;
        dragCleanupRef.current = null;

        setActiveId(null);
        setOverIndex(null);

        if (savedActiveId !== null && savedOverIndex !== null) {
          const currentItems = itemsRef.current;
          const di = currentItems.findIndex((it) => it.id === savedActiveId);
          if (di !== -1 && di !== savedOverIndex) {
            onReorderRef.current(reorder(currentItems, di, savedOverIndex));
          }
        }
      };

      window.addEventListener("pointermove", handleMove, { passive: false });
      window.addEventListener("pointerup", handleUp, { once: true });
      dragCleanupRef.current = () => {
        window.removeEventListener("pointermove", handleMove);
        window.removeEventListener("pointerup", handleUp);
      };

      setActiveId(itemId);
      setOverIndex(startIndex);
    },
    [disabled],
  );

  const handleItemKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>, itemId: string | number) => {
      if (disabled) return;

      const isVertical = orientation === "vertical";
      const prevKey = isVertical ? "ArrowUp" : "ArrowLeft";
      const nextKey = isVertical ? "ArrowDown" : "ArrowRight";

      const currentKbId = keyboardActiveIdRef.current;
      if (currentKbId === null) {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          setKeyboardActiveId(itemId);
          const idx = itemsRef.current.findIndex((it) => it.id === itemId);
          announce(
            `Picked up item at position ${idx + 1} of ${itemsRef.current.length}. Use arrow keys to move, Space or Enter to drop, Escape to cancel.`,
          );
          originalItemsRef.current = [...itemsRef.current];
        }
      } else {
        if (e.key === prevKey || e.key === nextKey) {
          e.preventDefault();
          const currentItems = itemsRef.current;
          const fromIndex = currentItems.findIndex((it) => it.id === currentKbId);
          if (fromIndex === -1) return;
          const delta = e.key === nextKey ? 1 : -1;
          const toIndex = clamp(fromIndex + delta, 0, currentItems.length - 1);
          if (toIndex === fromIndex) return;
          onReorderRef.current(reorder(currentItems, fromIndex, toIndex));
          announce(`Moved to position ${toIndex + 1} of ${currentItems.length}.`);
        } else if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          const idx = itemsRef.current.findIndex((it) => it.id === currentKbId);
          announce(`Dropped at position ${idx + 1} of ${itemsRef.current.length}.`);
          setKeyboardActiveId(null);
        } else if (e.key === "Escape") {
          e.preventDefault();
          onReorderRef.current(originalItemsRef.current);
          announce("Reordering cancelled.");
          setKeyboardActiveId(null);
        }
      }
    },
    [disabled, orientation, announce, setKeyboardActiveId],
  );

  const getContainerRef = useCallback((el: HTMLElement | null) => {
    containerRef.current = el;
  }, []);

  const containerProps: ContainerProps = {
    role: "listbox",
    "aria-orientation": orientation,
    "aria-label": "Sortable list",
    ref: getContainerRef,
    ...(isDragging || keyboardActiveId !== null ? { "data-dragging": "true" } : {}),
  };

  const getItemProps = useCallback(
    (item: T): ItemProps => {
      const isActive = item.id === activeId || item.id === keyboardActiveId;
      return {
        role: "option",
        "aria-roledescription": "sortable item",
        "aria-grabbed": isActive,
        tabIndex: 0,
        "data-sortable-id": String(item.id),
        ...(isActive ? { "data-active": "true" } : {}),
        onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
          if (!handle) startDrag(e, item.id);
        },
        onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
          handleItemKeyDown(e, item.id);
        },
      };
    },
    [activeId, keyboardActiveId, handle, startDrag, handleItemKeyDown],
  );

  const getItemState = useCallback(
    (item: T): ItemState => {
      const isActive = item.id === activeId || item.id === keyboardActiveId;
      return {
        isDragging: isActive,
        isOver: false,
        handleProps: {
          "aria-hidden": true,
          tabIndex: -1,
          onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
            startDrag(e, item.id);
          },
        },
      };
    },
    [activeId, keyboardActiveId, startDrag],
  );

  const handleProps = useCallback(
    (item: T): React.HTMLAttributes<HTMLElement> & { "aria-hidden": boolean } => ({
      "aria-hidden": true,
      tabIndex: -1,
      style: { cursor: isDragging ? "grabbing" : "grab", touchAction: "none" } as React.CSSProperties,
      onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
        e.stopPropagation();
        startDrag(e, item.id);
      },
    }),
    [isDragging, startDrag],
  );

  return {
    items,
    previewItems,
    containerProps,
    getItemProps,
    getItemState,
    handleProps,
    activeId,
    isDragging,
    dragIndex,
    ghostPos,
    liveRegionText,
  };
}
