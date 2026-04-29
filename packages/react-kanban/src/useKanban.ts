import { useState, useCallback, useRef } from "react";
import type React from "react";

export interface KanbanCard {
  id: string;
  content: string;
  description?: string;
  label?: string;
  priority?: "low" | "medium" | "high" | "urgent";
}

export interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
}

export interface UseKanbanOptions {
  columns: KanbanColumn[];
  onChange?: (columns: KanbanColumn[]) => void;
  disabled?: boolean;
  onCardAdd?: (card: KanbanCard, columnId: string) => void;
  onCardRemove?: (card: KanbanCard, columnId: string) => void;
  onCardMove?: (card: KanbanCard, fromColumnId: string, toColumnId: string) => void;
  maxCardsPerColumn?: number;
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

export interface UseKanbanResult {
  columns: KanbanColumn[];
  setColumns: React.Dispatch<React.SetStateAction<KanbanColumn[]>>;
  getDragProps: (cardId: string, columnId: string) => DragProps;
  getDropProps: (columnId: string) => DropProps;
  dragging: string | null;
  dragOver: string | null;
  addCard: (content: string, columnId: string) => void;
  removeCard: (cardId: string, columnId: string) => void;
}

interface DragPayload {
  cardId: string;
  sourceColumnId: string;
}

export function useKanban({
  columns: initialColumns,
  onChange,
  disabled = false,
  onCardAdd,
  onCardRemove,
  onCardMove,
  maxCardsPerColumn,
}: UseKanbanOptions): UseKanbanResult {
  const [columns, setColumns] = useState<KanbanColumn[]>(initialColumns);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  const dragPayload = useRef<DragPayload | null>(null);

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
        dragPayload.current = { cardId, sourceColumnId: columnId };
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", cardId);
        setDragging(cardId);
      },
      onDragEnd() {
        dragPayload.current = null;
        setDragging(null);
        setDragOver(null);
      },
    }),
    [disabled],
  );

  const getDropProps = useCallback(
    (columnId: string): DropProps => ({
      "data-column-id": columnId,
      onDragOver(e) {
        if (disabled || !dragPayload.current) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setDragOver(columnId);
      },
      onDragLeave(e) {
        const target = e.currentTarget as HTMLElement;
        const related = e.relatedTarget as Node | null;
        if (related && target.contains(related)) return;
        setDragOver((prev) => (prev === columnId ? null : prev));
      },
      onDrop(e) {
        e.preventDefault();
        if (disabled || !dragPayload.current) return;

        const { cardId, sourceColumnId } = dragPayload.current;
        dragPayload.current = null;
        setDragging(null);
        setDragOver(null);

        if (sourceColumnId === columnId) return;

        setColumns((prev) => {
          const next = prev.map((col) => ({ ...col, cards: [...col.cards] }));

          const srcCol = next.find((c) => c.id === sourceColumnId);
          const dstCol = next.find((c) => c.id === columnId);
          if (!srcCol || !dstCol) return prev;

          if (maxCardsPerColumn !== undefined && dstCol.cards.length >= maxCardsPerColumn) {
            return prev;
          }

          const cardIdx = srcCol.cards.findIndex((c) => c.id === cardId);
          if (cardIdx === -1) return prev;

          const [card] = srcCol.cards.splice(cardIdx, 1);
          if (card === undefined) return prev;
          dstCol.cards.push(card);

          onChange?.(next);
          onCardMove?.(card, sourceColumnId, columnId);
          return next;
        });
      },
    }),
    [disabled, onChange, onCardMove, maxCardsPerColumn],
  );

  const addCard = useCallback(
    (content: string, columnId: string) => {
      const newCard: KanbanCard = { id: Date.now().toString(), content };
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
      let removedCard: KanbanCard | undefined;
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

  return { columns, setColumns, getDragProps, getDropProps, dragging, dragOver, addCard, removeCard };
}
