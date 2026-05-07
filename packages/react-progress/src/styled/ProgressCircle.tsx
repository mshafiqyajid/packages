import { forwardRef, type ReactNode, type SVGAttributes } from "react";
import { useProgress } from "../useProgress";

export type ProgressCircleSize = "sm" | "md" | "lg";
export type ProgressCircleTone = "neutral" | "primary" | "success" | "warning" | "danger";

const SIZE_MAP: Record<ProgressCircleSize, number> = {
  sm: 32,
  md: 48,
  lg: 64,
};

export interface ProgressCircleProps extends Omit<SVGAttributes<SVGSVGElement>, "children"> {
  value?: number;
  min?: number;
  max?: number;
  size?: ProgressCircleSize | number;
  tone?: ProgressCircleTone;
  showValue?: boolean;
  strokeWidth?: number;
  /** Accessible label; also rendered as a caption below the circle when set. */
  label?: ReactNode;
  /** Customize the value display. Receives percent (0-100) and the raw value. */
  formatValue?: (percent: number, value: number | undefined) => ReactNode;
}

export const ProgressCircle = forwardRef<SVGSVGElement, ProgressCircleProps>(
  function ProgressCircle(
    {
      value,
      min = 0,
      max = 100,
      size = "md",
      tone = "neutral",
      showValue = false,
      strokeWidth,
      label,
      formatValue,
      className,
      ...rest
    },
    ref,
  ) {
    const { progressProps, percent, isIndeterminate } = useProgress({ value, min, max });

    const px = typeof size === "number" ? size : SIZE_MAP[size];
    const sw = strokeWidth ?? Math.max(2, Math.round(px * 0.1));
    const radius = (px - sw) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = isIndeterminate ? circumference * 0.75 : circumference * (1 - percent / 100);
    const center = px / 2;

    const sizeAttr = typeof size === "string" ? size : undefined;

    const renderedValue =
      formatValue && !isIndeterminate
        ? formatValue(percent, value)
        : `${percent}%`;

    const svg = (
      <svg
        ref={ref}
        {...progressProps}
        {...rest}
        aria-label={typeof label === "string" ? label : progressProps["aria-label" as never]}
        className={["rprog-circle", className].filter(Boolean).join(" ")}
        data-size={sizeAttr}
        data-tone={tone}
        data-indeterminate={isIndeterminate ? "true" : undefined}
        width={px}
        height={px}
        viewBox={`0 0 ${px} ${px}`}
        style={{ overflow: "visible", ...rest.style }}
      >
        <circle
          className="rprog-circle-track"
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={sw}
        />
        <circle
          className="rprog-circle-fill"
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={sw}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
        {showValue && !isIndeterminate && (
          <text
            className="rprog-circle-value"
            x={center}
            y={center}
            textAnchor="middle"
            dominantBaseline="central"
          >
            {renderedValue}
          </text>
        )}
      </svg>
    );

    if (label) {
      return (
        <span className="rprog-circle-wrap">
          {svg}
          <span className="rprog-circle-label">{label}</span>
        </span>
      );
    }

    return svg;
  },
);
