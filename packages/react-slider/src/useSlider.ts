import {
  useState,
  useCallback,
  useRef,
  useId,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

export type SliderValue = number | [number, number];

export interface UseSliderOptions {
  value?: SliderValue;
  defaultValue?: SliderValue;
  onChange?: (value: SliderValue) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
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

function isRange(v: SliderValue): v is [number, number] {
  return Array.isArray(v);
}

export function useSlider({
  value: controlledValue,
  defaultValue,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
}: UseSliderOptions = {}): UseSliderResult {
  const trackId = useId();
  const isControlled = controlledValue !== undefined;

  const getInitial = (): SliderValue => {
    if (defaultValue !== undefined) return defaultValue;
    return 0;
  };

  const [internalValue, setInternalValue] = useState<SliderValue>(getInitial);
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

  const getThumbValues = (): [number, number] | [number] => {
    if (isRange(current)) return current;
    return [current as number];
  };

  const setThumbValue = useCallback(
    (index: number, raw: number) => {
      const snapped = clamp(snapToStep(raw, min, step), min, max);
      if (isRange(current)) {
        const next: [number, number] = [current[0], current[1]];
        next[index] = snapped;
        if (index === 0 && snapped > next[1]) next[0] = next[1];
        if (index === 1 && snapped < next[0]) next[1] = next[0];
        updateValue([next[0], next[1]]);
      } else {
        updateValue(snapped);
      }
    },
    [current, min, max, step, updateValue],
  );

  const getPercentage = (val: number): number =>
    max === min ? 0 : ((val - min) / (max - min)) * 100;

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

      setThumbValue(index, next);
    },
    [disabled, getThumbValues, min, max, step, setThumbValue],
  );

  const getValueFromPointer = useCallback(
    (clientX: number): number => {
      if (!trackRef.current) return min;
      const rect = trackRef.current.getBoundingClientRect();
      const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
      return snapToStep(min + ratio * (max - min), min, step);
    },
    [min, max, step],
  );

  const handleTrackPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (disabled) return;
      trackRef.current = e.currentTarget;
      e.currentTarget.setPointerCapture(e.pointerId);

      const clickedValue = getValueFromPointer(e.clientX);
      const thumbValues = getThumbValues();

      let closestIndex = 0;
      if (thumbValues.length > 1) {
        const d0 = Math.abs(thumbValues[0]! - clickedValue);
        const d1 = Math.abs(thumbValues[1]! - clickedValue);
        closestIndex = d1 < d0 ? 1 : 0;
      }

      draggingThumb.current = closestIndex;
      setThumbValue(closestIndex, clickedValue);

      const onMove = (moveEvent: PointerEvent) => {
        if (draggingThumb.current === null) return;
        setThumbValue(draggingThumb.current, getValueFromPointer(moveEvent.clientX));
      };

      const onUp = () => {
        draggingThumb.current = null;
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [disabled, getValueFromPointer, getThumbValues, setThumbValue],
  );

  const handleThumbPointerDown = useCallback(
    (index: number) => (e: ReactPointerEvent<HTMLElement>) => {
      if (disabled) return;
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);
      trackRef.current = e.currentTarget.parentElement as HTMLElement | null;
      draggingThumb.current = index;

      const onMove = (moveEvent: PointerEvent) => {
        if (draggingThumb.current === null) return;
        setThumbValue(draggingThumb.current, getValueFromPointer(moveEvent.clientX));
      };

      const onUp = () => {
        draggingThumb.current = null;
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [disabled, getValueFromPointer, setThumbValue],
  );

  const thumbValues = getThumbValues();

  const thumbProps: ThumbProps[] = thumbValues.map((val, index) => ({
    role: "slider" as const,
    tabIndex: disabled ? -1 : 0,
    "aria-valuenow": val,
    "aria-valuemin": min,
    "aria-valuemax": max,
    "aria-disabled": disabled,
    "aria-label": thumbValues.length > 1 ? (index === 0 ? "Minimum value" : "Maximum value") : "Value",
    "data-thumb-index": index,
    onKeyDown: handleKeyDown(index),
    onPointerDown: handleThumbPointerDown(index),
    style: {
      position: "absolute" as const,
      left: `${getPercentage(val)}%`,
      transform: "translateX(-50%)",
      cursor: disabled ? "not-allowed" : "grab",
    },
  }));

  const rangeLeft = isRange(current)
    ? getPercentage(Math.min(current[0], current[1]))
    : 0;
  const rangeWidth = isRange(current)
    ? getPercentage(Math.abs(current[1] - current[0]))
    : getPercentage(current as number);

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
