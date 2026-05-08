import React, { forwardRef } from "react";
import { useDivider } from "../useDivider";

export interface DividerStyledProps {
  orientation?: "horizontal" | "vertical";
  label?: React.ReactNode;
  labelAlign?: "start" | "center" | "end";
  tone?: "neutral" | "primary" | "success" | "warning" | "danger" | "info";
  lineStyle?: "solid" | "dashed" | "dotted";
  size?: "sm" | "md" | "lg";
  spacing?: "sm" | "md" | "lg";
  className?: string;
  style?: React.CSSProperties;
}

export const DividerStyled = forwardRef<HTMLElement, DividerStyledProps>(
  function DividerStyled(
    {
      orientation = "horizontal",
      label,
      labelAlign = "center",
      tone = "neutral",
      lineStyle = "solid",
      size = "md",
      spacing = "md",
      className,
      style,
    },
    ref
  ) {
    const { dividerProps } = useDivider({ orientation });

    const hasLabel = label != null && label !== "";

    const commonProps = {
      ...dividerProps,
      className: ["rdvd-root", className].filter(Boolean).join(" "),
      "data-orientation": orientation,
      "data-tone": tone,
      "data-line-style": lineStyle,
      "data-size": size,
      "data-spacing": spacing,
      ...(hasLabel ? { "data-has-label": "true" } : {}),
      ...(hasLabel ? { "data-label-align": labelAlign } : {}),
      style,
    };

    if (orientation === "vertical") {
      return <div ref={ref as React.Ref<HTMLDivElement>} {...commonProps} />;
    }

    if (hasLabel) {
      return (
        <div ref={ref as React.Ref<HTMLDivElement>} {...commonProps}>
          <span className="rdvd-label">{label}</span>
        </div>
      );
    }

    return <div ref={ref as React.Ref<HTMLDivElement>} {...commonProps} />;
  }
);
DividerStyled.displayName = "DividerStyled";
