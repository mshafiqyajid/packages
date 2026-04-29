import React, { forwardRef, isValidElement, Children } from "react";
import type { AvatarSize } from "./AvatarStyled";
import { AvatarStyled } from "./AvatarStyled";

export type AvatarGroupSpacing = "sm" | "md" | "lg";

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  max?: number;
  size?: AvatarSize;
  spacing?: AvatarGroupSpacing;
}

export const AvatarGroup = forwardRef<HTMLSpanElement, AvatarGroupProps>(
  function AvatarGroup(
    {
      children,
      max,
      size = "md",
      spacing = "md",
      className,
      ...rest
    },
    ref
  ) {
    const childArray = Children.toArray(children).filter(isValidElement);
    const total = childArray.length;
    const overflow = max !== undefined && total > max ? total - max : 0;
    const visible = overflow > 0 ? childArray.slice(0, max) : childArray;

    const classes = ["rav-group", className].filter(Boolean).join(" ");

    return (
      <span
        ref={ref}
        className={classes}
        data-spacing={spacing}
        {...rest}
      >
        {visible.map((child, index) => {
          if (!isValidElement(child)) return null;
          return (
            <span key={index} className="rav-group-item">
              {React.cloneElement(child as React.ReactElement<{ size?: AvatarSize }>, {
                size,
              })}
            </span>
          );
        })}
        {overflow > 0 && (
          <span className="rav-group-item">
            <AvatarStyled
              size={size}
              aria-label={`${overflow} more`}
              fallback={
                <span className="rav-overflow-label">+{overflow}</span>
              }
            />
          </span>
        )}
      </span>
    );
  }
);
