import {
  useState,
  useCallback,
  useRef,
  type KeyboardEvent,
  type ChangeEvent,
} from "react";

export interface UseTagInputOptions {
  value?: string[];
  defaultValue?: string[];
  onChange?: (tags: string[]) => void;
  suggestions?: string[];
  maxTags?: number;
  allowDuplicates?: boolean;
  disabled?: boolean;
  delimiter?: string[];
  validate?: (tag: string) => boolean | string;
}

export interface UseTagInputResult {
  tags: string[];
  inputProps: {
    value: string;
    disabled: boolean;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
    "aria-autocomplete": "list";
    "aria-expanded": boolean;
    "aria-activedescendant": string | undefined;
    role: "combobox";
  };
  addTag: (tag: string) => void;
  removeTag: (index: number) => void;
  clearTags: () => void;
  inputValue: string;
  setInputValue: (value: string) => void;
  filteredSuggestions: string[];
  activeIndex: number;
  validationError: string | null;
}

export function useTagInput({
  value: controlledValue,
  defaultValue,
  onChange,
  suggestions = [],
  maxTags,
  allowDuplicates = false,
  disabled = false,
  delimiter = ["Enter", ","],
  validate,
}: UseTagInputOptions = {}): UseTagInputResult {
  const isControlled = controlledValue !== undefined;

  const [internalTags, setInternalTags] = useState<string[]>(
    defaultValue ?? [],
  );
  const [inputValue, setInputValue] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [validationError, setValidationError] = useState<string | null>(null);

  const tags = isControlled ? (controlledValue ?? []) : internalTags;

  // Keep a ref that always holds the latest tags so callbacks don't go stale
  const tagsRef = useRef<string[]>(tags);
  tagsRef.current = tags;

  // Keep refs for options that change but shouldn't force callback recreation
  const maxTagsRef = useRef(maxTags);
  maxTagsRef.current = maxTags;

  const allowDuplicatesRef = useRef(allowDuplicates);
  allowDuplicatesRef.current = allowDuplicates;

  const validateRef = useRef(validate);
  validateRef.current = validate;

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const updateTags = useCallback(
    (next: string[]) => {
      if (!isControlled) {
        setInternalTags(next);
        tagsRef.current = next;
      }
      onChangeRef.current?.(next);
    },
    [isControlled],
  );

  const filteredSuggestions = inputValue.trim()
    ? suggestions.filter((s) => {
        const matches = s.toLowerCase().includes(inputValue.toLowerCase());
        if (!matches) return false;
        if (!allowDuplicatesRef.current && tags.includes(s)) return false;
        return true;
      })
    : [];

  const addTag = useCallback(
    (raw: string) => {
      const tag = raw.trim();
      if (!tag) return;
      const currentTags = tagsRef.current;
      const max = maxTagsRef.current;
      const dups = allowDuplicatesRef.current;
      const val = validateRef.current;

      if (max !== undefined && currentTags.length >= max) return;
      if (!dups && currentTags.includes(tag)) {
        setValidationError("Duplicate tag");
        return;
      }
      if (val) {
        const result = val(tag);
        if (result === false) {
          setValidationError("Invalid tag");
          return;
        }
        if (typeof result === "string") {
          setValidationError(result);
          return;
        }
      }
      setValidationError(null);
      updateTags([...currentTags, tag]);
      setInputValue("");
      setActiveIndex(-1);
    },
    [updateTags],
  );

  const removeTag = useCallback(
    (index: number) => {
      const next = tagsRef.current.filter((_, i) => i !== index);
      updateTags(next);
    },
    [updateTags],
  );

  const clearTags = useCallback(() => {
    updateTags([]);
    setInputValue("");
    setActiveIndex(-1);
    setValidationError(null);
  }, [updateTags]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
      setActiveIndex(-1);
      setValidationError(null);
    },
    [],
  );

  // Ref to always have current filteredSuggestions inside the keydown handler
  const filteredRef = useRef<string[]>([]);
  filteredRef.current = filteredSuggestions;

  const inputValueRef = useRef(inputValue);
  inputValueRef.current = inputValue;

  const activeIndexRef = useRef(activeIndex);
  activeIndexRef.current = activeIndex;

  const delimiterRef = useRef(delimiter);
  delimiterRef.current = delimiter;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return;

      const current = filteredRef.current;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) =>
          current.length === 0 ? -1 : Math.min(prev + 1, current.length - 1),
        );
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, -1));
        return;
      }

      if (e.key === "Escape") {
        setActiveIndex(-1);
        return;
      }

      if (e.key === "Backspace" && inputValueRef.current === "" && tagsRef.current.length > 0) {
        removeTag(tagsRef.current.length - 1);
        return;
      }

      if (delimiterRef.current.includes(e.key)) {
        e.preventDefault();
        const idx = activeIndexRef.current;
        if (idx >= 0 && idx < current.length && current[idx]) {
          addTag(current[idx]);
        } else {
          addTag(inputValueRef.current);
        }
        return;
      }
    },
    [disabled, removeTag, addTag],
  );

  const activeSuggestionId =
    activeIndex >= 0
      ? `rti-suggestion-${activeIndex}`
      : undefined;

  return {
    tags,
    inputProps: {
      value: inputValue,
      disabled,
      onChange: handleChange,
      onKeyDown: handleKeyDown,
      "aria-autocomplete": "list",
      "aria-expanded": filteredSuggestions.length > 0,
      "aria-activedescendant": activeSuggestionId,
      role: "combobox",
    },
    addTag,
    removeTag,
    clearTags,
    inputValue,
    setInputValue,
    filteredSuggestions,
    activeIndex,
    validationError,
  };
}
