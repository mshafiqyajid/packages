import {
  useState,
  useCallback,
  useRef,
  useEffect,
  type ChangeEvent,
  type KeyboardEvent,
  type WheelEvent,
} from "react";

export interface RepeatOptions {
  /** Delay in ms before repeat starts. Default 500. */
  initialDelay?: number;
  /** Interval in ms between repeat fires. Default 80. */
  interval?: number;
  /** Multiplier applied to interval each repeat (< 1 = accelerate). Default 0.9. */
  accel?: number;
}

export interface UseNumberInputOptions {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Step used for Shift+Arrow / PageUp / PageDown. Default: step * 10. */
  bigStep?: number;
  /** Alias for bigStep — step used for Shift+Arrow / PageUp / PageDown. Default: step * 10. */
  largeStep?: number;
  precision?: number;
  disabled?: boolean;
  readOnly?: boolean;
  clampOnBlur?: boolean;
  /** Allow mouse-wheel to change the value when the input is focused. Default true. */
  wheelEnabled?: boolean;
  /** Hold-to-repeat configuration for stepper buttons. */
  repeat?: RepeatOptions;
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
    onPointerDown: () => void;
    onPointerUp: () => void;
    onPointerLeave: () => void;
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
    onPointerDown: () => void;
    onPointerUp: () => void;
    onPointerLeave: () => void;
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
  /** Direction of the last stepper action. "up" | "down" | null. */
  stepDir: "up" | "down" | null;
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

const DEFAULT_REPEAT_INITIAL_DELAY = 500;
const DEFAULT_REPEAT_INTERVAL = 80;
const DEFAULT_REPEAT_ACCEL = 0.9;

export function useNumberInput({
  value: controlledValue,
  defaultValue,
  onChange,
  min,
  max,
  step = 1,
  bigStep,
  largeStep,
  precision,
  disabled = false,
  readOnly = false,
  clampOnBlur = true,
  wheelEnabled = true,
  repeat,
}: UseNumberInputOptions = {}): UseNumberInputResult {
  const isControlled = controlledValue !== undefined;
  const resolvedBigStep = largeStep ?? bigStep ?? step * 10;

  const repeatInitialDelay = repeat?.initialDelay ?? DEFAULT_REPEAT_INITIAL_DELAY;
  const repeatInterval = repeat?.interval ?? DEFAULT_REPEAT_INTERVAL;
  const repeatAccel = repeat?.accel ?? DEFAULT_REPEAT_ACCEL;

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
  const [stepDir, setStepDir] = useState<"up" | "down" | null>(null);

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

  const increment = useCallback(() => {
    setStepDir("up");
    stepBy(step);
  }, [stepBy, step]);

  const decrement = useCallback(() => {
    setStepDir("down");
    stepBy(-step);
  }, [stepBy, step]);

  // Hold-to-repeat on stepper buttons with acceleration
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentIntervalRef = useRef<number>(repeatInterval);

  const stopHold = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (holdIntervalRef.current) {
      clearTimeout(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    currentIntervalRef.current = repeatInterval;
  }, [repeatInterval]);

  const scheduleRepeat = useCallback(
    (direction: 1 | -1, dir: "up" | "down") => {
      const fire = () => {
        setStepDir(dir);
        stepBy(direction * step);
        currentIntervalRef.current = Math.max(
          16,
          currentIntervalRef.current * repeatAccel,
        );
        holdIntervalRef.current = setTimeout(fire, currentIntervalRef.current);
      };
      holdTimerRef.current = setTimeout(() => {
        fire();
      }, repeatInitialDelay);
    },
    [step, stepBy, repeatInitialDelay, repeatAccel],
  );

  const startHold = useCallback(
    (direction: 1 | -1) => {
      if (disabled || readOnly) return;
      stopHold();
      const dir = direction === 1 ? "up" : "down";
      scheduleRepeat(direction, dir);
    },
    [disabled, readOnly, stopHold, scheduleRepeat],
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
        const delta = e.shiftKey ? resolvedBigStep : step;
        setStepDir("up");
        stepBy(delta);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        const delta = e.shiftKey ? resolvedBigStep : step;
        setStepDir("down");
        stepBy(-delta);
      } else if (e.key === "PageUp") {
        e.preventDefault();
        setStepDir("up");
        stepBy(resolvedBigStep);
      } else if (e.key === "PageDown") {
        e.preventDefault();
        setStepDir("down");
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
      if (!isFocused) return;
      e.preventDefault();
      if (e.deltaY < 0) {
        setStepDir("up");
        stepBy(e.shiftKey ? resolvedBigStep : step);
      } else {
        setStepDir("down");
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

  const inputMode: "decimal" | "numeric" = resolvedPrecision > 0 ? "decimal" : "numeric";

  const stopHoldProps = {
    onPointerUp: stopHold,
    onPointerLeave: stopHold,
    onMouseUp: stopHold,
    onMouseLeave: stopHold,
    onTouchEnd: stopHold,
  };

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
      onPointerDown: () => startHold(1),
      onMouseDown: () => startHold(1),
      onTouchStart: () => startHold(1),
      ...stopHoldProps,
      disabled: disabled || (atMax ?? false),
      "aria-label": "Increment",
      tabIndex: -1,
    },
    decrementProps: {
      onClick: decrement,
      onPointerDown: () => startHold(-1),
      onMouseDown: () => startHold(-1),
      onTouchStart: () => startHold(-1),
      ...stopHoldProps,
      disabled: disabled || (atMin ?? false),
      "aria-label": "Decrement",
      tabIndex: -1,
    },
    formattedValue: inputText,
    increment,
    decrement,
    clampedValue,
    handleBlur,
    stepDir,
  };
}
