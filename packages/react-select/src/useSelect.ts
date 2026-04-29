import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useId,
  type KeyboardEvent,
  type RefObject,
} from "react";

export interface SelectItem {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface UseSelectOptions {
  items: SelectItem[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  searchable?: boolean;
}

export interface UseSelectResult {
  triggerProps: {
    ref: RefObject<HTMLButtonElement>;
    id: string;
    role: "combobox";
    "aria-haspopup": "listbox";
    "aria-expanded": boolean;
    "aria-controls": string;
    "aria-activedescendant": string | undefined;
    tabIndex: number;
    onClick: () => void;
    onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => void;
  };
  listboxProps: {
    ref: RefObject<HTMLUListElement>;
    id: string;
    role: "listbox";
    "aria-multiselectable": boolean;
    "aria-labelledby": string;
    tabIndex: -1;
  };
  getItemProps: (item: SelectItem) => {
    id: string;
    role: "option";
    "aria-selected": boolean;
    "aria-disabled": boolean;
    "data-focused": boolean;
    onClick: () => void;
    onMouseEnter: () => void;
  };
  isOpen: boolean;
  searchValue: string;
  setSearchValue: (v: string) => void;
  filteredItems: SelectItem[];
  selectedItems: SelectItem[];
}

export function useSelect({
  items,
  value,
  onChange,
  multiple = false,
  searchable = false,
}: UseSelectOptions): UseSelectResult {
  const triggerId = useId();
  const listboxId = useId();

  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  const selectedValues = Array.isArray(value) ? value : value ? [value] : [];

  const selectedItems = items.filter((item) =>
    selectedValues.includes(item.value),
  );

  const filteredItems = searchable && searchValue
    ? items.filter((item) =>
        item.label.toLowerCase().includes(searchValue.toLowerCase()),
      )
    : items;

  const open = useCallback(() => {
    setIsOpen(true);
    setFocusedIndex(-1);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setSearchValue("");
    setFocusedIndex(-1);
    triggerRef.current?.focus();
  }, []);

  const selectItem = useCallback(
    (item: SelectItem) => {
      if (item.disabled) return;
      if (multiple) {
        const next = selectedValues.includes(item.value)
          ? selectedValues.filter((v) => v !== item.value)
          : [...selectedValues, item.value];
        onChange(next);
      } else {
        onChange(item.value);
        close();
      }
    },
    [multiple, selectedValues, onChange, close],
  );

  const focusableItems = filteredItems.filter((item) => !item.disabled);

  const moveFocus = useCallback(
    (direction: 1 | -1) => {
      setFocusedIndex((prev) => {
        const len = focusableItems.length;
        if (len === 0) return -1;
        if (prev === -1) return direction === 1 ? 0 : len - 1;
        const next = prev + direction;
        if (next < 0) return len - 1;
        if (next >= len) return 0;
        return next;
      });
    },
    [focusableItems.length],
  );

  const handleTriggerKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>) => {
      switch (e.key) {
        case "Enter":
        case " ": {
          e.preventDefault();
          if (isOpen) {
            if (focusedIndex >= 0) {
              const item = focusableItems[focusedIndex];
              if (item) selectItem(item);
            } else {
              close();
            }
          } else {
            open();
          }
          break;
        }
        case "ArrowDown": {
          e.preventDefault();
          if (!isOpen) {
            open();
          } else {
            moveFocus(1);
          }
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          if (!isOpen) {
            open();
          } else {
            moveFocus(-1);
          }
          break;
        }
        case "Escape": {
          e.preventDefault();
          close();
          break;
        }
        default: {
          if (searchable && isOpen && e.key.length === 1) {
            setSearchValue((prev) => prev + e.key);
          }
          break;
        }
      }
    },
    [isOpen, focusedIndex, focusableItems, selectItem, close, open, moveFocus, searchable],
  );

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (
        !triggerRef.current?.contains(target) &&
        !listboxRef.current?.contains(target)
      ) {
        close();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isOpen, close]);

  // Reset focus index when filtered items change
  useEffect(() => {
    setFocusedIndex(-1);
  }, [searchValue]);

  const focusedItemId =
    focusedIndex >= 0 && focusableItems[focusedIndex]
      ? `${listboxId}-item-${focusableItems[focusedIndex]!.value}`
      : undefined;

  const getItemProps = useCallback(
    (item: SelectItem) => {
      const focusableIdx = focusableItems.indexOf(item);
      return {
        id: `${listboxId}-item-${item.value}`,
        role: "option" as const,
        "aria-selected": selectedValues.includes(item.value),
        "aria-disabled": item.disabled === true,
        "data-focused": !item.disabled && focusableIdx === focusedIndex,
        onClick: () => selectItem(item),
        onMouseEnter: () => {
          if (!item.disabled) setFocusedIndex(focusableIdx);
        },
      };
    },
    [listboxId, selectedValues, focusedIndex, focusableItems, selectItem],
  );

  return {
    triggerProps: {
      ref: triggerRef as RefObject<HTMLButtonElement>,
      id: triggerId,
      role: "combobox",
      "aria-haspopup": "listbox",
      "aria-expanded": isOpen,
      "aria-controls": listboxId,
      "aria-activedescendant": focusedItemId,
      tabIndex: 0,
      onClick: () => (isOpen ? close() : open()),
      onKeyDown: handleTriggerKeyDown,
    },
    listboxProps: {
      ref: listboxRef as RefObject<HTMLUListElement>,
      id: listboxId,
      role: "listbox",
      "aria-multiselectable": multiple,
      "aria-labelledby": triggerId,
      tabIndex: -1,
    },
    getItemProps,
    isOpen,
    searchValue,
    setSearchValue,
    filteredItems,
    selectedItems,
  };
}
