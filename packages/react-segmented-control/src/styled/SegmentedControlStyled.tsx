import { type ReactNode, forwardRef, useId } from "react";
import {
  SegmentedControl,
  type SegmentedControlProps,
} from "../SegmentedControl";

export type SegmentedVariant = "solid" | "pill" | "underline";
export type SegmentedSize = "sm" | "md" | "lg";
export type SegmentedTone = "neutral" | "primary" | "success" | "danger";

export interface SegmentedControlStyledProps<TValue>
  extends Omit<SegmentedControlProps<TValue>, "children" | "renderOption"> {
  variant?: SegmentedVariant;
  size?: SegmentedSize;
  tone?: SegmentedTone;
  /** Stretch to container width and distribute options evenly. */
  fullWidth?: boolean;
  /** Optional label rendered above the control. */
  label?: ReactNode;
  /** Helper text below. */
  hint?: ReactNode;
  /** Error text — flips tone to danger and sets aria-invalid + data-invalid. */
  error?: ReactNode;
  /** Force the invalid state without inline error text. */
  invalid?: boolean;
  /** Mark as required (sets aria-required and required on the hidden input). */
  required?: boolean;
  /** Form name. When set, a hidden input carries `String(value)` for native form submission. */
  name?: string;
  /** Override the wrapper id (used for label association). */
  id?: string;
}

function SegmentedControlStyledInner<TValue>(
  {
    variant = "solid",
    size = "md",
    tone: toneProp = "primary",
    fullWidth = false,
    label,
    hint,
    error,
    invalid: invalidProp,
    required,
    name,
    id: idProp,
    className,
    value,
    defaultValue,
    ...rest
  }: SegmentedControlStyledProps<TValue>,
  ref: React.Ref<HTMLDivElement>,
) {
  const autoId = useId();
  const baseId = idProp ?? autoId;
  const labelId = `${baseId}-label`;
  const hintId = hint ? `${baseId}-hint` : undefined;
  const errorId = error ? `${baseId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  const isInvalid = Boolean(error) || invalidProp === true;
  const tone: SegmentedTone = isInvalid ? "danger" : toneProp;

  const trackClass = ["rsc-track", className].filter(Boolean).join(" ");

  const formValue =
    value !== undefined
      ? value
      : defaultValue !== undefined
        ? defaultValue
        : undefined;

  return (
    <div
      className="rsc-root"
      id={baseId}
      data-invalid={isInvalid ? "true" : undefined}
    >
      {label ? (
        <span className="rsc-label" id={labelId}>
          {label}
        </span>
      ) : null}
      <SegmentedControl<TValue>
        ref={ref}
        {...rest}
        value={value}
        defaultValue={defaultValue}
        className={trackClass}
        data-variant={variant}
        data-size={size}
        data-tone={tone}
        data-full-width={fullWidth ? "true" : undefined}
        data-invalid={isInvalid ? "true" : undefined}
        aria-invalid={isInvalid ? true : undefined}
        aria-required={required ? true : undefined}
        aria-labelledby={label ? labelId : undefined}
        aria-describedby={describedBy}
      />
      {name ? (
        <input
          type="hidden"
          name={name}
          value={formValue !== undefined ? String(formValue) : ""}
          required={required}
          readOnly
        />
      ) : null}
      {error ? (
        <span className="rsc-error" id={errorId} role="alert">
          {error}
        </span>
      ) : hint ? (
        <span className="rsc-hint" id={hintId}>
          {hint}
        </span>
      ) : null}
    </div>
  );
}

export const SegmentedControlStyled = forwardRef(
  SegmentedControlStyledInner,
) as <TValue>(
  props: SegmentedControlStyledProps<TValue> & {
    ref?: React.Ref<HTMLDivElement>;
  },
) => ReturnType<typeof SegmentedControlStyledInner>;
