import {
  useState,
  useCallback,
  useRef,
  useEffect,
  type ChangeEvent,
  type KeyboardEvent,
  type WheelEvent,
} from "react";

export interface UseNumberInputOptions {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  disabled?: boolean;
  readOnly?: boolean;
  clampOnBlur?: boolean;
}

export interface UseNumberInputResult {
  inputProps: {
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
    onWheel: (e: WheelEvent<HTMLInputElement>) => void;
    onBlur: () => void;
    disabled: boolean;
    readOnly: boolean;
    "aria-valuenow": number | undefined;
    "aria-valuemin": number | undefined;
    "aria-valuemax": number | undefined;
    role: "spinbutton";
  };
  incrementProps: {
    onClick: () => void;
    disabled: boolean;
    "aria-label": string;
    tabIndex: number;
  };
  decrementProps: {
    onClick: () => void;
    disabled: boolean;
    "aria-label": string;
    tabIndex: number;
  };
  formattedValue: string;
  increment: () => void;
  decrement: () => void;
  clampedValue: number | undefined;
  handleBlur: () => void;
}

function clamp(value: number, min?: number, max?: number): number {
  let result = value;
  if (min !== undefined) result = Math.max(min, result);
  if (max !== undefined) result = Math.min(max, result);
  return result;
}

function round(value: number, precision: number): number {
  const factor = Math.pow(10, precision);
  return Math.round(value * factor) / factor;
}

function toFixed(value: number, precision: number): string {
  return value.toFixed(precision);
}

export function useNumberInput({
  value: controlledValue,
  defaultValue,
  onChange,
  min,
  max,
  step = 1,
  precision,
  disabled = false,
  readOnly = false,
  clampOnBlur = true,
}: UseNumberInputOptions = {}): UseNumberInputResult {
  const isControlled = controlledValue !== undefined;

  const [internalValue, setInternalValue] = useState<number | undefined>(
    defaultValue,
  );
  const [inputText, setInputText] = useState<string>(() => {
    const initial = isControlled ? controlledValue : defaultValue;
    if (initial === undefined) return "";
    const p = precision ?? inferPrecision(step);
    return toFixed(initial, p);
  });

  const currentValue = isControlled ? controlledValue : internalValue;
  const resolvedPrecision = precision ?? inferPrecision(step);

  function inferPrecision(s: number): number {
    const str = s.toString();
    const dot = str.indexOf(".");
    return dot === -1 ? 0 : str.length - dot - 1;
  }

  const commit = useCallback(
    (raw: number) => {
      const clamped = clamp(round(raw, resolvedPrecision), min, max);
      if (!isControlled) {
        setInternalValue(clamped);
      }
      setInputText(toFixed(clamped, resolvedPrecision));
      onChange?.(clamped);
    },
    [isControlled, min, max, resolvedPrecision, onChange],
  );

  const increment = useCallback(() => {
    if (disabled || readOnly) return;
    const base = currentValue ?? min ?? 0;
    commit(base + step);
  }, [disabled, readOnly, currentValue, min, step, commit]);

  const decrement = useCallback(() => {
    if (disabled || readOnly) return;
    const base = currentValue ?? max ?? 0;
    commit(base - step);
  }, [disabled, readOnly, currentValue, max, step, commit]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (disabled || readOnly) return;
      setInputText(e.target.value);
    },
    [disabled, readOnly],
  );

  const handleBlur = useCallback(() => {
    const parsed = parseFloat(inputText);
    if (isNaN(parsed)) {
      const fallback = currentValue ?? min ?? 0;
      setInputText(toFixed(fallback, resolvedPrecision));
      return;
    }
    if (clampOnBlur !== false) {
      commit(parsed);
    } else {
      const rounded = round(parsed, resolvedPrecision);
      if (!isControlled) setInternalValue(rounded);
      setInputText(toFixed(rounded, resolvedPrecision));
      onChange?.(rounded);
    }
  }, [inputText, currentValue, min, resolvedPrecision, commit, clampOnBlur, isControlled, onChange]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        increment();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        decrement();
      }
    },
    [increment, decrement],
  );

  const handleWheel = useCallback(
    (e: WheelEvent<HTMLInputElement>) => {
      if (disabled || readOnly) return;
      e.preventDefault();
      if (e.deltaY < 0) {
        increment();
      } else {
        decrement();
      }
    },
    [disabled, readOnly, increment, decrement],
  );

  const prevControlled = useRef(controlledValue);
  useEffect(() => {
    if (isControlled && controlledValue !== prevControlled.current) {
      prevControlled.current = controlledValue;
      setInputText(toFixed(controlledValue!, resolvedPrecision));
    }
  }, [isControlled, controlledValue, resolvedPrecision]);

  const clampedValue =
    currentValue !== undefined
      ? clamp(round(currentValue, resolvedPrecision), min, max)
      : undefined;

  const atMin =
    clampedValue !== undefined && min !== undefined && clampedValue <= min;
  const atMax =
    clampedValue !== undefined && max !== undefined && clampedValue >= max;

  return {
    inputProps: {
      value: inputText,
      onChange: handleChange,
      onKeyDown: handleKeyDown,
      onWheel: handleWheel,
      onBlur: handleBlur,
      disabled,
      readOnly,
      "aria-valuenow": currentValue,
      "aria-valuemin": min,
      "aria-valuemax": max,
      role: "spinbutton",
    },
    incrementProps: {
      onClick: increment,
      disabled: disabled || (atMax ?? false),
      "aria-label": "Increment",
      tabIndex: -1,
    },
    decrementProps: {
      onClick: decrement,
      disabled: disabled || (atMin ?? false),
      "aria-label": "Decrement",
      tabIndex: -1,
    },
    formattedValue: inputText,
    increment,
    decrement,
    clampedValue,
    handleBlur,
  };
}
