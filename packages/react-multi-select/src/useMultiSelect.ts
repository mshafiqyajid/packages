import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useId,
  type KeyboardEvent,
  type RefObject,
} from "react";

export interface MultiSelectOption {
  value: string;
  label: string;
  group?: string;
  disabled?: boolean;
}

export interface UseMultiSelectOptions {
  options: MultiSelectOption[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  searchable?: boolean;
  maxSelected?: number;
}

export interface UseMultiSelectResult {
  triggerProps: {
    ref: RefObject<HTMLButtonElement>;
    id: string;
    role: "combobox";
    "aria-haspopup": "listbox";
    "aria-expanded": boolean;
    "aria-controls": string;
    "aria-activedescendant": string | undefined;
    "aria-multiselectable": true;
    tabIndex: number;
    onClick: () => void;
    onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => void;
  };
  listboxProps: {
    ref: RefObject<HTMLUListElement>;
    id: string;
    role: "listbox";
    "aria-multiselectable": true;
    "aria-labelledby": string;
    tabIndex: -1;
  };
  getOptionProps: (option: MultiSelectOption) => {
    id: string;
    role: "option";
    "aria-selected": boolean;
    "aria-disabled": boolean;
    "data-selected": boolean;
    "data-focused": boolean;
    "data-disabled": boolean;
    onClick: () => void;
    onMouseEnter: () => void;
  };
  isOpen: boolean;
  searchValue: string;
  setSearchValue: (v: string) => void;
  selectedOptions: MultiSelectOption[];
  selectedValues: string[];
  filteredOptions: MultiSelectOption[];
  toggleOption: (value: string) => void;
  selectAll: () => void;
  clearAll: () => void;
  isAllSelected: boolean;
  isIndeterminate: boolean;
  focusedIndex: number;
}

export function useMultiSelect({
  options,
  value: controlledValue,
  defaultValue,
  onChange,
  searchable = true,
  maxSelected,
}: UseMultiSelectOptions): UseMultiSelectResult {
  const triggerId = useId();
  const listboxId = useId();

  const isControlled = controlledValue !== undefined;

  const [internalValue, setInternalValue] = useState<string[]>(
    defaultValue ?? [],
  );

  const selectedValues = isControlled ? (controlledValue ?? []) : internalValue;

  const setSelectedValues = useCallback(
    (next: string[]) => {
      if (!isControlled) setInternalValue(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  const filteredOptions =
    searchable && searchValue
      ? options.filter((opt) =>
          opt.label.toLowerCase().includes(searchValue.toLowerCase()),
        )
      : options;

  const selectedOptions = options.filter((opt) =>
    selectedValues.includes(opt.value),
  );

  const enabledOptions = filteredOptions.filter((opt) => !opt.disabled);

  const isAllSelected =
    enabledOptions.length > 0 &&
    enabledOptions.every((opt) => selectedValues.includes(opt.value));

  const isIndeterminate =
    !isAllSelected &&
    enabledOptions.some((opt) => selectedValues.includes(opt.value));

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

  const toggleOption = useCallback(
    (value: string) => {
      const opt = options.find((o) => o.value === value);
      if (opt?.disabled) return;
      const isSelected = selectedValues.includes(value);
      if (isSelected) {
        setSelectedValues(selectedValues.filter((v) => v !== value));
      } else {
        if (maxSelected !== undefined && selectedValues.length >= maxSelected) {
          return;
        }
        setSelectedValues([...selectedValues, value]);
      }
    },
    [options, selectedValues, setSelectedValues, maxSelected],
  );

  const selectAll = useCallback(() => {
    const currentlyEnabled = options.filter((opt) => !opt.disabled);
    const allEnabledValues = currentlyEnabled.map((opt) => opt.value);
    if (maxSelected !== undefined) {
      const toAdd = allEnabledValues
        .filter((v) => !selectedValues.includes(v))
        .slice(0, maxSelected - selectedValues.length);
      setSelectedValues([...selectedValues, ...toAdd]);
    } else {
      const merged = Array.from(new Set([...selectedValues, ...allEnabledValues]));
      setSelectedValues(merged);
    }
  }, [options, selectedValues, setSelectedValues, maxSelected]);

  const clearAll = useCallback(() => {
    setSelectedValues([]);
  }, [setSelectedValues]);

  const moveFocus = useCallback(
    (direction: 1 | -1) => {
      setFocusedIndex((prev) => {
        const len = enabledOptions.length;
        if (len === 0) return -1;
        if (prev === -1) return direction === 1 ? 0 : len - 1;
        const next = prev + direction;
        if (next < 0) return len - 1;
        if (next >= len) return 0;
        return next;
      });
    },
    [enabledOptions.length],
  );

  const handleTriggerKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>) => {
      switch (e.key) {
        case "Enter": {
          e.preventDefault();
          if (isOpen) {
            if (focusedIndex >= 0) {
              const opt = enabledOptions[focusedIndex];
              if (opt) toggleOption(opt.value);
            } else {
              close();
            }
          } else {
            open();
          }
          break;
        }
        case " ": {
          e.preventDefault();
          if (isOpen) {
            if (focusedIndex >= 0) {
              const opt = enabledOptions[focusedIndex];
              if (opt) toggleOption(opt.value);
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
          if (searchable && isOpen && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
            setSearchValue((prev) => prev + e.key);
          }
          break;
        }
      }
    },
    [
      isOpen,
      focusedIndex,
      enabledOptions,
      toggleOption,
      close,
      open,
      moveFocus,
      searchable,
    ],
  );

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

  useEffect(() => {
    setFocusedIndex(-1);
  }, [searchValue]);

  const focusedOptionId =
    focusedIndex >= 0 && enabledOptions[focusedIndex]
      ? `${listboxId}-opt-${enabledOptions[focusedIndex]!.value}`
      : undefined;

  const getOptionProps = useCallback(
    (option: MultiSelectOption) => {
      const focusableIdx = enabledOptions.indexOf(option);
      const isSelected = selectedValues.includes(option.value);
      const isFocused = !option.disabled && focusableIdx === focusedIndex;
      return {
        id: `${listboxId}-opt-${option.value}`,
        role: "option" as const,
        "aria-selected": isSelected,
        "aria-disabled": option.disabled === true,
        "data-selected": isSelected,
        "data-focused": isFocused,
        "data-disabled": option.disabled === true,
        onClick: () => toggleOption(option.value),
        onMouseEnter: () => {
          if (!option.disabled) setFocusedIndex(focusableIdx);
        },
      };
    },
    [listboxId, selectedValues, focusedIndex, enabledOptions, toggleOption],
  );

  return {
    triggerProps: {
      ref: triggerRef as RefObject<HTMLButtonElement>,
      id: triggerId,
      role: "combobox",
      "aria-haspopup": "listbox",
      "aria-expanded": isOpen,
      "aria-controls": listboxId,
      "aria-activedescendant": focusedOptionId,
      "aria-multiselectable": true,
      tabIndex: 0,
      onClick: () => (isOpen ? close() : open()),
      onKeyDown: handleTriggerKeyDown,
    },
    listboxProps: {
      ref: listboxRef as RefObject<HTMLUListElement>,
      id: listboxId,
      role: "listbox",
      "aria-multiselectable": true,
      "aria-labelledby": triggerId,
      tabIndex: -1,
    },
    getOptionProps,
    isOpen,
    searchValue,
    setSearchValue,
    selectedOptions,
    selectedValues,
    filteredOptions,
    toggleOption,
    selectAll,
    clearAll,
    isAllSelected,
    isIndeterminate,
    focusedIndex,
  };
}
