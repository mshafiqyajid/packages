import {
  forwardRef,
  useEffect,
  useRef,
  useCallback,
  useId,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useSlider, type SliderValue } from "../useSlider";

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
  /** Fires only on pointer release / keyboard commit, not on every step. Useful for expensive update flows. */
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
   * Show the bubble only while the thumb is hovered/active. Default: depends on `showValue`.
   * When `showValue` is true, the bubble is always visible. Set this true to make it appear on interaction only.
   */
  showValueOnInteraction?: boolean;
  /** Format the value displayed in the bubble. */
  formatValue?: (value: number) => ReactNode;
  /** Render tick marks. Pass `true` to derive from `step`, or an array of values / `{ value, label }` objects. */
  marks?: boolean | number[] | SliderMark[];
  /**
   * Orientation. Default: "horizontal". Vertical lays out the slider top-to-bottom
   * via `data-orientation="vertical"` on the root; the hook math stays horizontal,
   * so consumers using the hook directly should still wire pointer math themselves.
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
  /** Form name. Renders hidden input(s) with the current value(s) for native submission. Range mode emits `${name}` and `${name}-end`. */
  name?: string;
  /** Override the wrapper id. */
  id?: string;
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

    const { trackProps, thumbProps, rangeProps, value: liveValue } = useSlider({
      value,
      defaultValue: resolvedDefault,
      onChange,
      min,
      max,
      step,
      disabled,
    });

    // onCommit: fire when the user releases pointer / keys after a change.
    // Tracked via a ref so we don't refire on re-renders.
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
            ? cur[0] !== last[0] || cur[1] !== last[1]
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
    // showValue: bubble always visible.
    // showValueOnInteraction: bubble only on hover/active (overrides showValue when true).
    const showBubbleOnInteraction = showValueOnInteraction === true;
    const showBubbleAlways = showValue && !showBubbleOnInteraction;

    const isRangeValue = Array.isArray(liveValue);
    const hiddenStart = isRangeValue ? liveValue[0] : (liveValue as number);
    const hiddenEnd = isRangeValue ? liveValue[1] : undefined;

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
            return (
              <div
                key={i}
                {...tp}
                className="rslider-thumb"
                style={tp.style as CSSProperties}
              >
                {(showBubbleAlways || showBubbleOnInteraction) && (
                  <div className="rslider-tooltip" aria-hidden>
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
            {isRangeValue && hiddenEnd !== undefined ? (
              <input
                type="hidden"
                name={`${name}-end`}
                value={String(hiddenEnd)}
                required={required}
                readOnly
              />
            ) : null}
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
