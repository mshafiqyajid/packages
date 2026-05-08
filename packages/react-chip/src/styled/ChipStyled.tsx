import { forwardRef, type CSSProperties, type ReactNode } from "react";
import { useChip } from "../useChip";

export interface ChipStyledProps {
  variant?: "solid" | "subtle" | "outline" | "soft";
  tone?: "neutral" | "primary" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md" | "lg";
  /** "rounded" keeps a proportional radius; "pill" forces full pill shape. Default: "rounded" */
  shape?: "rounded" | "pill";
  selectable?: boolean;
  selected?: boolean;
  defaultSelected?: boolean;
  onSelect?: (selected: boolean) => void;
  /** Show a checkmark when selected. Default: true when selectable. */
  showCheck?: boolean;
  dismissible?: boolean;
  onDismiss?: () => void;
  /** Small status dot before the label */
  dot?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  /** Avatar node — rendered as a circular clipped image slot */
  avatar?: ReactNode;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

const CheckIcon = ({ size }: { size: number }) => (
  <svg viewBox="0 0 10 10" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M1.5 5.5l2.5 2.5 4.5-5" />
  </svg>
);

const CloseIcon = ({ size }: { size: number }) => (
  <svg viewBox="0 0 10 10" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
    <path d="M1 1l8 8M9 1L1 9" />
  </svg>
);

export const ChipStyled = forwardRef<HTMLSpanElement, ChipStyledProps>(
  function ChipStyled(
    {
      variant = "subtle",
      tone = "neutral",
      size = "md",
      shape = "rounded",
      selectable = false,
      selected,
      defaultSelected,
      onSelect,
      showCheck = true,
      dismissible = false,
      onDismiss,
      dot = false,
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

    const iconSize = size === "sm" ? 10 : size === "lg" ? 14 : 12;
    const dismissSize = size === "sm" ? 8 : size === "lg" ? 10 : 9;
    const rootClass = ["rchp-root", className].filter(Boolean).join(" ");

    return (
      <span
        ref={ref}
        className={rootClass}
        data-variant={variant}
        data-tone={tone}
        data-size={size}
        data-shape={shape}
        data-selected={isSelected ? "true" : undefined}
        data-dismissible={dismissible ? "true" : undefined}
        data-disabled={disabled ? "true" : undefined}
        style={style}
        {...chipProps}
      >
        {/* Status dot */}
        {dot && <span className="rchp-dot" aria-hidden="true" />}

        {/* Checkmark (when selected + selectable) */}
        {selectable && isSelected && showCheck && (
          <span className="rchp-check" aria-hidden="true">
            <CheckIcon size={iconSize} />
          </span>
        )}

        {/* Avatar — circular clipped slot */}
        {avatar != null && (
          <span className="rchp-avatar">{avatar}</span>
        )}

        {/* Left icon (only if no avatar) */}
        {avatar == null && icon != null && (
          <span className="rchp-icon-left">{icon}</span>
        )}

        <span className="rchp-label">{children}</span>

        {iconRight != null && (
          <span className="rchp-icon-right">{iconRight}</span>
        )}

        {dismissible && (
          <button className="rchp-dismiss" {...dismissProps}>
            <span className="rchp-dismiss-bg" aria-hidden="true" />
            <CloseIcon size={dismissSize} />
          </button>
        )}
      </span>
    );
  },
);
