export { LineChart } from "./LineChart";
export type { LineChartProps, LineChartTone } from "./LineChart";

export { BarChart } from "./BarChart";
export type { BarChartProps } from "./BarChart";

export { PieChart } from "./PieChart";
export type { PieChartProps } from "./PieChart";

// 1.0 additions
export { AreaChart } from "./AreaChart";
export type { AreaChartProps, AreaChartTone, AreaChartHandle } from "./AreaChart";

export { ScatterChart } from "./ScatterChart";
export type { ScatterChartProps, ScatterChartHandle, ScatterSeries } from "./ScatterChart";

export { GaugeChart } from "./GaugeChart";
export type { GaugeChartProps, GaugeChartHandle, GaugeThreshold } from "./GaugeChart";

export type { AreaPointPayload, AreaRangeSelection } from "./AreaChart";

// Synchronized cursor across multiple AreaChart / LineChart instances
export { ChartSyncProvider, useChartSyncCursor } from "./ChartSync";
export type { ChartSyncState } from "./ChartSync";
