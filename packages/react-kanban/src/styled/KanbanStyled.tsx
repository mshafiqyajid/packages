import {
  forwardRef,
  useState,
  useRef,
  useEffect,
  type ReactNode,
  type ReactElement,
  type Ref,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { useKanban } from "../useKanban";
import type {
  KanbanColumn,
  KanbanCard,
  DropRejectReason,
} from "../useKanban";

export type KanbanSize = "sm" | "md" | "lg";
export type KanbanTone = "neutral" | "primary";

export interface KanbanCardAction<TData = unknown> {
  id: string;
  label: string;
  icon?: ReactNode;
  onAction: (card: KanbanCard<TData>, columnId: string) => void;
  show?: (card: KanbanCard<TData>, column: KanbanColumn<TData>) => boolean;
}

export interface KanbanStyledProps<TData = unknown> {
  columns: KanbanColumn<TData>[];
  onChange?: (columns: KanbanColumn<TData>[]) => void;
  disabled?: boolean;
  size?: KanbanSize;
  tone?: KanbanTone;
  columnMinWidth?: string;
  maxColumns?: number;
  renderCard?: (card: KanbanCard<TData>, column: KanbanColumn<TData>) => ReactNode;
  renderColumnHeader?: (column: KanbanColumn<TData>) => ReactNode;
  addCardPlaceholder?: string;
  className?: string;
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
  onColumnAdd?: (column: KanbanColumn<TData>) => void;
  onColumnRename?: (columnId: string, title: string) => void;
  onColumnRemove?: (column: KanbanColumn<TData>) => void;
  renameColumnInline?: boolean;
  addColumnPlaceholder?: string;
  maxCardsPerColumn?: number;
  cardDraggable?: boolean | ((card: KanbanCard<TData>, column: KanbanColumn<TData>) => boolean);
  collapsible?: boolean;
  reorderable?: boolean;
  showDropIndicator?: boolean;
  cardActions?: KanbanCardAction<TData>[];
  showCardRemoveButton?: boolean;
  showWipBadge?: boolean;
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
}

function wipState<TData>(
  col: KanbanColumn<TData>,
  globalCap: number | undefined,
): "ok" | "warn" | "over" | undefined {
  const limit = col.wipLimit ?? globalCap;
  const count = col.cards.length;
  if (limit !== undefined && count >= limit) return "over";
  if (col.wipWarnThreshold !== undefined && count >= col.wipWarnThreshold) return "warn";
  if (limit === undefined && col.wipWarnThreshold === undefined) return undefined;
  return "ok";
}

const KanbanStyledImpl = forwardRef<HTMLDivElement, KanbanStyledProps<unknown>>(
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
      onCardReorder,
      onColumnAdd,
      onColumnRename,
      onColumnRemove,
      renameColumnInline = false,
      addColumnPlaceholder,
      maxCardsPerColumn,
      cardDraggable,
      collapsible = false,
      reorderable = false,
      showDropIndicator = true,
      cardActions,
      showCardRemoveButton = false,
      showWipBadge = false,
      canDrop,
      onDropRejected,
    },
    ref,
  ) {
    const {
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
    } = useKanban({
      columns: columnsProp,
      onChange,
      disabled,
      onCardAdd,
      onCardRemove,
      onCardMove,
      onCardReorder,
      maxCardsPerColumn,
      reorderable,
      canDrop,
      onDropRejected,
    });

    const [collapsedColumns, setCollapsedColumns] = useState<Set<string>>(new Set());
    const [addingCardIn, setAddingCardIn] = useState<string | null>(null);
    const [newCardText, setNewCardText] = useState("");
    const [addingColumn, setAddingColumn] = useState(false);
    const [newColumnText, setNewColumnText] = useState("");
    const [renamingColumn, setRenamingColumn] = useState<string | null>(null);
    const [renameText, setRenameText] = useState("");
    const cardInputRef = useRef<HTMLInputElement>(null);
    const columnInputRef = useRef<HTMLInputElement>(null);
    const renameInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (addingCardIn) cardInputRef.current?.focus();
    }, [addingCardIn]);

    useEffect(() => {
      if (addingColumn) columnInputRef.current?.focus();
    }, [addingColumn]);

    useEffect(() => {
      if (renamingColumn) {
        renameInputRef.current?.focus();
        renameInputRef.current?.select();
      }
    }, [renamingColumn]);

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

    const showAddColumnSlot = addColumnPlaceholder !== undefined;
    const columnCount = visibleColumns.length + (showAddColumnSlot ? 1 : 0);

    const boardStyle: CSSProperties = {
      gridTemplateColumns: `repeat(${columnCount}, minmax(${columnMinWidth}, 1fr))`,
      minWidth: `calc(${columnCount} * (${columnMinWidth} + var(--rkb-gap, 12px)))`,
    };

    const commitAddCard = (columnId: string) => {
      const text = newCardText.trim();
      if (text) addCard(text, columnId);
      setNewCardText("");
      setAddingCardIn(null);
    };

    const commitAddColumn = () => {
      const title = newColumnText.trim();
      if (!title) {
        setAddingColumn(false);
        setNewColumnText("");
        return;
      }
      const newCol: KanbanColumn = {
        id: `col-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title,
        cards: [],
      };
      const next = [...columns, newCol];
      setColumns(next);
      onChange?.(next);
      onColumnAdd?.(newCol);
      setNewColumnText("");
      setAddingColumn(false);
    };

    const commitRename = (columnId: string) => {
      const title = renameText.trim();
      if (title) {
        const next = columns.map((c) =>
          c.id === columnId ? { ...c, title } : c,
        );
        setColumns(next);
        onChange?.(next);
        onColumnRename?.(columnId, title);
      }
      setRenamingColumn(null);
      setRenameText("");
    };

    const handleCardKeyDown = (e: KeyboardEvent<HTMLInputElement>, columnId: string) => {
      if (e.key === "Enter") {
        e.preventDefault();
        commitAddCard(columnId);
      } else if (e.key === "Escape") {
        e.preventDefault();
        setNewCardText("");
        setAddingCardIn(null);
      }
    };

    const handleColumnKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        commitAddColumn();
      } else if (e.key === "Escape") {
        e.preventDefault();
        setNewColumnText("");
        setAddingColumn(false);
      }
    };

    const handleRenameKeyDown = (e: KeyboardEvent<HTMLInputElement>, columnId: string) => {
      if (e.key === "Enter") {
        e.preventDefault();
        commitRename(columnId);
      } else if (e.key === "Escape") {
        e.preventDefault();
        setRenamingColumn(null);
        setRenameText("");
      }
    };

    const dragSourceColumnId = dragging
      ? (columns.find((c) => c.cards.some((card) => card.id === dragging))?.id ?? null)
      : null;

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
          const cap = col.wipLimit ?? maxCardsPerColumn;
          const atMax = cap !== undefined && col.cards.length >= cap;
          const wip = wipState(col, maxCardsPerColumn);
          const isRejected = rejectedColumn === col.id;
          const isSameColumnDrag = isOver && dragSourceColumnId === col.id;
          const draggingIndexInCol =
            isSameColumnDrag && dragging
              ? col.cards.findIndex((c) => c.id === dragging)
              : -1;

          let indicatorAt: number | null = null;
          if (showDropIndicator && isOver && dragOverIndex !== null) {
            if (isSameColumnDrag) {
              if (dragOverIndex !== draggingIndexInCol) {
                indicatorAt =
                  dragOverIndex < draggingIndexInCol
                    ? dragOverIndex
                    : dragOverIndex + 1;
              }
            } else {
              indicatorAt = Math.min(dragOverIndex, col.cards.length);
            }
          }

          return (
            <div
              key={col.id}
              className="rkb-column"
              data-drag-over={isOver ? "true" : undefined}
              data-at-max={atMax ? "true" : undefined}
              data-collapsed={isCollapsed ? "true" : undefined}
              data-wip-state={wip}
              data-drop-rejected={isRejected ? "true" : undefined}
              data-renaming={renamingColumn === col.id ? "true" : undefined}
              {...dropProps}
            >
              <div className="rkb-column-header">
                {renderColumnHeader ? (
                  renderColumnHeader(col)
                ) : renamingColumn === col.id ? (
                  <input
                    ref={renameInputRef}
                    className="rkb-column-rename-input"
                    value={renameText}
                    onChange={(e) => setRenameText(e.target.value)}
                    onBlur={() => commitRename(col.id)}
                    onKeyDown={(e) => handleRenameKeyDown(e, col.id)}
                    aria-label="Column title"
                  />
                ) : (
                  <>
                    <span
                      className="rkb-column-title"
                      onDoubleClick={
                        renameColumnInline && !disabled
                          ? () => {
                              setRenameText(col.title);
                              setRenamingColumn(col.id);
                            }
                          : undefined
                      }
                    >
                      {col.title}
                    </span>
                    {showWipBadge && (col.wipLimit !== undefined || maxCardsPerColumn !== undefined) ? (
                      <span
                        className="rkb-column-badge"
                        data-wip-state={wip}
                        aria-label={`${col.cards.length} of ${col.wipLimit ?? maxCardsPerColumn} cards`}
                      >
                        {col.cards.length} / {col.wipLimit ?? maxCardsPerColumn}
                      </span>
                    ) : (
                      <span className="rkb-column-badge" aria-label={`${col.cards.length} cards`}>
                        {col.cards.length}
                      </span>
                    )}
                  </>
                )}
                <span className="rkb-column-actions">
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
                  {onColumnRemove && !disabled && renamingColumn !== col.id && (
                    <button
                      type="button"
                      className="rkb-column-remove-btn"
                      aria-label={`Remove column ${col.title}`}
                      onClick={() => {
                        const next = columns.filter((c) => c.id !== col.id);
                        setColumns(next);
                        onChange?.(next);
                        onColumnRemove(col);
                      }}
                    >
                      ×
                    </button>
                  )}
                </span>
              </div>

              <div className="rkb-cards">
                {col.cards.map((card, idx) => {
                  const isDraggable =
                    cardDraggable === undefined
                      ? true
                      : typeof cardDraggable === "boolean"
                        ? cardDraggable
                        : cardDraggable(card, col);
                  const dragProps = getDragProps(card.id, col.id);
                  const isDragging = dragging === card.id;

                  const showIndicatorBefore = indicatorAt === idx;

                  const visibleActions = cardActions?.filter(
                    (a) => !a.show || a.show(card, col),
                  );
                  const hasActions =
                    !disabled &&
                    ((visibleActions && visibleActions.length > 0) || showCardRemoveButton);

                  return (
                    <div key={card.id} className="rkb-card-slot">
                      {showIndicatorBefore && (
                        <div className="rkb-drop-indicator" aria-hidden="true" />
                      )}
                      <div
                        className="rkb-card"
                        data-dragging={isDragging ? "true" : undefined}
                        data-priority={card.priority}
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
                        {hasActions && (
                          <span className="rkb-card-actions" aria-hidden={false}>
                            {visibleActions?.map((action) => (
                              <button
                                key={action.id}
                                type="button"
                                className="rkb-card-action"
                                aria-label={action.label}
                                title={action.label}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  action.onAction(card, col.id);
                                }}
                              >
                                {action.icon ?? action.label}
                              </button>
                            ))}
                            {showCardRemoveButton && (
                              <button
                                type="button"
                                className="rkb-card-remove"
                                aria-label={`Remove ${card.content}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeCard(card.id, col.id);
                                }}
                              >
                                ×
                              </button>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {indicatorAt === col.cards.length && (
                  <div className="rkb-drop-indicator" aria-hidden="true" />
                )}

                {addCardPlaceholder !== undefined && !atMax && (
                  addingCardIn === col.id ? (
                    <div className="rkb-add-card-form">
                      <input
                        ref={cardInputRef}
                        className="rkb-add-card-input"
                        value={newCardText}
                        placeholder={addCardPlaceholder}
                        onChange={(e) => setNewCardText(e.target.value)}
                        onBlur={() => commitAddCard(col.id)}
                        onKeyDown={(e) => handleCardKeyDown(e, col.id)}
                        aria-label="New card title"
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="rkb-add-card"
                      aria-label={addCardPlaceholder}
                      disabled={disabled}
                      onClick={() => {
                        if (disabled) return;
                        setNewCardText("");
                        setAddingCardIn(col.id);
                      }}
                    >
                      <span className="rkb-add-card-icon" aria-hidden="true">+</span>
                      <span className="rkb-add-card-label">{addCardPlaceholder}</span>
                    </button>
                  )
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

        {showAddColumnSlot && (
          addingColumn ? (
            <div className="rkb-add-column-form">
              <input
                ref={columnInputRef}
                className="rkb-add-column-input"
                value={newColumnText}
                placeholder="Column title"
                onChange={(e) => setNewColumnText(e.target.value)}
                onBlur={() => commitAddColumn()}
                onKeyDown={handleColumnKeyDown}
                aria-label="New column title"
              />
            </div>
          ) : (
            <button
              type="button"
              className="rkb-add-column"
              disabled={disabled}
              onClick={() => {
                if (disabled) return;
                setNewColumnText("");
                setAddingColumn(true);
              }}
            >
              <span aria-hidden="true">+</span>
              {addColumnPlaceholder}
            </button>
          )
        )}
      </div>
      </div>
    );
  },
);

export const KanbanStyled = KanbanStyledImpl as unknown as <TData = unknown>(
  props: KanbanStyledProps<TData> & { ref?: Ref<HTMLDivElement> },
) => ReactElement | null;
