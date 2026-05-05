import {
  useState,
  useCallback,
  useRef,
  type KeyboardEvent,
  type ChangeEvent,
  type ClipboardEvent,
} from "react";

export interface UseTagInputOptions {
  value?: string[];
  defaultValue?: string[];
  onChange?: (tags: string[]) => void;
  suggestions?: string[];
  maxTags?: number;
  allowDuplicates?: boolean;
  disabled?: boolean;
  /** Keys that commit the current input as a tag. Default: ["Enter", ","]. */
  delimiter?: string[];
  /**
   * Pasted text is split by these patterns into multiple tags.
   * Defaults to comma, newline, tab, semicolon when undefined.
   * Pass `null` to disable paste-splitting entirely.
   */
  pasteDelimiters?: (string | RegExp)[] | null;
  validate?: (tag: string) => boolean | string;
  /** Normalize each candidate tag before validation (trim, lowercase, etc). */
  transform?: (tag: string) => string;
  maxLength?: number;
  onTagAdd?: (tag: string) => void;
  onTagRemove?: (tag: string, index: number) => void;
  caseSensitive?: boolean;
  /** When the input is empty, Backspace pulls the last tag back into the input for editing instead of just removing it. Default false. */
  backspaceEditsLastTag?: boolean;
}

export interface UseTagInputResult {
  tags: string[];
  inputProps: {
    value: string;
    disabled: boolean;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
    onPaste: (e: ClipboardEvent<HTMLInputElement>) => void;
    "aria-autocomplete": "list";
    "aria-expanded": boolean;
    "aria-activedescendant": string | undefined;
    role: "combobox";
  };
  addTag: (tag: string) => void;
  /** Add multiple tags at once (e.g. from a paste). Each tag goes through transform + validate. */
  addTags: (tags: string[]) => void;
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
  pasteDelimiters,
  validate,
  transform,
  maxLength,
  onTagAdd,
  onTagRemove,
  caseSensitive = false,
  backspaceEditsLastTag = false,
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

  const maxLengthRef = useRef(maxLength);
  maxLengthRef.current = maxLength;

  const allowDuplicatesRef = useRef(allowDuplicates);
  allowDuplicatesRef.current = allowDuplicates;

  const caseSensitiveRef = useRef(caseSensitive);
  caseSensitiveRef.current = caseSensitive;

  const validateRef = useRef(validate);
  validateRef.current = validate;

  const transformRef = useRef(transform);
  transformRef.current = transform;

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const onTagAddRef = useRef(onTagAdd);
  onTagAddRef.current = onTagAdd;

  const onTagRemoveRef = useRef(onTagRemove);
  onTagRemoveRef.current = onTagRemove;

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
      const transformed = transformRef.current ? transformRef.current(raw) : raw;
      const tag = transformed.trim();
      if (!tag) return;
      const currentTags = tagsRef.current;
      const max = maxTagsRef.current;
      const maxLen = maxLengthRef.current;
      const dups = allowDuplicatesRef.current;
      const cs = caseSensitiveRef.current;
      const val = validateRef.current;

      if (max !== undefined && currentTags.length >= max) return;
      if (maxLen !== undefined && tag.length > maxLen) {
        setValidationError(`Tag must be ${maxLen} characters or fewer`);
        return;
      }
      const isDuplicate = dups
        ? false
        : cs
          ? currentTags.includes(tag)
          : currentTags.map((t) => t.toLowerCase()).includes(tag.toLowerCase());
      if (isDuplicate) {
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
      onTagAddRef.current?.(tag);
      setInputValue("");
      setActiveIndex(-1);
    },
    [updateTags],
  );

  const addTags = useCallback(
    (raws: string[]) => {
      for (const raw of raws) addTag(raw);
    },
    [addTag],
  );

  const removeTag = useCallback(
    (index: number) => {
      const tag = tagsRef.current[index];
      const next = tagsRef.current.filter((_, i) => i !== index);
      updateTags(next);
      if (tag !== undefined) {
        onTagRemoveRef.current?.(tag, index);
      }
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
        const lastIndex = tagsRef.current.length - 1;
        const lastTag = tagsRef.current[lastIndex];
        if (backspaceEditsLastTag && lastTag !== undefined) {
          // Pull the last tag back into the input for editing instead of just dropping it.
          removeTag(lastIndex);
          setInputValue(lastTag);
        } else {
          removeTag(lastIndex);
        }
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

  const splitPasted = useCallback(
    (text: string): string[] => {
      if (pasteDelimiters === null) return [text];
      const patterns = pasteDelimiters ?? [",", "\n", "\t", ";"];
      // Build a regex that matches any of the delimiters.
      const re = new RegExp(
        patterns
          .map((p) => (p instanceof RegExp ? p.source : escapeRegex(p)))
          .join("|"),
      );
      return text
        .split(re)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    },
    [pasteDelimiters],
  );

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>) => {
      if (disabled) return;
      const text = e.clipboardData.getData("text");
      if (!text) return;
      const parts = splitPasted(text);
      if (parts.length <= 1) return; // let the default paste apply
      e.preventDefault();
      addTags(parts);
    },
    [disabled, splitPasted, addTags],
  );

  return {
    tags,
    inputProps: {
      value: inputValue,
      disabled,
      onChange: handleChange,
      onKeyDown: handleKeyDown,
      onPaste: handlePaste,
      "aria-autocomplete": "list",
      "aria-expanded": filteredSuggestions.length > 0,
      "aria-activedescendant": activeSuggestionId,
      role: "combobox",
    },
    addTag,
    addTags,
    removeTag,
    clearTags,
    inputValue,
    setInputValue,
    filteredSuggestions,
    activeIndex,
    validationError,
  };
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
