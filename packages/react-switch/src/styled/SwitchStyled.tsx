import { forwardRef, useId, type ReactNode } from "react";
import { useSwitch } from "../useSwitch";

export type SwitchSize = "sm" | "md" | "lg";
export type SwitchTone = "neutral" | "primary" | "success" | "danger";

export interface SwitchStyledProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: SwitchSize;
  tone?: SwitchTone;
  label?: ReactNode;
  labelPosition?: "left" | "right";
  loading?: boolean;
  className?: string;
}

export const SwitchStyled = forwardRef<HTMLButtonElement, SwitchStyledProps>(
  function SwitchStyled(
    {
      checked,
      defaultChecked,
      onChange,
      disabled = false,
      size = "md",
      tone = "neutral",
      label,
      labelPosition = "right",
      loading = false,
      className,
    },
    ref,
  ) {
    const labelId = useId();
    const { switchProps, isChecked } = useSwitch({
      checked,
      defaultChecked,
      onChange,
      disabled: disabled || loading,
    });

    const rootClass = [
      "rsw-root",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <span className={rootClass} data-label-position={labelPosition}>
        {label && labelPosition === "left" && (
          <span id={labelId} className="rsw-label">
            {label}
          </span>
        )}
        <button
          {...switchProps}
          ref={ref}
          className="rsw-track"
          data-size={size}
          data-tone={tone}
          data-checked={isChecked ? "true" : undefined}
          data-disabled={disabled ? "true" : undefined}
          data-loading={loading ? "true" : undefined}
          aria-labelledby={label ? labelId : undefined}
          type="button"
        >
          <span className="rsw-thumb" aria-hidden="true">
            {loading && <span className="rsw-spinner" />}
          </span>
        </button>
        {label && labelPosition === "right" && (
          <span id={labelId} className="rsw-label">
            {label}
          </span>
        )}
      </span>
    );
  },
);
