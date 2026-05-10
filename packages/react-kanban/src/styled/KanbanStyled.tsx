import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import { createPortal } from "react-dom";
import { useKanban } from "../useKanban";
import type {
  CardDragState,
  DropRejectReason,
  KanbanAssignee,
  KanbanCard,
  KanbanColumn,
} from "../useKanban";

export type KanbanSize = "sm" | "md" | "lg";
export type KanbanTone =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "danger";

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
  defaultColumns?: KanbanColumn<TData>[];
  disabled?: boolean;
  size?: KanbanSize;
  tone?: KanbanTone;
  columnMinWidth?: string;
  maxColumns?: number;
  renderCard?: (card: KanbanCard<TData>, column: KanbanColumn<TData>) => ReactNode;
  renderColumnHeader?: (column: KanbanColumn<TData>) => ReactNode;
  renderCardMeta?: (
    card: KanbanCard<TData>,
    column: KanbanColumn<TData>,
  ) => ReactNode;
  renderEmptyColumn?: (column: KanbanColumn<TData>) => ReactNode;
  renderEmptyBoard?: () => ReactNode;
  addCardPlaceholder?: string;
  addCardPosition?: "top" | "bottom";
  className?: string;
  style?: CSSProperties;
  onCardAdd?: (card: KanbanCard<TData>, columnId: string) => void;
  onCardRemove?: (card: KanbanCard<TData>, columnId: string) => void;
  onCardClick?: (card: KanbanCard<TData>, column: KanbanColumn<TData>) => void;
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
  onColumnAdd?: (column: KanbanColumn<TData>) => void;
  onColumnRename?: (columnId: string, title: string) => void;
  onColumnRemove?: (column: KanbanColumn<TData>) => void;
  onColumnReorder?: (columnId: string, fromIndex: number, toIndex: number) => void;
  renameColumnInline?: boolean;
  addColumnPlaceholder?: string;
  maxCardsPerColumn?: number;
  cardDraggable?:
    | boolean
    | ((card: KanbanCard<TData>, column: KanbanColumn<TData>) => boolean);
  collapsible?: boolean;
  reorderable?: boolean;
  columnReorderable?: boolean;
  showDropIndicator?: boolean;
  cardActions?: KanbanCardAction<TData>[];
  showCardRemoveButton?: boolean;
  showWipBadge?: boolean;
  selectable?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  filter?: (card: KanbanCard<TData>, column: KanbanColumn<TData>) => boolean;
  animateLayout?: boolean;
  canDrop?: (
    card: KanbanCard<TData>,
    fromColumnId: string,
    toColumnId: string,
    toIndex: number,
  ) => boolean;
  onDropRejected?: (
    card: KanbanCard<TData>,
    fromColumnId: string,
    toColumnId: string,
    reason: DropRejectReason,
  ) => void;
  onSelectionChange?: (ids: string[]) => void;
}

function wipState<TData>(
  col: KanbanColumn<TData>,
  globalCap: number | undefined,
): "ok" | "warn" | "over" | undefined {
  const limit = col.wipLimit ?? globalCap;
  const count = col.cards.length;
  if (limit !== undefined && count >= limit) return "over";
  if (col.wipWarnThreshold !== undefined && count >= col.wipWarnThreshold)
    return "warn";
  if (limit === undefined && col.wipWarnThreshold === undefined) return undefined;
  return "ok";
}

function dueState(value: string | Date | null | undefined):
  | "overdue"
  | "today"
  | "soon"
  | "future"
  | undefined {
  if (value === undefined || value === null) return undefined;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  const now = new Date();
  const dDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const day = 24 * 60 * 60 * 1000;
  if (dDay < today) return "overdue";
  if (dDay === today) return "today";
  if (dDay - today <= 2 * day) return "soon";
  return "future";
}

function formatDue(value: string | Date | null | undefined): string {
  if (value === undefined || value === null) return "";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  const dDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const day = 24 * 60 * 60 * 1000;
  if (dDay === today) return "Today";
  if (dDay === today - day) return "Yesterday";
  if (dDay === today + day) return "Tomorrow";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function initialsOf(a: KanbanAssignee): string {
  if (a.initials) return a.initials;
  if (!a.name) return "?";
  const parts = a.name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const second = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (first + second).toUpperCase().slice(0, 2);
}

function isCardLocked<TData>(
  card: KanbanCard<TData>,
  column: KanbanColumn<TData>,
  cardDraggable: KanbanStyledProps<TData>["cardDraggable"],
): boolean {
  if (column.locked) return true;
  if (cardDraggable === undefined) return false;
  if (typeof cardDraggable === "boolean") return !cardDraggable;
  return !cardDraggable(card, column);
}

const CalendarIcon = () => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const PaperclipIcon = () => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
  </svg>
);
const MessageIcon = () => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);
const CheckIcon = () => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const SearchIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

interface DefaultCardBodyProps<TData> {
  card: KanbanCard<TData>;
  renderMeta?: (
    card: KanbanCard<TData>,
    column: KanbanColumn<TData>,
  ) => ReactNode;
  column: KanbanColumn<TData>;
}

function DefaultCardBody<TData>({
  card,
  column,
  renderMeta,
}: DefaultCardBodyProps<TData>) {
  const due = dueState(card.dueDate);
  const dueLabel = formatDue(card.dueDate);
  const checkPct =
    card.checklist && card.checklist.total > 0
      ? Math.round((card.checklist.done / card.checklist.total) * 100)
      : null;
  const hasFooter =
    Boolean(
      card.label ||
        card.priority ||
        (card.tags && card.tags.length) ||
        card.assignees?.length ||
        dueLabel ||
        card.attachments ||
        card.comments ||
        card.checklist,
    );

  return (
    <>
      {card.cover && (
        <span
          className="rkb-card-cover"
          aria-hidden="true"
          style={{ background: card.cover }}
        />
      )}
      <span className="rkb-card-content">
        <span className="rkb-card-title">{card.content}</span>
        {card.description && (
          <span className="rkb-card-desc">{card.description}</span>
        )}
        {card.tags && card.tags.length > 0 && (
          <span className="rkb-card-tags">
            {card.tags.map((t) => (
              <span key={t} className="rkb-card-tag">
                {t}
              </span>
            ))}
          </span>
        )}
        {hasFooter && (
          <span className="rkb-card-footer">
            <span className="rkb-card-footer-left">
              {card.priority && (
                <span
                  className="rkb-card-priority"
                  data-priority={card.priority}
                  aria-label={`Priority: ${card.priority}`}
                />
              )}
              {card.label && (
                <span className="rkb-card-label">{card.label}</span>
              )}
              {dueLabel && (
                <span
                  className="rkb-card-due"
                  data-due-state={due}
                  aria-label={`Due ${dueLabel}`}
                >
                  <CalendarIcon />
                  <span>{dueLabel}</span>
                </span>
              )}
              {card.checklist && (
                <span
                  className="rkb-card-checklist"
                  data-complete={
                    checkPct === 100 ? "true" : undefined
                  }
                  aria-label={`Checklist ${card.checklist.done} of ${card.checklist.total}`}
                >
                  <CheckIcon />
                  <span>
                    {card.checklist.done}/{card.checklist.total}
                  </span>
                </span>
              )}
              {card.attachments !== undefined && card.attachments > 0 && (
                <span
                  className="rkb-card-meta-icon"
                  aria-label={`${card.attachments} attachments`}
                >
                  <PaperclipIcon />
                  <span>{card.attachments}</span>
                </span>
              )}
              {card.comments !== undefined && card.comments > 0 && (
                <span
                  className="rkb-card-meta-icon"
                  aria-label={`${card.comments} comments`}
                >
                  <MessageIcon />
                  <span>{card.comments}</span>
                </span>
              )}
              {renderMeta?.(card, column)}
            </span>
            {card.assignees && card.assignees.length > 0 && (
              <span className="rkb-card-assignees">
                {card.assignees.slice(0, 3).map((a, i) => (
                  <span
                    key={a.id}
                    className="rkb-card-assignee"
                    title={a.name}
                    style={{
                      background: a.color ?? "var(--rkb-avatar-bg)",
                      backgroundImage: a.avatarUrl
                        ? `url(${a.avatarUrl})`
                        : undefined,
                      zIndex: 10 - i,
                    }}
                    aria-label={a.name}
                  >
                    {a.avatarUrl ? "" : initialsOf(a)}
                  </span>
                ))}
                {card.assignees.length > 3 && (
                  <span
                    className="rkb-card-assignee rkb-card-assignee-overflow"
                    aria-label={`${card.assignees.length - 3} more`}
                  >
                    +{card.assignees.length - 3}
                  </span>
                )}
              </span>
            )}
          </span>
        )}
        {card.checklist && card.checklist.total > 0 && (
          <span
            className="rkb-card-progress"
            aria-hidden="true"
          >
            <span
              className="rkb-card-progress-fill"
              style={{ width: `${checkPct ?? 0}%` }}
            />
          </span>
        )}
      </span>
    </>
  );
}

const KanbanStyledImpl = forwardRef<HTMLDivElement, KanbanStyledProps<unknown>>(
  function KanbanStyled(props, ref) {
    const {
      columns: columnsProp,
      onChange,
      defaultColumns,
      disabled = false,
      size = "md",
      tone = "neutral",
      columnMinWidth = "260px",
      maxColumns,
      renderCard,
      renderColumnHeader,
      renderCardMeta,
      renderEmptyColumn,
      renderEmptyBoard,
      addCardPlaceholder,
      addCardPosition = "bottom",
      className,
      style,
      onCardAdd,
      onCardRemove,
      onCardClick,
      onCardMove,
      onCardReorder,
      onColumnAdd,
      onColumnRename,
      onColumnRemove,
      onColumnReorder,
      renameColumnInline = false,
      addColumnPlaceholder,
      maxCardsPerColumn,
      cardDraggable,
      collapsible = false,
      reorderable = true,
      columnReorderable = false,
      showDropIndicator = true,
      cardActions,
      showCardRemoveButton = false,
      showWipBadge = false,
      selectable = false,
      searchable = false,
      searchPlaceholder = "Search cards…",
      filter,
      animateLayout = true,
      canDrop,
      onDropRejected,
      onSelectionChange,
    } = props;

    const k = useKanban<unknown>({
      ...(columnsProp !== undefined ? { columns: columnsProp } : {}),
      ...(defaultColumns !== undefined
        ? { defaultColumns }
        : {}),
      ...(onChange !== undefined ? { onChange } : {}),
      disabled,
      reorderable,
      columnReorderable,
      addCardPosition,
      ...(maxCardsPerColumn !== undefined ? { maxCardsPerColumn } : {}),
      ...(canDrop !== undefined ? { canDrop } : {}),
      ...(onCardAdd !== undefined ? { onCardAdd } : {}),
      ...(onCardRemove !== undefined ? { onCardRemove } : {}),
      ...(onCardMove !== undefined ? { onCardMove } : {}),
      ...(onCardReorder !== undefined ? { onCardReorder } : {}),
      ...(onColumnReorder !== undefined ? { onColumnReorder } : {}),
      ...(onDropRejected !== undefined ? { onDropRejected } : {}),
      ...(onSelectionChange !== undefined ? { onSelectionChange } : {}),
    });

    const {
      columns,
      setColumns,
      drag,
      rejectedColumn,
      selection,
      toggleSelect,
      clearSelection,
      addCard,
      removeCard,
      getBoardProps,
      getCardProps,
      getColumnDropProps,
      getColumnHandleProps,
    } = k;

    const [collapsedColumns, setCollapsedColumns] = useState<Set<string>>(
      new Set(),
    );
    const [addingCardIn, setAddingCardIn] = useState<string | null>(null);
    const [newCardText, setNewCardText] = useState("");
    const [addingColumn, setAddingColumn] = useState(false);
    const [newColumnText, setNewColumnText] = useState("");
    const [renamingColumn, setRenamingColumn] = useState<string | null>(null);
    const [renameText, setRenameText] = useState("");
    const [search, setSearch] = useState("");
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

    const visibleColumns = useMemo(
      () =>
        maxColumns !== undefined ? columns.slice(0, maxColumns) : columns,
      [columns, maxColumns],
    );

    const searchLc = search.trim().toLowerCase();
    const cardMatches = useCallback(
      (card: KanbanCard<unknown>, col: KanbanColumn<unknown>) => {
        if (filter && !filter(card, col)) return false;
        if (!searchLc) return true;
        if (card.content.toLowerCase().includes(searchLc)) return true;
        if (card.description?.toLowerCase().includes(searchLc)) return true;
        if (card.label?.toLowerCase().includes(searchLc)) return true;
        if (card.tags?.some((t) => t.toLowerCase().includes(searchLc)))
          return true;
        if (
          card.assignees?.some((a) =>
            a.name.toLowerCase().includes(searchLc),
          )
        )
          return true;
        return false;
      },
      [filter, searchLc],
    );

    const showAddColumnSlot = addColumnPlaceholder !== undefined;
    const columnCount = visibleColumns.length + (showAddColumnSlot ? 1 : 0);

    const boardStyle: CSSProperties = {
      gridTemplateColumns: `repeat(${columnCount || 1}, minmax(${columnMinWidth}, 1fr))`,
      minWidth: `calc(${columnCount || 1} * (${columnMinWidth} + var(--rkb-gap, 12px)))`,
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
      const newCol: KanbanColumn<unknown> = {
        id: `col-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title,
        cards: [],
      };
      setColumns((prev) => [...prev, newCol]);
      onColumnAdd?.(newCol);
      setNewColumnText("");
      setAddingColumn(false);
    };

    const commitRename = (columnId: string) => {
      const title = renameText.trim();
      if (title) {
        setColumns((prev) =>
          prev.map((c) => (c.id === columnId ? { ...c, title } : c)),
        );
        onColumnRename?.(columnId, title);
      }
      setRenamingColumn(null);
      setRenameText("");
    };

    const handleCardKeyDownEdit = (
      e: KeyboardEvent<HTMLInputElement>,
      columnId: string,
    ) => {
      if (e.key === "Enter") {
        e.preventDefault();
        commitAddCard(columnId);
      } else if (e.key === "Escape") {
        e.preventDefault();
        setNewCardText("");
        setAddingCardIn(null);
      }
    };

    const handleColumnKeyDownEdit = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        commitAddColumn();
      } else if (e.key === "Escape") {
        e.preventDefault();
        setNewColumnText("");
        setAddingColumn(false);
      }
    };

    const handleRenameKeyDown = (
      e: KeyboardEvent<HTMLInputElement>,
      columnId: string,
    ) => {
      if (e.key === "Enter") {
        e.preventDefault();
        commitRename(columnId);
      } else if (e.key === "Escape") {
        e.preventDefault();
        setRenamingColumn(null);
        setRenameText("");
      }
    };

    const toggleCollapse = (colId: string) => {
      setCollapsedColumns((prev) => {
        const next = new Set(prev);
        if (next.has(colId)) next.delete(colId);
        else next.add(colId);
        return next;
      });
    };

    // ---- FLIP animations ----
    const animateRefs = useRef(new Map<string, HTMLElement>());
    const lastRectsRef = useRef(new Map<string, DOMRect>());

    useLayoutEffect(() => {
      if (!animateLayout) return;
      const reduce =
        typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        // Even when motion is reduced, clear any stuck transforms to be safe.
        animateRefs.current.forEach((el) => {
          if (el && el.style.transform) {
            el.style.transition = "";
            el.style.transform = "";
          }
        });
        return;
      }

      // Skip FLIP while a drag is active. Pointer-driven re-renders + auto-scroll
      // produce viewport-coord deltas that aren't real layout changes; animating
      // them stacks transforms and translates cards off-screen.
      if (drag) {
        const newRects = new Map<string, DOMRect>();
        animateRefs.current.forEach((el, id) => {
          if (!el) return;
          // Defensive: clear any stale FLIP transform so cards can't be displaced
          // off-screen while dragging.
          if (el.style.transform) {
            el.style.transition = "";
            el.style.transform = "";
          }
          newRects.set(id, el.getBoundingClientRect());
        });
        lastRectsRef.current = newRects;
        return;
      }

      const newRects = new Map<string, DOMRect>();
      animateRefs.current.forEach((el, id) => {
        if (!el) return;
        newRects.set(id, el.getBoundingClientRect());
      });

      const prev = lastRectsRef.current;
      prev.forEach((p, id) => {
        const el = animateRefs.current.get(id);
        const n = newRects.get(id);
        if (!el || !n) return;
        const dx = p.left - n.left;
        const dy = p.top - n.top;
        if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;
        // Sanity clamp — anything this big is a scroll-jump, tab switch, or a
        // measurement against a stale element. Snap, don't fly off-screen.
        if (Math.abs(dx) > 800 || Math.abs(dy) > 800) {
          el.style.transition = "";
          el.style.transform = "";
          return;
        }
        el.style.transition = "none";
        el.style.transform = `translate(${dx}px, ${dy}px)`;
        // force reflow
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        el.offsetHeight;
        el.style.transition =
          "transform 280ms cubic-bezier(0.22, 1, 0.36, 1)";
        el.style.transform = "";
        const finalize = () => {
          el.style.transition = "";
          el.style.transform = "";
          el.removeEventListener("transitionend", onEnd);
        };
        const onEnd = () => finalize();
        el.addEventListener("transitionend", onEnd);
        // Watchdog: if transitionend doesn't fire (element unmounted, transition
        // pre-empted), force cleanup so a transform never lingers.
        window.setTimeout(finalize, 360);
      });
      lastRectsRef.current = newRects;
    });

    const setAnimateRef = useCallback(
      (id: string) => (el: HTMLElement | null) => {
        if (el) animateRefs.current.set(id, el);
        else animateRefs.current.delete(id);
      },
      [],
    );

    // ---- column reorder visual indices ----
    const columnDragVisual = useMemo(() => {
      if (drag?.kind !== "column") return null;
      const fromIdx = visibleColumns.findIndex((c) => c.id === drag.columnId);
      if (fromIdx === -1) return null;
      const target = drag.target ?? fromIdx;
      return { fromIdx, target };
    }, [drag, visibleColumns]);

    const dragSourceColumnId =
      drag?.kind === "card" ? drag.sourceColumnId : null;

    const renderColumns = visibleColumns;

    const rkbBoardClass = ["rkb-board"].filter(Boolean).join(" ");

    const portalReady =
      typeof window !== "undefined" && typeof document !== "undefined";

    const dragPreview =
      portalReady && drag?.kind === "card" && drag.pointer && drag.cardRect ? (
        <div
          className="rkb-drag-preview"
          data-rkb-board
          aria-hidden="true"
          style={{
            position: "fixed",
            top: drag.pointer.y - drag.pointerOffset.y,
            left: drag.pointer.x - drag.pointerOffset.x,
            width: drag.cardRect.width,
            pointerEvents: "none",
            zIndex: 9999,
          }}
        >
          <DragPreviewCard
            primaryId={drag.primaryId}
            ids={drag.ids}
            columns={columns}
            renderCard={renderCard}
            renderCardMeta={renderCardMeta}
          />
        </div>
      ) : null;

    return (
      <div
        ref={ref}
        className={["rkb-wrap", className].filter(Boolean).join(" ")}
        data-rkb-board
        style={style}
      >
        {searchable && (
          <div className="rkb-toolbar" data-size={size}>
            <label className="rkb-search">
              <span className="rkb-search-icon" aria-hidden="true">
                <SearchIcon />
              </span>
              <input
                type="search"
                className="rkb-search-input"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search cards"
              />
              {search && (
                <button
                  type="button"
                  className="rkb-search-clear"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </label>
            {selectable && selection.length > 0 && (
              <div className="rkb-selection-info" role="status">
                <span>{selection.length} selected</span>
                <button
                  type="button"
                  className="rkb-selection-clear"
                  onClick={clearSelection}
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        )}
        {!searchable && selectable && selection.length > 0 && (
          <div className="rkb-toolbar" data-size={size}>
            <div className="rkb-selection-info" role="status">
              <span>{selection.length} selected</span>
              <button
                type="button"
                className="rkb-selection-clear"
                onClick={clearSelection}
              >
                Clear
              </button>
            </div>
          </div>
        )}

        <div
          {...getBoardProps()}
          className={rkbBoardClass}
          data-size={size}
          data-tone={tone}
          data-disabled={disabled ? "true" : undefined}
          data-dragging={drag ? "true" : undefined}
          style={boardStyle}
          role="region"
          aria-label="Kanban board"
        >
          {renderColumns.length === 0 && renderEmptyBoard ? (
            <div className="rkb-empty-board">{renderEmptyBoard()}</div>
          ) : null}
          {renderColumns.map((col, colIdx) => {
            const dropProps = getColumnDropProps(col.id);
            const handleProps = getColumnHandleProps(col.id);
            const isOver = drag?.kind === "card" && drag.target?.columnId === col.id;
            const isCollapsed = collapsedColumns.has(col.id);
            const cap = col.wipLimit ?? maxCardsPerColumn;
            const atMax =
              cap !== undefined && col.cards.length >= cap;
            const wip = wipState(col, maxCardsPerColumn);
            void rejectedColumn;
            const isThisColumnDragging =
              drag?.kind === "column" && drag.columnId === col.id;

            // visible-only filter
            const visibleCards = col.cards.filter((c) => cardMatches(c, col));
            const totalCards = col.cards.length;
            const filteredOut = totalCards - visibleCards.length;

            // drop indicator at index for cards
            const isSameColumnDrag =
              drag?.kind === "card" &&
              isOver &&
              dragSourceColumnId === col.id;

            const indicatorAt =
              showDropIndicator &&
              drag?.kind === "card" &&
              isOver &&
              drag.target
                ? Math.min(drag.target.index, visibleCards.length)
                : null;

            const placeholderHeight = drag?.kind === "card"
              ? drag.cardRect?.height ?? 60
              : 0;

            // column reorder offset transform
            let columnTransform: string | undefined;
            if (columnDragVisual) {
              const { fromIdx, target } = columnDragVisual;
              if (drag?.kind === "column" && drag.columnId === col.id) {
                if (drag.pointer && drag.columnRect) {
                  // floating preview offset — handled separately, hide source
                  columnTransform = undefined;
                }
              } else if (
                fromIdx < colIdx &&
                colIdx <= target
              ) {
                columnTransform = `translateX(calc(-1 * (${columnMinWidth} + var(--rkb-gap, 12px))))`;
              } else if (fromIdx > colIdx && colIdx >= target) {
                columnTransform = `translateX(calc(${columnMinWidth} + var(--rkb-gap, 12px)))`;
              }
            }

            return (
              <div
                key={col.id}
                {...dropProps}
                ref={(el) => {
                  dropProps.ref(el);
                  setAnimateRef(`col:${col.id}`)(el);
                }}
                className="rkb-column"
                data-at-max={atMax ? "true" : undefined}
                data-collapsed={isCollapsed ? "true" : undefined}
                data-wip-state={wip}
                data-renaming={renamingColumn === col.id ? "true" : undefined}
                data-accent={col.accent}
                data-locked={col.locked ? "true" : undefined}
                data-column-dragging={isThisColumnDragging ? "true" : undefined}
                style={
                  columnTransform ? { transform: columnTransform } : undefined
                }
              >
                <div
                  className="rkb-column-header"
                  {...(columnReorderable ? handleProps : {})}
                  ref={handleProps.ref}
                >
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
                      data-rkb-no-drag
                    />
                  ) : (
                    <>
                      <span className="rkb-column-accent" aria-hidden="true" />
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
                      {showWipBadge &&
                      (col.wipLimit !== undefined ||
                        maxCardsPerColumn !== undefined) ? (
                        <span
                          className="rkb-column-badge"
                          data-wip-state={wip}
                          aria-label={`${col.cards.length} of ${col.wipLimit ?? maxCardsPerColumn} cards`}
                        >
                          {col.cards.length} /{" "}
                          {col.wipLimit ?? maxCardsPerColumn}
                        </span>
                      ) : (
                        <span
                          className="rkb-column-badge"
                          aria-label={`${col.cards.length} cards`}
                        >
                          {col.cards.length}
                        </span>
                      )}
                    </>
                  )}
                  <span
                    className="rkb-column-actions"
                    data-rkb-no-drag
                  >
                    {collapsible && (
                      <button
                        type="button"
                        className="rkb-icon-btn"
                        aria-label={
                          isCollapsed ? "Expand column" : "Collapse column"
                        }
                        onClick={() => toggleCollapse(col.id)}
                        data-rkb-no-drag
                      >
                        <span
                          className="rkb-collapse-icon"
                          data-collapsed={isCollapsed ? "true" : undefined}
                          aria-hidden="true"
                        >
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 12 12"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="3 4.5 6 7.5 9 4.5" />
                          </svg>
                        </span>
                      </button>
                    )}
                    {onColumnRemove && !disabled && renamingColumn !== col.id && (
                      <button
                        type="button"
                        className="rkb-icon-btn rkb-icon-btn-danger"
                        aria-label={`Remove column ${col.title}`}
                        onClick={() => {
                          setColumns((prev) =>
                            prev.filter((c) => c.id !== col.id),
                          );
                          onColumnRemove(col);
                        }}
                        data-rkb-no-drag
                      >
                        ×
                      </button>
                    )}
                  </span>
                </div>

                <div className="rkb-cards" data-empty={visibleCards.length === 0 ? "true" : undefined}>
                  {visibleCards.map((card, idx) => {
                    const cardProps = getCardProps(card.id, col.id);
                    const showIndicatorBefore =
                      indicatorAt === idx && !isSameColumnDrag;
                    const showPlaceholderBefore =
                      drag?.kind === "card" &&
                      isOver &&
                      drag.target?.index === idx;
                    const locked = isCardLocked(card, col, cardDraggable);

                    const visibleActions = cardActions?.filter(
                      (a) => !a.show || a.show(card, col),
                    );
                    const hasActions =
                      !disabled &&
                      ((visibleActions && visibleActions.length > 0) ||
                        showCardRemoveButton);

                    return (
                      <div key={card.id} className="rkb-card-slot">
                        {showPlaceholderBefore && !isSameColumnDrag && (
                          <div
                            className="rkb-card-placeholder"
                            aria-hidden="true"
                            style={{ height: placeholderHeight }}
                          />
                        )}
                        {showIndicatorBefore && !showPlaceholderBefore && (
                          <div
                            className="rkb-drop-indicator"
                            aria-hidden="true"
                          />
                        )}
                        <div
                          {...cardProps}
                          ref={(el) => {
                            cardProps.ref(el);
                            setAnimateRef(card.id)(el);
                          }}
                          className="rkb-card"
                          data-priority={card.priority}
                          data-locked={locked ? "true" : undefined}
                          data-has-cover={card.cover ? "true" : undefined}
                          aria-disabled={locked ? true : undefined}
                          onClick={(e) => {
                            cardProps.onClick(e);
                            if (e.defaultPrevented) return;
                            if (selectable && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
                              if (selection.length > 0) {
                                toggleSelect(card.id, "single");
                              }
                            }
                            onCardClick?.(card, col);
                          }}
                          {...(locked
                            ? { onPointerDown: undefined }
                            : {})}
                        >
                          <span className="rkb-card-handle" aria-hidden="true">
                            <svg
                              width="10"
                              height="14"
                              viewBox="0 0 10 14"
                              fill="currentColor"
                              aria-hidden="true"
                              focusable="false"
                            >
                              <circle cx="3" cy="3" r="1.1" />
                              <circle cx="7" cy="3" r="1.1" />
                              <circle cx="3" cy="7" r="1.1" />
                              <circle cx="7" cy="7" r="1.1" />
                              <circle cx="3" cy="11" r="1.1" />
                              <circle cx="7" cy="11" r="1.1" />
                            </svg>
                          </span>
                          {renderCard ? (
                            <span className="rkb-card-content">
                              {renderCard(card, col)}
                            </span>
                          ) : (
                            <DefaultCardBody
                              card={card}
                              column={col}
                              renderMeta={renderCardMeta}
                            />
                          )}
                          {hasActions && (
                            <span
                              className="rkb-card-actions"
                              data-rkb-no-drag
                            >
                              {visibleActions?.map((action) => (
                                <button
                                  key={action.id}
                                  type="button"
                                  className="rkb-icon-btn rkb-card-action"
                                  aria-label={action.label}
                                  title={action.label}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    action.onAction(card, col.id);
                                  }}
                                  data-rkb-no-drag
                                >
                                  {action.icon ?? action.label}
                                </button>
                              ))}
                              {showCardRemoveButton && (
                                <button
                                  type="button"
                                  className="rkb-icon-btn rkb-icon-btn-danger rkb-card-remove"
                                  aria-label={`Remove ${card.content}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeCard(card.id, col.id);
                                  }}
                                  data-rkb-no-drag
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

                  {indicatorAt === visibleCards.length &&
                    drag?.kind === "card" &&
                    !isSameColumnDrag && (
                      <div
                        className="rkb-card-placeholder"
                        aria-hidden="true"
                        style={{ height: placeholderHeight }}
                      />
                    )}

                  {visibleCards.length === 0 && (
                    <div className="rkb-empty-col" aria-label="Empty column">
                      {renderEmptyColumn ? (
                        renderEmptyColumn(col)
                      ) : drag?.kind === "card" ? (
                        <span className="rkb-empty-col-label">
                          Drop here
                        </span>
                      ) : col.locked ? (
                        <span className="rkb-empty-col-label">Locked</span>
                      ) : filteredOut > 0 ? (
                        <span className="rkb-empty-col-label">
                          {filteredOut} hidden by filter
                        </span>
                      ) : (
                        <span className="rkb-empty-col-label">No cards</span>
                      )}
                    </div>
                  )}

                  {addCardPlaceholder !== undefined && !atMax && (
                    addingCardIn === col.id ? (
                      <div className="rkb-add-card-form" data-rkb-no-drag>
                        <input
                          ref={cardInputRef}
                          className="rkb-add-card-input"
                          value={newCardText}
                          placeholder={addCardPlaceholder}
                          onChange={(e) => setNewCardText(e.target.value)}
                          onBlur={() => commitAddCard(col.id)}
                          onKeyDown={(e) => handleCardKeyDownEdit(e, col.id)}
                          aria-label="New card title"
                          data-rkb-no-drag
                        />
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="rkb-add-card"
                        aria-label={addCardPlaceholder}
                        disabled={disabled || col.locked}
                        onClick={() => {
                          if (disabled || col.locked) return;
                          setNewCardText("");
                          setAddingCardIn(col.id);
                        }}
                        data-rkb-no-drag
                        data-position={addCardPosition}
                      >
                        <span
                          className="rkb-add-card-icon"
                          aria-hidden="true"
                        >
                          +
                        </span>
                        <span className="rkb-add-card-label">
                          {addCardPlaceholder}
                        </span>
                      </button>
                    )
                  )}
                </div>
                {col.locked && (
                  <span className="rkb-locked-badge" aria-label="Locked column">
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                  </span>
                )}
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
                  onKeyDown={handleColumnKeyDownEdit}
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

        {portalReady &&
          drag?.kind === "card" &&
          drag.pointer &&
          drag.cardRect &&
          createPortal(dragPreview, document.body)}

        {portalReady &&
          drag?.kind === "column" &&
          drag.pointer &&
          drag.columnRect &&
          createPortal(
            <div
              className="rkb-column-drag-preview"
              data-rkb-board
              aria-hidden="true"
              data-tone={tone}
              data-size={size}
              style={{
                position: "fixed",
                top: drag.pointer.y - drag.pointerOffset.y,
                left: drag.pointer.x - drag.pointerOffset.x,
                width: drag.columnRect.width,
                height: drag.columnRect.height,
                pointerEvents: "none",
                zIndex: 9999,
              }}
            >
              <ColumnDragPreview
                column={
                  visibleColumns.find((c) => c.id === drag.columnId) ?? null
                }
              />
            </div>,
            document.body,
          )}
      </div>
    );
  },
);

function DragPreviewCard({
  primaryId,
  ids,
  columns,
  renderCard,
  renderCardMeta,
}: {
  primaryId: string;
  ids: string[];
  columns: KanbanColumn<unknown>[];
  renderCard?: (card: KanbanCard<unknown>, col: KanbanColumn<unknown>) => ReactNode;
  renderCardMeta?: (
    card: KanbanCard<unknown>,
    col: KanbanColumn<unknown>,
  ) => ReactNode;
}) {
  const card = useMemo(() => {
    for (const col of columns) {
      const found = col.cards.find((c) => c.id === primaryId);
      if (found) return { card: found, col };
    }
    return null;
  }, [columns, primaryId]);
  if (!card) return null;
  const stackCount = ids.length;
  return (
    <div className="rkb-card rkb-card-preview" data-priority={card.card.priority}>
      <span className="rkb-card-handle" aria-hidden="true">
        <svg
          width="10"
          height="14"
          viewBox="0 0 10 14"
          fill="currentColor"
          aria-hidden="true"
          focusable="false"
        >
          <circle cx="3" cy="3" r="1.1" />
          <circle cx="7" cy="3" r="1.1" />
          <circle cx="3" cy="7" r="1.1" />
          <circle cx="7" cy="7" r="1.1" />
          <circle cx="3" cy="11" r="1.1" />
          <circle cx="7" cy="11" r="1.1" />
        </svg>
      </span>
      {renderCard ? (
        <span className="rkb-card-content">
          {renderCard(card.card, card.col)}
        </span>
      ) : (
        <DefaultCardBody
          card={card.card}
          column={card.col}
          renderMeta={renderCardMeta}
        />
      )}
      {stackCount > 1 && (
        <span className="rkb-stack-badge" aria-label={`${stackCount} cards`}>
          {stackCount}
        </span>
      )}
    </div>
  );
}

function ColumnDragPreview({
  column,
}: {
  column: KanbanColumn<unknown> | null;
}) {
  if (!column) return null;
  return (
    <div className="rkb-column rkb-column-preview" data-accent={column.accent}>
      <div className="rkb-column-header">
        <span className="rkb-column-accent" aria-hidden="true" />
        <span className="rkb-column-title">{column.title}</span>
        <span className="rkb-column-badge">{column.cards.length}</span>
      </div>
    </div>
  );
}

export const KanbanStyled = KanbanStyledImpl as unknown as <TData = unknown>(
  props: KanbanStyledProps<TData> & { ref?: Ref<HTMLDivElement> },
) => ReactElement | null;

export type { CardDragState };
