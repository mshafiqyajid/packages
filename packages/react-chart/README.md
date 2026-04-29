# @mshafiqyajid/react-chart

Lightweight SVG-based line, bar, and pie charts for React. Zero runtime dependencies — pure SVG math.

## Installation

```bash
npm install @mshafiqyajid/react-chart
```

## Usage

### Styled components (quickest path)

```tsx
import { LineChart, BarChart, PieChart } from "@mshafiqyajid/react-chart/styled";
import "@mshafiqyajid/react-chart/styles.css";

const data = [
  { label: "Jan", value: 40 },
  { label: "Feb", value: 65 },
  { label: "Mar", value: 52 },
];

// Line chart
<LineChart data={data} width={600} height={300} showGrid showDots showLabels />

// Bar chart
<BarChart data={data} width={600} height={300} showValues direction="vertical" />

// Pie chart
<PieChart data={data} size={300} donut showLabels showLegend />
```

### Headless hook

```tsx
import { useChart } from "@mshafiqyajid/react-chart";

const { points, paths, viewBox, scales } = useChart({
  data: [{ label: "A", value: 10 }, { label: "B", value: 20 }],
  type: "line",
  width: 400,
  height: 200,
});
```

## Props

### LineChart

| Prop | Type | Default | Description |
|---|---|---|---|
| `data` | `DataPoint[]` \| `SeriesDataPoint[]` | required | Chart data |
| `width` | `number` | `600` | SVG width |
| `height` | `number` | `300` | SVG height |
| `showGrid` | `boolean` | `false` | Show background grid lines |
| `showDots` | `boolean` | `true` | Show data point dots |
| `showLabels` | `boolean` | `false` | Show axis labels |
| `showLegend` | `boolean` | `false` | Show series legend |
| `smooth` | `boolean` | `false` | Bezier curve smoothing |
| `tone` | `"neutral"` \| `"primary"` | `"neutral"` | Color tone |
| `animated` | `boolean` | `false` | Animate on mount |

### BarChart

| Prop | Type | Default | Description |
|---|---|---|---|
| `data` | `DataPoint[]` \| `SeriesDataPoint[]` | required | Chart data |
| `width` | `number` | `600` | SVG width |
| `height` | `number` | `300` | SVG height |
| `direction` | `"vertical"` \| `"horizontal"` | `"vertical"` | Bar orientation |
| `stacked` | `boolean` | `false` | Stack grouped bars |
| `gap` | `number` | `4` | Gap between bars (px) |
| `radius` | `number` | `3` | Bar corner radius |
| `showValues` | `boolean` | `false` | Show value labels on bars |
| `animated` | `boolean` | `false` | Animate fill on mount |

### PieChart

| Prop | Type | Default | Description |
|---|---|---|---|
| `data` | `DataPoint[]` | required | Chart data |
| `size` | `number` | `300` | SVG width and height |
| `donut` | `boolean` | `false` | Donut variant |
| `donutWidth` | `number` | `60` | Donut ring width |
| `showLabels` | `boolean` | `false` | Show slice labels |
| `showLegend` | `boolean` | `false` | Show legend |
| `animated` | `boolean` | `false` | Animate on mount |

## Dark mode

Add `data-theme="dark"` to any ancestor element:

```html
<div data-theme="dark">
  <LineChart ... />
</div>
```

## License

MIT
