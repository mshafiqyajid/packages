import {
  forwardRef,
  useEffect,
  useRef,
  useCallback,
  useId,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useSlider, type SliderValue, type SliderScale } from "../useSlider";

export type SliderSize = "sm" | "md" | "lg";
export type SliderTone = "neutral" | "primary" | "success" | "danger";
export type SliderOrientation = "horizontal" | "vertical";

export interface SliderMark {
  value: number;
  label?: ReactNode;
}

export interface SliderStyledProps {
  value?: SliderValue;
  defaultValue?: SliderValue;
  onChange?: (value: SliderValue) => void;
  /** Fires only on pointer release / keyboard commit, not on every step. */
  onCommit?: (value: SliderValue) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  size?: SliderSize;
  tone?: SliderTone;
  range?: boolean;
  /** Show the current value next to the thumb. Default: false. */
  showValue?: boolean;
  /**
   * Show the bubble only while the thumb is hovered/active.
   * When `showValue` is true the bubble is always visible.
   */
  showValueOnInteraction?: boolean;
  /** Format the value displayed in the bubble. */
  formatValue?: (value: number) => ReactNode;
  /** Render tick marks. Pass `true` to derive from `step`, or an array of values / `{ value, label }` objects. */
  marks?: boolean | number[] | SliderMark[];
  /** When true and `marks` is set, thumb snaps to the nearest mark on drag end. */
  snapToMarks?: boolean;
  /** Map the linear 0-100 visual track to a logarithmic scale. */
  scale?: SliderScale;
  /** Base for the log scale. Default 10. */
  scaleBase?: number;
  /**
   * Orientation. Default: "horizontal".
   */
  orientation?: SliderOrientation;
  className?: string;
  /** Label rendered above the slider. */
  label?: ReactNode;
  /** Helper text below. */
  hint?: ReactNode;
  /** Error text — flips tone to danger and sets aria-invalid + data-invalid. */
  error?: ReactNode;
  /** Force the invalid state without inline error text. */
  invalid?: boolean;
  /** Mark as required. */
  required?: boolean;
  /** Form name. Renders hidden input(s). Range mode emits `${name}` and `${name}-end`. */
  name?: string;
  /** Override the wrapper id. */
  id?: string;
  style?: CSSProperties;
}

function buildMarks(min: number, max: number, step: number): number[] {
  const result: number[] = [];
  for (let v = min; v <= max; v = Math.round((v + step) * 1e10) / 1e10) {
    result.push(v);
  }
  return result;
}

function normalizeMarks(
  marks: SliderStyledProps["marks"],
  min: number,
  max: number,
  step: number,
): SliderMark[] {
  if (!marks) return [];
  if (marks === true) return buildMarks(min, max, step).map((value) => ({ value }));
  if (Array.isArray(marks)) {
    return marks.map((m) =>
      typeof m === "number" ? ({ value: m } as SliderMark) : (m as SliderMark),
    );
  }
  return [];
}

function getMarkValues(
  marks: SliderStyledProps["marks"],
  min: number,
  max: number,
  step: number,
): number[] {
  return normalizeMarks(marks, min, max, step).map((m) => m.value);
}

export const SliderStyled = forwardRef<HTMLDivElement, SliderStyledProps>(
  function SliderStyled(
    {
      value,
      defaultValue,
      onChange,
      min = 0,
      max = 100,
      step = 1,
      disabled = false,
      size = "md",
      tone: toneProp = "neutral",
      range = false,
      showValue = false,
      showValueOnInteraction,
      formatValue,
      marks = false,
      snapToMarks = false,
      scale = "linear",
      scaleBase = 10,
      orientation = "horizontal",
      onCommit,
      className,
      label,
      hint,
      error,
      invalid: invalidProp,
      required,
      name,
      id: idProp,
      style: styleProp,
    },
    ref,
  ) {
    const autoId = useId();
    const baseId = idProp ?? autoId;
    const labelId = `${baseId}-label`;
    const hintId = hint ? `${baseId}-hint` : undefined;
    const errorId = error ? `${baseId}-error` : undefined;
    const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

    const isInvalid = Boolean(error) || invalidProp === true;
    const tone: SliderTone = isInvalid ? "danger" : toneProp;

    const resolvedDefault: SliderValue =
      defaultValue !== undefined
        ? defaultValue
        : range
          ? [min, max]
          : min;

    const markValuesForSnap = snapToMarks ? getMarkValues(marks, min, max, step) : undefined;

    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
    const tooltipTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

    const handleDragStart = useCallback((index: number) => {
      const existing = tooltipTimers.current.get(index);
      if (existing) clearTimeout(existing);
      tooltipTimers.current.delete(index);
      setDraggingIndex(index);
    }, []);

    const handleDragEnd = useCallback((index: number) => {
      const timer = setTimeout(() => {
        setDraggingIndex((prev) => (prev === index ? null : prev));
        tooltipTimers.current.delete(index);
      }, 800);
      tooltipTimers.current.set(index, timer);
    }, []);

    const { trackProps, thumbProps, rangeProps, value: liveValue } = useSlider({
      value,
      defaultValue: resolvedDefault,
      onChange,
      min,
      max,
      step,
      disabled,
      marks: markValuesForSnap,
      snapToMarks,
      scale,
      scaleBase,
      onDragStart: handleDragStart,
      onDragEnd: handleDragEnd,
    });

    useEffect(() => {
      return () => {
        tooltipTimers.current.forEach((t) => clearTimeout(t));
      };
    }, []);

    const lastCommittedRef = useRef<SliderValue | null>(null);
    const liveValueRef = useRef(liveValue);
    liveValueRef.current = liveValue;
    useEffect(() => {
      if (!onCommit) return;
      const fire = () => {
        const cur = liveValueRef.current;
        const last = lastCommittedRef.current;
        const changed =
          last == null ||
          (Array.isArray(cur) && Array.isArray(last)
            ? cur.length !== last.length || cur.some((v, i) => v !== last[i])
            : cur !== last);
        if (changed) {
          lastCommittedRef.current = cur;
          onCommit(cur);
        }
      };
      document.addEventListener("pointerup", fire);
      document.addEventListener("keyup", fire);
      return () => {
        document.removeEventListener("pointerup", fire);
        document.removeEventListener("keyup", fire);
      };
    }, [onCommit]);

    const trackInnerRef = useRef<HTMLDivElement | null>(null);

    const setTrackRef = useCallback(
      (el: HTMLDivElement | null) => {
        trackInnerRef.current = el;
      },
      [],
    );

    const normalizedMarks = normalizeMarks(marks, min, max, step);
    const getPercent = (v: number) =>
      max === min ? 0 : ((v - min) / (max - min)) * 100;

    const showBubbleOnInteraction = showValueOnInteraction === true;
    const showBubbleAlways = showValue && !showBubbleOnInteraction;

    const isRangeValue = Array.isArray(liveValue);
    const liveArr = Array.isArray(liveValue) ? liveValue : [liveValue as number];
    const hiddenStart = liveArr[0]!;

    return (
      <div
        ref={ref}
        id={baseId}
        className={[
          "rslider-root",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        data-size={size}
        data-tone={tone}
        data-disabled={disabled || undefined}
        data-range={range || undefined}
        data-orientation={orientation}
        data-bubble-on-interaction={showBubbleOnInteraction || undefined}
        data-invalid={isInvalid ? "true" : undefined}
        style={styleProp}
      >
        {label ? (
          <span className="rslider-label" id={labelId}>
            {label}
          </span>
        ) : null}
        <div
          ref={(el) => {
            setTrackRef(el);
          }}
          {...trackProps}
          className="rslider-track"
          aria-labelledby={label ? labelId : undefined}
          aria-describedby={describedBy}
          aria-invalid={isInvalid ? true : undefined}
          aria-required={required ? true : undefined}
          style={trackProps.style as CSSProperties}
        >
          <div className="rslider-track-rail" />

          <div
            {...rangeProps}
            className="rslider-range"
            style={rangeProps.style as CSSProperties}
          />

          {normalizedMarks.map((m) => (
            <div
              key={m.value}
              className="rslider-mark"
              aria-hidden
              data-has-label={m.label !== undefined || undefined}
              style={{
                position: "absolute",
                left: `${getPercent(m.value)}%`,
                transform: "translateX(-50%)",
              }}
            >
              {m.label !== undefined && (
                <span className="rslider-mark-label">{m.label}</span>
              )}
            </div>
          ))}

          {thumbProps.map((tp, i) => {
            const numValue = tp["aria-valuenow"];
            const isThisDragging = draggingIndex === i;
            return (
              <div
                key={i}
                {...tp}
                className="rslider-thumb"
                data-dragging={isThisDragging ? "true" : undefined}
                style={tp.style as CSSProperties}
              >
                {(showBubbleAlways || showBubbleOnInteraction || isThisDragging) && (
                  <div
                    className="rslider-tooltip"
                    data-drag-tooltip={isThisDragging ? "visible" : undefined}
                    aria-hidden
                  >
                    {formatValue ? formatValue(numValue) : numValue}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {name ? (
          <>
            <input
              type="hidden"
              name={name}
              value={String(hiddenStart)}
              required={required}
              readOnly
            />
            {isRangeValue && liveArr.length > 1
              ? liveArr.slice(1).map((v, i) => (
                  <input
                    key={i}
                    type="hidden"
                    name={i === 0 ? `${name}-end` : `${name}-${i + 1}`}
                    value={String(v)}
                    required={required}
                    readOnly
                  />
                ))
              : null}
          </>
        ) : null}
        {error ? (
          <span className="rslider-error" id={errorId} role="alert">
            {error}
          </span>
        ) : hint ? (
          <span className="rslider-hint" id={hintId}>
            {hint}
          </span>
        ) : null}
      </div>
    );
  },
);
