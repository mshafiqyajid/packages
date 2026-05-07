import { forwardRef, type HTMLAttributes } from "react";
import { ProgressCircle, type ProgressCircleTone } from "./ProgressCircle";

export type { ProgressCircleTone as ProgressTone };

export interface ProgressRingItem {
  value: number;
  tone?: ProgressCircleTone;
  label?: string;
}

export interface ProgressCircleStackProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  rings: ProgressRingItem[];
  size?: number;
  gap?: number;
}

const DEFAULT_SIZE = 120;
const DEFAULT_GAP = 6;

export const ProgressCircleStack = forwardRef<HTMLDivElement, ProgressCircleStackProps>(
  function ProgressCircleStack({ rings, size = DEFAULT_SIZE, gap = DEFAULT_GAP, className, style, ...rest }, ref) {
    const clamped = rings.slice(0, 4);
    const strokeWidth = Math.max(4, Math.round(size * 0.08));

    return (
      <div
        ref={ref}
        className={["rprog-stack", className].filter(Boolean).join(" ")}
        style={{
          position: "relative",
          width: size,
          height: size,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          ...style,
        }}
        {...rest}
      >
        {clamped.map((ring, i) => {
          const ringSize = size - i * (strokeWidth + gap) * 2;
          return (
            <ProgressCircle
              key={i}
              value={ring.value}
              tone={ring.tone}
              size={ringSize}
              strokeWidth={strokeWidth}
              label={ring.label}
              style={{
                position: "absolute",
                animationDelay: `${i * 120}ms`,
              }}
            />
          );
        })}
      </div>
    );
  },
);
