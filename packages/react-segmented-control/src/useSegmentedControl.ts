import {
  type ButtonHTMLAttributes,
  type CSSProperties,
  type KeyboardEvent,
  type RefCallback,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// Run layout effects on the client; fall back to a no-op effect on the server.
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export type SegmentedControlOption<TValue> =
  | TValue
  | {
      value: TValue;
      label?: React.ReactNode;
      disabled?: boolean;
    };

export interface UseSegmentedControlOptions<TValue> {
  /** Options to render. Strings/numbers are auto-wrapped; pass objects for labels/disabled. */
  options: ReadonlyArray<SegmentedControlOption<TValue>>;
  /** Controlled value. */
  value?: TValue;
  /** Initial value when uncontrolled. Defaults to the first option. */
  defaultValue?: TValue;
  /** Called when the active value changes. */
  onChange?: (value: TValue) => void;
  /** Disable the entire control. */
  disabled?: boolean;
  /** Compare two values for equality. Defaults to `Object.is`. */
  equals?: (a: TValue, b: TValue) => boolean;
}

export interface SegmentedControlOptionState<TValue> {
  value: TValue;
  label: React.ReactNode;
  index: number;
  isSelected: boolean;
  isDisabled: boolean;
  /** Spread onto your `<button>` to wire up the option. */
  buttonProps: ButtonHTMLAttributes<HTMLButtonElement> & {
    ref: RefCallback<HTMLButtonElement>;
  };
}

export interface UseSegmentedControlResult<TValue> {
  value: TValue;
  options: SegmentedControlOptionState<TValue>[];
  /** Spread onto the wrapper element to set role="radiogroup" / aria-disabled. */
  rootProps: {
    role: "radiogroup";
    "aria-disabled"?: boolean;
  };
  /**
   * Inline style to apply to your sliding indicator. Contains a CSS variable
   * `--rsc-indicator-x` (px), `--rsc-indicator-width` (px), and a
   * `--rsc-indicator-ready` flag (0 = pre-measure, 1 = measured) so you can
   * skip the animation on first render.
   */
  indicatorStyle: CSSProperties;
  /** Programmatically set the value. */
  setValue: (value: TValue) => void;
}

function normalize<TValue>(
  options: ReadonlyArray<SegmentedControlOption<TValue>>,
): { value: TValue; label: React.ReactNode; disabled: boolean }[] {
  return options.map((opt) => {
    if (
      opt !== null &&
      typeof opt === "object" &&
      "value" in (opt as object)
    ) {
      const o = opt as {
        value: TValue;
        label?: React.ReactNode;
        disabled?: boolean;
      };
      return {
        value: o.value,
        label: o.label ?? String(o.value),
        disabled: o.disabled ?? false,
      };
    }
    return {
      value: opt as TValue,
      label: String(opt),
      disabled: false,
    };
  });
}

const defaultEquals = Object.is;

export function useSegmentedControl<TValue>(
  opts: UseSegmentedControlOptions<TValue>,
): UseSegmentedControlResult<TValue> {
  const {
    options: rawOptions,
    value: controlledValue,
    defaultValue,
    onChange,
    disabled = false,
    equals = defaultEquals,
  } = opts;

  const options = useMemo(() => normalize(rawOptions), [rawOptions]);
  const isControlled = controlledValue !== undefined;

  const initialValue = useMemo<TValue>(() => {
    if (defaultValue !== undefined) return defaultValue;
    return options[0]!.value;
  }, [defaultValue, options]);

  const [internalValue, setInternalValue] = useState<TValue>(initialValue);
  const value = isControlled ? (controlledValue as TValue) : internalValue;

  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [indicator, setIndicator] = useState<{ x: number; w: number; ready: boolean }>({
    x: 0,
    w: 0,
    ready: false,
  });

  // Resize observer: keep indicator measurement in sync with layout changes.
  useIsoLayoutEffect(() => {
    const selectedIndex = options.findIndex((o) => equals(o.value, value));
    const node = buttonRefs.current[selectedIndex];
    if (!node) return;

    const measure = () => {
      const parent = node.offsetParent as HTMLElement | null;
      if (!parent) return;
      const parentRect = parent.getBoundingClientRect();
      const rect = node.getBoundingClientRect();
      setIndicator({
        x: rect.left - parentRect.left,
        w: rect.width,
        ready: true,
      });
    };

    measure();

    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(node);
    if (node.offsetParent) ro.observe(node.offsetParent as Element);
    return () => ro.disconnect();
  }, [options, value, equals]);

  const setValue = useCallback(
    (next: TValue) => {
      if (disabled) return;
      const targetOption = options.find((o) => equals(o.value, next));
      if (!targetOption || targetOption.disabled) return;
      if (isControlled) {
        if (!equals(next, controlledValue as TValue)) onChange?.(next);
      } else {
        setInternalValue((prev) => (equals(prev, next) ? prev : next));
        onChange?.(next);
      }
    },
    [disabled, options, isControlled, controlledValue, onChange, equals],
  );

  const focusOption = useCallback((index: number) => {
    const node = buttonRefs.current[index];
    if (node && !node.disabled) node.focus();
  }, []);

  const handleKeyDown = useCallback(
    (index: number) => (event: KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return;
      const lastIndex = options.length - 1;
      let nextIndex: number | null = null;

      switch (event.key) {
        case "ArrowRight":
        case "ArrowDown": {
          nextIndex = nextEnabled(options, index, +1);
          break;
        }
        case "ArrowLeft":
        case "ArrowUp": {
          nextIndex = nextEnabled(options, index, -1);
          break;
        }
        case "Home": {
          nextIndex = nextEnabled(options, -1, +1);
          break;
        }
        case "End": {
          nextIndex = nextEnabled(options, lastIndex + 1, -1);
          break;
        }
        default:
          return;
      }
      if (nextIndex === null || nextIndex === index) return;
      event.preventDefault();
      const target = options[nextIndex]!;
      setValue(target.value);
      focusOption(nextIndex);
    },
    [disabled, options, setValue, focusOption],
  );

  const optionStates = useMemo<SegmentedControlOptionState<TValue>[]>(() => {
    return options.map((opt, i) => {
      const isSelected = equals(opt.value, value);
      const isDisabled = disabled || opt.disabled;
      const ref: RefCallback<HTMLButtonElement> = (node) => {
        buttonRefs.current[i] = node;
      };
      const buttonProps: SegmentedControlOptionState<TValue>["buttonProps"] = {
        ref,
        type: "button",
        role: "radio",
        "aria-checked": isSelected,
        "aria-disabled": isDisabled || undefined,
        disabled: isDisabled,
        tabIndex: isSelected && !isDisabled ? 0 : -1,
        onClick: () => setValue(opt.value),
        onKeyDown: handleKeyDown(i),
      };
      return {
        value: opt.value,
        label: opt.label,
        index: i,
        isSelected,
        isDisabled,
        buttonProps,
      };
    });
  }, [options, value, disabled, equals, setValue, handleKeyDown]);

  const indicatorStyle = useMemo<CSSProperties>(
    () => ({
      ["--rsc-indicator-x" as string]: `${indicator.x}px`,
      ["--rsc-indicator-width" as string]: `${indicator.w}px`,
      ["--rsc-indicator-ready" as string]: indicator.ready ? "1" : "0",
    }),
    [indicator.x, indicator.w, indicator.ready],
  );

  const rootProps = useMemo<UseSegmentedControlResult<TValue>["rootProps"]>(
    () => ({
      role: "radiogroup",
      "aria-disabled": disabled || undefined,
    }),
    [disabled],
  );

  return {
    value,
    options: optionStates,
    rootProps,
    indicatorStyle,
    setValue,
  };
}

function nextEnabled<TValue>(
  options: { value: TValue; disabled: boolean }[],
  fromIndex: number,
  step: 1 | -1,
): number | null {
  const len = options.length;
  let i = fromIndex + step;
  let attempts = 0;
  while (attempts < len) {
    if (i < 0) i = len - 1;
    if (i >= len) i = 0;
    if (!options[i]!.disabled) return i;
    i += step;
    attempts += 1;
  }
  return null;
}
