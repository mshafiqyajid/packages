import { forwardRef, type CSSProperties } from "react";
import { useSkeleton } from "../useSkeleton";

export type SkeletonVariant = "rect" | "line" | "circle" | "text";
export type SkeletonAnimation = "pulse" | "wave" | "none";
export type SkeletonRadius = "none" | "sm" | "md" | "lg" | "full";

export interface SkeletonStyledProps {
  variant?: SkeletonVariant;
  animation?: SkeletonAnimation;
  width?: string | number;
  height?: string | number;
  radius?: SkeletonRadius;
  lines?: number;
  lastLineWidth?: string;
  className?: string;
  style?: CSSProperties;
}

function toCSSValue(value: string | number | undefined): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "number") return `${value}px`;
  return value;
}

function TextVariant({
  lines,
  lastLineWidth,
  animation,
  radius,
}: {
  lines: number;
  lastLineWidth: string;
  animation: SkeletonAnimation;
  radius: SkeletonRadius;
}) {
  return (
    <>
      {Array.from({ length: lines }, (_, i) => {
        const isLast = i === lines - 1;
        return (
          <span
            key={i}
            className="rsk-line"
            data-animation={animation}
            data-radius={radius}
            style={isLast ? { width: lastLineWidth } : undefined}
          />
        );
      })}
    </>
  );
}

export const SkeletonStyled = forwardRef<HTMLDivElement, SkeletonStyledProps>(
  function SkeletonStyled(
    {
      variant = "rect",
      animation = "pulse",
      width,
      height,
      radius = "sm",
      lines = 3,
      lastLineWidth = "60%",
      className,
      style,
    },
    ref,
  ) {
    const { skeletonProps } = useSkeleton();

    const rootClass = ["rsk-root", className].filter(Boolean).join(" ");

    const resolvedStyle: CSSProperties = {
      ...(width !== undefined ? { width: toCSSValue(width) } : {}),
      ...(height !== undefined ? { height: toCSSValue(height) } : {}),
      ...style,
    };

    return (
      <div
        {...skeletonProps}
        ref={ref}
        className={rootClass}
        data-variant={variant}
        data-animation={animation}
        data-radius={variant !== "circle" ? radius : undefined}
        style={Object.keys(resolvedStyle).length > 0 ? resolvedStyle : undefined}
      >
        {variant === "text" && (
          <TextVariant
            lines={lines}
            lastLineWidth={lastLineWidth}
            animation={animation}
            radius={radius}
          />
        )}
      </div>
    );
  },
);
