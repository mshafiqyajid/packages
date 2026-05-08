import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useRange, type RangeMode, type RangeValue } from "../useRange";

export type RangeSize = "sm" | "md" | "lg";
export type RangeTone = "neutral" | "primary" | "success" | "warning" | "danger";

export interface RangeMark {
  value: number;
  label?: string;
}

export interface RangeStyledProps {
  value?: number | [number, number];
  defaultValue?: number | [number, number];
  onChange?: (value: number | [number, number]) => void;
  onChangeEnd?: (value: number | [number, number]) => void;
  min?: number;
  max?: number;
  step?: number;
  mode?: RangeMode;
  disabled?: boolean;
  inverted?: boolean;
  showTooltip?: "always" | "drag" | "never";
  tooltipFormat?: (value: number) => string;
  marks?: boolean | RangeMark[];
  size?: RangeSize;
  tone?: RangeTone;
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  invalid?: boolean;
  className?: string;
  style?: CSSProperties;
}

function buildAutoMarks(min: number, max: number, step: number): RangeMark[] {
  const result: RangeMark[] = [];
  for (let v = min; v <= max; v = Math.round((v + step) * 1e10) / 1e10) {
    result.push({ value: v });
  }
  return result;
}

function resolveMarks(
  marks: RangeStyledProps["marks"],
  min: number,
  max: number,
  step: number,
): RangeMark[] {
  if (!marks) return [];
  if (marks === true) return buildAutoMarks(min, max, step);
  return marks;
}

export const RangeStyled = forwardRef<HTMLDivElement, RangeStyledProps>(
  function RangeStyled(
    {
      value,
      defaultValue,
      onChange,
      onChangeEnd,
      min = 0,
      max = 100,
      step = 1,
      mode = "range",
      disabled = false,
      inverted = false,
      showTooltip = "drag",
      tooltipFormat,
      marks = false,
      size = "md",
      tone: toneProp = "primary",
      label,
      hint,
      error,
      required,
      invalid: invalidProp,
      className,
      style: styleProp,
    },
    ref,
  ) {
    const autoId = useId();
    const labelId = `${autoId}-label`;
    const hintId = hint ? `${autoId}-hint` : undefined;
    const errorId = error ? `${autoId}-error` : undefined;
    const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

    const isInvalid = Boolean(error) || invalidProp === true;
    const tone: RangeTone = isInvalid ? "danger" : toneProp;

    const resolvedDefault: RangeValue =
      defaultValue !== undefined
        ? defaultValue
        : mode === "single"
          ? min
          : [min, max];

    const [activeDragging, setActiveDragging] = useState<number | null>(null);
    const tooltipHideTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

    const handleDragEnd = useCallback((index: number) => {
      if (showTooltip !== "drag") return;
      const timer = setTimeout(() => {
        setActiveDragging((prev) => (prev === index ? null : prev));
        tooltipHideTimers.current.delete(index);
      }, 600);
      tooltipHideTimers.current.set(index, timer);
    }, [showTooltip]);

    useEffect(() => {
      return () => {
        tooltipHideTimers.current.forEach((t) => clearTimeout(t));
      };
    }, []);

    const handleChange = useCallback(
      (v: RangeValue) => {
        onChange?.(v as number | [number, number]);
      },
      [onChange],
    );

    const handleChangeEnd = useCallback(
      (v: RangeValue) => {
        onChangeEnd?.(v as number | [number, number]);
        if (showTooltip === "drag") {
          const thumbCount = mode === "single" ? 1 : 2;
          for (let i = 0; i < thumbCount; i++) {
            handleDragEnd(i);
          }
        }
      },
      [onChangeEnd, showTooltip, mode, handleDragEnd],
    );

    const { trackProps, getThumbProps, getTrackFillProps, draggingIndex } =
      useRange({
        value: value as RangeValue | undefined,
        defaultValue: resolvedDefault,
        onChange: handleChange,
        onChangeEnd: handleChangeEnd,
        min,
        max,
        step,
        mode,
        disabled,
        inverted,
      });

    useEffect(() => {
      if (draggingIndex !== null && showTooltip === "drag") {
        const existing = tooltipHideTimers.current.get(draggingIndex);
        if (existing) clearTimeout(existing);
        tooltipHideTimers.current.delete(draggingIndex);
        setActiveDragging(draggingIndex);
      }
    }, [draggingIndex, showTooltip]);

    const getPercent = (v: number) =>
      max === min ? 0 : ((v - min) / (max - min)) * 100;

    const resolvedMarks = resolveMarks(marks, min, max, step);
    const thumbCount = mode === "single" ? 1 : 2;
    const fillProps = getTrackFillProps();

    const isTooltipVisible = (index: number) => {
      if (showTooltip === "always") return true;
      if (showTooltip === "never") return false;
      return activeDragging === index || draggingIndex === index;
    };

    return (
      <div
        ref={ref}
        className={["rrng-root", className].filter(Boolean).join(" ")}
        data-size={size}
        data-tone={tone}
        data-mode={mode}
        data-disabled={disabled || undefined}
        data-invalid={isInvalid ? "true" : undefined}
        data-inverted={inverted || undefined}
        style={styleProp}
      >
        {label ? (
          <span className="rrng-label" id={labelId}>
            {label}
            {required ? <span className="rrng-required" aria-hidden>*</span> : null}
          </span>
        ) : null}

        <div
          {...trackProps}
          className="rrng-track"
          aria-labelledby={label ? labelId : undefined}
          aria-describedby={describedBy}
          aria-invalid={isInvalid ? true : undefined}
          style={trackProps.style as CSSProperties}
        >
          <div className="rrng-rail" />

          <div
            {...fillProps}
            className="rrng-fill"
            style={fillProps.style as CSSProperties}
          />

          {resolvedMarks.map((mark) => (
            <div
              key={mark.value}
              className="rrng-mark"
              aria-hidden
              data-has-label={mark.label !== undefined || undefined}
              style={{
                position: "absolute",
                left: `${getPercent(mark.value)}%`,
                transform: "translateX(-50%)",
              }}
            >
              {mark.label !== undefined ? (
                <span className="rrng-mark-label">{mark.label}</span>
              ) : null}
            </div>
          ))}

          {Array.from({ length: thumbCount }, (_, i) => {
            const tp = getThumbProps(i);
            const numValue = tp["aria-valuenow"];
            const visible = isTooltipVisible(i);

            return (
              <div
                key={i}
                {...tp}
                className="rrng-thumb"
                style={tp.style as CSSProperties}
              >
                {showTooltip !== "never" ? (
                  <div
                    className="rrng-tooltip"
                    data-visible={visible ? "true" : undefined}
                    aria-hidden
                  >
                    {tooltipFormat ? tooltipFormat(numValue) : numValue}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        {error ? (
          <span className="rrng-error" id={errorId} role="alert">
            {error}
          </span>
        ) : hint ? (
          <span className="rrng-hint" id={hintId}>
            {hint}
          </span>
        ) : null}
      </div>
    );
  },
);
