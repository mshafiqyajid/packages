import { forwardRef, useId, type ReactNode } from "react";
import { useCheckbox, type CheckboxState } from "../useCheckbox";

export type CheckboxSize = "sm" | "md" | "lg";
export type CheckboxTone = "neutral" | "primary" | "success" | "danger";

export interface CheckboxStyledProps {
  checked?: CheckboxState;
  defaultChecked?: CheckboxState;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: CheckboxSize;
  tone?: CheckboxTone;
  label?: ReactNode;
  labelPosition?: "left" | "right";
  className?: string;
}

export const CheckboxStyled = forwardRef<HTMLButtonElement, CheckboxStyledProps>(
  function CheckboxStyled(
    {
      checked,
      defaultChecked,
      onChange,
      disabled = false,
      size = "md",
      tone = "primary",
      label,
      labelPosition = "right",
      className,
    },
    ref,
  ) {
    const labelId = useId();
    const { checkboxProps, isChecked, isIndeterminate } = useCheckbox({
      checked,
      defaultChecked,
      onChange,
      disabled,
    });

    const rootClass = ["rchk-root", className].filter(Boolean).join(" ");

    return (
      <span className={rootClass} data-label-position={labelPosition}>
        {label && labelPosition === "left" && (
          <span id={labelId} className="rchk-label">
            {label}
          </span>
        )}
        <button
          {...checkboxProps}
          ref={ref}
          className="rchk-box"
          data-size={size}
          data-tone={tone}
          data-checked={isChecked ? "true" : undefined}
          data-indeterminate={isIndeterminate ? "true" : undefined}
          data-disabled={disabled ? "true" : undefined}
          aria-labelledby={label ? labelId : undefined}
          type="button"
        >
          {isIndeterminate ? (
            <svg className="rchk-icon" viewBox="0 0 12 12" aria-hidden="true">
              <path d="M2.5 6h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg className="rchk-icon" viewBox="0 0 12 12" aria-hidden="true">
              <path
                d="M2.5 6.5l2.3 2.3L9.5 3.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          )}
        </button>
        {label && labelPosition === "right" && (
          <span id={labelId} className="rchk-label">
            {label}
          </span>
        )}
      </span>
    );
  },
);
