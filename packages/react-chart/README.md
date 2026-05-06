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

## What's new in 1.0.0

**Three new chart types:**

- **`<AreaChart>`** — filled-area variant with smooth/stepped interpolation, gradient fills (`fill: { from, to, fromOpacity?, toOpacity? }`), single- or multi-series, opt-in `stacked`, crosshair tooltip with snap-to-nearest-x, and an interactive legend (click a series swatch to toggle visibility).
- **`<ScatterChart>`** — points-only chart with optional `size` field for bubble layouts. Auto-scales bubble radii into a configurable `bubbleRange` (default `[4, 24]`). Multi-series via `series` prop.
- **`<GaugeChart>`** — single-value KPI dial. Threshold-based colouring, configurable `sweep` (180 = semicircle, 220 = default, 360 = ring), tick marks, centered numeric readout.

**Visual variants per chart** (not just colour — actual design alternatives):

| Chart | Variants |
|---|---|
| BarChart | `default \| rounded \| lollipop` |
| LineChart | `default \| sparkline \| stepped \| dashed` |
| AreaChart | `default \| stepped` |
| PieChart | `default \| donut \| semi` (semi = horizontal half-donut) |
| ScatterChart | `points \| connected` |
| GaugeChart | `arc \| ring \| linear` |

**Interactive features (focused on AreaChart):**

- **Click-to-drill** — `onPointClick(payload)` fires with every visible series' value at the clicked x.
- **Pinned tooltip** — click any point to pin; click again to unpin (`tooltipPin`).
- **Brush range selection** — drag horizontally to select; `onRangeSelect({ startLabel, endLabel, startIndex, endIndex })` fires once on release.
- **Hover-dim siblings** — hovering a legend item fades the rest to 0.22 opacity (`hoverDim`).
- **Synchronised cursor** — wrap a group of charts in `<ChartSyncProvider>` and pass the same `syncId` to share crosshair x-index. Dashboard-friendly.
- **Keyboard navigation** — focus the chart and ←/→/Home/End move the crosshair, Enter/Space fire `onPointClick`, Esc clears.
- **Imperative export** — `chartRef.current.exportSVG()` returns the SVG markup string; `exportPNG()` returns a 2× `Blob` rasterised via canvas. Available on Area / Scatter / Gauge.

**Cross-cutting features (apply to Area; subset on others):**

- **Crosshair tooltip** (`showTooltip`) — vertical guide snaps to the nearest x-index, lists every visible series at that point.
- **Animated reveal** (`animate`) — `stroke-dasharray` reveal on mount for the line, fade-in for the fill. Respects `prefers-reduced-motion`.
- **Reference lines** (`referenceLines: [{ value, label?, color?, dashed? }]`) — horizontal targets / thresholds.
- **Annotations** (`annotations: [{ x, label?, color? }]`) — vertical guides at a label or index.
- **Interactive legend** (`showLegend`, optionally controlled via `hiddenSeries` + `onHiddenSeriesChange`).
