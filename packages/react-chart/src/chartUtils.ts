export interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface SeriesEntry {
  name: string;
  values: number[];
  color?: string;
}

export interface SeriesDataPoint {
  label: string;
  series: SeriesEntry[];
}

export type ChartType = "line" | "bar" | "pie";

export interface Point {
  x: number;
  y: number;
}

export interface Scales {
  minValue: number;
  maxValue: number;
  valueRange: number;
  xStep: number;
}

export interface UseChartOptions {
  data: DataPoint[];
  type: ChartType;
  width: number;
  height: number;
}

export interface UseChartResult {
  points: Point[];
  paths: string[];
  viewBox: string;
  scales: Scales;
}

export function scaleLinear(
  value: number,
  domainMin: number,
  domainMax: number,
  rangeMin: number,
  rangeMax: number,
): number {
  if (domainMax === domainMin) return (rangeMin + rangeMax) / 2;
  return (
    rangeMin +
    ((value - domainMin) / (domainMax - domainMin)) * (rangeMax - rangeMin)
  );
}

export function normalize(values: number[]): number[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return values.map(() => 0.5);
  return values.map((v) => (v - min) / (max - min));
}

export function computeLinePoints(
  data: DataPoint[],
  width: number,
  height: number,
  padding: number = 40,
): Point[] {
  if (data.length === 0) return [];
  const values = data.map((d) => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const plotWidth = width - padding * 2;
  const plotHeight = height - padding * 2;

  return data.map((d, i) => ({
    x: padding + (data.length === 1 ? plotWidth / 2 : (i / (data.length - 1)) * plotWidth),
    y: padding + scaleLinear(d.value, minVal, maxVal, plotHeight, 0),
  }));
}

export function pointsToPolyline(points: Point[]): string {
  return points.map((p) => `${p.x},${p.y}`).join(" ");
}

export function pointsToSmoothPath(points: Point[]): string {
  if (points.length < 2) {
    if (points.length === 1) return `M ${points[0]!.x} ${points[0]!.y}`;
    return "";
  }

  const d: string[] = [`M ${points[0]!.x} ${points[0]!.y}`];

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]!;
    const curr = points[i]!;
    const cpX = (prev.x + curr.x) / 2;
    d.push(`C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`);
  }

  return d.join(" ");
}

export function arcPath(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): string {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const x1 = cx + r * Math.cos(toRad(startAngle));
  const y1 = cy + r * Math.sin(toRad(startAngle));
  const x2 = cx + r * Math.cos(toRad(endAngle));
  const y2 = cy + r * Math.sin(toRad(endAngle));
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
}

export function donutArcPath(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngle: number,
  endAngle: number,
): string {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const ox1 = cx + outerR * Math.cos(toRad(startAngle));
  const oy1 = cy + outerR * Math.sin(toRad(startAngle));
  const ox2 = cx + outerR * Math.cos(toRad(endAngle));
  const oy2 = cy + outerR * Math.sin(toRad(endAngle));
  const ix1 = cx + innerR * Math.cos(toRad(endAngle));
  const iy1 = cy + innerR * Math.sin(toRad(endAngle));
  const ix2 = cx + innerR * Math.cos(toRad(startAngle));
  const iy2 = cy + innerR * Math.sin(toRad(startAngle));
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return [
    `M ${ox1} ${oy1}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${ox2} ${oy2}`,
    `L ${ix1} ${iy1}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix2} ${iy2}`,
    "Z",
  ].join(" ");
}

export function computePieSlices(
  data: DataPoint[],
): Array<{ startAngle: number; endAngle: number; label: string; value: number; color?: string }> {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return [];
  let cursor = -90;
  return data.map((d) => {
    const span = (d.value / total) * 360;
    const start = cursor;
    cursor += span;
    return {
      startAngle: start,
      endAngle: cursor,
      label: d.label,
      value: d.value,
      color: d.color,
    };
  });
}

export function midAngle(startAngle: number, endAngle: number): number {
  return (startAngle + endAngle) / 2;
}

export function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number,
): Point {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export const DEFAULT_PALETTE = [
  "#6366f1",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#a855f7",
  "#14b8a6",
  "#f97316",
];

export function resolveColor(color: string | undefined, index: number): string {
  return color ?? DEFAULT_PALETTE[index % DEFAULT_PALETTE.length] ?? "#6366f1";
}

export function isSeriesData(
  data: DataPoint[] | SeriesDataPoint[],
): data is SeriesDataPoint[] {
  return data.length > 0 && "series" in data[0]!;
}
