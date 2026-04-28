import { type ReactNode, forwardRef } from "react";
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
}

function SegmentedControlStyledInner<TValue>(
  {
    variant = "solid",
    size = "md",
    tone = "primary",
    fullWidth = false,
    label,
    hint,
    className,
    ...rest
  }: SegmentedControlStyledProps<TValue>,
  ref: React.Ref<HTMLDivElement>,
) {
  const trackClass = ["rsc-track", className].filter(Boolean).join(" ");

  return (
    <div className="rsc-root">
      {label ? <span className="rsc-label">{label}</span> : null}
      <SegmentedControl<TValue>
        ref={ref}
        {...rest}
        className={trackClass}
        data-variant={variant}
        data-size={size}
        data-tone={tone}
        data-full-width={fullWidth ? "true" : undefined}
      />
      {hint ? <span className="rsc-hint">{hint}</span> : null}
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
