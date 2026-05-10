import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useId,
  type KeyboardEvent,
  type ChangeEvent,
} from "react";

export interface MentionSuggestion {
  id: string;
  label: string;
  value?: string;
  avatar?: string;
  description?: string;
}

export interface MentionTrigger {
  char: string;
  loadSuggestions: (
    query: string,
  ) => MentionSuggestion[] | Promise<MentionSuggestion[]>;
  minChars?: number;
  maxSuggestions?: number;
  allowSpaces?: boolean;
  renderSuggestion?: (suggestion: MentionSuggestion, isActive: boolean) => React.ReactNode;
}

export interface UseMentionOptions {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  triggers?: MentionTrigger[];
  disabled?: boolean;
  readOnly?: boolean;
  onMentionAdd?: (triggerChar: string, suggestion: MentionSuggestion) => void;
}

export interface UseMentionResult {
  textareaProps: {
    value: string;
    onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
    onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
    role: "combobox";
    "aria-expanded": boolean;
    "aria-controls": string | undefined;
    "aria-activedescendant": string | undefined;
    "aria-autocomplete": "list";
    disabled: boolean | undefined;
    readOnly: boolean | undefined;
  };
  dropdownProps: {
    id: string;
    role: "listbox";
  };
  getItemProps: (index: number) => {
    id: string;
    role: "option";
    "aria-selected": boolean;
  };
  isOpen: boolean;
  isLoading: boolean;
  query: string;
  triggerChar: string;
  suggestions: MentionSuggestion[];
  activeSuggestion: number;
  selectSuggestion: (index: number) => void;
  close: () => void;
  value: string;
}

interface MentionState {
  isOpen: boolean;
  isLoading: boolean;
  query: string;
  triggerChar: string;
  triggerIndex: number;
  suggestions: MentionSuggestion[];
  activeSuggestion: number;
}

const CLOSED: MentionState = {
  isOpen: false,
  isLoading: false,
  query: "",
  triggerChar: "",
  triggerIndex: -1,
  suggestions: [],
  activeSuggestion: 0,
};

export function useMention(options: UseMentionOptions = {}): UseMentionResult {
  const {
    value: controlledValue,
    defaultValue = "",
    onChange,
    triggers = [{ char: "@", loadSuggestions: () => [] }],
    disabled,
    readOnly,
    onMentionAdd,
  } = options;

  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState<string>(defaultValue);
  const value = isControlled ? (controlledValue ?? "") : internalValue;

  const [state, setState] = useState<MentionState>(CLOSED);

  const listboxId = useId();
  const instanceId = useId();

  const pendingLoad = useRef<number>(0);

  useEffect(() => {
    return () => { pendingLoad.current++; };
  }, []);

  const updateValue = useCallback(
    (next: string) => {
      if (!isControlled) setInternalValue(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  const close = useCallback(() => {
    setState(CLOSED);
    pendingLoad.current++;
  }, []);

  const loadSuggestions = useCallback(
    async (trigger: MentionTrigger, query: string, seq: number) => {
      const maxSuggestions = trigger.maxSuggestions ?? 8;
      const rawResult = trigger.loadSuggestions(query);

      if (rawResult instanceof Promise) {
        setState((prev) =>
          prev.isOpen && prev.triggerChar === trigger.char && pendingLoad.current === seq
            ? { ...prev, isLoading: true }
            : prev,
        );
        try {
          const result = await rawResult;
          if (pendingLoad.current !== seq) return;
          setState((prev) =>
            prev.isOpen && prev.triggerChar === trigger.char
              ? { ...prev, isLoading: false, suggestions: result.slice(0, maxSuggestions) }
              : prev,
          );
        } catch {
          if (pendingLoad.current !== seq) return;
          setState((prev) =>
            prev.isOpen && prev.triggerChar === trigger.char
              ? { ...prev, isLoading: false }
              : prev,
          );
        }
      } else {
        if (pendingLoad.current !== seq) return;
        setState((prev) =>
          prev.isOpen && prev.triggerChar === trigger.char
            ? { ...prev, isLoading: false, suggestions: rawResult.slice(0, maxSuggestions) }
            : prev,
        );
      }
    },
    [],
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      const next = e.target.value;
      updateValue(next);

      const textarea = e.target;
      const cursor = textarea.selectionStart ?? next.length;
      const textBeforeCursor = next.slice(0, cursor);

      let matched: { trigger: MentionTrigger; query: string; triggerIndex: number } | null =
        null;

      for (const trigger of triggers) {
        const { char, minChars = 0, allowSpaces = false } = trigger;
        const lastTriggerIdx = textBeforeCursor.lastIndexOf(char);
        if (lastTriggerIdx === -1) continue;

        const after = textBeforeCursor.slice(lastTriggerIdx + char.length);

        if (!allowSpaces && after.includes(" ")) continue;
        if (after.length < minChars) continue;
        const prevChar = textBeforeCursor[lastTriggerIdx - 1];
        if (prevChar !== undefined && /\S/.test(prevChar)) continue;

        // keep whichever trigger is closest to the cursor (highest index)
        if (!matched || lastTriggerIdx > matched.triggerIndex) {
          matched = { trigger, query: after, triggerIndex: lastTriggerIdx };
        }
      }

      if (!matched) {
        setState(CLOSED);
        pendingLoad.current++;
        return;
      }

      const { trigger, query, triggerIndex } = matched;
      const seq = ++pendingLoad.current;

      setState((prev) => ({
        isOpen: true,
        isLoading: false,
        query,
        triggerChar: trigger.char,
        triggerIndex,
        suggestions: prev.isOpen && prev.triggerChar === trigger.char ? prev.suggestions : [],
        activeSuggestion: 0,
      }));

      void loadSuggestions(trigger, query, seq);
    },
    [triggers, updateValue, loadSuggestions],
  );

  const selectSuggestion = useCallback(
    (index: number) => {
      const suggestion = state.suggestions[index];
      if (!suggestion) return;

      const inserted = suggestion.value ?? suggestion.label;
      const triggerChar = state.triggerChar;
      const triggerIndex = state.triggerIndex;

      const before = value.slice(0, triggerIndex);
      const after = value.slice(triggerIndex + triggerChar.length + state.query.length);
      const next = `${before}${triggerChar}${inserted}${after} `;

      updateValue(next);
      onMentionAdd?.(triggerChar, suggestion);
      setState(CLOSED);
      pendingLoad.current++;
    },
    [state, value, updateValue, onMentionAdd],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (!state.isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setState((prev) => ({
          ...prev,
          activeSuggestion: Math.min(
            prev.activeSuggestion + 1,
            prev.suggestions.length - 1,
          ),
        }));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setState((prev) => ({
          ...prev,
          activeSuggestion: Math.max(prev.activeSuggestion - 1, 0),
        }));
      } else if (e.key === "Enter") {
        if (state.suggestions.length > 0) {
          e.preventDefault();
          selectSuggestion(state.activeSuggestion);
        }
      } else if (e.key === "Escape" || e.key === "Tab") {
        close();
      }
    },
    [state, selectSuggestion, close],
  );

  const getItemProps = useCallback(
    (index: number) => ({
      id: `${instanceId}-opt-${index}`,
      role: "option" as const,
      "aria-selected": index === state.activeSuggestion,
    }),
    [instanceId, state.activeSuggestion],
  );

  const activeId =
    state.isOpen && state.suggestions.length > 0
      ? `${instanceId}-opt-${state.activeSuggestion}`
      : undefined;

  return {
    textareaProps: {
      value,
      onChange: handleChange,
      onKeyDown: handleKeyDown,
      role: "combobox",
      "aria-expanded": state.isOpen,
      "aria-controls": state.isOpen ? listboxId : undefined,
      "aria-activedescendant": activeId,
      "aria-autocomplete": "list",
      disabled: disabled || undefined,
      readOnly: readOnly || undefined,
    },
    dropdownProps: {
      id: listboxId,
      role: "listbox",
    },
    getItemProps,
    isOpen: state.isOpen,
    isLoading: state.isLoading,
    query: state.query,
    triggerChar: state.triggerChar,
    suggestions: state.suggestions,
    activeSuggestion: state.activeSuggestion,
    selectSuggestion,
    close,
    value,
  };
}
