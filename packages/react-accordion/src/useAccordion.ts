import { useState, useCallback, useRef, useId, useMemo } from "react";

export type AccordionType = "single" | "multiple";

export interface UseAccordionOptions {
  /** Array of item IDs managed by the accordion */
  items: string[];
  /** Whether one or multiple items can be open at once. Default: "single" */
  type?: AccordionType;
  /** Initially open item ID (single mode) or array of IDs (multiple mode) */
  defaultOpen?: string | string[];
  /** Controlled open state. Single → string | null, multiple → string[]. */
  value?: string | string[] | null;
  /** Fired whenever the open set changes. */
  onValueChange?: (value: string | string[] | null) => void;
  /** Disable all items globally. */
  disabled?: boolean;
  /** Disable specific items by id. */
  disabledItems?: string[];
  /** Single mode only: allow clicking the open item again to close it. Default: true. */
  collapsible?: boolean;
  /** Per-item open/close callback. Fires after the change. */
  onOpenChange?: (id: string, isOpen: boolean) => void;
}

export interface AccordionTriggerProps {
  id: string;
  "aria-expanded": boolean;
  "aria-controls": string;
  "aria-disabled"?: boolean;
  "data-state": "open" | "closed";
  role: "button";
  tabIndex: 0 | -1;
  onClick: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  disabled?: boolean;
}

export interface AccordionPanelProps {
  id: string;
  role: "region";
  "aria-labelledby": string;
  "data-state": "open" | "closed";
  hidden: boolean;
}

export interface AccordionItemProps {
  triggerProps: AccordionTriggerProps;
  panelProps: AccordionPanelProps;
  isOpen: boolean;
  isDisabled: boolean;
}

export interface UseAccordionResult {
  /** Returns ARIA-wired props for a given item ID */
  getItemProps: (id: string) => AccordionItemProps;
  /** Currently open item IDs */
  openItems: string[];
  /** Programmatically open an item */
  open: (id: string) => void;
  /** Programmatically close an item */
  close: (id: string) => void;
  /** Toggle an item */
  toggle: (id: string) => void;
  /** Open every item (multiple mode only — no-op in single). */
  expandAll: () => void;
  /** Close every item. */
  collapseAll: () => void;
  /** Programmatic check. */
  isOpen: (id: string) => boolean;
}

function normalizeDefaultOpen(
  defaultOpen: string | string[] | undefined,
  type: AccordionType,
): string[] {
  if (defaultOpen === undefined) return [];
  if (Array.isArray(defaultOpen)) {
    return type === "single" ? defaultOpen.slice(0, 1) : defaultOpen;
  }
  return [defaultOpen];
}

function normalizeControlled(
  value: string | string[] | null | undefined,
  type: AccordionType,
): string[] {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) {
    return type === "single" ? value.slice(0, 1) : value;
  }
  return [value];
}

export function useAccordion({
  items,
  type = "single",
  defaultOpen,
  value: controlledValue,
  onValueChange,
  disabled = false,
  disabledItems,
  collapsible = true,
  onOpenChange,
}: UseAccordionOptions): UseAccordionResult {
  const baseId = useId();
  const isControlled = controlledValue !== undefined;
  const [internalOpen, setInternalOpen] = useState<string[]>(() =>
    normalizeDefaultOpen(defaultOpen, type),
  );

  const openItems = isControlled
    ? normalizeControlled(controlledValue, type)
    : internalOpen;

  const itemsRef = useRef(items);
  itemsRef.current = items;

  const disabledSet = useMemo(
    () => new Set(disabledItems ?? []),
    [disabledItems],
  );

  const triggerId = useCallback(
    (id: string) => `${baseId}-trigger-${id}`,
    [baseId],
  );

  const panelId = useCallback(
    (id: string) => `${baseId}-panel-${id}`,
    [baseId],
  );

  const onOpenChangeRef = useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;
  const onValueChangeRef = useRef(onValueChange);
  onValueChangeRef.current = onValueChange;

  const commit = useCallback(
    (next: string[]) => {
      if (!isControlled) setInternalOpen(next);
      if (onValueChangeRef.current) {
        const value: string | string[] | null =
          type === "single" ? (next[0] ?? null) : next;
        onValueChangeRef.current(value);
      }
    },
    [isControlled, type],
  );

  const isItemDisabled = useCallback(
    (id: string) => disabled || disabledSet.has(id),
    [disabled, disabledSet],
  );

  const open = useCallback(
    (id: string) => {
      if (isItemDisabled(id)) return;
      if (openItems.includes(id)) return;
      const next = type === "single" ? [id] : [...openItems, id];
      commit(next);
      onOpenChangeRef.current?.(id, true);
    },
    [type, openItems, commit, isItemDisabled],
  );

  const close = useCallback(
    (id: string) => {
      if (!openItems.includes(id)) return;
      const next = openItems.filter((i) => i !== id);
      commit(next);
      onOpenChangeRef.current?.(id, false);
    },
    [openItems, commit],
  );

  const toggle = useCallback(
    (id: string) => {
      if (isItemDisabled(id)) return;
      const isCurrentlyOpen = openItems.includes(id);
      if (isCurrentlyOpen) {
        if (type === "single" && !collapsible) return;
        const next = openItems.filter((i) => i !== id);
        commit(next);
        onOpenChangeRef.current?.(id, false);
      } else {
        const next = type === "single" ? [id] : [...openItems, id];
        commit(next);
        onOpenChangeRef.current?.(id, true);
      }
    },
    [openItems, type, collapsible, commit, isItemDisabled],
  );

  const expandAll = useCallback(() => {
    if (type === "single") return;
    const next = itemsRef.current.filter((id) => !isItemDisabled(id));
    commit(next);
  }, [type, commit, isItemDisabled]);

  const collapseAll = useCallback(() => {
    commit([]);
  }, [commit]);

  const isOpen = useCallback(
    (id: string) => openItems.includes(id),
    [openItems],
  );

  const getItemProps = useCallback(
    (id: string): AccordionItemProps => {
      const itemOpen = openItems.includes(id);
      const itemDisabled = isItemDisabled(id);

      const onKeyDown = (e: React.KeyboardEvent) => {
        const currentItems = itemsRef.current;
        const currentIndex = currentItems.indexOf(id);

        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle(id);
          return;
        }

        let nextIndex = -1;
        if (e.key === "ArrowDown") {
          e.preventDefault();
          nextIndex = (currentIndex + 1) % currentItems.length;
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          nextIndex =
            (currentIndex - 1 + currentItems.length) % currentItems.length;
        } else if (e.key === "Home") {
          e.preventDefault();
          nextIndex = 0;
        } else if (e.key === "End") {
          e.preventDefault();
          nextIndex = currentItems.length - 1;
        }

        if (nextIndex !== -1) {
          const nextId = currentItems[nextIndex] as string;
          const nextTrigger = document.getElementById(triggerId(nextId));
          nextTrigger?.focus();
        }
      };

      return {
        triggerProps: {
          id: triggerId(id),
          "aria-expanded": itemOpen,
          "aria-controls": panelId(id),
          "aria-disabled": itemDisabled || undefined,
          "data-state": itemOpen ? "open" : "closed",
          role: "button",
          tabIndex: itemDisabled ? -1 : 0,
          onClick: () => toggle(id),
          onKeyDown,
          disabled: itemDisabled || undefined,
        },
        panelProps: {
          id: panelId(id),
          role: "region",
          "aria-labelledby": triggerId(id),
          "data-state": itemOpen ? "open" : "closed",
          hidden: !itemOpen,
        },
        isOpen: itemOpen,
        isDisabled: itemDisabled,
      };
    },
    [openItems, toggle, triggerId, panelId, isItemDisabled],
  );

  return {
    getItemProps,
    openItems,
    open,
    close,
    toggle,
    expandAll,
    collapseAll,
    isOpen,
  };
}
