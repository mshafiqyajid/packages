import { forwardRef, useRef, useCallback, type CSSProperties } from "react";
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
      tone = "neutral",
      range = false,
      showValue = false,
      marks = false,
      className,
    },
    ref,
  ) {
    const resolvedDefault: SliderValue =
      defaultValue !== undefined
        ? defaultValue
        : range
          ? [min, max]
          : min;

    const { trackProps, thumbProps, rangeProps } = useSlider({
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

    return (
      <div
        ref={ref}
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
      >
        <div
          ref={(el) => {
            setTrackRef(el);
          }}
          {...trackProps}
          className="rslider-track"
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
      </div>
    );
  },
);
