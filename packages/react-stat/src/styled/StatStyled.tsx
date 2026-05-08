import { forwardRef } from "react";
import type { ReactNode } from "react";
import { useStat } from "../useStat";

export interface StatStyledProps {
  value: string | number;
  label: string;
  previousValue?: number;
  trend?: number;
  trendLabel?: string;
  trendFormat?: "percent" | "absolute";
  prefix?: ReactNode;
  suffix?: ReactNode;
  icon?: ReactNode;
  size?: "sm" | "md" | "lg";
  tone?: "neutral" | "primary";
  countUp?: boolean;
  countUpDuration?: number;
  countUpDelay?: number;
  loading?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const StatStyled = forwardRef<HTMLDivElement, StatStyledProps>(
  function StatStyled(
    {
      value,
      label,
      previousValue,
      trend,
      trendLabel,
      trendFormat = "percent",
      prefix,
      suffix,
      icon,
      size = "md",
      tone = "neutral",
      countUp = true,
      countUpDuration = 1000,
      countUpDelay = 0,
      loading = false,
      className,
      style,
    },
    ref,
  ) {
    const { rootProps, valueProps, animatedValue, trendDirection } = useStat({
      value,
      label,
      previousValue,
      trend,
      countUp,
      countUpDuration,
      countUpDelay,
    });

    const rootClass = ["rst-root", className].filter(Boolean).join(" ");

    const displayValue =
      typeof animatedValue === "number"
        ? animatedValue.toLocaleString()
        : animatedValue;

    const trendMagnitude =
      trend !== undefined
        ? trend
        : previousValue !== undefined && typeof value === "number"
          ? ((value - previousValue) / Math.abs(previousValue || 1)) * 100
          : 0;

    return (
      <div
        ref={ref}
        className={rootClass}
        data-size={size}
        data-tone={tone}
        data-trend={trendDirection}
        data-loading={loading ? "true" : undefined}
        style={style}
        {...rootProps}
      >
        {loading ? (
          <div className="rst-skeleton">
            <div className="rst-skeleton-value" />
            <div className="rst-skeleton-label" />
          </div>
        ) : (
          <>
            <div className="rst-header">
              {icon && <span className="rst-icon">{icon}</span>}
              <span className="rst-label">{label}</span>
            </div>

            <div className="rst-value-row" {...valueProps}>
              {prefix && <span className="rst-prefix">{prefix}</span>}
              <span className="rst-value">{displayValue}</span>
              {suffix && <span className="rst-suffix">{suffix}</span>}
            </div>

            {trendDirection && (
              <div className="rst-trend">
                <span className="rst-trend-icon">
                  {trendDirection === "up"
                    ? "↑"
                    : trendDirection === "down"
                      ? "↓"
                      : "−"}
                </span>
                <span className="rst-trend-value">
                  {trendFormat === "absolute"
                    ? Math.abs(trendMagnitude).toFixed(1)
                    : `${Math.abs(trendMagnitude).toFixed(1)}%`}
                </span>
                {trendLabel && (
                  <span className="rst-trend-label">{trendLabel}</span>
                )}
              </div>
            )}
          </>
        )}
      </div>
    );
  },
);
