---
"@mshafiqyajid/react-chart": major
---

react-chart 1.0 — adds three new chart types and a stack of cross-cutting features.

**New chart components:**

- **`<AreaChart>`** — filled-area variant with smooth interpolation, gradient fills (`fill: { from, to, fromOpacity?, toOpacity? }`), single- or multi-series, opt-in `stacked` mode, crosshair tooltip with snap-to-nearest-x, and an interactive legend (click a series swatch to toggle visibility).
- **`<ScatterChart>`** — points-only chart with optional `size` field for bubble layouts. Auto-scales bubble radii into a configurable `bubbleRange` (default `[4, 24]`). Multi-series via `series` prop, hover tooltip with x / y / size readout.
- **`<GaugeChart>`** — single-value KPI dial. Threshold-based colouring (`thresholds: [{ from, color, label? }]`), configurable `sweep` (180 = semicircle, 220 = default, 360 = ring), tick marks, centered numeric readout with `formatValue`.

**Cross-cutting features (apply to Area; some apply elsewhere too):**

- **Crosshair tooltip** (`showTooltip`) — vertical guide snaps to the nearest x-index, lists every visible series at that point with colour swatches.
- **Animated reveal** (`animate`) — `stroke-dasharray` reveal on mount for the line, fade-in for the fill. Respects `prefers-reduced-motion`.
- **Reference lines** (`referenceLines: [{ value, label?, color?, dashed? }]`) — horizontal targets / thresholds.
- **Annotations** (`annotations: [{ x, label?, color? }]`) — vertical guides at a label or index (release marker, deploy event).
- **Interactive legend** (`showLegend`, optionally controlled via `hiddenSeries` + `onHiddenSeriesChange`) — click a series in the legend to toggle visibility.
- **Imperative export** — `chartRef.current.exportSVG()` returns the SVG markup string; `exportPNG()` returns a 2× `Blob` rasterised via canvas. Available on `AreaChart`, `ScatterChart`, and `GaugeChart` (existing charts retain their pre-1.0 imperative APIs unchanged).

**Why major:** the styled API is fully additive (every existing prop on Bar / Line / Pie still works exactly as before), but the new chart components, the imperative ref handles, and the new shared types (`ChartGradient`, `ChartReferenceLine`, `ChartAnnotation`, `ScatterPoint`, plus extending `ChartType` to include `"area" | "scatter" | "gauge"`) are large enough surface to warrant 1.0.

Bundle size: ~16 KB (was ~12 KB) — three new components plus crosshair / tooltip / legend chrome. Still zero external dependencies.

Includes README + docs page + demo updates.
