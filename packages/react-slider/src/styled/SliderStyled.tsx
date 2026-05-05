import {
  forwardRef,
  useRef,
  useCallback,
  useId,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useSlider, type SliderValue } from "../useSlider";

export type SliderSize = "sm" | "md" | "lg";
export type SliderTone = "neutral" | "primary" | "success" | "danger";

export interface SliderStyledProps {
  value?: SliderValue;
  defaultValue?: SliderValue;
  onChange?: (value: SliderValue) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  size?: SliderSize;
  tone?: SliderTone;
  range?: boolean;
  showValue?: boolean;
  marks?: boolean;
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
      marks = false,
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

    const trackInnerRef = useRef<HTMLDivElement | null>(null);

    const setTrackRef = useCallback(
      (el: HTMLDivElement | null) => {
        trackInnerRef.current = el;
      },
      [],
    );

    const markValues = marks ? buildMarks(min, max, step) : [];
    const getPercent = (v: number) =>
      max === min ? 0 : ((v - min) / (max - min)) * 100;

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

          {marks && markValues.map((v) => (
            <div
              key={v}
              className="rslider-mark"
              aria-hidden
              style={{
                position: "absolute",
                left: `${getPercent(v)}%`,
                transform: "translateX(-50%)",
              }}
            />
          ))}

          {thumbProps.map((tp, i) => (
            <div
              key={i}
              {...tp}
              className="rslider-thumb"
              style={tp.style as CSSProperties}
            >
              {showValue && (
                <div className="rslider-tooltip" aria-hidden>
                  {tp["aria-valuenow"]}
                </div>
              )}
            </div>
          ))}
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
