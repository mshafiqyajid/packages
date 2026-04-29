import { forwardRef, useState, type ReactNode, type CSSProperties } from "react";
import { useKanban } from "../useKanban";
import type { KanbanColumn, KanbanCard } from "../useKanban";

export type KanbanSize = "sm" | "md" | "lg";
export type KanbanTone = "neutral" | "primary";

export interface KanbanStyledProps {
  columns: KanbanColumn[];
  onChange?: (columns: KanbanColumn[]) => void;
  disabled?: boolean;
  size?: KanbanSize;
  tone?: KanbanTone;
  columnMinWidth?: string;
  maxColumns?: number;
  renderCard?: (card: KanbanCard, column: KanbanColumn) => ReactNode;
  renderColumnHeader?: (column: KanbanColumn) => ReactNode;
  addCardPlaceholder?: string;
  className?: string;
  onCardAdd?: (card: KanbanCard, columnId: string) => void;
  onCardRemove?: (card: KanbanCard, columnId: string) => void;
  onCardMove?: (card: KanbanCard, fromColumnId: string, toColumnId: string) => void;
  onColumnAdd?: (column: KanbanColumn) => void;
  addColumnPlaceholder?: string;
  maxCardsPerColumn?: number;
  cardDraggable?: boolean | ((card: KanbanCard, column: KanbanColumn) => boolean);
  collapsible?: boolean;
}

export const KanbanStyled = forwardRef<HTMLDivElement, KanbanStyledProps>(
  function KanbanStyled(
    {
      columns: columnsProp,
      onChange,
      disabled = false,
      size = "md",
      tone = "neutral",
      columnMinWidth = "240px",
      maxColumns,
      renderCard,
      renderColumnHeader,
      addCardPlaceholder,
      className,
      onCardAdd,
      onCardRemove,
      onCardMove,
      onColumnAdd,
      addColumnPlaceholder,
      maxCardsPerColumn,
      cardDraggable,
      collapsible = false,
    },
    ref,
  ) {
    const { columns, setColumns, getDragProps, getDropProps, dragging, dragOver } =
      useKanban({ columns: columnsProp, onChange, disabled, onCardAdd, onCardRemove, onCardMove, maxCardsPerColumn });

    const [collapsedColumns, setCollapsedColumns] = useState<Set<string>>(new Set());

    const toggleCollapse = (colId: string) => {
      setCollapsedColumns((prev) => {
        const next = new Set(prev);
        if (next.has(colId)) {
          next.delete(colId);
        } else {
          next.add(colId);
        }
        return next;
      });
    };

    const visibleColumns =
      maxColumns !== undefined ? columns.slice(0, maxColumns) : columns;

    const columnCount = visibleColumns.length + (addColumnPlaceholder !== undefined ? 1 : 0);

    const boardStyle: CSSProperties = {
      gridTemplateColumns: `repeat(${columnCount}, minmax(${columnMinWidth}, 1fr))`,
      minWidth: `calc(${columnCount} * (${columnMinWidth} + var(--rkb-gap, 12px)))`,
    };

    const handleAddColumn = () => {
      const newCol: KanbanColumn = {
        id: Date.now().toString(),
        title: addColumnPlaceholder ?? "New Column",
        cards: [],
      };
      const next = [...columns, newCol];
      setColumns(next);
      onChange?.(next);
      onColumnAdd?.(newCol);
    };

    return (
      <div ref={ref} className={["rkb-wrap", className].filter(Boolean).join(" ")}>
      <div
        className="rkb-board"
        data-size={size}
        data-tone={tone}
        data-disabled={disabled ? "true" : undefined}
        style={boardStyle}
        role="region"
        aria-label="Kanban board"
      >
        {visibleColumns.map((col) => {
          const dropProps = getDropProps(col.id);
          const isOver = dragOver === col.id;
          const isCollapsed = collapsedColumns.has(col.id);
          const atMax = maxCardsPerColumn !== undefined && col.cards.length >= maxCardsPerColumn;

          return (
            <div
              key={col.id}
              className="rkb-column"
              data-drag-over={isOver ? "true" : undefined}
              data-at-max={atMax ? "true" : undefined}
              data-collapsed={isCollapsed ? "true" : undefined}
              {...dropProps}
            >
              <div className="rkb-column-header">
                {renderColumnHeader ? (
                  renderColumnHeader(col)
                ) : (
                  <>
                    <span className="rkb-column-title">{col.title}</span>
                    <span className="rkb-column-badge" aria-label={`${col.cards.length} cards`}>
                      {col.cards.length}
                    </span>
                  </>
                )}
                {collapsible && (
                  <button
                    type="button"
                    className="rkb-column-collapse-btn"
                    aria-label={isCollapsed ? "Expand column" : "Collapse column"}
                    onClick={() => toggleCollapse(col.id)}
                  >
                    {isCollapsed ? "▶" : "▼"}
                  </button>
                )}
              </div>

              <div className="rkb-cards">
                {col.cards.map((card) => {
                  const isDraggable =
                    cardDraggable === undefined
                      ? true
                      : typeof cardDraggable === "boolean"
                        ? cardDraggable
                        : cardDraggable(card, col);
                  const dragProps = getDragProps(card.id, col.id);
                  const isDragging = dragging === card.id;

                  return (
                    <div
                      key={card.id}
                      className="rkb-card"
                      data-dragging={isDragging ? "true" : undefined}
                      {...dragProps}
                      draggable={isDraggable && !disabled}
                    >
                      <span className="rkb-card-handle" aria-hidden="true">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="currentColor"
                          aria-hidden="true"
                          focusable="false"
                        >
                          <circle cx="4" cy="2" r="1.25" />
                          <circle cx="8" cy="2" r="1.25" />
                          <circle cx="4" cy="6" r="1.25" />
                          <circle cx="8" cy="6" r="1.25" />
                          <circle cx="4" cy="10" r="1.25" />
                          <circle cx="8" cy="10" r="1.25" />
                        </svg>
                      </span>
                      <span className="rkb-card-content">
                        {renderCard ? (
                          renderCard(card, col)
                        ) : (
                          <>
                            {card.content}
                            {card.description && (
                              <span className="rkb-card-desc">{card.description}</span>
                            )}
                            {(card.label || card.priority) && (
                              <span style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                                {card.label && (
                                  <span className="rkb-card-label">{card.label}</span>
                                )}
                                {card.priority && (
                                  <span
                                    className="rkb-card-priority"
                                    data-priority={card.priority}
                                    aria-label={`Priority: ${card.priority}`}
                                  />
                                )}
                              </span>
                            )}
                          </>
                        )}
                      </span>
                    </div>
                  );
                })}

                {addCardPlaceholder !== undefined && !atMax && (
                  <div className="rkb-add-card" aria-label={addCardPlaceholder}>
                    <span className="rkb-add-card-icon" aria-hidden="true">+</span>
                    <span className="rkb-add-card-label">{addCardPlaceholder}</span>
                  </div>
                )}

                {col.cards.length === 0 && addCardPlaceholder === undefined && (
                  <div className="rkb-empty" aria-label="Empty column">
                    <span className="rkb-empty-label">Drop cards here</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {addColumnPlaceholder !== undefined && (
          <button
            type="button"
            className="rkb-add-column"
            onClick={handleAddColumn}
          >
            <span aria-hidden="true">+</span>
            {addColumnPlaceholder}
          </button>
        )}
      </div>
      </div>
    );
  },
);
