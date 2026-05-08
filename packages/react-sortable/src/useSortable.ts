import {
  useState,
  useCallback,
  useRef,
  useEffect,
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
  "data-over"?: string;
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

export interface UseSortableResult<T extends SortableItem = SortableItem> {
  items: T[];
  containerProps: ContainerProps;
  getItemProps: (item: T) => ItemProps;
  getItemState: (item: T) => ItemState;
  activeId: string | number | null;
  overId: string | number | null;
  isDragging: boolean;
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
  disabled = false,
  animationDuration: _animationDuration = 200,
}: UseSortableOptions<T>): UseSortableResult<T> {
  const [activeId, setActiveId] = useState<string | number | null>(null);
  const [overId, setOverId] = useState<string | number | null>(null);
  const [keyboardActiveId, setKeyboardActiveId] = useState<
    string | number | null
  >(null);
  const [liveRegionText, setLiveRegionText] = useState("");

  const itemsRef = useRef(items);
  itemsRef.current = items;

  const dragNodeRef = useRef<HTMLElement | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);
  const originalItemsRef = useRef<T[]>([]);
  const isDragging = activeId !== null;

  const announce = useCallback((text: string) => {
    setLiveRegionText(text);
  }, []);

  const getItemElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];
    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>("[data-sortable-id]"),
    );
  }, []);

  const getItemIdFromElement = useCallback(
    (el: HTMLElement): string | number | null => {
      const raw = el.dataset["sortableId"];
      if (raw === undefined) return null;
      const asNum = Number(raw);
      return isNaN(asNum) ? raw : asNum;
    },
    [],
  );

  const getOverIdFromPointer = useCallback(
    (clientX: number, clientY: number): string | number | null => {
      const els = getItemElements();
      for (const el of els) {
        const rect = el.getBoundingClientRect();
        if (
          clientX >= rect.left &&
          clientX <= rect.right &&
          clientY >= rect.top &&
          clientY <= rect.bottom
        ) {
          return getItemIdFromElement(el);
        }
      }
      return null;
    },
    [getItemElements, getItemIdFromElement],
  );

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      if (dragNodeRef.current) {
        const ghostEl = document.getElementById("rsort-drag-ghost");
        if (ghostEl) {
          ghostEl.style.transform = `translate(${e.clientX - 20}px, ${e.clientY - 20}px)`;
        }
      }
      const newOverId = getOverIdFromPointer(e.clientX, e.clientY);
      setOverId(newOverId);
    },
    [getOverIdFromPointer],
  );

  const onPointerUp = useCallback(
    (e: PointerEvent) => {
      e.preventDefault();
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
      document.body.style.removeProperty("cursor");

      const ghostEl = document.getElementById("rsort-drag-ghost");
      if (ghostEl) ghostEl.remove();

      setActiveId((currentActiveId) => {
        setOverId((currentOverId) => {
          if (
            currentActiveId !== null &&
            currentOverId !== null &&
            currentActiveId !== currentOverId
          ) {
            const currentItems = itemsRef.current;
            const fromIndex = currentItems.findIndex(
              (it) => it.id === currentActiveId,
            );
            const toIndex = currentItems.findIndex(
              (it) => it.id === currentOverId,
            );
            if (fromIndex !== -1 && toIndex !== -1) {
              onReorder(reorder(currentItems, fromIndex, toIndex));
            }
          }
          return null;
        });
        return null;
      });

      dragNodeRef.current = null;
    },
    [onPointerMove, onReorder],
  );

  const startDrag = useCallback(
    (e: React.PointerEvent<HTMLElement>, itemId: string | number) => {
      if (disabled) return;
      e.preventDefault();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

      dragNodeRef.current = e.currentTarget as HTMLElement;
      originalItemsRef.current = [...itemsRef.current];

      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();

      const ghost = document.createElement("div");
      ghost.id = "rsort-drag-ghost";
      ghost.setAttribute("aria-hidden", "true");
      ghost.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: ${rect.width}px;
        pointer-events: none;
        z-index: 9999;
        transform: translate(${e.clientX - 20}px, ${e.clientY - 20}px);
        opacity: 0.85;
        box-shadow: 0 8px 24px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.1);
        border-radius: 6px;
        background: var(--rsort-item-bg, #fff);
        padding: var(--rsort-item-padding, 10px 14px);
        font-size: var(--rsort-font-size, 0.875rem);
        color: var(--rsort-item-fg, #18181b);
        display: flex;
        align-items: center;
        gap: var(--rsort-gap, 8px);
        border: 1px solid var(--rsort-item-border, #e4e4e7);
      `;
      ghost.textContent =
        (e.currentTarget as HTMLElement).textContent?.trim() ?? "";
      document.body.appendChild(ghost);

      document.body.style.cursor = "grabbing";

      document.addEventListener("pointermove", onPointerMove);
      document.addEventListener("pointerup", onPointerUp);

      setActiveId(itemId);
      setOverId(itemId);
    },
    [disabled, onPointerMove, onPointerUp],
  );

  useEffect(() => {
    return () => {
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
      document.body.style.removeProperty("cursor");
      document.getElementById("rsort-drag-ghost")?.remove();
    };
  }, [onPointerMove, onPointerUp]);

  const handleItemKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>, itemId: string | number) => {
      if (disabled) return;

      const isVertical = orientation === "vertical";
      const prevKey = isVertical ? "ArrowUp" : "ArrowLeft";
      const nextKey = isVertical ? "ArrowDown" : "ArrowRight";

      if (keyboardActiveId === null) {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          setKeyboardActiveId(itemId);
          const currentItems = itemsRef.current;
          const idx = currentItems.findIndex((it) => it.id === itemId);
          announce(
            `Picked up item at position ${idx + 1} of ${currentItems.length}. Use arrow keys to move, Space or Enter to drop, Escape to cancel.`,
          );
          originalItemsRef.current = [...currentItems];
        }
      } else {
        if (e.key === prevKey || e.key === nextKey) {
          e.preventDefault();
          const currentItems = itemsRef.current;
          const fromIndex = currentItems.findIndex(
            (it) => it.id === keyboardActiveId,
          );
          if (fromIndex === -1) return;
          const delta = e.key === nextKey ? 1 : -1;
          const toIndex = clamp(fromIndex + delta, 0, currentItems.length - 1);
          if (toIndex === fromIndex) return;
          const reordered = reorder(currentItems, fromIndex, toIndex);
          onReorder(reordered);
          announce(
            `Moved to position ${toIndex + 1} of ${currentItems.length}.`,
          );
        } else if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          const currentItems = itemsRef.current;
          const idx = currentItems.findIndex(
            (it) => it.id === keyboardActiveId,
          );
          announce(
            `Dropped at position ${idx + 1} of ${currentItems.length}.`,
          );
          setKeyboardActiveId(null);
        } else if (e.key === "Escape") {
          e.preventDefault();
          onReorder(originalItemsRef.current);
          announce("Reordering cancelled.");
          setKeyboardActiveId(null);
        }
      }
    },
    [disabled, keyboardActiveId, orientation, onReorder, announce],
  );

  const getContainerRef = useCallback((el: HTMLElement | null) => {
    containerRef.current = el;
  }, []);

  const containerProps: ContainerProps = {
    role: "listbox",
    "aria-orientation": orientation,
    "aria-label": "Sortable list",
    ref: getContainerRef,
    ...(isDragging || keyboardActiveId !== null
      ? { "data-dragging": "true" }
      : {}),
  };

  const getItemProps = useCallback(
    (item: T): ItemProps => {
      const isActive =
        item.id === activeId || item.id === keyboardActiveId;
      const isKeyboardActive = item.id === keyboardActiveId;
      const isOver = item.id === overId && item.id !== activeId;

      return {
        role: "option",
        "aria-roledescription": "sortable item",
        "aria-grabbed": isActive,
        tabIndex: 0,
        "data-sortable-id": String(item.id),
        ...(isActive ? { "data-active": "true" } : {}),
        ...(isOver || isKeyboardActive ? { "data-over": "true" } : {}),
        onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
          startDrag(e, item.id);
        },
        onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
          handleItemKeyDown(e, item.id);
        },
      };
    },
    [activeId, overId, keyboardActiveId, startDrag, handleItemKeyDown],
  );

  const getItemState = useCallback(
    (item: T): ItemState => {
      const isActive =
        item.id === activeId || item.id === keyboardActiveId;
      const isOver =
        (item.id === overId && item.id !== activeId) ||
        item.id === keyboardActiveId;

      const handleProps: ItemState["handleProps"] = {
        "aria-hidden": true,
        tabIndex: -1,
        onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
          startDrag(e, item.id);
        },
      };

      return {
        isDragging: isActive,
        isOver,
        handleProps,
      };
    },
    [activeId, overId, keyboardActiveId, startDrag],
  );

  return {
    items,
    containerProps,
    getItemProps,
    getItemState,
    activeId,
    overId,
    isDragging,
    liveRegionText,
  };
}
