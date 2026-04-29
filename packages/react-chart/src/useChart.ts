import { useMemo } from "react";
import {
  computeLinePoints,
  computePieSlices,
  pointsToPolyline,
  pointsToSmoothPath,
  arcPath,
} from "./chartUtils";
import type { DataPoint, ChartType, Point, Scales, UseChartOptions, UseChartResult } from "./chartUtils";

export type { DataPoint, ChartType, Scales, UseChartOptions, UseChartResult };

export function useChart(options: UseChartOptions): UseChartResult {
  const { data, type, width, height } = options;

  return useMemo<UseChartResult>(() => {
    const viewBox = `0 0 ${width} ${height}`;
    const values = data.map((d) => d.value);
    const minValue = values.length > 0 ? Math.min(...values) : 0;
    const maxValue = values.length > 0 ? Math.max(...values) : 0;
    const valueRange = maxValue - minValue;
    const xStep = data.length > 1 ? width / (data.length - 1) : width;

    const scales: Scales = { minValue, maxValue, valueRange, xStep };

    if (type === "line") {
      const points = computeLinePoints(data, width, height);
      const polyline = pointsToPolyline(points);
      const smooth = pointsToSmoothPath(points);
      return { points, paths: [polyline, smooth], viewBox, scales };
    }

    if (type === "pie") {
      const slices = computePieSlices(data);
      const cx = width / 2;
      const cy = height / 2;
      const r = Math.min(width, height) / 2 - 10;
      const paths = slices.map((s) => arcPath(cx, cy, r, s.startAngle, s.endAngle));
      const points: Point[] = slices.map((s) => {
        const mid = (s.startAngle + s.endAngle) / 2;
        const rad = (mid * Math.PI) / 180;
        return { x: cx + r * 0.6 * Math.cos(rad), y: cy + r * 0.6 * Math.sin(rad) };
      });
      return { points, paths, viewBox, scales };
    }

    if (type === "bar") {
      const padding = 40;
      const plotWidth = width - padding * 2;
      const plotHeight = height - padding * 2;
      const barWidth = data.length > 0 ? plotWidth / data.length - 4 : 0;
      const points: Point[] = data.map((d, i) => ({
        x: padding + i * (plotWidth / data.length) + barWidth / 2,
        y: padding + (maxValue === minValue ? 0 : ((maxValue - d.value) / valueRange) * plotHeight),
      }));
      const paths = data.map((d, i) => {
        const x = padding + i * (plotWidth / data.length) + 2;
        const barH = maxValue === minValue ? plotHeight : ((d.value - minValue) / valueRange) * plotHeight;
        const y = padding + plotHeight - barH;
        return `M ${x} ${y} H ${x + barWidth} V ${padding + plotHeight} H ${x} Z`;
      });
      return { points, paths, viewBox, scales };
    }

    return { points: [], paths: [], viewBox, scales };
  }, [data, type, width, height]);
}
