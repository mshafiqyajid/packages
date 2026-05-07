import { forwardRef, useId, type CSSProperties, type ReactNode } from "react";
import { useCheckbox, type CheckboxState } from "../useCheckbox";
import { useCheckboxGroupContext } from "./CheckboxGroup";

export type CheckboxSize = "sm" | "md" | "lg";
export type CheckboxTone = "neutral" | "primary" | "success" | "danger";

export interface CheckboxStyledProps {
  checked?: CheckboxState;
  defaultChecked?: CheckboxState;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  /** Value used when this checkbox lives inside a CheckboxGroup. */
  value?: string;
  size?: CheckboxSize;
  tone?: CheckboxTone;
  label?: ReactNode;
  /** Helper text shown beneath the label. */
  description?: ReactNode;
  /** Error message — flips tone to danger and renders below. */
  error?: ReactNode;
  labelPosition?: "left" | "right";
  /** Render as a bordered card. The whole row becomes clickable. */
  card?: boolean;
  /** Append a red asterisk to the label. */
  required?: boolean;
  invalid?: boolean;
  name?: string;
  className?: string;
  style?: CSSProperties;
}

export const CheckboxStyled = forwardRef<HTMLButtonElement, CheckboxStyledProps>(
  function CheckboxStyled(
    {
      checked: checkedProp,
      defaultChecked,
      onChange: onChangeProp,
      disabled: disabledProp = false,
      value,
      size = "md",
      tone = "primary",
      label,
      description,
      error,
      labelPosition = "right",
      card = false,
      required = false,
      invalid: invalidProp = false,
      name: nameProp,
      className,
      style,
    },
    ref,
  ) {
    const labelId = useId();
    const descId = useId();
    const errId = useId();

    const groupCtx = useCheckboxGroupContext();

    const disabled = disabledProp || (groupCtx?.groupDisabled ?? false);
    const groupInvalid = groupCtx?.groupInvalid ?? false;

    const isGroupMember = groupCtx !== null && value !== undefined;

    const groupChecked: CheckboxState | undefined = isGroupMember
      ? groupCtx!.values.includes(value!)
      : undefined;

    const resolvedChecked = isGroupMember ? groupChecked : checkedProp;
    const resolvedOnChange = isGroupMember
      ? () => groupCtx!.toggleValue(value!)
      : onChangeProp;

    const { checkboxProps, isChecked, isIndeterminate, toggle } = useCheckbox({
      checked: resolvedChecked,
      defaultChecked: isGroupMember ? undefined : defaultChecked,
      onChange: resolvedOnChange,
      disabled,
    });

    const effectiveInvalid = invalidProp || groupInvalid || !!error;
    const effectiveTone: CheckboxTone = effectiveInvalid ? "danger" : tone;
    const rootClass = ["rchk-root", className].filter(Boolean).join(" ");

    const handleCardClick = (e: React.MouseEvent) => {
      // Avoid double-triggering when the box itself is clicked.
      if ((e.target as HTMLElement).closest(".rchk-box")) return;
      if (disabled) return;
      toggle();
    };

    const ariaDescribedBy = [description ? descId : null, error ? errId : null]
      .filter(Boolean)
      .join(" ") || undefined;

    return (
      <div
        className={rootClass}
        style={style}
        data-label-position={labelPosition}
        data-card={card ? "true" : undefined}
        data-error={error ? "true" : undefined}
        data-disabled={disabled ? "true" : undefined}
        onClick={card ? handleCardClick : undefined}
      >
        <span className="rchk-row">
          {label && labelPosition === "left" && (
            <span className="rchk-label-block">
              <span id={labelId} className="rchk-label">
                {label}
                {required && <span className="rchk-required" aria-hidden="true"> *</span>}
              </span>
              {description && (
                <span id={descId} className="rchk-description">{description}</span>
              )}
            </span>
          )}
          <button
            {...checkboxProps}
            ref={ref}
            className="rchk-box"
            data-size={size}
            data-tone={effectiveTone}
            data-checked={isChecked ? "true" : undefined}
            data-indeterminate={isIndeterminate ? "true" : undefined}
            data-disabled={disabled ? "true" : undefined}
            aria-labelledby={label ? labelId : undefined}
            aria-describedby={ariaDescribedBy}
            aria-required={required || undefined}
            aria-invalid={effectiveInvalid || undefined}
            type="button"
          >
            {isIndeterminate ? (
              <svg className="rchk-icon" viewBox="0 0 12 12" aria-hidden="true">
                <path
                  className="rchk-indet-path"
                  d="M2.5 6h7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg className="rchk-icon" viewBox="0 0 12 12" aria-hidden="true">
                <path
                  className="rchk-check-path"
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
            <span className="rchk-label-block">
              <span id={labelId} className="rchk-label">
                {label}
                {required && <span className="rchk-required" aria-hidden="true"> *</span>}
              </span>
              {description && (
                <span id={descId} className="rchk-description">{description}</span>
              )}
            </span>
          )}
        </span>
        {error && (
          <span id={errId} className="rchk-error" role="alert">
            {error}
          </span>
        )}
      </div>
    );
  },
);
