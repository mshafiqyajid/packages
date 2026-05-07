import {
  useState,
  useCallback,
  useRef,
  useId,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

export type SliderValue = number | [number, number] | number[];

export type SliderScale = "linear" | "log";

export interface UseSliderOptions {
  value?: SliderValue;
  defaultValue?: SliderValue;
  onChange?: (value: SliderValue) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  marks?: number[];
  snapToMarks?: boolean;
  scale?: SliderScale;
  scaleBase?: number;
  onDragStart?: (index: number) => void;
  onDragEnd?: (index: number, value: number) => void;
}

export interface ThumbProps {
  role: "slider";
  tabIndex: number;
  "aria-valuenow": number;
  "aria-valuemin": number;
  "aria-valuemax": number;
  "aria-disabled": boolean;
  "aria-label": string;
  "data-thumb-index": number;
  "data-dragging"?: "true";
  onKeyDown: (e: KeyboardEvent<HTMLElement>) => void;
  onPointerDown: (e: ReactPointerEvent<HTMLElement>) => void;
  style: { position: "absolute"; left: string; transform: string; cursor: string };
}

export interface TrackProps {
  role: "presentation";
  "data-slider-track": string;
  "data-disabled": boolean | undefined;
  onPointerDown: (e: ReactPointerEvent<HTMLElement>) => void;
  style: { position: "relative"; cursor: string };
}

export interface RangeProps {
  "aria-hidden": true;
  style: { position: "absolute"; left: string; width: string };
}

export interface UseSliderResult {
  value: SliderValue;
  trackProps: TrackProps;
  thumbProps: ThumbProps[];
  rangeProps: RangeProps;
  trackId: string;
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

function snapToStep(val: number, min: number, step: number): number {
  return Math.round((val - min) / step) * step + min;
}

function isRange(v: SliderValue): v is [number, number] | number[] {
  return Array.isArray(v);
}

function isTwoTuple(v: SliderValue): v is [number, number] {
  return Array.isArray(v) && v.length === 2;
}

function toArray(v: SliderValue): number[] {
  if (Array.isArray(v)) return v;
  return [v];
}

function fromArray(arr: number[], original: SliderValue): SliderValue {
  if (!Array.isArray(original)) return arr[0]!;
  if (original.length === 2) return [arr[0]!, arr[1]!] as [number, number];
  return arr;
}

function logToLinear(value: number, min: number, max: number, base: number): number {
  if (min <= 0) return value;
  const logMin = Math.log(min) / Math.log(base);
  const logMax = Math.log(max) / Math.log(base);
  const logVal = Math.log(value) / Math.log(base);
  return ((logVal - logMin) / (logMax - logMin)) * 100;
}

function linearToLog(percent: number, min: number, max: number, base: number): number {
  if (min <= 0) return min + (percent / 100) * (max - min);
  const logMin = Math.log(min) / Math.log(base);
  const logMax = Math.log(max) / Math.log(base);
  return Math.pow(base, logMin + (percent / 100) * (logMax - logMin));
}

function snapToNearestMark(val: number, marks: number[]): number {
  if (marks.length === 0) return val;
  let closest = marks[0]!;
  let minDist = Math.abs(val - closest);
  for (const m of marks) {
    const d = Math.abs(val - m);
    if (d < minDist) {
      minDist = d;
      closest = m;
    }
  }
  return closest;
}

export function useSlider({
  value: controlledValue,
  defaultValue,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  marks: markValues,
  snapToMarks = false,
  scale = "linear",
  scaleBase = 10,
  onDragStart,
  onDragEnd,
}: UseSliderOptions = {}): UseSliderResult {
  const trackId = useId();
  const isControlled = controlledValue !== undefined;

  const getInitial = (): SliderValue => {
    if (defaultValue !== undefined) return defaultValue;
    return 0;
  };

  const [internalValue, setInternalValue] = useState<SliderValue>(getInitial);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const trackRef = useRef<HTMLElement | null>(null);
  const draggingThumb = useRef<number | null>(null);

  const current: SliderValue = isControlled ? controlledValue : internalValue;

  const updateValue = useCallback(
    (next: SliderValue) => {
      if (!isControlled) setInternalValue(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  const getThumbValues = useCallback((): number[] => {
    return toArray(current);
  }, [current]);

  const getPercentage = useCallback(
    (val: number): number => {
      if (max === min) return 0;
      if (scale === "log") {
        return logToLinear(val, min, max, scaleBase);
      }
      return ((val - min) / (max - min)) * 100;
    },
    [min, max, scale, scaleBase],
  );

  const getRawValueFromPercent = useCallback(
    (percent: number): number => {
      if (scale === "log") {
        return linearToLog(percent, min, max, scaleBase);
      }
      return min + (percent / 100) * (max - min);
    },
    [min, max, scale, scaleBase],
  );

  const setThumbValue = useCallback(
    (index: number, raw: number, snap = false) => {
      const thumbValues = toArray(current);
      const count = thumbValues.length;

      const thumbMin = index === 0 ? min : (thumbValues[index - 1]! + step);
      const thumbMax = index === count - 1 ? max : (thumbValues[index + 1]! - step);

      let snapped: number;
      if (snap && snapToMarks && markValues && markValues.length > 0) {
        snapped = clamp(snapToNearestMark(raw, markValues), thumbMin, thumbMax);
      } else {
        snapped = clamp(snapToStep(raw, min, step), thumbMin, thumbMax);
      }

      const next = [...thumbValues];
      next[index] = snapped;
      updateValue(fromArray(next, current));
    },
    [current, min, max, step, updateValue, snapToMarks, markValues],
  );

  const handleKeyDown = useCallback(
    (index: number) => (e: KeyboardEvent<HTMLElement>) => {
      if (disabled) return;
      const thumbValues = getThumbValues();
      const thumbVal = thumbValues[index] ?? min;
      let next = thumbVal;

      switch (e.key) {
        case "ArrowRight":
        case "ArrowUp":
          e.preventDefault();
          next = thumbVal + step;
          break;
        case "ArrowLeft":
        case "ArrowDown":
          e.preventDefault();
          next = thumbVal - step;
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

      setThumbValue(index, next, true);
    },
    [disabled, getThumbValues, min, max, step, setThumbValue],
  );

  const getValueFromPointer = useCallback(
    (clientX: number): number => {
      if (!trackRef.current) return min;
      const rect = trackRef.current.getBoundingClientRect();
      const percent = clamp((clientX - rect.left) / rect.width, 0, 1) * 100;
      const raw = getRawValueFromPercent(percent);
      return snapToStep(raw, min, step);
    },
    [min, step, getRawValueFromPercent],
  );

  const handleTrackPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (disabled) return;
      trackRef.current = e.currentTarget;
      e.currentTarget.setPointerCapture(e.pointerId);

      const clickedValue = getValueFromPointer(e.clientX);
      const thumbValues = getThumbValues();

      let closestIndex = 0;
      let minDist = Math.abs(thumbValues[0]! - clickedValue);
      for (let i = 1; i < thumbValues.length; i++) {
        const d = Math.abs(thumbValues[i]! - clickedValue);
        if (d < minDist) {
          minDist = d;
          closestIndex = i;
        }
      }

      draggingThumb.current = closestIndex;
      setDraggingIndex(closestIndex);
      onDragStart?.(closestIndex);
      setThumbValue(closestIndex, clickedValue);

      const onMove = (moveEvent: PointerEvent) => {
        if (draggingThumb.current === null) return;
        setThumbValue(draggingThumb.current, getValueFromPointer(moveEvent.clientX));
      };

      const onUp = () => {
        const idx = draggingThumb.current;
        draggingThumb.current = null;
        setDraggingIndex(null);
        if (idx !== null) {
          const vals = toArray(isControlled ? controlledValue! : internalValue);
          const finalVal = vals[idx] ?? min;
          if (snapToMarks && markValues && markValues.length > 0) {
            setThumbValue(idx, snapToNearestMark(finalVal, markValues), true);
          }
          onDragEnd?.(idx, finalVal);
        }
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [disabled, getValueFromPointer, getThumbValues, setThumbValue, onDragStart, onDragEnd, snapToMarks, markValues, isControlled, controlledValue, internalValue, min],
  );

  const handleThumbPointerDown = useCallback(
    (index: number) => (e: ReactPointerEvent<HTMLElement>) => {
      if (disabled) return;
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);
      trackRef.current = e.currentTarget.parentElement as HTMLElement | null;
      draggingThumb.current = index;
      setDraggingIndex(index);
      onDragStart?.(index);

      const onMove = (moveEvent: PointerEvent) => {
        if (draggingThumb.current === null) return;
        setThumbValue(draggingThumb.current, getValueFromPointer(moveEvent.clientX));
      };

      const onUp = () => {
        const idx = draggingThumb.current;
        draggingThumb.current = null;
        setDraggingIndex(null);
        if (idx !== null) {
          const vals = toArray(isControlled ? controlledValue! : internalValue);
          const finalVal = vals[idx] ?? min;
          if (snapToMarks && markValues && markValues.length > 0) {
            setThumbValue(idx, snapToNearestMark(finalVal, markValues), true);
          }
          onDragEnd?.(idx, finalVal);
        }
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [disabled, getValueFromPointer, setThumbValue, onDragStart, onDragEnd, snapToMarks, markValues, isControlled, controlledValue, internalValue, min],
  );

  const thumbValues = getThumbValues();

  const getThumbLabel = (index: number, total: number): string => {
    if (total === 1) return "Value";
    if (total === 2) return index === 0 ? "Minimum value" : "Maximum value";
    return `Thumb ${index + 1} of ${total}`;
  };

  const thumbProps: ThumbProps[] = thumbValues.map((val, index) => {
    const isDragging = draggingIndex === index;
    return {
      role: "slider" as const,
      tabIndex: disabled ? -1 : 0,
      "aria-valuenow": val,
      "aria-valuemin": min,
      "aria-valuemax": max,
      "aria-disabled": disabled,
      "aria-label": getThumbLabel(index, thumbValues.length),
      "data-thumb-index": index,
      ...(isDragging ? { "data-dragging": "true" as const } : {}),
      onKeyDown: handleKeyDown(index),
      onPointerDown: handleThumbPointerDown(index),
      style: {
        position: "absolute" as const,
        left: `${getPercentage(val)}%`,
        transform: "translateX(-50%)",
        cursor: disabled ? "not-allowed" : "grab",
      },
    };
  });

  const tvArr = thumbValues;
  const rangeLeft =
    tvArr.length > 1
      ? getPercentage(Math.min(...tvArr))
      : 0;
  const rangeWidth =
    tvArr.length > 1
      ? getPercentage(Math.max(...tvArr)) - rangeLeft
      : getPercentage(tvArr[0] ?? 0);

  const rangeProps: RangeProps = {
    "aria-hidden": true,
    style: {
      position: "absolute" as const,
      left: `${rangeLeft}%`,
      width: `${rangeWidth}%`,
    },
  };

  const trackProps: TrackProps = {
    role: "presentation",
    "data-slider-track": trackId,
    "data-disabled": disabled || undefined,
    onPointerDown: handleTrackPointerDown,
    style: {
      position: "relative" as const,
      cursor: disabled ? "not-allowed" : "pointer",
    },
  };

  return {
    value: current,
    trackProps,
    thumbProps,
    rangeProps,
    trackId,
  };
}
