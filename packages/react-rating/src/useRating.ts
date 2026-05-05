import {
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type RefCallback,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

export interface UseRatingOptions {
  /** Number of stars/items. Default: 5. */
  count?: number;
  /** Controlled value, 0..count, in step of 0.5 (or 1 if `allowHalf` is false). */
  value?: number;
  /** Initial value when uncontrolled. Default: 0. */
  defaultValue?: number;
  /** Called when the value changes (commit). Return a Promise to auto-drive a pending state — the rating shows data-pending until the promise settles, and reverts to the previous value on rejection. */
  onChange?: (value: number) => void | Promise<void>;
  /** Called as the user hovers, even before they click. Useful for live preview text. */
  onHover?: (value: number | null) => void;
  /** Allow half-step values. Default: true. */
  allowHalf?: boolean;
  /** Read-only — value cannot change. */
  readOnly?: boolean;
  /** Disable interaction entirely. */
  disabled?: boolean;
  /** Allow clearing by clicking the current value again. Default: true. */
  clearable?: boolean;
}

export interface RatingItemState {
  index: number;
  /**
   * Fill amount for this item, 0..1.
   * - 0 = empty
   * - 0.5 = half (only when `allowHalf` is true)
   * - 1 = full
   * Reflects the current preview (hover) or committed value.
   */
  fill: number;
  /** Whether this item is the one the cursor is over. */
  isHovered: boolean;
  /** True if rating is in read-only or disabled state. */
  isInteractive: boolean;
  /** Spread these onto your interactive element. */
  itemProps: {
    ref: RefCallback<HTMLElement>;
    role: "radio";
    "aria-checked": boolean;
    "aria-label": string;
    tabIndex: number;
    onPointerMove?: (event: PointerEvent<HTMLElement>) => void;
    onPointerLeave?: (event: PointerEvent<HTMLElement>) => void;
    onClick?: (event: MouseEvent<HTMLElement>) => void;
    onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
    onFocus?: () => void;
  };
  /** CSS variable carrying the fill (`--rrt-fill: 0|.5|1`). */
  style: CSSProperties;
}

export interface UseRatingResult {
  /** The committed value. */
  value: number;
  /** The currently hovered preview value, or null if not hovering. */
  hoverValue: number | null;
  /** The visible value: hoverValue ?? value. */
  displayValue: number;
  /** True while an async onChange Promise is in flight. */
  isPending: boolean;
  /** Per-item state to render your own UI. */
  items: RatingItemState[];
  /** Spread onto the wrapper for `role="radiogroup"`. */
  rootProps: {
    role: "radiogroup";
    "aria-disabled"?: boolean;
    "aria-readonly"?: boolean;
    "aria-busy"?: boolean;
    "data-pending"?: "true";
  };
  /** Programmatically set the value. */
  setValue: (value: number) => void;
  /** Programmatically clear (sets to 0). */
  clear: () => void;
}

const DEFAULT_COUNT = 5;
const STEP_HALF = 0.5;
const STEP_FULL = 1;

function clampValue(value: number, max: number): number {
  if (Number.isNaN(value)) return 0;
  if (value < 0) return 0;
  if (value > max) return max;
  return value;
}

function snap(value: number, step: number): number {
  return Math.round(value / step) * step;
}

function fillFor(itemIndex: number, value: number): number {
  // itemIndex is 0-based; an item is "full" when value >= itemIndex + 1.
  const ones = itemIndex + 1;
  if (value >= ones) return 1;
  if (value >= ones - STEP_HALF) return 0.5;
  return 0;
}

export function useRating(options: UseRatingOptions = {}): UseRatingResult {
  const {
    count = DEFAULT_COUNT,
    value: controlledValue,
    defaultValue = 0,
    onChange,
    onHover,
    allowHalf = true,
    readOnly = false,
    disabled = false,
    clearable = true,
  } = options;

  const isControlled = controlledValue !== undefined;
  const step = allowHalf ? STEP_HALF : STEP_FULL;

  const [internalValue, setInternalValue] = useState<number>(() =>
    snap(clampValue(defaultValue, count), step),
  );
  const value = isControlled
    ? snap(clampValue(controlledValue!, count), step)
    : internalValue;

  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [isPending, setIsPending] = useState(false);
  const pendingRef = useRef(false);

  const itemRefs = useRef<Array<HTMLElement | null>>([]);

  const isInteractive = !disabled && !readOnly && !isPending;

  const commit = useCallback(
    (next: number) => {
      if (disabled || readOnly || pendingRef.current) return;
      const clamped = snap(clampValue(next, count), step);
      if (clamped === value) return;
      const previous = value;
      if (!isControlled) setInternalValue(clamped);
      const result = onChange?.(clamped);
      if (result && typeof (result as Promise<void>).then === "function") {
        pendingRef.current = true;
        setIsPending(true);
        (result as Promise<void>).then(
          () => {
            pendingRef.current = false;
            setIsPending(false);
          },
          () => {
            pendingRef.current = false;
            setIsPending(false);
            if (!isControlled) setInternalValue(previous);
          },
        );
      }
    },
    [disabled, readOnly, count, step, isControlled, value, onChange],
  );

  const setValue = useCallback(
    (next: number) => commit(next),
    [commit],
  );

  const clear = useCallback(() => commit(0), [commit]);

  const handlePointerMove = useCallback(
    (index: number) => (event: PointerEvent<HTMLElement>) => {
      if (!isInteractive) return;
      const target = event.currentTarget;
      const rect = target.getBoundingClientRect();
      // Read clientX from the native event when the synthetic value is
      // unavailable (some test renderers / Pointer Events polyfills drop it).
      const clientX =
        typeof event.clientX === "number"
          ? event.clientX
          : event.nativeEvent?.clientX ?? 0;
      let preview: number;
      if (allowHalf) {
        const isLeftHalf = clientX - rect.left < rect.width / 2;
        preview = index + (isLeftHalf ? STEP_HALF : STEP_FULL);
      } else {
        preview = index + STEP_FULL;
      }
      setHoverValue((prev) => (prev === preview ? prev : preview));
      onHover?.(preview);
    },
    [isInteractive, allowHalf, onHover],
  );

  const handlePointerLeave = useCallback(() => {
    if (!isInteractive) return;
    setHoverValue(null);
    onHover?.(null);
  }, [isInteractive, onHover]);

  const handleClick = useCallback(
    (index: number) => (event: MouseEvent<HTMLElement>) => {
      if (!isInteractive) return;
      const target = event.currentTarget;
      const rect = target.getBoundingClientRect();
      const clientX =
        typeof event.clientX === "number"
          ? event.clientX
          : event.nativeEvent?.clientX ?? 0;
      let next: number;
      if (allowHalf) {
        const isLeftHalf = clientX - rect.left < rect.width / 2;
        next = index + (isLeftHalf ? STEP_HALF : STEP_FULL);
      } else {
        next = index + STEP_FULL;
      }
      // If clearable and clicking the same value already committed, clear.
      if (clearable && next === value) {
        commit(0);
        return;
      }
      commit(next);
    },
    [isInteractive, allowHalf, clearable, value, commit],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (!isInteractive) return;
      const max = count;
      let next: number | null = null;

      switch (event.key) {
        case "ArrowRight":
        case "ArrowUp":
          next = clampValue(value + step, max);
          break;
        case "ArrowLeft":
        case "ArrowDown":
          next = clampValue(value - step, max);
          break;
        case "Home":
          next = 0;
          break;
        case "End":
          next = max;
          break;
        case " ":
        case "Enter": {
          // Toggle clear when at the focused star's full value.
          if (focusedIndex !== null) {
            const star = focusedIndex + 1;
            next = value === star && clearable ? 0 : star;
          }
          break;
        }
        default:
          return;
      }
      if (next === null) return;
      event.preventDefault();
      commit(next);
    },
    [isInteractive, count, step, value, focusedIndex, clearable, commit],
  );

  const displayValue = hoverValue ?? value;

  const items = useMemo<RatingItemState[]>(() => {
    return Array.from({ length: count }, (_, i) => {
      const fill = fillFor(i, displayValue);
      const ref: RefCallback<HTMLElement> = (node) => {
        itemRefs.current[i] = node;
      };
      const isSelected = value >= i + 1;
      const itemProps: RatingItemState["itemProps"] = {
        ref,
        role: "radio",
        "aria-checked": isSelected,
        "aria-label": `${i + 1} of ${count} stars`,
        tabIndex: isInteractive
          ? // Roving tabindex on the integer star matching `value` (or first if no value).
            i === Math.max(0, Math.ceil(value) - 1)
            ? 0
            : -1
          : -1,
        onKeyDown: isInteractive ? handleKeyDown : undefined,
        onFocus: isInteractive
          ? () => setFocusedIndex(i)
          : undefined,
        onPointerMove: isInteractive ? handlePointerMove(i) : undefined,
        onPointerLeave: isInteractive ? handlePointerLeave : undefined,
        onClick: isInteractive ? handleClick(i) : undefined,
      };
      return {
        index: i,
        fill,
        isHovered: hoverValue !== null && Math.ceil(hoverValue) - 1 === i,
        isInteractive,
        itemProps,
        style: {
          ["--rrt-fill" as string]: String(fill),
        },
      };
    });
  }, [
    count,
    displayValue,
    value,
    hoverValue,
    isInteractive,
    handleClick,
    handleKeyDown,
    handlePointerMove,
    handlePointerLeave,
  ]);

  const rootProps = useMemo<UseRatingResult["rootProps"]>(
    () => ({
      role: "radiogroup",
      "aria-disabled": disabled || undefined,
      "aria-readonly": readOnly || undefined,
      "aria-busy": isPending || undefined,
      "data-pending": isPending ? "true" : undefined,
    }),
    [disabled, readOnly, isPending],
  );

  return {
    value,
    hoverValue,
    displayValue,
    isPending,
    items,
    rootProps,
    setValue,
    clear,
  };
}
