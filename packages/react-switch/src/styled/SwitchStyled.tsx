import { forwardRef, useId, type CSSProperties, type ReactNode } from "react";
import { useSwitch } from "../useSwitch";

export type SwitchSize = "sm" | "md" | "lg";
export type SwitchTone = "neutral" | "primary" | "success" | "danger";

export interface SwitchStyledProps {
  checked?: boolean;
  defaultChecked?: boolean;
  /** Called with the new checked state. Return a Promise to auto-drive the pending state — the switch shows a spinner during the promise and reverts on rejection. */
  onChange?: (checked: boolean) => void | Promise<void>;
  /** Called before committing the toggle. Return false (or a Promise resolving to false) to cancel. A Promise triggers a pending state while awaiting. */
  confirm?: (next: boolean) => boolean | Promise<boolean>;
  disabled?: boolean;
  size?: SwitchSize;
  tone?: SwitchTone;
  label?: ReactNode;
  labelPosition?: "left" | "right";
  /** Force loading state. The hook also auto-sets loading when onChange returns a Promise. */
  loading?: boolean;
  /** Content rendered inside the track on the "on" side. */
  onLabel?: ReactNode;
  /** Content rendered inside the track on the "off" side. */
  offLabel?: ReactNode;
  /** Icon rendered inside the thumb when the switch is on. Cross-fades with thumbIconOff on toggle. */
  thumbIconOn?: ReactNode;
  /** Icon rendered inside the thumb when the switch is off. Cross-fades with thumbIconOn on toggle. */
  thumbIconOff?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export const SwitchStyled = forwardRef<HTMLButtonElement, SwitchStyledProps>(
  function SwitchStyled(
    {
      checked,
      defaultChecked,
      onChange,
      confirm,
      disabled = false,
      size = "md",
      tone = "neutral",
      label,
      labelPosition = "right",
      loading = false,
      onLabel,
      offLabel,
      thumbIconOn,
      thumbIconOff,
      className,
      style,
    },
    ref,
  ) {
    const labelId = useId();
    const { switchProps, isChecked, isPending } = useSwitch({
      checked,
      defaultChecked,
      onChange,
      confirm,
      disabled: disabled || loading,
    });
    const showLoading = loading || isPending;
    const hasThumbIcon = thumbIconOn != null || thumbIconOff != null;

    const rootClass = [
      "rsw-root",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <span className={rootClass} style={style} data-label-position={labelPosition}>
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
          {onLabel != null && (
            <span className="rsw-track-label rsw-track-label--on" aria-hidden="true">
              {onLabel}
            </span>
          )}
          {offLabel != null && (
            <span className="rsw-track-label rsw-track-label--off" aria-hidden="true">
              {offLabel}
            </span>
          )}
          <span className="rsw-thumb" aria-hidden="true">
            {showLoading && <span className="rsw-spinner" />}
            {!showLoading && hasThumbIcon && (
              <span className="rsw-thumb-icon">
                <span className="rsw-thumb-icon__on">{thumbIconOn}</span>
                <span className="rsw-thumb-icon__off">{thumbIconOff}</span>
              </span>
            )}
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
