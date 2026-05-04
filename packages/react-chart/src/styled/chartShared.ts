import { useEffect, useState, type RefObject, type ReactNode } from "react";
import type { DataPoint } from "../chartUtils";

export interface TooltipPayload {
  label: string;
  value: number;
  series?: string;
  color: string;
  point: DataPoint;
  index: number;
}

export interface CommonChartProps {
  formatValue?: (value: number, point: DataPoint, index: number) => ReactNode;
  formatLabel?: (label: string, index: number) => ReactNode;
  renderTooltip?: (payload: TooltipPayload) => ReactNode;
  responsive?: boolean;
  aspectRatio?: number;
  minWidth?: number;
  minHeight?: number;
  loading?: boolean;
  emptyText?: ReactNode;
  errorText?: ReactNode;
  error?: boolean;
}

export function useResponsiveSize(
  rootRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  baseWidth: number,
  baseHeight: number,
  aspectRatio: number | undefined,
  minWidth: number,
  minHeight: number,
): { width: number; height: number } {
  const [size, setSize] = useState({ width: baseWidth, height: baseHeight });

  useEffect(() => {
    if (!enabled) return;
    const el = rootRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;

    const ratio = aspectRatio ?? baseWidth / baseHeight;

    const measure = () => {
      const w = Math.max(minWidth, el.clientWidth || baseWidth);
      const h = Math.max(minHeight, w / ratio);
      setSize((prev) => (prev.width === w && prev.height === h ? prev : { width: w, height: h }));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [enabled, aspectRatio, baseWidth, baseHeight, minWidth, minHeight, rootRef]);

  return enabled ? size : { width: baseWidth, height: baseHeight };
}

export function isDataEmpty(data: unknown[]): boolean {
  return !data || data.length === 0;
}
