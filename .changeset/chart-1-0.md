---
"@mshafiqyajid/react-chart": major
---

react-chart 1.0 — three new chart types, a `variant` prop on every chart for visual alternatives (not just colour), and a deep stack of interactive features that take it well beyond a stock chart kit.

**Visual variants per chart:**

- **BarChart** — `variant: "default" | "rounded" | "lollipop"`. Lollipop renders a thin stem + circle marker.
- **LineChart** — `variant: "default" | "sparkline" | "stepped" | "dashed"`. Stepped draws stair-step segments; dashed applies `stroke-dasharray`.
- **AreaChart** — `variant: "default" | "stepped"`. Stepped renders the fill as level plateaus.
- **PieChart** — `variant: "default" | "donut" | "semi"`. Semi renders a horizontal half-donut, gauge-style.
- **ScatterChart** — `variant: "points" | "connected"`. Connected draws a line through points in array order.
- **GaugeChart** — `variant: "arc" | "ring" | "linear"`. Ring forces sweep to 360°; linear renders a horizontal bar with markers.

**Interactive features (focused on AreaChart):**

- **Click-to-drill** — `onPointClick(payload)` fires with every visible series' value at the clicked x.
- **Pinned tooltip** — click any point to pin the tooltip; click again to unpin (`tooltipPin`).
- **Brush range selection** — drag horizontally to select; `onRangeSelect({ startLabel, endLabel, startIndex, endIndex })` fires once on release.
- **Hover-dim siblings** — hovering a legend item fades the rest to 0.22 opacity (`hoverDim`).
- **Synchronised cursor** — wrap a group of charts in `<ChartSyncProvider>` and pass the same `syncId` to share crosshair x-index. Dashboard-friendly.
- **Keyboard navigation** — focus the chart; ← / → / Home / End move the crosshair, Enter / Space fire `onPointClick`, Esc clears.

**Original 1.0 wave:**

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
