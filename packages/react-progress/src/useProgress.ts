export interface UseProgressOptions {
  value?: number;
  min?: number;
  max?: number;
}

export interface UseProgressResult {
  progressProps: {
    role: "progressbar";
    "aria-valuenow": number | undefined;
    "aria-valuemin": number;
    "aria-valuemax": number;
  };
  percent: number;
  isComplete: boolean;
  isIndeterminate: boolean;
}

export function useProgress({
  value,
  min = 0,
  max = 100,
}: UseProgressOptions = {}): UseProgressResult {
  const isIndeterminate = value === undefined || value === null;

  const clamped = isIndeterminate
    ? 0
    : Math.min(Math.max(value, min), max);

  const range = max - min;
  const percent = range === 0 ? 0 : Math.round(((clamped - min) / range) * 100);

  const isComplete = !isIndeterminate && clamped >= max;

  return {
    progressProps: {
      role: "progressbar",
      "aria-valuenow": isIndeterminate ? undefined : clamped,
      "aria-valuemin": min,
      "aria-valuemax": max,
    },
    percent,
    isComplete,
    isIndeterminate,
  };
}
