import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type React from "react";

export type KanbanAccent =
  | "neutral"
  | "blue"
  | "green"
  | "amber"
  | "red"
  | "violet"
  | "pink"
  | "cyan";

export interface KanbanAssignee {
  id: string;
  name: string;
  initials?: string;
  color?: string;
  avatarUrl?: string;
}

export interface KanbanChecklist {
  done: number;
  total: number;
}

export interface KanbanCard<TData = unknown> {
  id: string;
  content: string;
  description?: string;
  label?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  assignees?: KanbanAssignee[];
  dueDate?: string | Date | null;
  tags?: string[];
  checklist?: KanbanChecklist;
  attachments?: number;
  comments?: number;
  cover?: string;
  data?: TData;
}

export interface KanbanColumn<TData = unknown> {
  id: string;
  title: string;
  cards: KanbanCard<TData>[];
  wipLimit?: number;
  wipWarnThreshold?: number;
  accent?: KanbanAccent;
  locked?: boolean;
}

export type DropRejectReason = "canDrop" | "limit" | "locked";

export type DragMode = "pointer" | "keyboard";

export interface CardDragState {
  kind: "card";
  primaryId: string;
  ids: string[];
  sourceColumnId: string;
  sourceIndex: number;
  pointer: { x: number; y: number } | null;
  pointerOffset: { x: number; y: number };
  cardRect: { width: number; height: number } | null;
  target: { columnId: string; index: number } | null;
  mode: DragMode;
}

export interface ColumnDragState {
  kind: "column";
  columnId: string;
  sourceIndex: number;
  pointer: { x: number; y: number } | null;
  pointerOffset: { x: number; y: number };
  columnRect: { width: number; height: number } | null;
  target: number | null;
  mode: DragMode;
}

export type DragState = CardDragState | ColumnDragState | null;

export interface UseKanbanOptions<TData = unknown> {
  columns?: KanbanColumn<TData>[];
  defaultColumns?: KanbanColumn<TData>[];
  onChange?: (columns: KanbanColumn<TData>[]) => void;
  disabled?: boolean;
  reorderable?: boolean;
  columnReorderable?: boolean;
  maxCardsPerColumn?: number;
  canDrop?: (
    card: KanbanCard<TData>,
    fromColumnId: string,
    toColumnId: string,
    toIndex: number,
  ) => boolean;
  onCardAdd?: (card: KanbanCard<TData>, columnId: string) => void;
  onCardRemove?: (card: KanbanCard<TData>, columnId: string) => void;
  onCardMove?: (
    card: KanbanCard<TData>,
    fromColumnId: string,
    toColumnId: string,
    toIndex: number,
  ) => void;
  onCardReorder?: (
    card: KanbanCard<TData>,
    columnId: string,
    fromIndex: number,
    toIndex: number,
  ) => void;
  onColumnReorder?: (columnId: string, fromIndex: number, toIndex: number) => void;
  onDropRejected?: (
    card: KanbanCard<TData>,
    fromColumnId: string,
    toColumnId: string,
    reason: DropRejectReason,
  ) => void;
  onSelectionChange?: (ids: string[]) => void;
  addCardPosition?: "top" | "bottom";
}

export interface CardProps {
  ref: (el: HTMLElement | null) => void;
  role: string;
  tabIndex: number;
  "data-card-id": string;
  "data-column-id": string;
  "data-dragging"?: "true";
  "data-selected"?: "true";
  "aria-grabbed"?: boolean;
  "aria-roledescription"?: string;
  onPointerDown: (e: React.PointerEvent<HTMLElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
  onFocus: (e: React.FocusEvent<HTMLElement>) => void;
}

export interface ColumnDropProps {
  ref: (el: HTMLElement | null) => void;
  "data-column-id": string;
  "data-drag-over"?: "true";
  "data-drop-rejected"?: "true";
}

export interface ColumnHandleProps {
  ref: (el: HTMLElement | null) => void;
  role: string;
  tabIndex: number;
  "data-column-id": string;
  "data-column-dragging"?: "true";
  "aria-grabbed"?: boolean;
  "aria-roledescription"?: string;
  onPointerDown: (e: React.PointerEvent<HTMLElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
}

export interface BoardProps {
  ref: (el: HTMLElement | null) => void;
}

export interface UseKanbanResult<TData = unknown> {
  columns: KanbanColumn<TData>[];
  setColumns: React.Dispatch<React.SetStateAction<KanbanColumn<TData>[]>>;
  drag: DragState;
  rejectedColumn: string | null;
  selection: string[];
  toggleSelect: (cardId: string, mode?: "single" | "toggle" | "range") => void;
  clearSelection: () => void;
  isSelected: (cardId: string) => boolean;
  getBoardProps: () => BoardProps;
  getCardProps: (cardId: string, columnId: string) => CardProps;
  getColumnDropProps: (columnId: string) => ColumnDropProps;
  getColumnHandleProps: (columnId: string) => ColumnHandleProps;
  addCard: (
    contentOrCard: string | Partial<KanbanCard<TData>>,
    columnId: string,
  ) => void;
  removeCard: (cardId: string, columnId: string) => void;
  moveCard: (
    cardId: string,
    fromColumnId: string,
    toColumnId: string,
    toIndex?: number,
  ) => void;
  reorderColumn: (columnId: string, toIndex: number) => void;
  cancelDrag: () => void;
}

const DRAG_THRESHOLD = 4;
const AUTO_SCROLL_EDGE = 60;
const AUTO_SCROLL_MAX = 18;

function effectiveLimit<TData>(
  col: KanbanColumn<TData>,
  globalCap: number | undefined,
): number | undefined {
  if (col.wipLimit !== undefined) return col.wipLimit;
  return globalCap;
}

function genId(prefix: string): string {
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${stamp}-${rand}`;
}

export function useKanban<TData = unknown>(
  options: UseKanbanOptions<TData>,
): UseKanbanResult<TData> {
  const {
    columns: columnsProp,
    defaultColumns,
    onChange,
    disabled = false,
    reorderable = true,
    columnReorderable = false,
    maxCardsPerColumn,
    canDrop,
    onCardAdd,
    onCardRemove,
    onCardMove,
    onCardReorder,
    onColumnReorder,
    onDropRejected,
    onSelectionChange,
    addCardPosition = "bottom",
  } = options;

  const isControlled = columnsProp !== undefined;
  const [internalCols, setInternalCols] = useState<KanbanColumn<TData>[]>(
    () => columnsProp ?? defaultColumns ?? [],
  );

  const columns: KanbanColumn<TData>[] = columnsProp ?? internalCols;

  const setColumns = useCallback<
    React.Dispatch<React.SetStateAction<KanbanColumn<TData>[]>>
  >(
    (update) => {
      const apply = (prev: KanbanColumn<TData>[]) =>
        typeof update === "function"
          ? (update as (p: KanbanColumn<TData>[]) => KanbanColumn<TData>[])(prev)
          : update;
      if (isControlled) {
        const next = apply(columns);
        onChange?.(next);
      } else {
        setInternalCols((prev) => {
          const next = apply(prev);
          onChange?.(next);
          return next;
        });
      }
    },
    [isControlled, columns, onChange],
  );

  const columnsRef = useRef(columns);
  useEffect(() => {
    columnsRef.current = columns;
  }, [columns]);

  const [drag, setDrag] = useState<DragState>(null);
  const dragRef = useRef<DragState>(null);
  useEffect(() => {
    dragRef.current = drag;
  }, [drag]);

  const [rejectedColumn, setRejectedColumn] = useState<string | null>(null);
  const rejectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashRejected = useCallback((columnId: string) => {
    setRejectedColumn(columnId);
    if (rejectTimer.current) clearTimeout(rejectTimer.current);
    rejectTimer.current = setTimeout(() => setRejectedColumn(null), 600);
  }, []);

  const cardElsRef = useRef(new Map<string, HTMLElement>());
  const columnDropElsRef = useRef(new Map<string, HTMLElement>());
  const columnHandleElsRef = useRef(new Map<string, HTMLElement>());
  const boardElRef = useRef<HTMLElement | null>(null);

  const [selection, setSelection] = useState<string[]>([]);
  const lastSelectionAnchor = useRef<string | null>(null);

  const isSelected = useCallback(
    (cardId: string) => selection.includes(cardId),
    [selection],
  );

  const setSelectionWithCb = useCallback(
    (next: string[] | ((prev: string[]) => string[])) => {
      setSelection((prev) => {
        const value = typeof next === "function" ? next(prev) : next;
        if (
          value.length === prev.length &&
          value.every((v, i) => v === prev[i])
        ) {
          return prev;
        }
        onSelectionChange?.(value);
        return value;
      });
    },
    [onSelectionChange],
  );

  const clearSelection = useCallback(() => {
    setSelectionWithCb([]);
    lastSelectionAnchor.current = null;
  }, [setSelectionWithCb]);

  const toggleSelect = useCallback(
    (cardId: string, mode: "single" | "toggle" | "range" = "single") => {
      setSelectionWithCb((prev) => {
        if (mode === "single") {
          lastSelectionAnchor.current = cardId;
          return prev.length === 1 && prev[0] === cardId ? [cardId] : [cardId];
        }
        if (mode === "toggle") {
          lastSelectionAnchor.current = cardId;
          return prev.includes(cardId)
            ? prev.filter((id) => id !== cardId)
            : [...prev, cardId];
        }
        // range — within same column from anchor
        const cols = columnsRef.current;
        const anchor = lastSelectionAnchor.current ?? cardId;
        let anchorCol: KanbanColumn<TData> | undefined;
        let targetCol: KanbanColumn<TData> | undefined;
        for (const col of cols) {
          if (col.cards.some((c) => c.id === anchor)) anchorCol = col;
          if (col.cards.some((c) => c.id === cardId)) targetCol = col;
        }
        if (!anchorCol || !targetCol || anchorCol.id !== targetCol.id) {
          lastSelectionAnchor.current = cardId;
          return prev.includes(cardId) ? prev : [...prev, cardId];
        }
        const aIdx = anchorCol.cards.findIndex((c) => c.id === anchor);
        const bIdx = anchorCol.cards.findIndex((c) => c.id === cardId);
        const [from, to] =
          aIdx < bIdx ? [aIdx, bIdx] : [bIdx, aIdx];
        const ids = anchorCol.cards.slice(from, to + 1).map((c) => c.id);
        return Array.from(new Set([...prev, ...ids]));
      });
    },
    [setSelectionWithCb],
  );

  const cancelDrag = useCallback(() => {
    setDrag(null);
  }, []);

  const findCardLocation = useCallback(
    (cardId: string): { column: KanbanColumn<TData>; index: number } | null => {
      for (const col of columnsRef.current) {
        const idx = col.cards.findIndex((c) => c.id === cardId);
        if (idx !== -1) return { column: col, index: idx };
      }
      return null;
    },
    [],
  );

  const computeCardDropTarget = useCallback(
    (
      x: number,
      y: number,
      excludeIds: Set<string>,
    ): { columnId: string; index: number } | null => {
      let bestColumn: HTMLElement | null = null;
      let bestColumnId: string | null = null;
      for (const [colId, el] of columnDropElsRef.current.entries()) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) continue;
        if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
          bestColumn = el;
          bestColumnId = colId;
          break;
        }
      }
      if (!bestColumn || !bestColumnId) {
        // pick nearest column horizontally
        let nearest: { id: string; el: HTMLElement; dist: number } | null = null;
        for (const [colId, el] of columnDropElsRef.current.entries()) {
          const r = el.getBoundingClientRect();
          if (r.width === 0 && r.height === 0) continue;
          const cx = (r.left + r.right) / 2;
          const dist = Math.abs(x - cx);
          if (!nearest || dist < nearest.dist) nearest = { id: colId, el, dist };
        }
        if (!nearest) return null;
        bestColumn = nearest.el;
        bestColumnId = nearest.id;
      }
      const cards = Array.from(
        bestColumn.querySelectorAll<HTMLElement>("[data-card-id]"),
      );
      let idx = 0;
      for (const el of cards) {
        const id = el.dataset.cardId;
        if (id && excludeIds.has(id)) continue;
        const r = el.getBoundingClientRect();
        if (r.height === 0 && r.top === 0) {
          idx++;
          continue;
        }
        const mid = r.top + r.height / 2;
        if (y < mid) return { columnId: bestColumnId, index: idx };
        idx++;
      }
      return { columnId: bestColumnId, index: idx };
    },
    [],
  );

  const computeColumnDropIndex = useCallback(
    (x: number, draggingColumnId: string): number => {
      const cols = columnsRef.current;
      const filtered = cols.filter((c) => c.id !== draggingColumnId);
      const rects = filtered.map((c) => {
        const el = columnDropElsRef.current.get(c.id);
        return el?.getBoundingClientRect() ?? null;
      });
      let idx = 0;
      for (const r of rects) {
        if (!r) {
          idx++;
          continue;
        }
        const mid = r.left + r.width / 2;
        if (x < mid) return idx;
        idx++;
      }
      return idx;
    },
    [],
  );

  const performCardDrop = useCallback(
    (state: CardDragState, target: { columnId: string; index: number }) => {
      const cols = columnsRef.current;
      const sourceCol = cols.find((c) => c.id === state.sourceColumnId);
      const dstCol = cols.find((c) => c.id === target.columnId);
      if (!sourceCol || !dstCol) return;
      if (dstCol.locked) {
        const card = sourceCol.cards.find((c) => c.id === state.primaryId);
        if (card) {
          flashRejected(target.columnId);
          onDropRejected?.(card, sourceCol.id, dstCol.id, "locked");
        }
        return;
      }
      const sameCol = sourceCol.id === dstCol.id;
      if (sameCol && !reorderable && state.ids.length === 1) return;

      const ids = state.ids;
      const draggedCards = ids
        .map((id) => sourceCol.cards.find((c) => c.id === id))
        .filter((c): c is KanbanCard<TData> => Boolean(c));
      if (draggedCards.length === 0) return;

      const primary =
        draggedCards.find((c) => c.id === state.primaryId) ?? draggedCards[0]!;

      if (canDrop && !canDrop(primary, sourceCol.id, dstCol.id, target.index)) {
        flashRejected(target.columnId);
        onDropRejected?.(primary, sourceCol.id, dstCol.id, "canDrop");
        return;
      }

      if (!sameCol) {
        const cap = effectiveLimit(dstCol, maxCardsPerColumn);
        if (cap !== undefined && dstCol.cards.length + ids.length > cap) {
          flashRejected(target.columnId);
          onDropRejected?.(primary, sourceCol.id, dstCol.id, "limit");
          return;
        }
      }

      setColumns((prev) => {
        const next = prev.map((c) => ({ ...c, cards: [...c.cards] }));
        const src = next.find((c) => c.id === sourceCol.id);
        const dst = next.find((c) => c.id === dstCol.id);
        if (!src || !dst) return prev;

        const movingIds = new Set(ids);
        const moved: KanbanCard<TData>[] = [];
        for (const id of ids) {
          const idx = src.cards.findIndex((c) => c.id === id);
          if (idx !== -1) {
            const [card] = src.cards.splice(idx, 1);
            if (card) moved.push(card);
          }
        }
        if (moved.length === 0) return prev;

        let insertAt = target.index;
        if (sameCol) {
          const removedBefore = src.cards.length === dst.cards.length ? 0 : 0;
          void removedBefore;
          insertAt = Math.min(target.index, dst.cards.length);
        } else {
          insertAt = Math.min(target.index, dst.cards.length);
        }
        dst.cards.splice(insertAt, 0, ...moved);

        if (sameCol) {
          if (moved.length === 1) {
            const m = moved[0]!;
            const fromIdx = sourceCol.cards.findIndex((c) => c.id === m.id);
            onCardReorder?.(m, dst.id, fromIdx, insertAt);
          } else {
            for (const m of moved) {
              const fromIdx = sourceCol.cards.findIndex((c) => c.id === m.id);
              const toIdx = dst.cards.findIndex((c) => c.id === m.id);
              onCardReorder?.(m, dst.id, fromIdx, toIdx);
            }
          }
        } else {
          for (let i = 0; i < moved.length; i++) {
            const m = moved[i]!;
            onCardMove?.(m, sourceCol.id, dst.id, insertAt + i);
          }
        }

        void movingIds;
        return next;
      });
    },
    [
      canDrop,
      flashRejected,
      maxCardsPerColumn,
      onCardMove,
      onCardReorder,
      onDropRejected,
      reorderable,
      setColumns,
    ],
  );

  const performColumnDrop = useCallback(
    (state: ColumnDragState, toIndex: number) => {
      if (toIndex === state.sourceIndex) return;
      setColumns((prev) => {
        const next = [...prev];
        const fromIdx = next.findIndex((c) => c.id === state.columnId);
        if (fromIdx === -1) return prev;
        const [moved] = next.splice(fromIdx, 1);
        if (!moved) return prev;
        const insertAt = Math.max(0, Math.min(toIndex, next.length));
        next.splice(insertAt, 0, moved);
        onColumnReorder?.(state.columnId, fromIdx, insertAt);
        return next;
      });
    },
    [onColumnReorder, setColumns],
  );

  // Auto-scroll loop while dragging
  const autoScrollFrame = useRef<number | null>(null);
  const stopAutoScroll = useCallback(() => {
    if (autoScrollFrame.current !== null) {
      cancelAnimationFrame(autoScrollFrame.current);
      autoScrollFrame.current = null;
    }
  }, []);

  const tickAutoScroll = useCallback(
    (x: number, y: number) => {
      const board = boardElRef.current;
      if (board) {
        const r = board.getBoundingClientRect();
        const leftDist = x - r.left;
        const rightDist = r.right - x;
        let dx = 0;
        if (leftDist < AUTO_SCROLL_EDGE && leftDist >= 0) {
          dx = -Math.round(
            ((AUTO_SCROLL_EDGE - leftDist) / AUTO_SCROLL_EDGE) * AUTO_SCROLL_MAX,
          );
        } else if (rightDist < AUTO_SCROLL_EDGE && rightDist >= 0) {
          dx = Math.round(
            ((AUTO_SCROLL_EDGE - rightDist) / AUTO_SCROLL_EDGE) * AUTO_SCROLL_MAX,
          );
        }
        if (dx !== 0) board.scrollLeft += dx;
      }

      const state = dragRef.current;
      if (state && state.kind === "card" && state.target) {
        const colEl = columnDropElsRef.current.get(state.target.columnId);
        if (colEl) {
          const r = colEl.getBoundingClientRect();
          const topDist = y - r.top;
          const bottomDist = r.bottom - y;
          let dy = 0;
          if (topDist < AUTO_SCROLL_EDGE && topDist >= 0) {
            dy = -Math.round(
              ((AUTO_SCROLL_EDGE - topDist) / AUTO_SCROLL_EDGE) *
                AUTO_SCROLL_MAX,
            );
          } else if (bottomDist < AUTO_SCROLL_EDGE && bottomDist >= 0) {
            dy = Math.round(
              ((AUTO_SCROLL_EDGE - bottomDist) / AUTO_SCROLL_EDGE) *
                AUTO_SCROLL_MAX,
            );
          }
          if (dy !== 0) {
            const scroller =
              colEl.scrollHeight > colEl.clientHeight ? colEl : null;
            if (scroller) scroller.scrollTop += dy;
            else if (board) board.scrollTop += dy;
          }
        }
      }
    },
    [],
  );

  const startAutoScroll = useCallback(() => {
    const loop = () => {
      const state = dragRef.current;
      if (!state || !state.pointer) {
        autoScrollFrame.current = null;
        return;
      }
      tickAutoScroll(state.pointer.x, state.pointer.y);
      autoScrollFrame.current = requestAnimationFrame(loop);
    };
    if (autoScrollFrame.current === null) {
      autoScrollFrame.current = requestAnimationFrame(loop);
    }
  }, [tickAutoScroll]);

  // ---- pointer-event listeners (window-level) ----
  useEffect(() => {
    if (!drag) return;
    const onMove = (e: PointerEvent) => {
      const state = dragRef.current;
      if (!state) return;
      if (state.kind === "card") {
        const exclude = new Set(state.ids);
        const target = computeCardDropTarget(e.clientX, e.clientY, exclude);
        setDrag({
          ...state,
          pointer: { x: e.clientX, y: e.clientY },
          target,
        });
      } else if (state.kind === "column") {
        const target = computeColumnDropIndex(e.clientX, state.columnId);
        setDrag({
          ...state,
          pointer: { x: e.clientX, y: e.clientY },
          target,
        });
      }
      startAutoScroll();
    };
    const onUp = () => {
      const state = dragRef.current;
      stopAutoScroll();
      if (!state) {
        setDrag(null);
        return;
      }
      if (state.kind === "card" && state.target) {
        performCardDrop(state, state.target);
      } else if (state.kind === "column" && state.target !== null) {
        performColumnDrop(state, state.target);
      }
      setDrag(null);
    };
    const onCancel = () => {
      stopAutoScroll();
      setDrag(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        stopAutoScroll();
        setDrag(null);
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      window.removeEventListener("keydown", onKey);
    };
  }, [
    drag,
    computeCardDropTarget,
    computeColumnDropIndex,
    performCardDrop,
    performColumnDrop,
    startAutoScroll,
    stopAutoScroll,
  ]);

  useEffect(() => {
    return () => {
      stopAutoScroll();
      if (rejectTimer.current) clearTimeout(rejectTimer.current);
    };
  }, [stopAutoScroll]);

  // ---- pending-drag tracking (until threshold met) ----
  const pendingRef = useRef<{
    cardId: string;
    columnId: string;
    startX: number;
    startY: number;
    pointerId: number;
  } | null>(null);

  const startCardDrag = useCallback(
    (cardId: string, columnId: string, x: number, y: number, mode: DragMode) => {
      const loc = findCardLocation(cardId);
      if (!loc) return;
      // batch with selection if cardId is part of selection
      let ids = [cardId];
      if (selection.includes(cardId) && selection.length > 1) {
        // restrict to same source column for simplicity
        const sameCol = selection.filter((id) =>
          loc.column.cards.some((c) => c.id === id),
        );
        if (sameCol.length > 1) ids = sameCol;
      }
      const cardEl = cardElsRef.current.get(cardId);
      const cardRect = cardEl?.getBoundingClientRect() ?? null;
      const pointerOffset = cardRect
        ? { x: x - cardRect.left, y: y - cardRect.top }
        : { x: 0, y: 0 };
      const next: CardDragState = {
        kind: "card",
        primaryId: cardId,
        ids,
        sourceColumnId: columnId,
        sourceIndex: loc.index,
        pointer: { x, y },
        pointerOffset,
        cardRect: cardRect
          ? { width: cardRect.width, height: cardRect.height }
          : null,
        target: null,
        mode,
      };
      setDrag(next);
    },
    [findCardLocation, selection],
  );

  const startColumnDrag = useCallback(
    (columnId: string, x: number, y: number, mode: DragMode) => {
      const idx = columnsRef.current.findIndex((c) => c.id === columnId);
      if (idx === -1) return;
      const el = columnDropElsRef.current.get(columnId);
      const rect = el?.getBoundingClientRect() ?? null;
      const pointerOffset = rect
        ? { x: x - rect.left, y: y - rect.top }
        : { x: 0, y: 0 };
      const next: ColumnDragState = {
        kind: "column",
        columnId,
        sourceIndex: idx,
        pointer: { x, y },
        pointerOffset,
        columnRect: rect ? { width: rect.width, height: rect.height } : null,
        target: null,
        mode,
      };
      setDrag(next);
    },
    [],
  );

  const handlePendingMove = useCallback(
    (e: PointerEvent) => {
      const p = pendingRef.current;
      if (!p) return;
      const dx = e.clientX - p.startX;
      const dy = e.clientY - p.startY;
      if (Math.hypot(dx, dy) >= DRAG_THRESHOLD) {
        startCardDrag(p.cardId, p.columnId, e.clientX, e.clientY, "pointer");
        pendingRef.current = null;
        window.removeEventListener("pointermove", handlePendingMove);
        window.removeEventListener("pointerup", handlePendingUp);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [startCardDrag],
  );

  const handlePendingUp = useCallback(() => {
    pendingRef.current = null;
    window.removeEventListener("pointermove", handlePendingMove);
    window.removeEventListener("pointerup", handlePendingUp);
  }, [handlePendingMove]);

  const handlePendingColMove = useCallback(
    (e: PointerEvent) => {
      const p = pendingColRef.current;
      if (!p) return;
      const dx = e.clientX - p.startX;
      const dy = e.clientY - p.startY;
      if (Math.hypot(dx, dy) >= DRAG_THRESHOLD) {
        startColumnDrag(p.columnId, e.clientX, e.clientY, "pointer");
        pendingColRef.current = null;
        window.removeEventListener("pointermove", handlePendingColMove);
        window.removeEventListener("pointerup", handlePendingColUp);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [startColumnDrag],
  );

  const handlePendingColUp = useCallback(() => {
    pendingColRef.current = null;
    window.removeEventListener("pointermove", handlePendingColMove);
    window.removeEventListener("pointerup", handlePendingColUp);
  }, [handlePendingColMove]);

  const pendingColRef = useRef<{
    columnId: string;
    startX: number;
    startY: number;
  } | null>(null);

  const beginPendingCardDrag = useCallback(
    (cardId: string, columnId: string, e: React.PointerEvent<HTMLElement>) => {
      if (disabled) return;
      if (e.button !== 0) return;
      pendingRef.current = {
        cardId,
        columnId,
        startX: e.clientX,
        startY: e.clientY,
        pointerId: e.pointerId,
      };
      window.addEventListener("pointermove", handlePendingMove);
      window.addEventListener("pointerup", handlePendingUp);
    },
    [disabled, handlePendingMove, handlePendingUp],
  );

  const beginPendingColumnDrag = useCallback(
    (columnId: string, e: React.PointerEvent<HTMLElement>) => {
      if (disabled || !columnReorderable) return;
      if (e.button !== 0) return;
      pendingColRef.current = {
        columnId,
        startX: e.clientX,
        startY: e.clientY,
      };
      window.addEventListener("pointermove", handlePendingColMove);
      window.addEventListener("pointerup", handlePendingColUp);
    },
    [columnReorderable, disabled, handlePendingColMove, handlePendingColUp],
  );

  // ---- keyboard drag ----
  const handleCardKeyDown = useCallback(
    (cardId: string, columnId: string, e: React.KeyboardEvent<HTMLElement>) => {
      if (disabled) return;
      const active = dragRef.current;
      const isActiveForThis =
        active?.kind === "card" && active.primaryId === cardId;

      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        if (!isActiveForThis) {
          const loc = findCardLocation(cardId);
          if (!loc) return;
          const cardEl = cardElsRef.current.get(cardId);
          const rect = cardEl?.getBoundingClientRect() ?? null;
          let ids = [cardId];
          if (selection.includes(cardId) && selection.length > 1) {
            const sameCol = selection.filter((id) =>
              loc.column.cards.some((c) => c.id === id),
            );
            if (sameCol.length > 1) ids = sameCol;
          }
          setDrag({
            kind: "card",
            primaryId: cardId,
            ids,
            sourceColumnId: columnId,
            sourceIndex: loc.index,
            pointer: null,
            pointerOffset: { x: 0, y: 0 },
            cardRect: rect
              ? { width: rect.width, height: rect.height }
              : null,
            target: { columnId, index: loc.index },
            mode: "keyboard",
          });
        } else {
          if (active.target) performCardDrop(active, active.target);
          setDrag(null);
        }
        return;
      }
      if (!isActiveForThis) return;
      const cols = columnsRef.current;
      const target = active.target ?? {
        columnId,
        index: active.sourceIndex,
      };
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setDrag({
          ...active,
          target: { columnId: target.columnId, index: Math.max(0, target.index - 1) },
        });
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        const col = cols.find((c) => c.id === target.columnId);
        const max = col ? col.cards.length : 0;
        setDrag({
          ...active,
          target: { columnId: target.columnId, index: Math.min(max, target.index + 1) },
        });
      } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        const idx = cols.findIndex((c) => c.id === target.columnId);
        if (idx === -1) return;
        const nextIdx =
          e.key === "ArrowLeft"
            ? Math.max(0, idx - 1)
            : Math.min(cols.length - 1, idx + 1);
        const nextCol = cols[nextIdx];
        if (!nextCol) return;
        setDrag({
          ...active,
          target: {
            columnId: nextCol.id,
            index: Math.min(nextCol.cards.length, target.index),
          },
        });
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (active.target) performCardDrop(active, active.target);
        setDrag(null);
      } else if (e.key === "Escape") {
        e.preventDefault();
        setDrag(null);
      }
    },
    [disabled, findCardLocation, performCardDrop, selection],
  );

  const handleColumnKeyDown = useCallback(
    (columnId: string, e: React.KeyboardEvent<HTMLElement>) => {
      if (disabled || !columnReorderable) return;
      const active = dragRef.current;
      const isActiveForThis =
        active?.kind === "column" && active.columnId === columnId;
      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        if (!isActiveForThis) {
          const idx = columnsRef.current.findIndex((c) => c.id === columnId);
          if (idx === -1) return;
          const el = columnDropElsRef.current.get(columnId);
          const rect = el?.getBoundingClientRect() ?? null;
          setDrag({
            kind: "column",
            columnId,
            sourceIndex: idx,
            pointer: null,
            pointerOffset: { x: 0, y: 0 },
            columnRect: rect ? { width: rect.width, height: rect.height } : null,
            target: idx,
            mode: "keyboard",
          });
        } else {
          if (active.target !== null) performColumnDrop(active, active.target);
          setDrag(null);
        }
      } else if (
        isActiveForThis &&
        (e.key === "ArrowLeft" || e.key === "ArrowRight")
      ) {
        e.preventDefault();
        const cols = columnsRef.current;
        const t = active.target ?? active.sourceIndex;
        const next =
          e.key === "ArrowLeft"
            ? Math.max(0, t - 1)
            : Math.min(cols.length - 1, t + 1);
        setDrag({ ...active, target: next });
      } else if (isActiveForThis && e.key === "Enter") {
        e.preventDefault();
        if (active.target !== null) performColumnDrop(active, active.target);
        setDrag(null);
      } else if (isActiveForThis && e.key === "Escape") {
        e.preventDefault();
        setDrag(null);
      }
    },
    [columnReorderable, disabled, performColumnDrop],
  );

  // ---- prop generators ----
  const getBoardProps = useCallback<UseKanbanResult<TData>["getBoardProps"]>(
    () => ({
      ref: (el: HTMLElement | null) => {
        boardElRef.current = el;
      },
    }),
    [],
  );

  const getCardProps = useCallback<UseKanbanResult<TData>["getCardProps"]>(
    (cardId, columnId) => {
      const isDragging =
        drag?.kind === "card" && drag.ids.includes(cardId);
      const result: CardProps = {
        ref: (el: HTMLElement | null) => {
          if (el) cardElsRef.current.set(cardId, el);
          else cardElsRef.current.delete(cardId);
        },
        role: "button",
        tabIndex: 0,
        "data-card-id": cardId,
        "data-column-id": columnId,
        "aria-roledescription": "draggable card",
        onPointerDown: (e) => {
          if (e.target instanceof HTMLElement) {
            const t = e.target as HTMLElement;
            if (t.closest("[data-rkb-no-drag]")) return;
          }
          beginPendingCardDrag(cardId, columnId, e);
        },
        onKeyDown: (e) => handleCardKeyDown(cardId, columnId, e),
        onClick: (e) => {
          if (e.shiftKey) {
            e.preventDefault();
            toggleSelect(cardId, "range");
          } else if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            toggleSelect(cardId, "toggle");
          }
        },
        onFocus: () => {
          // no-op; consumers can hook into events as they want
        },
      };
      if (isDragging) result["data-dragging"] = "true";
      if (selection.includes(cardId)) result["data-selected"] = "true";
      if (isDragging) result["aria-grabbed"] = true;
      return result;
    },
    [
      beginPendingCardDrag,
      drag,
      handleCardKeyDown,
      selection,
      toggleSelect,
    ],
  );

  const getColumnDropProps = useCallback<
    UseKanbanResult<TData>["getColumnDropProps"]
  >(
    (columnId) => {
      const result: ColumnDropProps = {
        ref: (el: HTMLElement | null) => {
          if (el) columnDropElsRef.current.set(columnId, el);
          else columnDropElsRef.current.delete(columnId);
        },
        "data-column-id": columnId,
      };
      if (drag?.kind === "card" && drag.target?.columnId === columnId) {
        result["data-drag-over"] = "true";
      }
      if (rejectedColumn === columnId) {
        result["data-drop-rejected"] = "true";
      }
      return result;
    },
    [drag, rejectedColumn],
  );

  const getColumnHandleProps = useCallback<
    UseKanbanResult<TData>["getColumnHandleProps"]
  >(
    (columnId) => {
      const isDragging =
        drag?.kind === "column" && drag.columnId === columnId;
      const result: ColumnHandleProps = {
        ref: (el: HTMLElement | null) => {
          if (el) columnHandleElsRef.current.set(columnId, el);
          else columnHandleElsRef.current.delete(columnId);
        },
        role: "button",
        tabIndex: columnReorderable ? 0 : -1,
        "data-column-id": columnId,
        "aria-roledescription": columnReorderable
          ? "draggable column"
          : undefined,
        onPointerDown: (e) => {
          if (!columnReorderable) return;
          if (e.target instanceof HTMLElement) {
            const t = e.target as HTMLElement;
            if (t.closest("[data-rkb-no-drag]")) return;
          }
          beginPendingColumnDrag(columnId, e);
        },
        onKeyDown: (e) => handleColumnKeyDown(columnId, e),
      };
      if (isDragging) {
        result["data-column-dragging"] = "true";
        result["aria-grabbed"] = true;
      }
      return result;
    },
    [
      beginPendingColumnDrag,
      columnReorderable,
      drag,
      handleColumnKeyDown,
    ],
  );

  const addCard = useCallback<UseKanbanResult<TData>["addCard"]>(
    (contentOrCard, columnId) => {
      const partial: Partial<KanbanCard<TData>> =
        typeof contentOrCard === "string"
          ? { content: contentOrCard }
          : contentOrCard;
      const newCard: KanbanCard<TData> = {
        id: partial.id ?? genId("card"),
        content: partial.content ?? "",
        ...(partial.description !== undefined && {
          description: partial.description,
        }),
        ...(partial.label !== undefined && { label: partial.label }),
        ...(partial.priority !== undefined && { priority: partial.priority }),
        ...(partial.assignees !== undefined && { assignees: partial.assignees }),
        ...(partial.dueDate !== undefined && { dueDate: partial.dueDate }),
        ...(partial.tags !== undefined && { tags: partial.tags }),
        ...(partial.checklist !== undefined && {
          checklist: partial.checklist,
        }),
        ...(partial.attachments !== undefined && {
          attachments: partial.attachments,
        }),
        ...(partial.comments !== undefined && { comments: partial.comments }),
        ...(partial.cover !== undefined && { cover: partial.cover }),
        ...(partial.data !== undefined && { data: partial.data }),
      };
      setColumns((prev) =>
        prev.map((col) => {
          if (col.id !== columnId) return col;
          return {
            ...col,
            cards:
              addCardPosition === "top"
                ? [newCard, ...col.cards]
                : [...col.cards, newCard],
          };
        }),
      );
      onCardAdd?.(newCard, columnId);
    },
    [addCardPosition, onCardAdd, setColumns],
  );

  const removeCard = useCallback<UseKanbanResult<TData>["removeCard"]>(
    (cardId, columnId) => {
      let removed: KanbanCard<TData> | undefined;
      setColumns((prev) =>
        prev.map((col) => {
          if (col.id !== columnId) return col;
          const card = col.cards.find((c) => c.id === cardId);
          if (card) removed = card;
          return { ...col, cards: col.cards.filter((c) => c.id !== cardId) };
        }),
      );
      if (removed) onCardRemove?.(removed, columnId);
      setSelectionWithCb((prev) => prev.filter((id) => id !== cardId));
    },
    [onCardRemove, setColumns, setSelectionWithCb],
  );

  const moveCard = useCallback<UseKanbanResult<TData>["moveCard"]>(
    (cardId, fromColumnId, toColumnId, toIndex) => {
      const cols = columnsRef.current;
      const src = cols.find((c) => c.id === fromColumnId);
      const dst = cols.find((c) => c.id === toColumnId);
      if (!src || !dst) return;
      const card = src.cards.find((c) => c.id === cardId);
      if (!card) return;
      performCardDrop(
        {
          kind: "card",
          primaryId: cardId,
          ids: [cardId],
          sourceColumnId: fromColumnId,
          sourceIndex: src.cards.findIndex((c) => c.id === cardId),
          pointer: null,
          pointerOffset: { x: 0, y: 0 },
          cardRect: null,
          target: { columnId: toColumnId, index: toIndex ?? dst.cards.length },
          mode: "keyboard",
        },
        { columnId: toColumnId, index: toIndex ?? dst.cards.length },
      );
    },
    [performCardDrop],
  );

  const reorderColumn = useCallback<UseKanbanResult<TData>["reorderColumn"]>(
    (columnId, toIndex) => {
      const idx = columnsRef.current.findIndex((c) => c.id === columnId);
      if (idx === -1) return;
      performColumnDrop(
        {
          kind: "column",
          columnId,
          sourceIndex: idx,
          pointer: null,
          pointerOffset: { x: 0, y: 0 },
          columnRect: null,
          target: toIndex,
          mode: "keyboard",
        },
        toIndex,
      );
    },
    [performColumnDrop],
  );

  // Suppress unused-var warning for useLayoutEffect import (kept for downstream use in styled component)
  void useLayoutEffect;
  void useMemo;

  return {
    columns,
    setColumns,
    drag,
    rejectedColumn,
    selection,
    toggleSelect,
    clearSelection,
    isSelected,
    getBoardProps,
    getCardProps,
    getColumnDropProps,
    getColumnHandleProps,
    addCard,
    removeCard,
    moveCard,
    reorderColumn,
    cancelDrag,
  };
}
