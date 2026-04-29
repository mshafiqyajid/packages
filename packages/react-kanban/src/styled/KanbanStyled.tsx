import { forwardRef, type ReactNode, type CSSProperties } from "react";
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
    },
    ref,
  ) {
    const { columns, getDragProps, getDropProps, dragging, dragOver } =
      useKanban({ columns: columnsProp, onChange, disabled });

    const visibleColumns =
      maxColumns !== undefined ? columns.slice(0, maxColumns) : columns;

    const boardStyle: CSSProperties = {
      gridTemplateColumns: `repeat(${visibleColumns.length}, minmax(${columnMinWidth}, 1fr))`,
    };

    return (
      <div
        ref={ref}
        className={["rkb-board", className].filter(Boolean).join(" ")}
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

          return (
            <div
              key={col.id}
              className="rkb-column"
              data-drag-over={isOver ? "true" : undefined}
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
              </div>

              <div className="rkb-cards">
                {col.cards.map((card) => {
                  const dragProps = getDragProps(card.id, col.id);
                  const isDragging = dragging === card.id;

                  return (
                    <div
                      key={card.id}
                      className="rkb-card"
                      data-dragging={isDragging ? "true" : undefined}
                      {...dragProps}
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
                        {renderCard ? renderCard(card, col) : card.content}
                      </span>
                    </div>
                  );
                })}

                {addCardPlaceholder !== undefined && (
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
      </div>
    );
  },
);
