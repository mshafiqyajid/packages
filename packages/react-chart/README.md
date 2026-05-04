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

## Dark mode

Add `data-theme="dark"` to any ancestor element.

## License

MIT
