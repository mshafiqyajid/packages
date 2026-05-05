import { forwardRef, useId, type ReactNode } from "react";
import { useSwitch } from "../useSwitch";

export type SwitchSize = "sm" | "md" | "lg";
export type SwitchTone = "neutral" | "primary" | "success" | "danger";

export interface SwitchStyledProps {
  checked?: boolean;
  defaultChecked?: boolean;
  /** Called with the new checked state. Return a Promise to auto-drive the pending state — the switch shows a spinner during the promise and reverts on rejection. */
  onChange?: (checked: boolean) => void | Promise<void>;
  disabled?: boolean;
  size?: SwitchSize;
  tone?: SwitchTone;
  label?: ReactNode;
  labelPosition?: "left" | "right";
  /** Force loading state. The hook also auto-sets loading when onChange returns a Promise. */
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
    const { switchProps, isChecked, isPending } = useSwitch({
      checked,
      defaultChecked,
      onChange,
      disabled: disabled || loading,
    });
    const showLoading = loading || isPending;

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
          data-loading={showLoading ? "true" : undefined}
          data-pending={isPending ? "true" : undefined}
          aria-labelledby={label ? labelId : undefined}
          type="button"
        >
          <span className="rsw-thumb" aria-hidden="true">
            {showLoading && <span className="rsw-spinner" />}
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
