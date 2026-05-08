import React, { forwardRef, useEffect, useState, Children } from "react";
import { useMasonry } from "../useMasonry";
import type { BreakpointMap } from "../useMasonry";

export interface MasonryStyledProps {
  columns?: number | BreakpointMap;
  spacing?: number | string;
  as?: React.ElementType;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const MasonryStyled = forwardRef<HTMLElement, MasonryStyledProps>(
  function MasonryStyled(
    {
      columns,
      spacing,
      as,
      children,
      className,
      style,
    },
    ref
  ) {
    const [windowWidth, setWindowWidth] = useState(
      typeof window !== "undefined" ? window.innerWidth : 1024
    );

    useEffect(() => {
      if (typeof window === "undefined") return;
      const handler = () => setWindowWidth(window.innerWidth);
      window.addEventListener("resize", handler);
      return () => window.removeEventListener("resize", handler);
    }, []);

    const { containerProps, getItemProps, activeColumns } = useMasonry(
      { columns, spacing },
      windowWidth
    );

    const Tag = (as || "div") as React.ElementType;

    const mergedStyle: React.CSSProperties = {
      ...containerProps.style,
      ...style,
    };

    return (
      <Tag
        ref={ref}
        role={containerProps.role}
        style={mergedStyle}
        data-columns={activeColumns}
        className={["rmsn-root", className].filter(Boolean).join(" ")}
      >
        {Children.map(children, (child) => {
          if (child === null || child === undefined) return null;
          const itemProps = getItemProps();
          return (
            <div role={itemProps.role} className={itemProps.className}>
              {child}
            </div>
          );
        })}
      </Tag>
    );
  }
);
MasonryStyled.displayName = "MasonryStyled";
