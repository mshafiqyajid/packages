import { useState, useCallback, useRef, useId } from "react";

export type AccordionType = "single" | "multiple";

export interface UseAccordionOptions {
  /** Array of item IDs managed by the accordion */
  items: string[];
  /** Whether one or multiple items can be open at once. Default: "single" */
  type?: AccordionType;
  /** Initially open item ID (single mode) or array of IDs (multiple mode) */
  defaultOpen?: string | string[];
}

export interface AccordionTriggerProps {
  id: string;
  "aria-expanded": boolean;
  "aria-controls": string;
  role: "button";
  tabIndex: 0;
  onClick: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

export interface AccordionPanelProps {
  id: string;
  role: "region";
  "aria-labelledby": string;
  hidden: boolean;
}

export interface AccordionItemProps {
  triggerProps: AccordionTriggerProps;
  panelProps: AccordionPanelProps;
  isOpen: boolean;
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

export function useAccordion({
  items,
  type = "single",
  defaultOpen,
}: UseAccordionOptions): UseAccordionResult {
  const baseId = useId();
  const [openItems, setOpenItems] = useState<string[]>(() =>
    normalizeDefaultOpen(defaultOpen, type),
  );

  const itemsRef = useRef(items);
  itemsRef.current = items;

  const triggerId = useCallback(
    (id: string) => `${baseId}-trigger-${id}`,
    [baseId],
  );

  const panelId = useCallback(
    (id: string) => `${baseId}-panel-${id}`,
    [baseId],
  );

  const open = useCallback(
    (id: string) => {
      setOpenItems((prev) => {
        if (prev.includes(id)) return prev;
        return type === "single" ? [id] : [...prev, id];
      });
    },
    [type],
  );

  const close = useCallback((id: string) => {
    setOpenItems((prev) => prev.filter((i) => i !== id));
  }, []);

  const toggle = useCallback(
    (id: string) => {
      setOpenItems((prev) => {
        if (prev.includes(id)) {
          return prev.filter((i) => i !== id);
        }
        return type === "single" ? [id] : [...prev, id];
      });
    },
    [type],
  );

  const getItemProps = useCallback(
    (id: string): AccordionItemProps => {
      const isOpen = openItems.includes(id);

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
          "aria-expanded": isOpen,
          "aria-controls": panelId(id),
          role: "button",
          tabIndex: 0,
          onClick: () => toggle(id),
          onKeyDown,
        },
        panelProps: {
          id: panelId(id),
          role: "region",
          "aria-labelledby": triggerId(id),
          hidden: !isOpen,
        },
        isOpen,
      };
    },
    [openItems, toggle, triggerId, panelId],
  );

  return { getItemProps, openItems, open, close, toggle };
}
