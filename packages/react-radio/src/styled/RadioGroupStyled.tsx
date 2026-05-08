import {
  createContext,
  forwardRef,
  useContext,
  useId,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useRadioGroup } from "../useRadioGroup";

export type RadioVariant = "default" | "card" | "button-group";
export type RadioSize = "sm" | "md" | "lg";
export type RadioTone = "neutral" | "primary" | "success" | "danger";

// ── Context ────────────────────────────────────────────────────────────────

interface RadioGroupCtx {
  value: string | undefined;
  setValue: (v: string) => void;
  variant: RadioVariant;
  size: RadioSize;
  tone: RadioTone;
  disabled: boolean;
  orientation: "vertical" | "horizontal";
  name: string;
  getItemProps: (
    itemValue: string,
    itemDisabled?: boolean,
  ) => {
    role: "radio";
    "aria-checked": boolean;
    "aria-disabled": boolean | undefined;
    tabIndex: number;
    onClick: () => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    "data-checked": string | undefined;
    "data-disabled": string | undefined;
    "data-focused": string | undefined;
  };
  groupId: string;
}

const RadioGroupContext = createContext<RadioGroupCtx | null>(null);

function useRadioGroupContext(): RadioGroupCtx {
  const ctx = useContext(RadioGroupContext);
  if (!ctx) {
    throw new Error("RadioItem must be used inside RadioGroupStyled");
  }
  return ctx;
}

// ── RadioGroupStyled ────────────────────────────────────────────────────────

export interface RadioGroupStyledProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  name?: string;
  orientation?: "vertical" | "horizontal";
  variant?: RadioVariant;
  size?: RadioSize;
  tone?: RadioTone;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  label?: string;
  hint?: string;
  error?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export const RadioGroupStyled = forwardRef<HTMLDivElement, RadioGroupStyledProps>(
  function RadioGroupStyled(
    {
      value,
      defaultValue,
      onChange,
      name,
      orientation = "vertical",
      variant = "default",
      size = "md",
      tone = "neutral",
      disabled = false,
      required = false,
      invalid = false,
      label,
      hint,
      error,
      className,
      style,
      children,
    },
    ref,
  ) {
    const labelId = useId();
    const hintId = useId();
    const errId = useId();

    const { groupProps, getItemProps, value: currentValue, setValue, name: resolvedName, groupId } =
      useRadioGroup({
        value,
        defaultValue,
        onChange,
        name,
        disabled,
        required,
        invalid: invalid || !!error,
      });

    const effectiveTone: RadioTone = error ? "danger" : tone;
    const rootClass = ["rrad-root", className].filter(Boolean).join(" ");

    const describedBy = [
      error ? errId : hint ? hintId : null,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

    return (
      <RadioGroupContext.Provider
        value={{
          value: currentValue,
          setValue,
          variant,
          size,
          tone: effectiveTone,
          disabled,
          orientation,
          name: resolvedName,
          getItemProps,
          groupId,
        }}
      >
        <div
          ref={ref}
          className={rootClass}
          style={style}
          data-size={size}
          data-tone={effectiveTone}
          data-variant={variant}
          data-orientation={orientation}
          data-disabled={disabled ? "true" : undefined}
          data-invalid={invalid || !!error ? "true" : undefined}
        >
          {label && (
            <span
              id={labelId}
              className="rrad-label"
              data-required={required ? "true" : undefined}
            >
              {label}
              {required && (
                <span className="rrad-required" aria-hidden="true">
                  {" "}*
                </span>
              )}
            </span>
          )}
          <div
            {...groupProps}
            className="rrad-group"
            aria-labelledby={label ? labelId : undefined}
            aria-describedby={describedBy}
          >
            {children}
          </div>
          {(hint || error) && (
            <span
              id={error ? errId : hintId}
              className="rrad-hint"
              data-error={error ? "true" : undefined}
              role={error ? "alert" : undefined}
            >
              {error ?? hint}
            </span>
          )}
        </div>
      </RadioGroupContext.Provider>
    );
  },
);

// ── RadioItem ───────────────────────────────────────────────────────────────

export interface RadioItemProps {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  /** Icon shown in the card variant (left slot). */
  icon?: ReactNode;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const RadioItem = forwardRef<HTMLDivElement, RadioItemProps>(
  function RadioItem({ value, label, description, icon, disabled = false, className, style }, ref) {
    const ctx = useRadioGroupContext();
    const { getItemProps, variant, size, tone, name } = ctx;

    const itemProps = getItemProps(value, disabled);
    const isChecked = itemProps["aria-checked"];
    const isDisabled = !!itemProps["aria-disabled"];

    const itemClass = ["rrad-item", className].filter(Boolean).join(" ");

    const inputId = `${ctx.groupId}-${value}`;

    if (variant === "button-group") {
      return (
        <div
          ref={ref}
          className={itemClass}
          style={style}
          data-checked={isChecked ? "true" : undefined}
          data-disabled={isDisabled ? "true" : undefined}
          data-size={size}
          data-tone={tone}
          data-variant="button-group"
        >
          <input
            type="radio"
            className="rrad-input"
            id={inputId}
            name={name}
            value={value}
            checked={isChecked}
            disabled={isDisabled}
            onChange={() => {
              if (!isDisabled) ctx.setValue(value);
            }}
            tabIndex={-1}
            aria-hidden="true"
          />
          <div
            {...itemProps}
            className="rrad-btn-item"
            data-checked={isChecked ? "true" : undefined}
            data-disabled={isDisabled ? "true" : undefined}
            data-size={size}
            data-tone={tone}
          >
            <span className="rrad-btn-label">{label}</span>
          </div>
        </div>
      );
    }

    if (variant === "card") {
      return (
        <div
          ref={ref}
          className={itemClass}
          style={style}
          data-checked={isChecked ? "true" : undefined}
          data-disabled={isDisabled ? "true" : undefined}
          data-size={size}
          data-tone={tone}
          data-variant="card"
        >
          <input
            type="radio"
            className="rrad-input"
            id={inputId}
            name={name}
            value={value}
            checked={isChecked}
            disabled={isDisabled}
            onChange={() => {
              if (!isDisabled) ctx.setValue(value);
            }}
            tabIndex={-1}
            aria-hidden="true"
          />
          <div
            {...itemProps}
            className="rrad-card"
            data-checked={isChecked ? "true" : undefined}
            data-disabled={isDisabled ? "true" : undefined}
            data-size={size}
            data-tone={tone}
          >
            {icon && <span className="rrad-card-icon">{icon}</span>}
            <span className="rrad-card-content">
              <span className="rrad-card-label">{label}</span>
              {description && (
                <span className="rrad-card-description">{description}</span>
              )}
            </span>
            <span className="rrad-card-indicator">
              <span className="rrad-circle" data-checked={isChecked ? "true" : undefined} data-tone={tone} data-size={size}>
                <span className="rrad-dot" />
              </span>
            </span>
          </div>
        </div>
      );
    }

    // default variant
    return (
      <div
        ref={ref}
        className={itemClass}
        style={style}
        data-checked={isChecked ? "true" : undefined}
        data-disabled={isDisabled ? "true" : undefined}
        data-size={size}
        data-tone={tone}
        data-variant="default"
      >
        <input
          type="radio"
          className="rrad-input"
          id={inputId}
          name={name}
          value={value}
          checked={isChecked}
          disabled={isDisabled}
          onChange={() => {
            if (!isDisabled) ctx.setValue(value);
          }}
          tabIndex={-1}
          aria-hidden="true"
        />
        <div
          {...itemProps}
          className="rrad-row"
          data-checked={isChecked ? "true" : undefined}
          data-disabled={isDisabled ? "true" : undefined}
        >
          <span className="rrad-circle" data-checked={isChecked ? "true" : undefined} data-tone={tone} data-size={size}>
            <span className="rrad-dot" />
          </span>
          <span className="rrad-label-block">
            <span className="rrad-item-label">{label}</span>
            {description && (
              <span className="rrad-item-description">{description}</span>
            )}
          </span>
        </div>
      </div>
    );
  },
);
