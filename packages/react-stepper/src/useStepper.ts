import {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface StepperStep {
  id: string;
  label: ReactNode;
  description?: ReactNode;
  /** Optional icon for the step indicator. */
  icon?: ReactNode;
  /** Disable the step — can't be navigated to. */
  disabled?: boolean;
  /** Marks the step as optional — shown as "(optional)" next to the label. */
  optional?: boolean;
  /** Per-step error state — shows the indicator in danger tone. */
  error?: boolean;
  /** Validate before leaving this step. Return false / a message to block `goNext`. */
  validate?: () => boolean | string | Promise<boolean | string>;
}

export interface UseStepperOptions {
  steps: StepperStep[];
  /** Index of the initial step (uncontrolled). */
  defaultStep?: number;
  /** Controlled active step index. Pair with `onStepChange`. */
  step?: number;
  onStepChange?: (next: number, prev: number) => void;
  /**
   * `"linear"` (default) requires sequential progression — can only `goTo` a step
   * that's been visited or the next one. `"non-linear"` lets users jump freely.
   */
  mode?: "linear" | "non-linear";
  /** Initial completed step ids (uncontrolled). */
  defaultCompleted?: string[];
  completed?: string[];
  onCompletedChange?: (ids: string[]) => void;
  /** Fires when the final step is committed (Finish / Submit). */
  onFinish?: () => void;
}

export interface UseStepperResult {
  steps: StepperStep[];
  activeStep: number;
  activeStepId: string;
  isFirst: boolean;
  isLast: boolean;
  /** Step ids the user has visited + the active one. */
  visitedIds: string[];
  completedIds: string[];
  isCompleted: (id: string) => boolean;
  goNext: () => Promise<boolean>;
  goPrev: () => void;
  goTo: (index: number) => boolean;
  setCompleted: (id: string, value?: boolean) => void;
  finish: () => Promise<boolean>;
  /** Reset to the first step + clear completed/visited. */
  reset: () => void;
  /** Most recent validation error message from `validate()`, if any. */
  error: string | null;
  /** True while a validate() promise is in flight. */
  isPending: boolean;
}

export function useStepper(opts: UseStepperOptions): UseStepperResult {
  const {
    steps,
    defaultStep = 0,
    step: controlledStep,
    onStepChange,
    mode = "linear",
    defaultCompleted = [],
    completed: controlledCompleted,
    onCompletedChange,
    onFinish,
  } = opts;

  const isStepControlled = controlledStep !== undefined;
  const [internalStep, setInternalStep] = useState(defaultStep);
  const activeStep = isStepControlled ? controlledStep : internalStep;

  const isCompletedControlled = controlledCompleted !== undefined;
  const [internalCompleted, setInternalCompleted] = useState<string[]>(defaultCompleted);
  const completedIds = isCompletedControlled ? controlledCompleted : internalCompleted;

  const [visitedIds, setVisitedIds] = useState<string[]>(() => {
    const id = steps[defaultStep]?.id;
    return id ? [id] : [];
  });

  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const setStepState = useCallback(
    (next: number) => {
      const prev = activeStep;
      if (next === prev) return;
      if (!isStepControlled) setInternalStep(next);
      onStepChange?.(next, prev);
      const id = steps[next]?.id;
      if (id) {
        setVisitedIds((cur) => (cur.includes(id) ? cur : [...cur, id]));
      }
    },
    [activeStep, isStepControlled, onStepChange, steps],
  );

  const setCompletedState = useCallback(
    (next: string[]) => {
      if (!isCompletedControlled) setInternalCompleted(next);
      onCompletedChange?.(next);
    },
    [isCompletedControlled, onCompletedChange],
  );

  const setCompleted = useCallback(
    (id: string, value: boolean = true) => {
      const next = value
        ? [...completedIds.filter((x) => x !== id), id]
        : completedIds.filter((x) => x !== id);
      setCompletedState(next);
    },
    [completedIds, setCompletedState],
  );

  const isCompleted = useCallback(
    (id: string) => completedIds.includes(id),
    [completedIds],
  );

  const runValidate = useCallback(async (): Promise<boolean> => {
    const cur = steps[activeStep];
    if (!cur || !cur.validate) return true;
    setIsPending(true);
    try {
      const result = await cur.validate();
      if (result === true) {
        setError(null);
        return true;
      }
      setError(typeof result === "string" ? result : "Please complete this step");
      return false;
    } finally {
      setIsPending(false);
    }
  }, [steps, activeStep]);

  const goNext = useCallback(async () => {
    const ok = await runValidate();
    if (!ok) return false;
    const cur = steps[activeStep];
    if (cur) setCompleted(cur.id, true);
    if (activeStep < steps.length - 1) {
      // Skip past disabled steps
      let nextIdx = activeStep + 1;
      while (nextIdx < steps.length && steps[nextIdx]?.disabled) nextIdx++;
      if (nextIdx < steps.length) setStepState(nextIdx);
    }
    return true;
  }, [runValidate, activeStep, steps, setCompleted, setStepState]);

  const goPrev = useCallback(() => {
    let prevIdx = activeStep - 1;
    while (prevIdx >= 0 && steps[prevIdx]?.disabled) prevIdx--;
    if (prevIdx >= 0) setStepState(prevIdx);
  }, [activeStep, steps, setStepState]);

  const goTo = useCallback(
    (index: number): boolean => {
      if (index < 0 || index >= steps.length) return false;
      const target = steps[index];
      if (!target || target.disabled) return false;
      if (mode === "linear") {
        // Allow back navigation freely; forward only to visited or the immediate next step.
        const isVisited = visitedIds.includes(target.id);
        const isImmediateNext = index === activeStep + 1;
        if (index > activeStep && !isVisited && !isImmediateNext) return false;
      }
      setStepState(index);
      return true;
    },
    [steps, mode, visitedIds, activeStep, setStepState],
  );

  const finish = useCallback(async () => {
    const ok = await runValidate();
    if (!ok) return false;
    const cur = steps[activeStep];
    if (cur) setCompleted(cur.id, true);
    onFinish?.();
    return true;
  }, [runValidate, steps, activeStep, setCompleted, onFinish]);

  const reset = useCallback(() => {
    if (!isStepControlled) setInternalStep(defaultStep);
    if (!isCompletedControlled) setInternalCompleted(defaultCompleted);
    const id = steps[defaultStep]?.id;
    setVisitedIds(id ? [id] : []);
    setError(null);
    setIsPending(false);
  }, [isStepControlled, isCompletedControlled, defaultStep, defaultCompleted, steps]);

  const activeStepId = useMemo(
    () => steps[activeStep]?.id ?? "",
    [steps, activeStep],
  );

  return {
    steps,
    activeStep,
    activeStepId,
    isFirst: activeStep === 0,
    isLast: activeStep === steps.length - 1,
    visitedIds,
    completedIds,
    isCompleted,
    goNext,
    goPrev,
    goTo,
    setCompleted,
    finish,
    reset,
    error,
    isPending,
  };
}
