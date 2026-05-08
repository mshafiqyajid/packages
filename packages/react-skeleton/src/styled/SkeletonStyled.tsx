import { forwardRef, type CSSProperties, type Ref } from "react";
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
  count?: number;
  spacing?: number;
  inline?: boolean;
  baseColor?: string;
  highlightColor?: string;
  borderRadius?: string | number;
  enableAnimation?: boolean;
  fitContent?: boolean;
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
  borderRadius,
}: {
  lines: number;
  lastLineWidth: string;
  animation: SkeletonAnimation;
  radius: SkeletonRadius;
  borderRadius?: string | number;
}) {
  const customRadiusStyle =
    borderRadius !== undefined
      ? ({ "--rsk-custom-radius": toCSSValue(borderRadius) } as CSSProperties)
      : undefined;

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
            style={{
              ...(isLast ? { width: lastLineWidth } : {}),
              ...customRadiusStyle,
            }}
          />
        );
      })}
    </>
  );
}

interface SkeletonItemProps {
  variant: SkeletonVariant;
  animation: SkeletonAnimation;
  width?: string | number;
  height?: string | number;
  radius: SkeletonRadius;
  lines: number;
  lastLineWidth: string;
  className?: string;
  style?: CSSProperties;
  inline: boolean;
  baseColor?: string;
  highlightColor?: string;
  borderRadius?: string | number;
  fitContent: boolean;
  skeletonProps: {
    role: "status";
    "aria-label": string;
    "aria-busy": "true";
    "aria-live": "polite";
  };
  divRef?: Ref<HTMLDivElement>;
}

function SkeletonItem({
  variant,
  animation,
  width,
  height,
  radius,
  lines,
  lastLineWidth,
  className,
  style,
  inline,
  baseColor,
  highlightColor,
  borderRadius,
  fitContent,
  skeletonProps,
  divRef,
}: SkeletonItemProps) {
  const rootClass = ["rsk-root", className].filter(Boolean).join(" ");

  const resolvedStyle: CSSProperties = {
    ...(width !== undefined ? { width: toCSSValue(width) } : {}),
    ...(height !== undefined ? { height: toCSSValue(height) } : {}),
    ...(baseColor !== undefined
      ? ({ "--rsk-bg": baseColor } as CSSProperties)
      : {}),
    ...(highlightColor !== undefined
      ? ({ "--rsk-wave-highlight": highlightColor } as CSSProperties)
      : {}),
    ...(borderRadius !== undefined
      ? ({ "--rsk-custom-radius": toCSSValue(borderRadius) } as CSSProperties)
      : {}),
    ...(fitContent && variant !== "circle" ? { width: "fit-content", height: "fit-content" } : {}),
    ...style,
  };

  return (
    <div
      {...skeletonProps}
      ref={divRef}
      className={rootClass}
      data-variant={variant}
      data-animation={animation}
      data-radius={variant !== "circle" ? radius : undefined}
      data-inline={inline ? "true" : undefined}
      style={Object.keys(resolvedStyle).length > 0 ? resolvedStyle : undefined}
    >
      {variant === "text" && (
        <TextVariant
          lines={lines}
          lastLineWidth={lastLineWidth}
          animation={animation}
          radius={radius}
          borderRadius={borderRadius}
        />
      )}
    </div>
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
      count = 1,
      spacing = 8,
      inline = false,
      baseColor,
      highlightColor,
      borderRadius,
      enableAnimation = true,
      fitContent = false,
    },
    ref,
  ) {
    const { skeletonProps } = useSkeleton();

    const resolvedAnimation: SkeletonAnimation =
      enableAnimation === false ? "none" : animation;

    const itemProps: Omit<SkeletonItemProps, "divRef"> = {
      variant,
      animation: resolvedAnimation,
      width,
      height,
      radius,
      lines,
      lastLineWidth,
      className,
      style,
      inline,
      baseColor,
      highlightColor,
      borderRadius,
      fitContent,
      skeletonProps,
    };

    if (count > 1) {
      const groupStyle = {
        "--rsk-group-gap": `${spacing}px`,
      } as CSSProperties;

      return (
        <div
          ref={ref}
          className="rsk-group"
          data-count={count}
          data-inline={inline ? "true" : undefined}
          style={groupStyle}
        >
          {Array.from({ length: count }, (_, i) => (
            <SkeletonItem key={i} {...itemProps} />
          ))}
        </div>
      );
    }

    return <SkeletonItem {...itemProps} divRef={ref} />;
  },
);
