import { useMemo } from "react";
import {
  computeLinePoints,
  computePieSlices,
  pointsToPolyline,
  pointsToSmoothPath,
  arcPath,
  donutArcPath,
  scaleLinear,
  isSeriesData,
  resolveDomain,
} from "./chartUtils";
import type {
  DataPoint,
  SeriesDataPoint,
  ChartType,
  Point,
  Scales,
  UseChartOptions,
  UseChartResult,
  ChartSeriesResult,
} from "./chartUtils";

export type { DataPoint, ChartType, Scales, UseChartOptions, UseChartResult };

const DEFAULT_PADDING = 40;

export function useChart(options: UseChartOptions): UseChartResult {
  const {
    data,
    type,
    width,
    height,
    padding = DEFAULT_PADDING,
    smooth = false,
    stacked = false,
    donut = false,
    domain,
  } = options;

  return useMemo<UseChartResult>(() => {
    const viewBox = `0 0 ${width} ${height}`;
    const isSeries = isSeriesData(data);

    if (isSeries) {
      const sd = data as SeriesDataPoint[];
      const allValues = sd.flatMap((d) => d.series.flatMap((s) => s.values));
      const dataMin = allValues.length > 0 ? Math.min(...allValues) : 0;
      const dataMax = allValues.length > 0 ? Math.max(...allValues) : 0;
      const resolved = resolveDomain(dataMin, dataMax, domain);
      const scales: Scales = {
        minValue: resolved.min,
        maxValue: resolved.max,
        valueRange: resolved.max - resolved.min,
        xStep: sd.length > 1 ? (width - padding * 2) / (sd.length - 1) : width,
      };

      if (type === "line") {
        const series = buildLineSeries(sd, width, height, padding, smooth, resolved.min, resolved.max);
        return {
          points: series.flatMap((s) => s.points),
          paths: series.map((s) => s.path),
          series,
          viewBox,
          scales,
        };
      }

      if (type === "bar") {
        const series = buildBarSeries(sd, width, height, padding, stacked, resolved.min, resolved.max);
        return {
          points: series.flatMap((s) => s.points),
          paths: series.map((s) => s.path),
          series,
          viewBox,
          scales,
        };
      }

      return { points: [], paths: [], series: [], viewBox, scales };
    }

    const fd = data as DataPoint[];
    const values = fd.map((d) => d.value);
    const dataMin = values.length > 0 ? Math.min(...values) : 0;
    const dataMax = values.length > 0 ? Math.max(...values) : 0;
    const resolved = resolveDomain(dataMin, dataMax, domain);
    const minValue = resolved.min;
    const maxValue = resolved.max;
    const valueRange = maxValue - minValue;
    const xStep = fd.length > 1 ? width / (fd.length - 1) : width;
    const scales: Scales = { minValue, maxValue, valueRange, xStep };

    if (type === "line") {
      const points = computeLinePoints(fd, width, height, padding);
      const polyline = pointsToPolyline(points);
      const smoothPath = pointsToSmoothPath(points);
      return { points, paths: [smooth ? smoothPath : polyline, smoothPath], viewBox, scales };
    }

    if (type === "pie") {
      const slices = computePieSlices(fd);
      const cx = width / 2;
      const cy = height / 2;
      const r = Math.min(width, height) / 2 - 10;
      const innerR = donut
        ? typeof donut === "object"
          ? donut.innerRadius
          : r * 0.6
        : 0;
      const paths = slices.map((s) =>
        donut
          ? donutArcPath(cx, cy, r, innerR, s.startAngle, s.endAngle)
          : arcPath(cx, cy, r, s.startAngle, s.endAngle),
      );
      const points: Point[] = slices.map((s) => {
        const mid = (s.startAngle + s.endAngle) / 2;
        const rad = (mid * Math.PI) / 180;
        return { x: cx + r * 0.6 * Math.cos(rad), y: cy + r * 0.6 * Math.sin(rad) };
      });
      return { points, paths, viewBox, scales };
    }

    if (type === "bar") {
      const plotWidth = width - padding * 2;
      const plotHeight = height - padding * 2;
      const barWidth = fd.length > 0 ? plotWidth / fd.length - 4 : 0;
      const points: Point[] = fd.map((d, i) => ({
        x: padding + i * (plotWidth / fd.length) + barWidth / 2,
        y: padding + (valueRange === 0 ? 0 : ((maxValue - d.value) / valueRange) * plotHeight),
      }));
      const paths = fd.map((d, i) => {
        const x = padding + i * (plotWidth / fd.length) + 2;
        const barH = valueRange === 0 ? plotHeight : ((d.value - minValue) / valueRange) * plotHeight;
        const y = padding + plotHeight - barH;
        return `M ${x} ${y} H ${x + barWidth} V ${padding + plotHeight} H ${x} Z`;
      });
      return { points, paths, viewBox, scales };
    }

    return { points: [], paths: [], viewBox, scales };
  }, [data, type, width, height, padding, smooth, stacked, donut, domain]);
}

function buildLineSeries(
  sd: SeriesDataPoint[],
  width: number,
  height: number,
  padding: number,
  smooth: boolean,
  minVal: number,
  maxVal: number,
): ChartSeriesResult[] {
  const plotW = width - padding * 2;
  const plotH = height - padding * 2;
  const labelCount = sd.length;

  const seriesNames: string[] = [];
  sd.forEach((d) => {
    d.series.forEach((s) => {
      if (!seriesNames.includes(s.name)) seriesNames.push(s.name);
    });
  });

  return seriesNames.map((name) => {
    const values: number[] = [];
    const points: Point[] = sd.map((d, i) => {
      const entry = d.series.find((s) => s.name === name);
      const val = entry ? (entry.values[0] ?? 0) : 0;
      values.push(val);
      return {
        x: padding + (labelCount === 1 ? plotW / 2 : (i / (labelCount - 1)) * plotW),
        y: padding + scaleLinear(val, minVal, maxVal, plotH, 0),
      };
    });
    const path = smooth
      ? pointsToSmoothPath(points)
      : points.length > 0
        ? "M " + points.map((p) => `${p.x} ${p.y}`).join(" L ")
        : "";
    const color = sd[0]?.series.find((s) => s.name === name)?.color;
    return { name, color, path, points, values };
  });
}

function buildBarSeries(
  sd: SeriesDataPoint[],
  width: number,
  height: number,
  padding: number,
  stacked: boolean,
  minVal: number,
  maxVal: number,
): ChartSeriesResult[] {
  const plotW = width - padding * 2;
  const plotH = height - padding * 2;

  const seriesNames: string[] = [];
  sd.forEach((d) => {
    d.series.forEach((s) => {
      if (!seriesNames.includes(s.name)) seriesNames.push(s.name);
    });
  });

  if (stacked) {
    const maxStacked = Math.max(
      ...sd.map((d) => d.series.reduce((acc, e) => acc + (e.values[0] ?? 0), 0)),
    );
    const slotW = plotW / sd.length;

    return seriesNames.map((name) => {
      const values: number[] = [];
      const points: Point[] = [];
      const segments: string[] = [];

      sd.forEach((d, di) => {
        let accumH = 0;
        for (const s of d.series) {
          const val = s.values[0] ?? 0;
          if (s.name !== name) {
            accumH += scaleLinear(val, 0, maxStacked, 0, plotH);
            continue;
          }
          values.push(val);
          const barW = slotW - 4;
          const barH = scaleLinear(val, 0, maxStacked, 0, plotH);
          const x = padding + di * slotW + 2;
          const y = padding + plotH - accumH - barH;
          points.push({ x: x + barW / 2, y });
          segments.push(`M ${x} ${y} H ${x + barW} V ${y + barH} H ${x} Z`);
          accumH += barH;
        }
      });

      const color = sd[0]?.series.find((s) => s.name === name)?.color;
      return { name, color, path: segments.join(" "), points, values };
    });
  }

  const groupSlotW = plotW / sd.length;
  const barSlotW = groupSlotW / Math.max(1, seriesNames.length);

  return seriesNames.map((name, si) => {
    const values: number[] = [];
    const points: Point[] = [];
    const segments: string[] = [];

    sd.forEach((d, di) => {
      const entry = d.series.find((s) => s.name === name);
      const val = entry ? (entry.values[0] ?? 0) : 0;
      values.push(val);
      const barW = barSlotW - 2;
      const barH = scaleLinear(val, minVal, maxVal, 0, plotH);
      const x = padding + di * groupSlotW + si * barSlotW + 1;
      const y = padding + plotH - barH;
      points.push({ x: x + barW / 2, y });
      segments.push(`M ${x} ${y} H ${x + barW} V ${padding + plotH} H ${x} Z`);
    });

    const color = sd[0]?.series.find((s) => s.name === name)?.color;
    return { name, color, path: segments.join(" "), points, values };
  });
}
