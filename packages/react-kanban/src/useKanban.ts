import { useState, useCallback, useRef } from "react";
import type React from "react";

export interface KanbanCard<TData = unknown> {
  id: string;
  content: string;
  description?: string;
  label?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  data?: TData;
}

export interface KanbanColumn<TData = unknown> {
  id: string;
  title: string;
  cards: KanbanCard<TData>[];
  wipLimit?: number;
  wipWarnThreshold?: number;
}

export type DropRejectReason = "canDrop" | "limit";

export interface UseKanbanOptions<TData = unknown> {
  columns: KanbanColumn<TData>[];
  onChange?: (columns: KanbanColumn<TData>[]) => void;
  disabled?: boolean;
  onCardAdd?: (card: KanbanCard<TData>, columnId: string) => void;
  onCardRemove?: (card: KanbanCard<TData>, columnId: string) => void;
  onCardMove?: (
    card: KanbanCard<TData>,
    fromColumnId: string,
    toColumnId: string,
    toIndex?: number,
  ) => void;
  onCardReorder?: (
    card: KanbanCard<TData>,
    columnId: string,
    fromIndex: number,
    toIndex: number,
  ) => void;
  canDrop?: (
    card: KanbanCard<TData>,
    fromColumnId: string,
    toColumnId: string,
    toIndex?: number,
  ) => boolean;
  onDropRejected?: (
    card: KanbanCard<TData>,
    fromColumnId: string,
    toColumnId: string,
    reason: DropRejectReason,
  ) => void;
  maxCardsPerColumn?: number;
  reorderable?: boolean;
}

export interface DragProps {
  draggable: boolean;
  "data-card-id": string;
  "data-column-id": string;
  onDragStart: (e: React.DragEvent<HTMLElement>) => void;
  onDragEnd: (e: React.DragEvent<HTMLElement>) => void;
}

export interface DropProps {
  "data-column-id": string;
  onDragOver: (e: React.DragEvent<HTMLElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLElement>) => void;
  onDrop: (e: React.DragEvent<HTMLElement>) => void;
}

export interface UseKanbanResult<TData = unknown> {
  columns: KanbanColumn<TData>[];
  setColumns: React.Dispatch<React.SetStateAction<KanbanColumn<TData>[]>>;
  getDragProps: (cardId: string, columnId: string) => DragProps;
  getDropProps: (columnId: string) => DropProps;
  dragging: string | null;
  dragOver: string | null;
  dragOverIndex: number | null;
  rejectedColumn: string | null;
  addCard: (content: string, columnId: string) => void;
  removeCard: (cardId: string, columnId: string) => void;
}

interface DragPayload<TData> {
  cardId: string;
  sourceColumnId: string;
  card: KanbanCard<TData>;
  sourceIndex: number;
}

function effectiveLimit<TData>(
  col: KanbanColumn<TData>,
  globalCap: number | undefined,
): number | undefined {
  if (col.wipLimit !== undefined) return col.wipLimit;
  return globalCap;
}

function computeDropIndex(
  container: HTMLElement,
  clientY: number,
  excludeCardId: string | null,
): number {
  const cards = Array.from(
    container.querySelectorAll<HTMLElement>("[data-card-id]"),
  );
  let idx = 0;
  for (const el of cards) {
    if (excludeCardId !== null && el.dataset.cardId === excludeCardId) continue;
    const rect = el.getBoundingClientRect();
    if (rect.height === 0 && rect.top === 0) {
      idx++;
      continue;
    }
    const mid = rect.top + rect.height / 2;
    if (clientY < mid) return idx;
    idx++;
  }
  return idx;
}

export function useKanban<TData = unknown>({
  columns: initialColumns,
  onChange,
  disabled = false,
  onCardAdd,
  onCardRemove,
  onCardMove,
  onCardReorder,
  canDrop,
  onDropRejected,
  maxCardsPerColumn,
  reorderable = false,
}: UseKanbanOptions<TData>): UseKanbanResult<TData> {
  const [columns, setColumns] = useState<KanbanColumn<TData>[]>(initialColumns);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [rejectedColumn, setRejectedColumn] = useState<string | null>(null);

  const dragPayload = useRef<DragPayload<TData> | null>(null);
  const rejectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flashRejected = useCallback((columnId: string) => {
    setRejectedColumn(columnId);
    if (rejectTimer.current) clearTimeout(rejectTimer.current);
    rejectTimer.current = setTimeout(() => setRejectedColumn(null), 600);
  }, []);

  const getDragProps = useCallback(
    (cardId: string, columnId: string): DragProps => ({
      draggable: !disabled,
      "data-card-id": cardId,
      "data-column-id": columnId,
      onDragStart(e) {
        if (disabled) {
          e.preventDefault();
          return;
        }
        const sourceCol = columns.find((c) => c.id === columnId);
        const sourceIndex = sourceCol?.cards.findIndex((c) => c.id === cardId) ?? -1;
        const card = sourceCol?.cards[sourceIndex];
        if (!card || sourceIndex < 0) {
          e.preventDefault();
          return;
        }
        dragPayload.current = {
          cardId,
          sourceColumnId: columnId,
          card,
          sourceIndex,
        };
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", cardId);
        setDragging(cardId);
      },
      onDragEnd() {
        dragPayload.current = null;
        setDragging(null);
        setDragOver(null);
        setDragOverIndex(null);
      },
    }),
    [disabled, columns],
  );

  const getDropProps = useCallback(
    (columnId: string): DropProps => ({
      "data-column-id": columnId,
      onDragOver(e) {
        if (disabled || !dragPayload.current) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setDragOver(columnId);

        const target = e.currentTarget as HTMLElement;
        const sameCol = dragPayload.current.sourceColumnId === columnId;
        const exclude = sameCol ? dragPayload.current.cardId : null;
        const idx = computeDropIndex(target, e.clientY, exclude);
        setDragOverIndex(idx);
      },
      onDragLeave(e) {
        const target = e.currentTarget as HTMLElement;
        const related = e.relatedTarget as Node | null;
        if (related && target.contains(related)) return;
        setDragOver((prev) => (prev === columnId ? null : prev));
        setDragOverIndex(null);
      },
      onDrop(e) {
        e.preventDefault();
        if (disabled || !dragPayload.current) return;

        const payload = dragPayload.current;
        const { cardId, sourceColumnId, card } = payload;

        const target = e.currentTarget as HTMLElement;
        const sameCol = sourceColumnId === columnId;
        const exclude = sameCol ? cardId : null;
        const targetIndex = computeDropIndex(target, e.clientY, exclude);

        dragPayload.current = null;
        setDragging(null);
        setDragOver(null);
        setDragOverIndex(null);

        if (sameCol && !reorderable) return;

        if (canDrop && !canDrop(card, sourceColumnId, columnId, targetIndex)) {
          flashRejected(columnId);
          onDropRejected?.(card, sourceColumnId, columnId, "canDrop");
          return;
        }

        setColumns((prev) => {
          const next = prev.map((col) => ({ ...col, cards: [...col.cards] }));

          const srcCol = next.find((c) => c.id === sourceColumnId);
          const dstCol = next.find((c) => c.id === columnId);
          if (!srcCol || !dstCol) return prev;

          const cardIdx = srcCol.cards.findIndex((c) => c.id === cardId);
          if (cardIdx === -1) return prev;

          if (sameCol) {
            if (targetIndex === cardIdx) return prev;

            const [moved] = srcCol.cards.splice(cardIdx, 1);
            if (moved === undefined) return prev;
            srcCol.cards.splice(targetIndex, 0, moved);

            onChange?.(next);
            onCardReorder?.(moved, columnId, cardIdx, targetIndex);
            return next;
          }

          const cap = effectiveLimit(dstCol, maxCardsPerColumn);
          if (cap !== undefined && dstCol.cards.length >= cap) {
            queueMicrotask(() => {
              flashRejected(columnId);
              onDropRejected?.(card, sourceColumnId, columnId, "limit");
            });
            return prev;
          }

          const [moved] = srcCol.cards.splice(cardIdx, 1);
          if (moved === undefined) return prev;
          const insertAt = Math.min(targetIndex, dstCol.cards.length);
          dstCol.cards.splice(insertAt, 0, moved);

          onChange?.(next);
          onCardMove?.(moved, sourceColumnId, columnId, insertAt);
          return next;
        });
      },
    }),
    [
      disabled,
      reorderable,
      canDrop,
      onDropRejected,
      onChange,
      onCardMove,
      onCardReorder,
      maxCardsPerColumn,
      flashRejected,
    ],
  );

  const addCard = useCallback(
    (content: string, columnId: string) => {
      const newCard: KanbanCard<TData> = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        content,
      };
      setColumns((prev) => {
        const next = prev.map((col) => {
          if (col.id !== columnId) return col;
          return { ...col, cards: [...col.cards, newCard] };
        });
        onChange?.(next);
        return next;
      });
      onCardAdd?.(newCard, columnId);
    },
    [onChange, onCardAdd],
  );

  const removeCard = useCallback(
    (cardId: string, columnId: string) => {
      let removedCard: KanbanCard<TData> | undefined;
      setColumns((prev) => {
        const next = prev.map((col) => {
          if (col.id !== columnId) return col;
          const card = col.cards.find((c) => c.id === cardId);
          if (card) removedCard = card;
          return { ...col, cards: col.cards.filter((c) => c.id !== cardId) };
        });
        onChange?.(next);
        return next;
      });
      if (removedCard) onCardRemove?.(removedCard, columnId);
    },
    [onChange, onCardRemove],
  );

  return {
    columns,
    setColumns,
    getDragProps,
    getDropProps,
    dragging,
    dragOver,
    dragOverIndex,
    rejectedColumn,
    addCard,
    removeCard,
  };
}
