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
  /** Step used for Shift+Arrow / PageUp / PageDown. Default: step * 10. */
  bigStep?: number;
  precision?: number;
  disabled?: boolean;
  readOnly?: boolean;
  clampOnBlur?: boolean;
  /** Allow mouse-wheel to change the value when the input is focused. Default true. */
  wheelEnabled?: boolean;
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
    inputMode: "decimal" | "numeric";
  };
  incrementProps: {
    onClick: () => void;
    onMouseDown: () => void;
    onMouseUp: () => void;
    onMouseLeave: () => void;
    onTouchStart: () => void;
    onTouchEnd: () => void;
    disabled: boolean;
    "aria-label": string;
    tabIndex: number;
  };
  decrementProps: {
    onClick: () => void;
    onMouseDown: () => void;
    onMouseUp: () => void;
    onMouseLeave: () => void;
    onTouchStart: () => void;
    onTouchEnd: () => void;
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

function inferPrecisionOf(s: number): number {
  const str = s.toString();
  const dot = str.indexOf(".");
  return dot === -1 ? 0 : str.length - dot - 1;
}

const HOLD_INITIAL_DELAY = 300;
const HOLD_REPEAT_INTERVAL = 50;

export function useNumberInput({
  value: controlledValue,
  defaultValue,
  onChange,
  min,
  max,
  step = 1,
  bigStep,
  precision,
  disabled = false,
  readOnly = false,
  clampOnBlur = true,
  wheelEnabled = true,
}: UseNumberInputOptions = {}): UseNumberInputResult {
  const isControlled = controlledValue !== undefined;
  const resolvedBigStep = bigStep ?? step * 10;

  const [internalValue, setInternalValue] = useState<number | undefined>(
    defaultValue,
  );
  const [inputText, setInputText] = useState<string>(() => {
    const initial = isControlled ? controlledValue : defaultValue;
    if (initial === undefined) return "";
    const p = precision ?? inferPrecisionOf(step);
    return toFixed(initial, p);
  });
  const [isFocused, setIsFocused] = useState(false);

  const currentValue = isControlled ? controlledValue : internalValue;
  const resolvedPrecision = precision ?? inferPrecisionOf(step);

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

  const stepBy = useCallback(
    (delta: number) => {
      if (disabled || readOnly) return;
      const base = currentValue ?? min ?? 0;
      commit(base + delta);
    },
    [disabled, readOnly, currentValue, min, commit],
  );

  const increment = useCallback(() => stepBy(step), [stepBy, step]);
  const decrement = useCallback(() => stepBy(-step), [stepBy, step]);

  // Hold-to-repeat on stepper buttons
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopHold = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
  }, []);

  const startHold = useCallback(
    (direction: 1 | -1) => {
      if (disabled || readOnly) return;
      stopHold();
      holdTimerRef.current = setTimeout(() => {
        holdIntervalRef.current = setInterval(() => {
          stepBy(direction * step);
        }, HOLD_REPEAT_INTERVAL);
      }, HOLD_INITIAL_DELAY);
    },
    [disabled, readOnly, step, stepBy, stopHold],
  );

  useEffect(() => () => stopHold(), [stopHold]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (disabled || readOnly) return;
      setInputText(e.target.value);
    },
    [disabled, readOnly],
  );

  const handleBlur = useCallback(() => {
    setIsFocused(false);
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
        stepBy(e.shiftKey ? resolvedBigStep : step);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        stepBy(e.shiftKey ? -resolvedBigStep : -step);
      } else if (e.key === "PageUp") {
        e.preventDefault();
        stepBy(resolvedBigStep);
      } else if (e.key === "PageDown") {
        e.preventDefault();
        stepBy(-resolvedBigStep);
      } else if (e.key === "Home" && min !== undefined) {
        e.preventDefault();
        commit(min);
      } else if (e.key === "End" && max !== undefined) {
        e.preventDefault();
        commit(max);
      }
    },
    [stepBy, step, resolvedBigStep, min, max, commit],
  );

  const handleWheel = useCallback(
    (e: WheelEvent<HTMLInputElement>) => {
      if (disabled || readOnly) return;
      if (!wheelEnabled) return;
      // Only respond to wheel when the input is actually focused — prevents
      // the page from being scrolled into a number input.
      if (!isFocused) return;
      e.preventDefault();
      if (e.deltaY < 0) {
        stepBy(e.shiftKey ? resolvedBigStep : step);
      } else {
        stepBy(e.shiftKey ? -resolvedBigStep : -step);
      }
    },
    [disabled, readOnly, wheelEnabled, isFocused, step, resolvedBigStep, stepBy],
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

  // The aria-valuenow should reflect the clamped (committed) value
  const inputMode: "decimal" | "numeric" = resolvedPrecision > 0 ? "decimal" : "numeric";

  return {
    inputProps: {
      value: inputText,
      onChange: handleChange,
      onKeyDown: handleKeyDown,
      onWheel: handleWheel,
      onBlur: handleBlur,
      disabled,
      readOnly,
      "aria-valuenow": clampedValue,
      "aria-valuemin": min,
      "aria-valuemax": max,
      role: "spinbutton",
      inputMode,
    },
    incrementProps: {
      onClick: increment,
      onMouseDown: () => startHold(1),
      onMouseUp: stopHold,
      onMouseLeave: stopHold,
      onTouchStart: () => startHold(1),
      onTouchEnd: stopHold,
      disabled: disabled || (atMax ?? false),
      "aria-label": "Increment",
      tabIndex: -1,
    },
    decrementProps: {
      onClick: decrement,
      onMouseDown: () => startHold(-1),
      onMouseUp: stopHold,
      onMouseLeave: stopHold,
      onTouchStart: () => startHold(-1),
      onTouchEnd: stopHold,
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
