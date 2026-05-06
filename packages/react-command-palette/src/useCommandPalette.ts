import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";

export interface CommandItem<TData = unknown> {
  id: string;
  /** Display label. */
  label: string;
  /** Optional secondary text — shown next to the label. */
  hint?: string;
  /** Optional left-side icon. */
  icon?: ReactNode;
  /** Optional right-side keyboard shortcut hint (e.g. "⌘K"). */
  shortcut?: string;
  /** Optional section / group key for grouping items in the rendered list. */
  group?: string;
  /** Disable the item. */
  disabled?: boolean;
  /** Free-form payload — passed to `onSelect`. */
  data?: TData;
  /** Extra search keywords beyond `label` + `hint`. */
  keywords?: string[];
}

export interface CommandPaletteGroup<TData = unknown> {
  id: string;
  label: string;
  items: CommandItem<TData>[];
}

export interface UseCommandPaletteOptions<TData = unknown> {
  items: CommandItem<TData>[];
  /** Initial open state. */
  defaultOpen?: boolean;
  /** Controlled open state. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Fires when an item is selected (Enter / click). */
  onSelect?: (item: CommandItem<TData>) => void;
  /** Initial search value. */
  defaultQuery?: string;
  /** Custom filter. Default: case-insensitive substring on label + hint + keywords. */
  filter?: (item: CommandItem<TData>, query: string) => boolean;
  /** Track recent selections under this `localStorage` key (last 5). */
  recentStorageKey?: string;
  /** Open shortcut. Default: ⌘K / Ctrl+K. Pass `null` to disable. */
  hotkey?: { key: string; meta?: boolean; ctrl?: boolean; shift?: boolean } | null;
}

export interface CommandPaletteInputProps {
  ref: RefObject<HTMLInputElement>;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: ReactKeyboardEvent<HTMLInputElement>) => void;
  type: "text";
  role: "combobox";
  "aria-expanded": boolean;
  "aria-controls": string;
  "aria-activedescendant": string | undefined;
  autoComplete: "off";
  spellCheck: false;
}

export interface CommandPaletteListProps {
  ref: RefObject<HTMLUListElement>;
  id: string;
  role: "listbox";
}

export interface CommandPaletteItemProps {
  id: string;
  role: "option";
  "aria-selected": boolean;
  "aria-disabled": boolean | undefined;
  "data-active": boolean;
  onClick: () => void;
  onMouseEnter: () => void;
}

export interface UseCommandPaletteResult<TData = unknown> {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  query: string;
  setQuery: (q: string) => void;
  /** Items after filtering, flattened (in render order). */
  filteredItems: CommandItem<TData>[];
  /** Items grouped (preserves group order; "Recent" first when applicable). */
  groups: CommandPaletteGroup<TData>[];
  activeIndex: number;
  setActiveIndex: (i: number) => void;
  inputProps: CommandPaletteInputProps;
  listProps: CommandPaletteListProps;
  getItemProps: (item: CommandItem<TData>) => CommandPaletteItemProps;
  /** Programmatically select an item (also fires onSelect). */
  selectItem: (item: CommandItem<TData>) => void;
  recentIds: string[];
  clearRecent: () => void;
}

const RECENT_LIMIT = 5;

function defaultFilter<T>(item: CommandItem<T>, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  if (item.label.toLowerCase().includes(q)) return true;
  if (item.hint && item.hint.toLowerCase().includes(q)) return true;
  if (item.keywords?.some((k) => k.toLowerCase().includes(q))) return true;
  return false;
}

export function useCommandPalette<TData = unknown>(
  opts: UseCommandPaletteOptions<TData>,
): UseCommandPaletteResult<TData> {
  const {
    items,
    defaultOpen = false,
    open: controlledOpen,
    onOpenChange,
    onSelect,
    defaultQuery = "",
    filter = defaultFilter,
    recentStorageKey,
    hotkey = { key: "k", meta: true, ctrl: true },
  } = opts;

  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const setOpenState = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const open = useCallback(() => setOpenState(true), [setOpenState]);
  const close = useCallback(() => setOpenState(false), [setOpenState]);
  const toggle = useCallback(() => setOpenState(!isOpen), [setOpenState, isOpen]);

  const [query, setQuery] = useState(defaultQuery);
  const [activeIndex, setActiveIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listboxId = useId();

  // Recent ids — read on first render, write on every selection.
  const [recentIds, setRecentIds] = useState<string[]>(() => {
    if (!recentStorageKey || typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(recentStorageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as string[]).slice(0, RECENT_LIMIT) : [];
    } catch {
      return [];
    }
  });

  const writeRecent = useCallback(
    (id: string) => {
      setRecentIds((prev) => {
        const next = [id, ...prev.filter((x) => x !== id)].slice(0, RECENT_LIMIT);
        if (recentStorageKey && typeof window !== "undefined") {
          try {
            window.localStorage.setItem(recentStorageKey, JSON.stringify(next));
          } catch { /* ignore */ }
        }
        return next;
      });
    },
    [recentStorageKey],
  );

  const clearRecent = useCallback(() => {
    setRecentIds([]);
    if (recentStorageKey && typeof window !== "undefined") {
      try { window.localStorage.removeItem(recentStorageKey); } catch { /* ignore */ }
    }
  }, [recentStorageKey]);

  // Filtered + grouped items
  const filteredItems = useMemo(() => items.filter((it) => filter(it, query)), [items, filter, query]);

  const groups = useMemo<CommandPaletteGroup<TData>[]>(() => {
    const out: CommandPaletteGroup<TData>[] = [];

    // Recent goes first when no query
    if (recentIds.length > 0 && !query.trim()) {
      const recentItems = recentIds
        .map((id) => filteredItems.find((it) => it.id === id))
        .filter((it): it is CommandItem<TData> => it !== undefined);
      if (recentItems.length > 0) {
        out.push({ id: "__recent__", label: "Recent", items: recentItems });
      }
    }

    // Group the rest by `group` field; items without a group land in __other__
    const seenInRecent = new Set(out[0]?.items.map((it) => it.id) ?? []);
    const byGroup = new Map<string, CommandItem<TData>[]>();
    for (const it of filteredItems) {
      if (seenInRecent.has(it.id)) continue;
      const g = it.group ?? "__other__";
      const list = byGroup.get(g) ?? [];
      list.push(it);
      byGroup.set(g, list);
    }
    for (const [gid, list] of byGroup) {
      out.push({ id: gid, label: gid === "__other__" ? "" : gid, items: list });
    }
    return out;
  }, [filteredItems, recentIds, query]);

  // Flat ordered list for keyboard nav (matches render order)
  const orderedItems = useMemo(
    () => groups.flatMap((g) => g.items),
    [groups],
  );

  // Reset active index when items change
  useEffect(() => { setActiveIndex(0); }, [query, isOpen]);

  // Auto-focus input when opening
  useEffect(() => {
    if (!isOpen) return;
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [isOpen]);

  // Global hotkey (⌘K / Ctrl+K by default)
  useEffect(() => {
    if (!hotkey || typeof document === "undefined") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== hotkey.key.toLowerCase()) return;
      const metaOk = hotkey.meta ? e.metaKey : !e.metaKey;
      const ctrlOk = hotkey.ctrl ? e.ctrlKey : !e.ctrlKey;
      // Either meta OR ctrl is enough (cross-platform)
      if (!(e.metaKey || e.ctrlKey)) return;
      if (hotkey.shift && !e.shiftKey) return;
      void metaOk; void ctrlOk;
      e.preventDefault();
      toggle();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [hotkey, toggle]);

  const selectItem = useCallback(
    (item: CommandItem<TData>) => {
      if (item.disabled) return;
      writeRecent(item.id);
      onSelect?.(item);
      close();
    },
    [writeRecent, onSelect, close],
  );

  const focusableItems = orderedItems.filter((it) => !it.disabled);

  const moveActive = useCallback(
    (delta: number) => {
      if (focusableItems.length === 0) return;
      setActiveIndex((cur) => {
        const total = focusableItems.length;
        const next = (cur + delta + total) % total;
        return next;
      });
    },
    [focusableItems.length],
  );

  const handleKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowDown") { e.preventDefault(); moveActive(1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); moveActive(-1); }
      else if (e.key === "Home") { e.preventDefault(); setActiveIndex(0); }
      else if (e.key === "End") { e.preventDefault(); setActiveIndex(Math.max(0, focusableItems.length - 1)); }
      else if (e.key === "Enter") {
        const item = focusableItems[activeIndex];
        if (item) { e.preventDefault(); selectItem(item); }
      }
      else if (e.key === "Escape") { e.preventDefault(); close(); }
    },
    [moveActive, focusableItems, activeIndex, selectItem, close],
  );

  const activeId =
    activeIndex >= 0 && focusableItems[activeIndex]
      ? `${listboxId}-item-${focusableItems[activeIndex]!.id}`
      : undefined;

  const inputProps: CommandPaletteInputProps = {
    ref: inputRef,
    value: query,
    onChange: (e) => setQuery(e.target.value),
    onKeyDown: handleKeyDown,
    type: "text",
    role: "combobox",
    "aria-expanded": isOpen,
    "aria-controls": listboxId,
    "aria-activedescendant": activeId,
    autoComplete: "off",
    spellCheck: false,
  };

  const listProps: CommandPaletteListProps = {
    ref: listRef,
    id: listboxId,
    role: "listbox",
  };

  const getItemProps = useCallback(
    (item: CommandItem<TData>): CommandPaletteItemProps => {
      const focusableIdx = focusableItems.indexOf(item);
      const isActive = focusableIdx >= 0 && focusableIdx === activeIndex;
      return {
        id: `${listboxId}-item-${item.id}`,
        role: "option",
        "aria-selected": isActive,
        "aria-disabled": item.disabled || undefined,
        "data-active": isActive,
        onClick: () => selectItem(item),
        onMouseEnter: () => {
          if (focusableIdx >= 0) setActiveIndex(focusableIdx);
        },
      };
    },
    [focusableItems, activeIndex, listboxId, selectItem],
  );

  return {
    isOpen,
    open,
    close,
    toggle,
    query,
    setQuery,
    filteredItems,
    groups,
    activeIndex,
    setActiveIndex,
    inputProps,
    listProps,
    getItemProps,
    selectItem,
    recentIds,
    clearRecent,
  };
}
