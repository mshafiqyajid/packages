import {
  useState,
  useCallback,
  useRef,
  useId,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

export type RangeMode = "single" | "range";

export type RangeValue = number | [number, number];

export interface RangeMark {
  value: number;
  label?: string;
}

export interface UseRangeOptions {
  value?: RangeValue;
  defaultValue?: RangeValue;
  onChange?: (value: RangeValue) => void;
  onChangeEnd?: (value: RangeValue) => void;
  min?: number;
  max?: number;
  step?: number;
  mode?: RangeMode;
  disabled?: boolean;
  inverted?: boolean;
}

export interface RangeThumbProps {
  role: "slider";
  tabIndex: number;
  "aria-valuenow": number;
  "aria-valuemin": number;
  "aria-valuemax": number;
  "aria-valuetext": string;
  "aria-disabled": boolean;
  "aria-orientation": "horizontal";
  "aria-label": string;
  "data-thumb-index": number;
  "data-dragging"?: "true";
  onKeyDown: (e: KeyboardEvent<HTMLElement>) => void;
  onPointerDown: (e: ReactPointerEvent<HTMLElement>) => void;
  style: { position: "absolute"; left: string; transform: string; cursor: string };
}

export interface RangeTrackProps {
  role: "presentation";
  "data-range-track": string;
  "data-disabled": boolean | undefined;
  onPointerDown: (e: ReactPointerEvent<HTMLElement>) => void;
  style: { position: "relative"; cursor: string };
}

export interface RangeTrackFillProps {
  "aria-hidden": true;
  style: { position: "absolute"; left: string; width: string };
}

export interface RangeRootProps {
  "data-range-root": string;
}

export interface UseRangeResult {
  value: RangeValue;
  setValue: (next: RangeValue) => void;
  rootProps: RangeRootProps;
  trackProps: RangeTrackProps;
  getThumbProps: (index: number) => RangeThumbProps;
  getTrackFillProps: () => RangeTrackFillProps;
  isDragging: boolean;
  draggingIndex: number | null;
}

function clamp(val: number, lo: number, hi: number): number {
  return Math.min(Math.max(val, lo), hi);
}

function snapToStep(val: number, min: number, step: number): number {
  return Math.round((val - min) / step) * step + min;
}

function toTuple(v: RangeValue, mode: RangeMode, min: number, max: number): [number, number] {
  if (mode === "single") {
    const n = typeof v === "number" ? v : v[0];
    return [n, max];
  }
  if (Array.isArray(v)) return [v[0], v[1]];
  return [min, v];
}

function fromTuple(t: [number, number], mode: RangeMode): RangeValue {
  if (mode === "single") return t[0];
  return t;
}

export function useRange({
  value: controlledValue,
  defaultValue,
  onChange,
  onChangeEnd,
  min = 0,
  max = 100,
  step = 1,
  mode = "range",
  disabled = false,
  inverted = false,
}: UseRangeOptions = {}): UseRangeResult {
  const id = useId();
  const isControlled = controlledValue !== undefined;

  const getInitial = (): RangeValue => {
    if (defaultValue !== undefined) return defaultValue;
    if (mode === "single") return min;
    return [min, max];
  };

  const [internalValue, setInternalValue] = useState<RangeValue>(getInitial);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const trackRef = useRef<HTMLElement | null>(null);
  const draggingThumb = useRef<number | null>(null);
  const internalValueRef = useRef(internalValue);
  internalValueRef.current = internalValue;

  const current: RangeValue = isControlled ? controlledValue : internalValue;

  const updateValue = useCallback(
    (next: RangeValue) => {
      if (!isControlled) setInternalValue(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  const getPercent = useCallback(
    (val: number): number => {
      if (max === min) return 0;
      const pct = ((val - min) / (max - min)) * 100;
      return inverted ? 100 - pct : pct;
    },
    [min, max, inverted],
  );

  const getValueFromPercent = useCallback(
    (pct: number): number => {
      const adjusted = inverted ? 100 - pct : pct;
      return min + (adjusted / 100) * (max - min);
    },
    [min, max, inverted],
  );

  const getValueFromPointer = useCallback(
    (clientX: number): number => {
      if (!trackRef.current) return min;
      const rect = trackRef.current.getBoundingClientRect();
      const pct = clamp((clientX - rect.left) / rect.width, 0, 1) * 100;
      const raw = getValueFromPercent(pct);
      return clamp(snapToStep(raw, min, step), min, max);
    },
    [min, max, step, getValueFromPercent],
  );

  const setThumbValue = useCallback(
    (index: number, raw: number) => {
      const tuple = toTuple(current, mode, min, max);
      const thumbMin = index === 0 ? min : tuple[0] + step;
      const thumbMax = mode === "single" || index === 1 ? max : tuple[1] - step;
      const snapped = clamp(snapToStep(raw, min, step), thumbMin, thumbMax);
      const next = [...tuple] as [number, number];
      next[index] = snapped;
      updateValue(fromTuple(next, mode));
    },
    [current, mode, min, max, step, updateValue],
  );

  const handleKeyDown = useCallback(
    (index: number) => (e: KeyboardEvent<HTMLElement>) => {
      if (disabled) return;
      const tuple = toTuple(current, mode, min, max);
      const thumbVal = tuple[index];
      if (thumbVal === undefined) return;
      const jumpAmount = Math.max(step, Math.round((max - min) * 0.1 / step) * step);
      let next = thumbVal;

      switch (e.key) {
        case "ArrowRight":
        case "ArrowUp":
          e.preventDefault();
          next = e.shiftKey ? thumbVal + jumpAmount : thumbVal + step;
          break;
        case "ArrowLeft":
        case "ArrowDown":
          e.preventDefault();
          next = e.shiftKey ? thumbVal - jumpAmount : thumbVal - step;
          break;
        case "Home":
          e.preventDefault();
          next = min;
          break;
        case "End":
          e.preventDefault();
          next = max;
          break;
        default:
          return;
      }

      setThumbValue(index, next);
      const afterTuple = toTuple(current, mode, min, max);
      const updatedTuple = [...afterTuple] as [number, number];
      const thumbMin = index === 0 ? min : updatedTuple[0] + step;
      const thumbMax = mode === "single" || index === 1 ? max : updatedTuple[1] - step;
      const clamped = clamp(snapToStep(next, min, step), thumbMin, thumbMax);
      updatedTuple[index] = clamped;
      const endVal = fromTuple(updatedTuple, mode);
      onChangeEnd?.(endVal);
    },
    [disabled, current, mode, min, max, step, setThumbValue, onChangeEnd],
  );

  const startDrag = useCallback(
    (index: number, getPointerValue: (e: PointerEvent) => number) => {
      draggingThumb.current = index;
      setDraggingIndex(index);

      const onMove = (e: PointerEvent) => {
        if (draggingThumb.current === null) return;
        setThumbValue(draggingThumb.current, getPointerValue(e));
      };

      const onUp = () => {
        const idx = draggingThumb.current;
        draggingThumb.current = null;
        setDraggingIndex(null);

        if (idx !== null) {
          const currentVal = isControlled
            ? controlledValue!
            : internalValueRef.current;
          onChangeEnd?.(currentVal);
        }

        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [setThumbValue, isControlled, controlledValue, onChangeEnd],
  );

  const handleTrackPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (disabled) return;
      trackRef.current = e.currentTarget;
      e.currentTarget.setPointerCapture(e.pointerId);

      const clickedValue = getValueFromPointer(e.clientX);
      const tuple = toTuple(current, mode, min, max);

      let closestIndex = 0;
      if (mode === "range") {
        const d0 = Math.abs(tuple[0] - clickedValue);
        const d1 = Math.abs(tuple[1] - clickedValue);
        closestIndex = d1 < d0 ? 1 : 0;
      }

      setThumbValue(closestIndex, clickedValue);
      startDrag(closestIndex, (ev) => getValueFromPointer(ev.clientX));
    },
    [disabled, current, mode, min, max, getValueFromPointer, setThumbValue, startDrag],
  );

  const handleThumbPointerDown = useCallback(
    (index: number) => (e: ReactPointerEvent<HTMLElement>) => {
      if (disabled) return;
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);
      trackRef.current = e.currentTarget.closest("[data-range-track]") as HTMLElement | null
        ?? e.currentTarget.parentElement as HTMLElement | null;
      startDrag(index, (ev) => getValueFromPointer(ev.clientX));
    },
    [disabled, getValueFromPointer, startDrag],
  );

  const tuple = toTuple(current, mode, min, max);

  const getThumbProps = useCallback(
    (index: number): RangeThumbProps => {
      const val = tuple[index] ?? min;
      const isDragging = draggingIndex === index;
      const label = mode === "single"
        ? "Value"
        : index === 0 ? "Minimum value" : "Maximum value";

      return {
        role: "slider" as const,
        tabIndex: disabled ? -1 : 0,
        "aria-valuenow": val,
        "aria-valuemin": min,
        "aria-valuemax": max,
        "aria-valuetext": String(val),
        "aria-disabled": disabled,
        "aria-orientation": "horizontal" as const,
        "aria-label": label,
        "data-thumb-index": index,
        ...(isDragging ? { "data-dragging": "true" as const } : {}),
        onKeyDown: handleKeyDown(index),
        onPointerDown: handleThumbPointerDown(index),
        style: {
          position: "absolute" as const,
          left: `${getPercent(val)}%`,
          transform: "translateX(-50%)",
          cursor: disabled ? "not-allowed" : "grab",
        },
      };
    },
    [tuple, draggingIndex, mode, disabled, min, max, handleKeyDown, handleThumbPointerDown, getPercent],
  );

  const getTrackFillProps = useCallback((): RangeTrackFillProps => {
    let left: number;
    let width: number;

    if (mode === "single") {
      const val = tuple[0];
      if (inverted) {
        left = getPercent(val);
        width = 100 - left;
      } else {
        left = 0;
        width = getPercent(val);
      }
    } else {
      const lo = Math.min(tuple[0], tuple[1]);
      const hi = Math.max(tuple[0], tuple[1]);
      left = getPercent(lo);
      width = getPercent(hi) - left;
    }

    return {
      "aria-hidden": true,
      style: {
        position: "absolute" as const,
        left: `${left}%`,
        width: `${width}%`,
      },
    };
  }, [tuple, mode, inverted, getPercent]);

  const rootProps: RangeRootProps = {
    "data-range-root": id,
  };

  const trackProps: RangeTrackProps = {
    role: "presentation",
    "data-range-track": id,
    "data-disabled": disabled || undefined,
    onPointerDown: handleTrackPointerDown,
    style: {
      position: "relative" as const,
      cursor: disabled ? "not-allowed" : "pointer",
    },
  };

  const setValue = useCallback(
    (next: RangeValue) => {
      if (!isControlled) setInternalValue(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  return {
    value: current,
    setValue,
    rootProps,
    trackProps,
    getThumbProps,
    getTrackFillProps,
    isDragging: draggingIndex !== null,
    draggingIndex,
  };
}

// Re-export thumbCount helper
export function getThumbCount(mode: RangeMode): number {
  return mode === "single" ? 1 : 2;
}
