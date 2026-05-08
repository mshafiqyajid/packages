import {
  useCallback,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";

// ─── Data types ──────────────────────────────────────────────────────────────

export interface SidebarItem {
  id: string;
  label: string;
  icon?: ReactNode;
  href?: string;
  active?: boolean;
  disabled?: boolean;
  badge?: ReactNode;
  children?: SidebarItem[];
}

export interface SidebarSection {
  label?: string;
  items: SidebarItem[];
}

// ─── Hook options / result ────────────────────────────────────────────────────

export interface UseSidebarOptions {
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  activeId?: string;
  onItemClick?: (id: string, item: SidebarItem) => void;
  sections?: SidebarSection[];
}

export interface SidebarNavProps {
  ref: RefObject<HTMLElement | null>;
  role: "navigation";
  "aria-label": string;
}

export interface SidebarItemProps {
  id: string;
  role: "listitem";
  tabIndex: number;
  "aria-current": "page" | undefined;
  "aria-disabled": true | undefined;
  onClick: () => void;
  onKeyDown: (e: ReactKeyboardEvent<HTMLElement>) => void;
  "data-active": boolean;
  "data-item-id": string;
}

export interface SidebarSectionProps {
  id: string;
  "aria-label": string | undefined;
  "aria-expanded": boolean;
  role: "group";
}

export interface UseSidebarResult {
  isCollapsed: boolean;
  toggle: () => void;
  expandedSections: string[];
  isExpanded: (id: string) => boolean;
  toggleSection: (id: string) => void;
  sidebarProps: SidebarNavProps;
  getItemProps: (item: SidebarItem) => SidebarItemProps;
  getSectionProps: (sectionId: string, label?: string) => SidebarSectionProps;
  /** Register/unregister item DOM refs for keyboard focus management. */
  registerItemRef: (id: string, el: HTMLElement | null) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function flattenItems(sections: SidebarSection[]): SidebarItem[] {
  const out: SidebarItem[] = [];
  function walk(items: SidebarItem[]) {
    for (const item of items) {
      out.push(item);
      if (item.children) walk(item.children);
    }
  }
  for (const section of sections) walk(section.items);
  return out;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useSidebar(opts: UseSidebarOptions = {}): UseSidebarResult {
  const {
    collapsed: controlledCollapsed,
    defaultCollapsed = false,
    onCollapse,
    activeId,
    onItemClick,
    sections = [],
  } = opts;

  const baseId = useId();
  const isCollapsedControlled = controlledCollapsed !== undefined;
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const isCollapsed = isCollapsedControlled ? controlledCollapsed! : internalCollapsed;

  const toggle = useCallback(() => {
    const next = !isCollapsed;
    if (!isCollapsedControlled) setInternalCollapsed(next);
    onCollapse?.(next);
  }, [isCollapsed, isCollapsedControlled, onCollapse]);

  // Track which nested sections (items with children) are open.
  const [expandedSections, setExpandedSections] = useState<string[]>(() => {
    const ids: string[] = [];
    function walk(items: SidebarItem[]) {
      for (const item of items) {
        if (item.children && item.children.length > 0) {
          // Auto-expand sections containing the active item.
          const hasActive = item.children.some((c) => c.id === activeId || c.active);
          if (hasActive) ids.push(item.id);
          walk(item.children);
        }
      }
    }
    for (const sec of sections) walk(sec.items);
    return ids;
  });

  const isExpanded = useCallback(
    (id: string) => expandedSections.includes(id),
    [expandedSections],
  );

  const toggleSection = useCallback((id: string) => {
    setExpandedSections((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  // DOM refs for keyboard navigation
  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Map<string, HTMLElement>>(new Map());

  const registerItemRef = useCallback((id: string, el: HTMLElement | null) => {
    if (el) itemRefs.current.set(id, el);
    else itemRefs.current.delete(id);
  }, []);

  // Build a flat, currently-visible list of focusable item ids.
  const getVisibleIds = useCallback((): string[] => {
    const ids: string[] = [];
    function walk(items: SidebarItem[]) {
      for (const item of items) {
        if (!item.disabled) ids.push(item.id);
        if (item.children && item.children.length > 0 && expandedSections.includes(item.id)) {
          walk(item.children);
        }
      }
    }
    for (const sec of sections) walk(sec.items);
    return ids;
  }, [sections, expandedSections]);

  const focusItem = useCallback((id: string) => {
    const el = itemRefs.current.get(id);
    if (el) el.focus();
  }, []);

  const onCollapseRef = useRef(onCollapse);
  onCollapseRef.current = onCollapse;
  const onItemClickRef = useRef(onItemClick);
  onItemClickRef.current = onItemClick;

  const handleItemKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLElement>, item: SidebarItem) => {
      const visibleIds = getVisibleIds();
      const idx = visibleIds.indexOf(item.id);

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = visibleIds[Math.min(visibleIds.length - 1, idx + 1)];
        if (next) focusItem(next);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = visibleIds[Math.max(0, idx - 1)];
        if (prev) focusItem(prev);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (item.children && item.children.length > 0) {
          if (!expandedSections.includes(item.id)) {
            toggleSection(item.id);
          } else {
            // Move focus to first child
            const firstChild = item.children.find((c) => !c.disabled);
            if (firstChild) focusItem(firstChild.id);
          }
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (item.children && item.children.length > 0 && expandedSections.includes(item.id)) {
          toggleSection(item.id);
        } else {
          // Move focus to parent if this is a child item
          outer: for (const sec of sections) {
            for (const parent of sec.items) {
              if (parent.children?.some((c) => c.id === item.id)) {
                focusItem(parent.id);
                break outer;
              }
            }
          }
        }
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (item.disabled) return;
        if (item.children && item.children.length > 0) {
          toggleSection(item.id);
        } else {
          onItemClickRef.current?.(item.id, item);
        }
      }
    },
    [getVisibleIds, focusItem, expandedSections, toggleSection, sections],
  );

  // ─── Prop getters ─────────────────────────────────────────────────────────

  const sidebarProps: SidebarNavProps = {
    ref: navRef,
    role: "navigation",
    "aria-label": "Main navigation",
  };

  const getItemProps = useCallback(
    (item: SidebarItem): SidebarItemProps => {
      const isActive = activeId ? item.id === activeId : (item.active ?? false);
      return {
        id: `${baseId}-item-${item.id}`,
        role: "listitem",
        tabIndex: item.disabled ? -1 : 0,
        "aria-current": isActive ? "page" : undefined,
        "aria-disabled": item.disabled || undefined,
        onClick: () => {
          if (item.disabled) return;
          if (item.children && item.children.length > 0) {
            toggleSection(item.id);
          } else {
            onItemClickRef.current?.(item.id, item);
          }
        },
        onKeyDown: (e) => handleItemKeyDown(e, item),
        "data-active": isActive,
        "data-item-id": item.id,
      };
    },
    [activeId, baseId, toggleSection, handleItemKeyDown],
  );

  const getSectionProps = useCallback(
    (sectionId: string, label?: string): SidebarSectionProps => ({
      id: `${baseId}-section-${sectionId}`,
      "aria-label": label,
      "aria-expanded": expandedSections.includes(sectionId),
      role: "group",
    }),
    [baseId, expandedSections],
  );

  return {
    isCollapsed,
    toggle,
    expandedSections,
    isExpanded,
    toggleSection,
    sidebarProps,
    getItemProps,
    getSectionProps,
    registerItemRef,
  };
}

/** Internal: flatten all items from sections for use in styled component registration. */
export function _flattenSidebarItems(sections: SidebarSection[]): SidebarItem[] {
  return flattenItems(sections);
}
