import React, { forwardRef } from "react";
import { useCard } from "../useCard";

export interface CardStyledProps {
  variant?: "elevated" | "outlined" | "filled" | "ghost";
  size?: "sm" | "md" | "lg";
  tone?: "neutral" | "primary" | "success" | "warning" | "danger" | "info";
  shadow?: "none" | "sm" | "md" | "lg";
  radius?: "none" | "sm" | "md" | "lg";
  clickable?: boolean;
  selected?: boolean;
  defaultSelected?: boolean;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  onSelect?: (selected: boolean) => void;
  href?: string;
  as?: React.ElementType;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const CardHeader = forwardRef<
  HTMLDivElement,
  { children?: React.ReactNode; className?: string; style?: React.CSSProperties }
>(function CardHeader({ children, className, style }, ref) {
  return (
    <div
      ref={ref}
      className={["rcrd-header", className].filter(Boolean).join(" ")}
      style={style}
    >
      {children}
    </div>
  );
});
CardHeader.displayName = "CardHeader";

const CardBody = forwardRef<
  HTMLDivElement,
  { children?: React.ReactNode; className?: string; style?: React.CSSProperties }
>(function CardBody({ children, className, style }, ref) {
  return (
    <div
      ref={ref}
      className={["rcrd-body", className].filter(Boolean).join(" ")}
      style={style}
    >
      {children}
    </div>
  );
});
CardBody.displayName = "CardBody";

const CardFooter = forwardRef<
  HTMLDivElement,
  { children?: React.ReactNode; className?: string; style?: React.CSSProperties }
>(function CardFooter({ children, className, style }, ref) {
  return (
    <div
      ref={ref}
      className={["rcrd-footer", className].filter(Boolean).join(" ")}
      style={style}
    >
      {children}
    </div>
  );
});
CardFooter.displayName = "CardFooter";

export const CardStyled = forwardRef<HTMLElement, CardStyledProps>(
  function CardStyled(
    {
      variant = "elevated",
      size = "md",
      tone = "neutral",
      shadow,
      radius = "md",
      clickable,
      selected,
      defaultSelected,
      disabled,
      onClick,
      onSelect,
      href,
      as,
      header,
      footer,
      children,
      className,
      style,
    },
    ref
  ) {
    const isClickable = !!(clickable || href || onClick);

    const { cardProps, isSelected, isFocused } = useCard({
      clickable: isClickable,
      selected,
      defaultSelected,
      disabled,
      onClick,
      onSelect,
    });

    const Tag = href ? "a" : (as || "div");
    const autoShadow = shadow ?? (variant === "elevated" ? "sm" : "none");

    const props: Record<string, unknown> = {
      ...(isClickable ? cardProps : { role: "article" }),
      className: ["rcrd-root", className].filter(Boolean).join(" "),
      "data-variant": variant,
      "data-size": size,
      "data-tone": tone,
      "data-shadow": autoShadow,
      "data-radius": radius,
      "data-clickable": isClickable ? "true" : undefined,
      "data-selected": isSelected ? "true" : undefined,
      "data-disabled": disabled ? "true" : undefined,
      "data-focused": isFocused ? "true" : undefined,
      style,
    };

    if (href) {
      props.href = href;
    }

    return (
      <Tag ref={ref} {...props}>
        {header && <CardHeader>{header}</CardHeader>}
        <CardBody>{children}</CardBody>
        {footer && <CardFooter>{footer}</CardFooter>}
      </Tag>
    );
  }
);
CardStyled.displayName = "CardStyled";

export const Card = Object.assign(CardStyled, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
});
