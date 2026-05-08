import { useState, useEffect, useRef } from "react";

export interface UseStatOptions {
  value: string | number;
  label: string;
  previousValue?: number;
  trend?: number;
  countUp?: boolean;
  countUpDuration?: number;
  countUpDelay?: number;
}

export interface UseStatResult {
  rootProps: { role: "figure"; "aria-label": string };
  valueProps: { "aria-hidden": true };
  animatedValue: string | number;
  trendDirection: "up" | "down" | "neutral" | undefined;
}

export function useStat(options: UseStatOptions): UseStatResult {
  const {
    value,
    label,
    previousValue,
    trend,
    countUp = true,
    countUpDuration = 1000,
    countUpDelay = 0,
  } = options;

  const isNumeric = typeof value === "number";
  const [animatedValue, setAnimatedValue] = useState<string | number>(
    isNumeric && countUp ? 0 : value,
  );
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isNumeric || !countUp) {
      setAnimatedValue(value);
      return;
    }

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setAnimatedValue(value);
      return;
    }

    const numValue = value as number;

    const delayTimeout = setTimeout(() => {
      startTimeRef.current = null;

      const animate = (timestamp: number) => {
        if (!startTimeRef.current) startTimeRef.current = timestamp;
        const elapsed = timestamp - startTimeRef.current;
        const progress = Math.min(elapsed / countUpDuration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setAnimatedValue(Math.round(numValue * eased));
        if (progress < 1) {
          rafRef.current = requestAnimationFrame(animate);
        } else {
          setAnimatedValue(numValue);
        }
      };

      rafRef.current = requestAnimationFrame(animate);
    }, countUpDelay);

    return () => {
      clearTimeout(delayTimeout);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      startTimeRef.current = null;
    };
  }, [value, countUp, countUpDuration, countUpDelay, isNumeric]);

  const effectiveTrend =
    trend !== undefined
      ? trend
      : previousValue !== undefined && isNumeric
        ? (((value as number) - previousValue) / Math.abs(previousValue || 1)) * 100
        : undefined;

  let trendDirection: "up" | "down" | "neutral" | undefined;
  if (effectiveTrend !== undefined) {
    trendDirection =
      effectiveTrend > 0 ? "up" : effectiveTrend < 0 ? "down" : "neutral";
  }

  let ariaLabel = `${label}: ${value}`;
  if (effectiveTrend !== undefined) {
    ariaLabel += `, ${Math.abs(effectiveTrend).toFixed(1)}% ${trendDirection}`;
  }

  return {
    rootProps: { role: "figure", "aria-label": ariaLabel },
    valueProps: { "aria-hidden": true },
    animatedValue,
    trendDirection,
  };
}
