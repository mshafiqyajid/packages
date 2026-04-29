import { useState, useCallback, useRef } from "react";

export interface KanbanCard {
  id: string;
  content: string;
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
  getDragProps: (cardId: string, columnId: string) => DragProps;
  getDropProps: (columnId: string) => DropProps;
  dragging: string | null;
  dragOver: string | null;
}

interface DragPayload {
  cardId: string;
  sourceColumnId: string;
}

export function useKanban({
  columns: initialColumns,
  onChange,
  disabled = false,
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

          const cardIdx = srcCol.cards.findIndex((c) => c.id === cardId);
          if (cardIdx === -1) return prev;

          const [card] = srcCol.cards.splice(cardIdx, 1);
          if (card === undefined) return prev;
          dstCol.cards.push(card);

          onChange?.(next);
          return next;
        });
      },
    }),
    [disabled, onChange],
  );

  return { columns, getDragProps, getDropProps, dragging, dragOver };
}
