import { forwardRef, type CSSProperties } from "react";
import { useSpinner } from "../useSpinner";

export type SpinnerVariant = "spin" | "dots" | "bars" | "pulse" | "ring";
export type SpinnerSize = "xs" | "sm" | "md" | "lg" | "xl";
export type SpinnerTone =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "current";
export type SpinnerSpeed = "slow" | "normal" | "fast";

export interface SpinnerStyledProps {
  variant?: SpinnerVariant;
  size?: SpinnerSize;
  tone?: SpinnerTone;
  speed?: SpinnerSpeed;
  label?: string;
  overlay?: boolean;
  /** Direct color shortcut — sets the spinner color without needing tone="current" + style. */
  color?: string;
  className?: string;
  style?: CSSProperties;
}

function SpinVariant() {
  return <span className="rspn-spin" />;
}

function DotsVariant() {
  return (
    <span className="rspn-dots">
      <span className="rspn-dot" />
      <span className="rspn-dot" />
      <span className="rspn-dot" />
    </span>
  );
}

function BarsVariant() {
  return (
    <span className="rspn-bars">
      <span className="rspn-bar" />
      <span className="rspn-bar" />
      <span className="rspn-bar" />
      <span className="rspn-bar" />
    </span>
  );
}

function PulseVariant() {
  return <span className="rspn-pulse" />;
}

function RingVariant() {
  return (
    <span className="rspn-rings">
      <span className="rspn-ring" />
      <span className="rspn-ring" />
    </span>
  );
}

function renderVariant(variant: SpinnerVariant) {
  switch (variant) {
    case "dots":
      return <DotsVariant />;
    case "bars":
      return <BarsVariant />;
    case "pulse":
      return <PulseVariant />;
    case "ring":
      return <RingVariant />;
    case "spin":
    default:
      return <SpinVariant />;
  }
}

export const SpinnerStyled = forwardRef<HTMLSpanElement, SpinnerStyledProps>(
  function SpinnerStyled(
    {
      variant = "spin",
      size = "md",
      tone = "primary",
      speed = "normal",
      label = "Loading",
      overlay = false,
      color,
      className,
      style,
    },
    ref,
  ) {
    const { spinnerProps } = useSpinner({ label });

    const rootClass = ["rspn-root", className].filter(Boolean).join(" ");
    const resolvedTone = color ? "current" : tone;
    const resolvedStyle: CSSProperties = color
      ? { color, ...style }
      : style ?? {};

    return (
      <span
        {...spinnerProps}
        ref={ref}
        className={rootClass}
        data-variant={variant}
        data-size={size}
        data-tone={resolvedTone}
        data-speed={speed}
        data-overlay={overlay ? "true" : undefined}
        style={resolvedStyle}
      >
        {renderVariant(variant)}
        <span className="rspn-sr-only">{label}</span>
      </span>
    );
  },
);
