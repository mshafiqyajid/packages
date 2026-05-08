import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useId,
  type KeyboardEvent,
  type RefObject,
  type ChangeEvent,
  type FocusEvent,
} from "react";

export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
}

export interface UseComboboxOptions {
  options?: ComboboxOption[];
  value?: string | null;
  defaultValue?: string;
  onChange?: (value: string | null) => void;
  loadOptions?: (query: string) => Promise<ComboboxOption[]>;
  debounceMs?: number;
  creatable?: boolean;
  onCreateOption?: (value: string) => void;
}

export interface OptionState {
  focused: boolean;
  selected: boolean;
}

export interface UseComboboxResult {
  inputProps: {
    ref: RefObject<HTMLInputElement>;
    id: string;
    role: "combobox";
    "aria-expanded": boolean;
    "aria-autocomplete": "list";
    "aria-controls": string;
    "aria-activedescendant": string | undefined;
    "aria-invalid"?: boolean;
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onFocus: (e: FocusEvent<HTMLInputElement>) => void;
    onBlur: (e: FocusEvent<HTMLInputElement>) => void;
    onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
    autoComplete: "off";
    autoCorrect: "off";
    spellCheck: false;
  };
  listboxProps: {
    ref: RefObject<HTMLUListElement>;
    id: string;
    role: "listbox";
    "aria-busy": boolean | undefined;
  };
  getOptionProps: (
    option: ComboboxOption,
    index: number,
  ) => {
    id: string;
    role: "option";
    "aria-selected": boolean;
    "aria-disabled": boolean;
    "data-focused": boolean;
    "data-selected": boolean;
    "data-disabled": boolean | undefined;
    onClick: () => void;
    onMouseEnter: () => void;
  };
  isOpen: boolean;
  query: string;
  setQuery: (q: string) => void;
  selectedOption: ComboboxOption | undefined;
  clearSelection: () => void;
  isLoading: boolean;
  loadError: Error | null;
  filteredOptions: ComboboxOption[];
  /** When creatable and the query doesn't match any option label exactly */
  showCreateOption: boolean;
}

function isControlled(value: string | null | undefined): value is string | null {
  return value !== undefined;
}

export function useCombobox({
  options = [],
  value,
  defaultValue,
  onChange,
  loadOptions,
  debounceMs = 300,
  creatable = false,
  onCreateOption,
}: UseComboboxOptions): UseComboboxResult {
  const inputId = useId();
  const listboxId = useId();

  const controlled = isControlled(value);
  const [internalValue, setInternalValue] = useState<string | null>(
    defaultValue ?? null,
  );
  const currentValue = controlled ? value : internalValue;

  const [query, setQueryRaw] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const [asyncOptions, setAsyncOptions] = useState<ComboboxOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ignoreBlurRef = useRef(false);

  const setValue = useCallback(
    (next: string | null) => {
      if (!controlled) setInternalValue(next);
      onChange?.(next);
    },
    [controlled, onChange],
  );

  const filteredOptions = loadOptions
    ? asyncOptions
    : query
    ? options.filter((o) =>
        o.label.toLowerCase().includes(query.toLowerCase()),
      )
    : options;

  const focusableOptions = filteredOptions.filter((o) => !o.disabled);

  const selectedOption = options.find((o) => o.value === currentValue);

  const exactMatch = filteredOptions.some(
    (o) => o.label.toLowerCase() === query.toLowerCase(),
  );
  const showCreateOption =
    creatable && query.trim().length > 0 && !exactMatch;

  // Total navigable items = focusable options + maybe create option
  const navigableCount = focusableOptions.length + (showCreateOption ? 1 : 0);
  const createIndex = focusableOptions.length; // index of the "create" pseudo-option

  const open = useCallback(() => {
    setIsOpen(true);
    setFocusedIndex(-1);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setFocusedIndex(-1);
  }, []);

  const setQuery = useCallback(
    (q: string) => {
      setQueryRaw(q);
      setFocusedIndex(-1);
      if (!isOpen) setIsOpen(true);
    },
    [isOpen],
  );

  const selectOption = useCallback(
    (option: ComboboxOption) => {
      if (option.disabled) return;
      setValue(option.value);
      setQueryRaw(option.label);
      close();
    },
    [setValue, close],
  );

  const clearSelection = useCallback(() => {
    setValue(null);
    setQueryRaw("");
    close();
  }, [setValue, close]);

  const moveFocus = useCallback(
    (direction: 1 | -1) => {
      setFocusedIndex((prev) => {
        if (navigableCount === 0) return -1;
        if (prev === -1) return direction === 1 ? 0 : navigableCount - 1;
        const next = prev + direction;
        if (next < 0) return navigableCount - 1;
        if (next >= navigableCount) return 0;
        return next;
      });
    },
    [navigableCount],
  );

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
    },
    [setQuery],
  );

  const handleInputFocus = useCallback(
    (_e: FocusEvent<HTMLInputElement>) => {
      // Clear query so the full list shows when re-focusing with a selection.
      // The selected label is restored on blur.
      if (currentValue) setQueryRaw("");
      open();
    },
    [open, currentValue],
  );

  const handleInputBlur = useCallback(
    (_e: FocusEvent<HTMLInputElement>) => {
      if (ignoreBlurRef.current) return;
      // Restore query to selected option label on blur if no explicit selection
      if (currentValue) {
        const opt = options.find((o) => o.value === currentValue);
        if (opt) setQueryRaw(opt.label);
        else setQueryRaw("");
      } else {
        setQueryRaw("");
      }
      close();
    },
    [close, currentValue, options],
  );

  const handleInputKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
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
        case "Enter": {
          e.preventDefault();
          if (!isOpen) {
            open();
            break;
          }
          if (focusedIndex >= 0) {
            if (showCreateOption && focusedIndex === createIndex) {
              // Create option
              onCreateOption?.(query.trim());
              close();
            } else {
              const opt = focusableOptions[focusedIndex];
              if (opt) selectOption(opt);
            }
          } else if (showCreateOption) {
            onCreateOption?.(query.trim());
            close();
          }
          break;
        }
        case "Escape": {
          e.preventDefault();
          if (isOpen) {
            // If query is dirty, clear it; otherwise close
            if (query && !currentValue) {
              setQueryRaw("");
              setFocusedIndex(-1);
            } else {
              // Restore to selected label
              if (currentValue) {
                const opt = options.find((o) => o.value === currentValue);
                setQueryRaw(opt?.label ?? "");
              } else {
                setQueryRaw("");
              }
              close();
            }
          }
          break;
        }
        case "Backspace": {
          const isShowingLabel = selectedOption && query === selectedOption.label;
          if ((query === "" || isShowingLabel) && currentValue !== null && currentValue !== undefined) {
            clearSelection();
          }
          break;
        }
        case "Tab": {
          close();
          break;
        }
        default:
          break;
      }
    },
    [
      isOpen,
      open,
      close,
      moveFocus,
      focusedIndex,
      focusableOptions,
      showCreateOption,
      createIndex,
      selectOption,
      query,
      currentValue,
      options,
      clearSelection,
      onCreateOption,
    ],
  );

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (
        !inputRef.current?.contains(target) &&
        !listboxRef.current?.contains(target)
      ) {
        ignoreBlurRef.current = true;
        // Restore query before closing
        if (currentValue) {
          const opt = options.find((o) => o.value === currentValue);
          setQueryRaw(opt?.label ?? "");
        } else {
          setQueryRaw("");
        }
        close();
        requestAnimationFrame(() => {
          ignoreBlurRef.current = false;
        });
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isOpen, close, currentValue, options]);

  // Listbox click: don't let blur fire before we handle the selection
  useEffect(() => {
    const el = listboxRef.current;
    if (!el) return;
    const onMouseDown = () => {
      ignoreBlurRef.current = true;
      requestAnimationFrame(() => {
        ignoreBlurRef.current = false;
      });
    };
    el.addEventListener("mousedown", onMouseDown);
    return () => el.removeEventListener("mousedown", onMouseDown);
  });

  // Async loadOptions
  useEffect(() => {
    if (!loadOptions || !isOpen) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsLoading(true);
      setLoadError(null);

      Promise.resolve(loadOptions(query))
        .then((result) => {
          if (controller.signal.aborted) return;
          setAsyncOptions(result);
          setIsLoading(false);
        })
        .catch((err) => {
          if (controller.signal.aborted) return;
          setLoadError(err instanceof Error ? err : new Error(String(err)));
          setIsLoading(false);
        });
    }, debounceMs);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, isOpen, loadOptions, debounceMs]);

  // Cancel in-flight on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Sync query to selected option label when value changes externally
  useEffect(() => {
    if (controlled) {
      if (currentValue) {
        const opt = options.find((o) => o.value === currentValue);
        if (opt) setQueryRaw(opt.label);
        else setQueryRaw("");
      } else if (currentValue === null) {
        setQueryRaw("");
      }
    }
  }, [controlled, currentValue, options]);

  const focusedOptionId =
    focusedIndex >= 0 &&
    focusedIndex < focusableOptions.length &&
    focusableOptions[focusedIndex]
      ? `${listboxId}-opt-${focusableOptions[focusedIndex]!.value}`
      : showCreateOption && focusedIndex === createIndex
      ? `${listboxId}-opt-create`
      : undefined;

  const getOptionProps = useCallback(
    (option: ComboboxOption, _index: number) => {
      const focusableIdx = focusableOptions.indexOf(option);
      const isFocused = !option.disabled && focusableIdx === focusedIndex;
      const isSelected = option.value === currentValue;
      return {
        id: `${listboxId}-opt-${option.value}`,
        role: "option" as const,
        "aria-selected": isSelected,
        "aria-disabled": option.disabled === true,
        "data-focused": isFocused,
        "data-selected": isSelected,
        "data-disabled": option.disabled || undefined,
        onClick: () => {
          ignoreBlurRef.current = true;
          selectOption(option);
          requestAnimationFrame(() => {
            ignoreBlurRef.current = false;
          });
        },
        onMouseEnter: () => {
          if (!option.disabled) setFocusedIndex(focusableIdx);
        },
      };
    },
    [focusableOptions, focusedIndex, currentValue, listboxId, selectOption],
  );

  return {
    inputProps: {
      ref: inputRef as RefObject<HTMLInputElement>,
      id: inputId,
      role: "combobox",
      "aria-expanded": isOpen,
      "aria-autocomplete": "list",
      "aria-controls": listboxId,
      "aria-activedescendant": focusedOptionId,
      value: query,
      onChange: handleInputChange,
      onFocus: handleInputFocus,
      onBlur: handleInputBlur,
      onKeyDown: handleInputKeyDown,
      autoComplete: "off",
      autoCorrect: "off",
      spellCheck: false,
    },
    listboxProps: {
      ref: listboxRef as RefObject<HTMLUListElement>,
      id: listboxId,
      role: "listbox",
      "aria-busy": isLoading || undefined,
    },
    getOptionProps,
    isOpen,
    query,
    setQuery,
    selectedOption,
    clearSelection,
    isLoading,
    loadError,
    filteredOptions,
    showCreateOption,
  };
}
