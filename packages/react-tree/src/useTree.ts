import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";

export interface TreeNode<TData = unknown> {
  id: string;
  label: ReactNode;
  /** Children. When `undefined`, the node is a leaf. When `[]`, the node is an empty branch. */
  children?: TreeNode<TData>[];
  /** Optional left-side icon. */
  icon?: ReactNode;
  /** Disable the node (greyed, can't toggle/select). */
  disabled?: boolean;
  /** Free-form payload exposed in callbacks. */
  data?: TData;
}

export interface UseTreeOptions<TData = unknown> {
  items: TreeNode<TData>[];
  /** Pre-expanded ids (uncontrolled). */
  defaultExpandedIds?: string[];
  /** Controlled expanded ids. */
  expandedIds?: string[];
  onExpandedChange?: (ids: string[]) => void;
  /** Pre-selected id (uncontrolled). */
  defaultSelectedId?: string | null;
  selectedId?: string | null;
  onSelectedChange?: (id: string | null, node: TreeNode<TData> | null) => void;
  /** Selection model. Default: "single". `"multiple"` enables shift/ctrl additive selection. */
  selectionMode?: "single" | "multiple";
  /** When `selectionMode === "multiple"`, controlled multi-selected ids. */
  selectedIds?: string[];
  onSelectedIdsChange?: (ids: string[]) => void;
  /** Async children loader fired the first time a node with `children: undefined` AND `loadChildren` is expanded. */
  loadChildren?: (node: TreeNode<TData>) => Promise<TreeNode<TData>[]>;
}

export interface TreeNodeProps {
  id: string;
  role: "treeitem";
  "aria-expanded": boolean | undefined;
  "aria-selected": boolean;
  "aria-level": number;
  "aria-disabled": boolean | undefined;
  tabIndex: number;
  onClick: () => void;
  onKeyDown: (e: ReactKeyboardEvent<HTMLElement>) => void;
  "data-active": boolean;
  "data-selected": boolean;
  "data-depth": number;
}

export interface TreeToggleProps {
  type: "button";
  "aria-label": string;
  onClick: (e: React.MouseEvent) => void;
  tabIndex: -1;
}

export interface TreeRootProps {
  ref: RefObject<HTMLElement>;
  role: "tree";
  "aria-multiselectable": boolean | undefined;
}

export interface FlatNode<TData = unknown> {
  node: TreeNode<TData>;
  depth: number;
  parentId: string | null;
  hasChildren: boolean;
  isLoading: boolean;
}

export interface UseTreeResult<TData = unknown> {
  /** Flattened, currently-visible nodes (parents + expanded children only). */
  visibleNodes: FlatNode<TData>[];
  expandedIds: string[];
  selectedId: string | null;
  selectedIds: string[];
  isExpanded: (id: string) => boolean;
  isSelected: (id: string) => boolean;
  expand: (id: string) => void;
  collapse: (id: string) => void;
  toggle: (id: string) => void;
  expandAll: () => void;
  collapseAll: () => void;
  select: (id: string | null) => void;
  /** True while the loader for a given node is in flight. */
  isLoadingNode: (id: string) => boolean;
  getRootProps: () => TreeRootProps;
  getNodeProps: (node: TreeNode<TData>, depth: number) => TreeNodeProps;
  getToggleProps: (node: TreeNode<TData>) => TreeToggleProps;
  /** Programmatic focus by id. */
  focusNode: (id: string) => void;
}

function flatten<T>(
  items: TreeNode<T>[],
  expanded: Set<string>,
  loadedChildren: Record<string, TreeNode<T>[]>,
  depth = 0,
  parentId: string | null = null,
  out: FlatNode<T>[] = [],
  loadingIds: Set<string> = new Set(),
): FlatNode<T>[] {
  for (const node of items) {
    const fromLoader = loadedChildren[node.id];
    const children = fromLoader ?? node.children;
    const hasChildren = children !== undefined; // even [] is a "branch"
    out.push({
      node,
      depth,
      parentId,
      hasChildren,
      isLoading: loadingIds.has(node.id),
    });
    if (hasChildren && expanded.has(node.id) && children) {
      flatten(children, expanded, loadedChildren, depth + 1, node.id, out, loadingIds);
    }
  }
  return out;
}

export function useTree<TData = unknown>(opts: UseTreeOptions<TData>): UseTreeResult<TData> {
  const {
    items,
    defaultExpandedIds = [],
    expandedIds: controlledExpanded,
    onExpandedChange,
    defaultSelectedId = null,
    selectedId: controlledSelected,
    onSelectedChange,
    selectionMode = "single",
    selectedIds: controlledSelectedIds,
    onSelectedIdsChange,
    loadChildren,
  } = opts;

  // Expanded state
  const isExpControlled = controlledExpanded !== undefined;
  const [internalExpanded, setInternalExpanded] = useState<string[]>(defaultExpandedIds);
  const expandedIds = isExpControlled ? controlledExpanded : internalExpanded;

  const setExpanded = useCallback((next: string[]) => {
    if (!isExpControlled) setInternalExpanded(next);
    onExpandedChange?.(next);
  }, [isExpControlled, onExpandedChange]);

  // Single-selected state
  const isSelControlled = controlledSelected !== undefined;
  const [internalSelected, setInternalSelected] = useState<string | null>(defaultSelectedId);
  const selectedId = isSelControlled ? (controlledSelected as string | null) : internalSelected;

  // Multi-selected state (only used when selectionMode === "multiple")
  const isMultiControlled = controlledSelectedIds !== undefined;
  const [internalMulti, setInternalMulti] = useState<string[]>([]);
  const selectedIds = isMultiControlled ? controlledSelectedIds! : internalMulti;

  // Async-loaded children cache
  const [loadedChildren, setLoadedChildren] = useState<Record<string, TreeNode<TData>[]>>({});
  const [loadingIds, setLoadingIds] = useState<Set<string>>(() => new Set());
  const inFlightRef = useRef<Set<string>>(new Set());

  const expanded = useMemo(() => new Set(expandedIds), [expandedIds]);
  const visibleNodes = useMemo(
    () => flatten(items, expanded, loadedChildren, 0, null, [], loadingIds),
    [items, expanded, loadedChildren, loadingIds],
  );

  const isExpanded = useCallback((id: string) => expandedIds.includes(id), [expandedIds]);
  const isSelected = useCallback((id: string) => {
    if (selectionMode === "multiple") return selectedIds.includes(id);
    return selectedId === id;
  }, [selectionMode, selectedIds, selectedId]);
  const isLoadingNode = useCallback((id: string) => loadingIds.has(id), [loadingIds]);

  const triggerLoad = useCallback(async (node: TreeNode<TData>) => {
    if (!loadChildren) return;
    if (loadedChildren[node.id]) return;
    if (inFlightRef.current.has(node.id)) return;
    inFlightRef.current.add(node.id);
    setLoadingIds((cur) => { const next = new Set(cur); next.add(node.id); return next; });
    try {
      const children = await loadChildren(node);
      setLoadedChildren((cur) => ({ ...cur, [node.id]: children }));
    } catch {
      // Swallow — consumer can implement retry via re-toggle
    } finally {
      inFlightRef.current.delete(node.id);
      setLoadingIds((cur) => { const next = new Set(cur); next.delete(node.id); return next; });
    }
  }, [loadChildren, loadedChildren]);

  const expand = useCallback((id: string) => {
    if (expandedIds.includes(id)) return;
    setExpanded([...expandedIds, id]);
    // Trigger async load if needed
    const findNode = (list: TreeNode<TData>[]): TreeNode<TData> | null => {
      for (const n of list) {
        if (n.id === id) return n;
        if (n.children) {
          const r = findNode(n.children);
          if (r) return r;
        }
      }
      return null;
    };
    const node = findNode(items);
    if (node && node.children === undefined && loadChildren) {
      void triggerLoad(node);
    }
  }, [expandedIds, setExpanded, items, loadChildren, triggerLoad]);

  const collapse = useCallback((id: string) => {
    if (!expandedIds.includes(id)) return;
    setExpanded(expandedIds.filter((x) => x !== id));
  }, [expandedIds, setExpanded]);

  const toggle = useCallback((id: string) => {
    if (expandedIds.includes(id)) collapse(id);
    else expand(id);
  }, [expandedIds, collapse, expand]);

  const expandAll = useCallback(() => {
    const all: string[] = [];
    const walk = (list: TreeNode<TData>[]) => {
      for (const n of list) {
        if (n.children !== undefined) {
          all.push(n.id);
          walk(n.children);
        }
      }
    };
    walk(items);
    setExpanded(all);
  }, [items, setExpanded]);

  const collapseAll = useCallback(() => setExpanded([]), [setExpanded]);

  const select = useCallback((id: string | null) => {
    if (selectionMode === "multiple") {
      if (id === null) {
        if (!isMultiControlled) setInternalMulti([]);
        onSelectedIdsChange?.([]);
        return;
      }
      const next = selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id];
      if (!isMultiControlled) setInternalMulti(next);
      onSelectedIdsChange?.(next);
      return;
    }
    if (!isSelControlled) setInternalSelected(id);
    let foundNode: TreeNode<TData> | null = null;
    if (id !== null) {
      const walk = (list: TreeNode<TData>[]): TreeNode<TData> | null => {
        for (const n of list) {
          if (n.id === id) return n;
          if (n.children) {
            const r = walk(n.children);
            if (r) return r;
          }
        }
        return null;
      };
      foundNode = walk(items);
    }
    onSelectedChange?.(id, foundNode);
  }, [selectionMode, isSelControlled, isMultiControlled, selectedIds, items, onSelectedChange, onSelectedIdsChange]);

  // Refs + keyboard nav
  const rootRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Map<string, HTMLElement>>(new Map());
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const focusNode = useCallback((id: string) => {
    const node = itemRefs.current.get(id);
    if (node) { node.focus(); setFocusedId(id); }
  }, []);

  const visibleIdsRef = useRef<string[]>([]);
  visibleIdsRef.current = visibleNodes.map((n) => n.node.id);

  const handleKeyDown = useCallback((e: ReactKeyboardEvent<HTMLElement>, currentId: string) => {
    const list = visibleIdsRef.current;
    const idx = list.indexOf(currentId);
    if (idx === -1) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = list[Math.min(list.length - 1, idx + 1)];
      if (next) focusNode(next);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = list[Math.max(0, idx - 1)];
      if (prev) focusNode(prev);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      // If collapsed parent, expand. Else move to first child if any.
      const flat = visibleNodes[idx];
      if (!flat) return;
      if (flat.hasChildren && !expanded.has(currentId)) {
        expand(currentId);
      } else if (flat.hasChildren && idx + 1 < list.length) {
        const child = list[idx + 1];
        if (child) focusNode(child);
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const flat = visibleNodes[idx];
      if (!flat) return;
      if (flat.hasChildren && expanded.has(currentId)) {
        collapse(currentId);
      } else if (flat.parentId) {
        focusNode(flat.parentId);
      }
    } else if (e.key === "Home") {
      e.preventDefault();
      if (list[0]) focusNode(list[0]);
    } else if (e.key === "End") {
      e.preventDefault();
      const last = list[list.length - 1];
      if (last) focusNode(last);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      select(currentId);
    }
  }, [visibleNodes, expanded, expand, collapse, focusNode, select]);

  const getRootProps = useCallback((): TreeRootProps => ({
    ref: rootRef,
    role: "tree",
    "aria-multiselectable": selectionMode === "multiple" || undefined,
  }), [selectionMode]);

  const getNodeProps = useCallback((node: TreeNode<TData>, depth: number): TreeNodeProps => {
    const sel = isSelected(node.id);
    const exp = expanded.has(node.id);
    const flat = visibleNodes.find((f) => f.node.id === node.id);
    const hasChildren = flat?.hasChildren ?? false;
    return {
      id: `tree-node-${node.id}`,
      role: "treeitem",
      "aria-expanded": hasChildren ? exp : undefined,
      "aria-selected": sel,
      "aria-level": depth + 1,
      "aria-disabled": node.disabled || undefined,
      tabIndex: focusedId === node.id ? 0 : -1,
      onClick: () => {
        if (node.disabled) return;
        select(node.id);
      },
      onKeyDown: (e) => handleKeyDown(e, node.id),
      "data-active": focusedId === node.id,
      "data-selected": sel,
      "data-depth": depth,
    };
  }, [isSelected, expanded, visibleNodes, focusedId, select, handleKeyDown]);

  const getToggleProps = useCallback((node: TreeNode<TData>): TreeToggleProps => ({
    type: "button",
    "aria-label": expanded.has(node.id) ? `Collapse ${typeof node.label === "string" ? node.label : "node"}` : `Expand ${typeof node.label === "string" ? node.label : "node"}`,
    onClick: (e) => {
      e.stopPropagation();
      if (node.disabled) return;
      toggle(node.id);
    },
    tabIndex: -1,
  }), [expanded, toggle]);

  // Mount registration done by the styled component via ref attribute lookup;
  // expose register/unregister so headless consumers can wire it themselves.
  // (Not used internally; the styled component uses its own callback ref.)

  // Expose registration via getNodeProps callers — they should pass `ref` to the
  // rendered element. We do that in StyledTree below.
  const _registerRef = useCallback((id: string, el: HTMLElement | null) => {
    if (el) itemRefs.current.set(id, el);
    else itemRefs.current.delete(id);
  }, []);
  // Stash on the result so the styled component can call it.
  (getNodeProps as unknown as { register: typeof _registerRef }).register = _registerRef;

  return {
    visibleNodes,
    expandedIds,
    selectedId: selectionMode === "single" ? selectedId : null,
    selectedIds: selectionMode === "multiple" ? selectedIds : (selectedId ? [selectedId] : []),
    isExpanded,
    isSelected,
    expand,
    collapse,
    toggle,
    expandAll,
    collapseAll,
    select,
    isLoadingNode,
    getRootProps,
    getNodeProps,
    getToggleProps,
    focusNode,
  };
}

/** Internal helper for the styled component to register node refs for keyboard focus. */
export function _registerTreeNodeRef(
  result: UseTreeResult,
  id: string,
  el: HTMLElement | null,
): void {
  const fn = (result.getNodeProps as unknown as { register?: (id: string, el: HTMLElement | null) => void }).register;
  fn?.(id, el);
}
