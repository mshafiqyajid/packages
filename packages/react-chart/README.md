# @mshafiqyajid/react-chart

**[Full docs →](https://docs.shafiqyajid.com/react/chart/)**

Lightweight SVG-based line, bar, and pie charts for React. Zero runtime dependencies — pure SVG math.

## Installation

```bash
npm install @mshafiqyajid/react-chart
```

## Usage

### Styled components

```tsx
import { LineChart, BarChart, PieChart } from "@mshafiqyajid/react-chart/styled";
import "@mshafiqyajid/react-chart/styles.css";

const data = [
  { label: "Jan", value: 40 },
  { label: "Feb", value: 65 },
  { label: "Mar", value: 52 },
];

<LineChart data={data} responsive aspectRatio={2} domain="nice" colorScheme="cool" />
<BarChart  data={data} showValues formatValue={(v) => `$${v}`} />
<PieChart  data={data} donut showLegend hoverOffset={8} />
```

### Headless hook

```tsx
import { useChart, niceDomain, getPalette } from "@mshafiqyajid/react-chart";

const { points, paths, series, viewBox, scales } = useChart({
  data,
  type: "line",
  width: 400,
  height: 200,
  smooth: true,
  domain: "nice",
});
```

`series` is populated for multi-series data. `niceDomain(min, max)` returns `[niceMin, niceMax, ticks]`. `getPalette(scheme)` returns one of: `default`, `warm`, `cool`, `muted`, `vivid`, `mono`.

## Shared props (all charts)

| Prop | Type | Default | Description |
|---|---|---|---|
| `colorScheme` | `"default" \| "warm" \| "cool" \| "muted" \| "vivid" \| "mono"` | `"default"` | Named palette |
| `formatValue` | `(value, point, index) => ReactNode` | — | Tooltip / value-label formatter |
| `formatLabel` | `(label, index) => ReactNode` | — | Axis / slice-label formatter |
| `renderTooltip` | `(payload) => ReactNode` | — | Custom tooltip body |
| `responsive` | `boolean` | `false` | Resize via `ResizeObserver` |
| `aspectRatio` | `number` | `width/height` | Used when responsive |
| `loading` / `error` | `boolean` | `false` | Render skeleton / error state |
| `emptyText` / `errorText` | `ReactNode` | — | State copy |

## LineChart

Adds `domain` (`[min, max] \| "nice"`), `yTicks`, `xTicks`, and `variant: "default" | "sparkline"` (sparkline drops padding, dots, labels, legend, tooltip).

## BarChart

Adds `domain`, `yTicks`, `xTicks`, plus existing `direction`, `stacked`, `gap`, `radius`, `showValues` (now respects `formatValue`).

## PieChart

Adds `hoverOffset`, `selectedIndex`, `onSelectedChange`, `selectedOffset`. Click a slice to toggle selection when `onSelectedChange` is provided.

## 1.0 — three new chart types + cross-cutting features

```tsx
import {
  AreaChart, ScatterChart, GaugeChart,
  type AreaChartHandle,
} from "@mshafiqyajid/react-chart/styled";

// AreaChart — gradient fill, crosshair tooltip, stacked, interactive legend
<AreaChart
  data={seriesData}
  smooth
  stacked
  fill={{ from: "#6366f1", to: "#6366f1", fromOpacity: 0.5, toOpacity: 0 }}
  referenceLines={[{ value: 200, label: "target", color: "#dc2626", dashed: true }]}
  annotations={[{ x: "Feb", label: "launch", color: "#16a34a" }]}
  showLegend
  showTooltip
/>

// ScatterChart — points only with optional bubble sizing
<ScatterChart
  series={[{ name: "Cohort A", points: [{ x: 1, y: 4, size: 10 }, ...] }]}
  bubbleRange={[4, 24]}
  showLegend
/>

// GaugeChart — single-value KPI dial with threshold colours
<GaugeChart
  value={72}
  thresholds={[
    { from: 0,  color: "#dc2626" },
    { from: 50, color: "#eab308" },
    { from: 80, color: "#16a34a" },
  ]}
  formatValue={(v) => `${v}%`}
/>
```

### Cross-cutting features

| Feature | Where | Notes |
|---|---|---|
| Crosshair tooltip | Line / Area | Vertical guide that snaps to the nearest x-index, lists every series at that point. |
| Animated reveal | Line / Area | `stroke-dasharray` reveal on mount; respects `prefers-reduced-motion`. |
| Gradient fills | Area (and any chart that accepts a fill) | `fill: { from, to, fromOpacity?, toOpacity? }`. |
| Reference lines | Area / Bar | `referenceLines: [{ value, label?, color?, dashed? }]` for thresholds. |
| Annotations | Area / Bar | `annotations: [{ x: label \| index, label?, color? }]` for vertical guides. |
| Interactive legend | Area | Click any series in the legend to toggle visibility. |
| Imperative export | Area / Scatter / Gauge | `chartRef.current.exportSVG()` / `exportPNG()` (2× canvas). |

### Imperative export

```tsx
const ref = useRef<AreaChartHandle>(null);

await ref.current?.exportSVG();   // string
await ref.current?.exportPNG();   // Promise<Blob | null>
```

## Dark mode

Add `data-theme="dark"` to any ancestor element.

## License

MIT
