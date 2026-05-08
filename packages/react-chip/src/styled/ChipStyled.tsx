import { forwardRef, type CSSProperties, type ReactNode } from "react";
import { useChip } from "../useChip";

export interface ChipStyledProps {
  variant?: "solid" | "subtle" | "outline" | "soft";
  tone?: "neutral" | "primary" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md" | "lg";
  selectable?: boolean;
  selected?: boolean;
  defaultSelected?: boolean;
  onSelect?: (selected: boolean) => void;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: ReactNode;
  iconRight?: ReactNode;
  avatar?: ReactNode;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export const ChipStyled = forwardRef<HTMLSpanElement, ChipStyledProps>(
  function ChipStyled(
    {
      variant = "subtle",
      tone = "neutral",
      size = "md",
      selectable = false,
      selected,
      defaultSelected,
      onSelect,
      dismissible = false,
      onDismiss,
      icon,
      iconRight,
      avatar,
      disabled = false,
      children,
      className,
      style,
    },
    ref,
  ) {
    const { chipProps, dismissProps, isSelected, isDismissed } = useChip({
      selectable,
      selected,
      defaultSelected,
      onSelect,
      dismissible,
      onDismiss,
      disabled,
    });

    if (isDismissed) return null;

    const rootClass = ["rchp-root", className].filter(Boolean).join(" ");

    return (
      <span
        ref={ref}
        className={rootClass}
        data-variant={variant}
        data-tone={tone}
        data-size={size}
        data-selected={isSelected ? "true" : undefined}
        data-dismissible={dismissible ? "true" : undefined}
        data-disabled={disabled ? "true" : undefined}
        style={style}
        {...chipProps}
      >
        {(avatar != null || icon != null) && (
          <span className="rchp-icon-left">{avatar ?? icon}</span>
        )}
        <span className="rchp-label">{children}</span>
        {iconRight != null && (
          <span className="rchp-icon-right">{iconRight}</span>
        )}
        {dismissible && (
          <button className="rchp-dismiss" {...dismissProps}>
            <svg
              viewBox="0 0 12 12"
              width="10"
              height="10"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M1 1l10 10M11 1L1 11" />
            </svg>
          </button>
        )}
      </span>
    );
  },
);
