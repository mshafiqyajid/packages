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

export type ColorScheme = "default" | "warm" | "cool" | "muted" | "vivid" | "mono";

export type ChartDomain = [number | "auto", number | "auto"] | "nice";

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
  data: DataPoint[] | SeriesDataPoint[];
  type: ChartType;
  width: number;
  height: number;
  padding?: number;
  smooth?: boolean;
  stacked?: boolean;
  donut?: boolean | { innerRadius: number };
  domain?: ChartDomain;
}

export interface ChartSeriesResult {
  name: string;
  color?: string;
  path: string;
  points: Point[];
  values: number[];
}

export interface UseChartResult {
  points: Point[];
  paths: string[];
  series?: ChartSeriesResult[];
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

export const PALETTES: Record<ColorScheme, string[]> = {
  default: DEFAULT_PALETTE,
  warm: ["#ef4444", "#f97316", "#f59e0b", "#eab308", "#dc2626", "#c2410c", "#b45309", "#92400e"],
  cool: ["#3b82f6", "#06b6d4", "#0ea5e9", "#22d3ee", "#1d4ed8", "#0891b2", "#0284c7", "#155e75"],
  muted: ["#64748b", "#94a3b8", "#a8a29e", "#9ca3af", "#78716c", "#475569", "#737373", "#52525b"],
  vivid: ["#dc2626", "#16a34a", "#2563eb", "#9333ea", "#ea580c", "#0891b2", "#db2777", "#65a30d"],
  mono: ["#1f2937", "#374151", "#4b5563", "#6b7280", "#9ca3af", "#d1d5db", "#e5e7eb", "#f3f4f6"],
};

export function getPalette(scheme: ColorScheme = "default"): string[] {
  return PALETTES[scheme] ?? DEFAULT_PALETTE;
}

export function resolveColor(color: string | undefined, index: number, palette?: string[]): string {
  const p = palette && palette.length > 0 ? palette : DEFAULT_PALETTE;
  return color ?? p[index % p.length] ?? "#6366f1";
}

/**
 * Round a domain to nice round numbers and produce evenly-spaced ticks.
 * Returns [niceMin, niceMax, ticks].
 */
export function niceDomain(min: number, max: number, tickCount: number = 5): [number, number, number[]] {
  if (!isFinite(min) || !isFinite(max)) return [0, 1, [0, 1]];
  if (min === max) {
    if (min === 0) return [0, 1, [0, 0.5, 1]];
    const pad = Math.abs(min) * 0.1;
    return [min - pad, max + pad, [min - pad, min, max + pad]];
  }
  const range = niceNum(max - min, false);
  const step = niceNum(range / Math.max(1, tickCount - 1), true);
  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = niceMin; v <= niceMax + step / 2; v += step) {
    ticks.push(roundToStep(v, step));
  }
  return [niceMin, niceMax, ticks];
}

function niceNum(range: number, round: boolean): number {
  const exponent = Math.floor(Math.log10(Math.abs(range) || 1));
  const fraction = Math.abs(range) / Math.pow(10, exponent);
  let niceFraction: number;
  if (round) {
    if (fraction < 1.5) niceFraction = 1;
    else if (fraction < 3) niceFraction = 2;
    else if (fraction < 7) niceFraction = 5;
    else niceFraction = 10;
  } else {
    if (fraction <= 1) niceFraction = 1;
    else if (fraction <= 2) niceFraction = 2;
    else if (fraction <= 5) niceFraction = 5;
    else niceFraction = 10;
  }
  return niceFraction * Math.pow(10, exponent);
}

function roundToStep(value: number, step: number): number {
  const decimals = step < 1 ? Math.max(0, -Math.floor(Math.log10(step))) : 0;
  return Number(value.toFixed(decimals));
}

/**
 * Resolve a ChartDomain prop to concrete [min, max] given the data extent.
 */
export function resolveDomain(
  dataMin: number,
  dataMax: number,
  domain: ChartDomain | undefined,
  tickCount: number = 5,
): { min: number; max: number; ticks?: number[] } {
  if (domain === undefined) return { min: dataMin, max: dataMax };
  if (domain === "nice") {
    const [nMin, nMax, ticks] = niceDomain(dataMin, dataMax, tickCount);
    return { min: nMin, max: nMax, ticks };
  }
  const [lo, hi] = domain;
  return {
    min: lo === "auto" ? dataMin : lo,
    max: hi === "auto" ? dataMax : hi,
  };
}

export function isSeriesData(
  data: DataPoint[] | SeriesDataPoint[],
): data is SeriesDataPoint[] {
  return data.length > 0 && "series" in data[0]!;
}
