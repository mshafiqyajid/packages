import {
  type ChangeEvent,
  type ClipboardEvent,
  type FocusEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type RefCallback,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type OTPPatternPreset = "numeric" | "alphanumeric" | "any";
export type OTPPattern = OTPPatternPreset | RegExp | ((char: string) => boolean);

export interface UseOTPOptions {
  /** Number of slots. Default: 6. */
  length?: number;
  /** Controlled value. */
  value?: string;
  /** Initial value when uncontrolled. */
  defaultValue?: string;
  /** Called whenever the joined value changes. */
  onChange?: (value: string) => void;
  /** Called when the user fills the last slot. */
  onComplete?: (value: string) => void;
  /**
   * Allowed characters per slot.
   * - `"numeric"` (default): `0-9`
   * - `"alphanumeric"`: `0-9` and `A-Za-z`
   * - `"any"`: any single character
   * - RegExp: must match a single character
   * - Function: returns true if the char is allowed
   */
  pattern?: OTPPattern;
  /** Lowercase letters get uppercased before insertion. Default: true. */
  uppercase?: boolean;
  /** Auto-focus the first empty slot on mount. Default: false. */
  autoFocus?: boolean;
  /** Disable all slots. */
  disabled?: boolean;
  /** Read-only — the user can copy but not edit. */
  readOnly?: boolean;
}

export interface OTPSlot {
  index: number;
  /** The single character in this slot (or empty string). */
  char: string;
  /** Whether this slot is currently focused. */
  isFocused: boolean;
  /** Whether this slot will be the next one to fill (i.e. the active cursor). */
  isActive: boolean;
  /** Spread these onto your `<input>` to wire up the slot. */
  inputProps: InputHTMLAttributes<HTMLInputElement> & {
    ref: RefCallback<HTMLInputElement>;
  };
}

export interface UseOTPResult {
  /** The joined value across all slots. */
  value: string;
  /** Whether every slot has a character. */
  isComplete: boolean;
  /** Per-slot data + spreadable input props. */
  slots: OTPSlot[];
  /** Programmatically clear the value. */
  clear: () => void;
  /** Programmatically set the value. Pads/truncates to `length`. */
  setValue: (value: string) => void;
  /** Programmatically focus a specific slot. */
  focusSlot: (index: number) => void;
}

const DEFAULT_LENGTH = 6;

function compilePattern(pattern: OTPPattern): (char: string) => boolean {
  if (typeof pattern === "function") return pattern;
  if (pattern instanceof RegExp) return (c) => pattern.test(c);
  switch (pattern) {
    case "numeric":
      return (c) => /^\d$/.test(c);
    case "alphanumeric":
      return (c) => /^[A-Za-z0-9]$/.test(c);
    case "any":
    default:
      return (c) => c.length === 1;
  }
}

export function useOTP(options: UseOTPOptions = {}): UseOTPResult {
  const {
    length = DEFAULT_LENGTH,
    value: controlledValue,
    defaultValue = "",
    onChange,
    onComplete,
    pattern = "numeric",
    uppercase = true,
    autoFocus = false,
    disabled = false,
    readOnly = false,
  } = options;

  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(() =>
    sanitize(defaultValue, length, pattern, uppercase),
  );
  const value = isControlled
    ? sanitize(controlledValue, length, pattern, uppercase)
    : internalValue;

  const isAllowed = useMemo(() => compilePattern(pattern), [pattern]);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const lastReportedRef = useRef<string>(value);
  const hasAutoFocusedRef = useRef(false);

  // Keep ref array sized to `length`.
  if (inputsRef.current.length !== length) {
    inputsRef.current = Array.from(
      { length },
      (_, i) => inputsRef.current[i] ?? null,
    );
  }

  useEffect(() => {
    if (autoFocus && !hasAutoFocusedRef.current) {
      hasAutoFocusedRef.current = true;
      const target = Math.min(value.length, length - 1);
      inputsRef.current[target]?.focus();
    }
  }, [autoFocus, length, value.length]);

  useEffect(() => {
    if (isControlled) {
      lastReportedRef.current = value;
      return;
    }
    if (lastReportedRef.current !== value) {
      lastReportedRef.current = value;
      onChange?.(value);
      if (value.length === length) {
        onComplete?.(value);
      }
    }
  }, [isControlled, value, length, onChange, onComplete]);

  const updateValue = useCallback(
    (next: string) => {
      const sanitized = sanitize(next, length, pattern, uppercase);
      if (isControlled) {
        // Parent owns the value; ask them to update.
        if (sanitized !== controlledValue) {
          onChange?.(sanitized);
          if (sanitized.length === length) onComplete?.(sanitized);
        }
      } else {
        // Uncontrolled: update local state; the effect below will fire callbacks.
        setInternalValue(sanitized);
      }
    },
    [length, pattern, uppercase, isControlled, controlledValue, onChange, onComplete],
  );

  const focusSlot = useCallback(
    (index: number) => {
      const target = clamp(index, 0, length - 1);
      // Defer to a microtask so the current event handler completes (and
      // its triggering state update commits) before we move focus. Avoids
      // nested-state-update warnings when typing cascades focus.
      queueMicrotask(() => {
        const node = inputsRef.current[target];
        if (node) {
          node.focus();
          node.select();
        }
      });
    },
    [length],
  );

  const clear = useCallback(() => {
    updateValue("");
    focusSlot(0);
  }, [updateValue, focusSlot]);

  const setValueExternal = useCallback(
    (next: string) => {
      updateValue(next);
    },
    [updateValue],
  );

  const handleChange = useCallback(
    (index: number) => (event: ChangeEvent<HTMLInputElement>) => {
      const raw = event.target.value;
      // The native input may contain multiple chars (autofill, IME, paste-like).
      // We treat anything beyond the first allowed char as an overflow that
      // continues into subsequent slots.
      const incoming = uppercase ? raw.toUpperCase() : raw;
      const filtered = Array.from(incoming).filter(isAllowed).join("");

      if (filtered === "") {
        // Clear this slot only.
        const next =
          value.slice(0, index) + " " + value.slice(index + 1);
        updateValue(next.replace(/ /g, ""));
        return;
      }

      // Replace from `index` with as many chars as fit.
      const before = value.slice(0, index);
      const after = filtered;
      const merged = (before + after).slice(0, length);
      updateValue(merged);

      const nextFocus = Math.min(merged.length, length - 1);
      focusSlot(nextFocus);
    },
    [value, length, isAllowed, uppercase, updateValue, focusSlot],
  );

  const handleKeyDown = useCallback(
    (index: number) => (event: KeyboardEvent<HTMLInputElement>) => {
      if (disabled || readOnly) return;
      const key = event.key;

      if (key === "Backspace") {
        event.preventDefault();
        if (value[index]) {
          // Clear current slot, stay here.
          const next = removeAt(value, index);
          updateValue(next);
        } else if (index > 0) {
          // Move back and clear that slot.
          const next = removeAt(value, index - 1);
          updateValue(next);
          focusSlot(index - 1);
        }
        return;
      }

      if (key === "Delete") {
        event.preventDefault();
        if (value[index]) {
          updateValue(removeAt(value, index));
        }
        return;
      }

      if (key === "ArrowLeft") {
        event.preventDefault();
        if (index > 0) focusSlot(index - 1);
        return;
      }

      if (key === "ArrowRight") {
        event.preventDefault();
        if (index < length - 1) focusSlot(index + 1);
        return;
      }

      if (key === "Home") {
        event.preventDefault();
        focusSlot(0);
        return;
      }

      if (key === "End") {
        event.preventDefault();
        focusSlot(length - 1);
        return;
      }
    },
    [disabled, readOnly, value, length, updateValue, focusSlot],
  );

  const handlePaste = useCallback(
    (index: number) => (event: ClipboardEvent<HTMLInputElement>) => {
      if (disabled || readOnly) return;
      event.preventDefault();
      const text = event.clipboardData.getData("text") ?? "";
      const incoming = uppercase ? text.toUpperCase() : text;
      const filtered = Array.from(incoming).filter(isAllowed).join("");
      if (!filtered) return;
      const before = value.slice(0, index);
      const merged = (before + filtered).slice(0, length);
      updateValue(merged);
      const nextFocus = Math.min(merged.length, length - 1);
      focusSlot(nextFocus);
    },
    [disabled, readOnly, value, length, isAllowed, uppercase, updateValue, focusSlot],
  );

  const handleFocus = useCallback(
    (index: number) => (event: FocusEvent<HTMLInputElement>) => {
      setFocusedIndex(index);
      // Select content so typing replaces.
      try {
        event.target.select();
      } catch {
        // some browsers throw on hidden/disabled inputs — ignore
      }
    },
    [],
  );

  const handleBlur = useCallback(
    (index: number) => () => {
      setFocusedIndex((current) => (current === index ? null : current));
    },
    [],
  );

  const slots = useMemo<OTPSlot[]>(() => {
    const activeIndex = Math.min(value.length, length - 1);
    return Array.from({ length }, (_, i) => {
      const char = value[i] ?? "";
      const ref: RefCallback<HTMLInputElement> = (node) => {
        inputsRef.current[i] = node;
      };
      const inputProps: OTPSlot["inputProps"] = {
        ref,
        type: "text",
        inputMode: pattern === "numeric" ? "numeric" : "text",
        autoComplete: i === 0 ? "one-time-code" : "off",
        maxLength: length, // permit paste/autofill to overflow into us
        value: char,
        disabled,
        readOnly,
        "aria-label": `Digit ${i + 1} of ${length}`,
        onChange: handleChange(i),
        onKeyDown: handleKeyDown(i),
        onPaste: handlePaste(i),
        onFocus: handleFocus(i),
        onBlur: handleBlur(i),
      };
      return {
        index: i,
        char,
        isFocused: focusedIndex === i,
        isActive: i === activeIndex,
        inputProps,
      };
    });
  }, [
    value,
    length,
    pattern,
    disabled,
    readOnly,
    focusedIndex,
    handleChange,
    handleKeyDown,
    handlePaste,
    handleFocus,
    handleBlur,
  ]);

  return {
    value,
    isComplete: value.length === length,
    slots,
    clear,
    setValue: setValueExternal,
    focusSlot,
  };
}

// ---------- helpers ----------

function sanitize(
  raw: string,
  length: number,
  pattern: OTPPattern,
  uppercase: boolean,
): string {
  const isAllowed = compilePattern(pattern);
  const transformed = uppercase ? raw.toUpperCase() : raw;
  return Array.from(transformed).filter(isAllowed).slice(0, length).join("");
}

function removeAt(value: string, index: number): string {
  return value.slice(0, index) + value.slice(index + 1);
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}
