# @mshafiqyajid/react-chart

## 1.0.1

### Patch Changes

- 2fb7a3a: Fix tooltip regression on Bar / Line / Pie charts that shipped in 1.0.0.

  The 1.0 release added an unscoped `.rchart-tooltip` rule for AreaChart/ScatterChart that overrode the original Bar / Line / Pie tooltip's `top/left` pixel positioning — tooltips on those charts displayed at the top of the container instead of next to the hovered element.

  **Fix:** scoped every Area/Scatter-specific tooltip selector under `.rchart-area` or `.rchart-scatter`. The original Bar / Line / Pie tooltip now positions correctly again.

  **Polish bundled in the same patch:**

  - Tooltip pop-in animation on every chart type — 140 ms cubic-bezier translate + scale, respects `prefers-reduced-motion`.
  - Tabular-num value alignment + slightly larger font.
  - Bigger arrow tail with a subtle drop-shadow so it doesn't look detached from the body.
  - Hover polish on Bar / Pie / Line dots:
    - Bars: `brightness(1.08)` + small drop-shadow on hover (was just `opacity 0.8`).
    - Pie slices: `brightness(1.06)` + drop-shadow + smoother transition curve.
    - Dots: cubic-bezier `r` transition + drop-shadow on hover.
  - All hover transitions disabled under `prefers-reduced-motion`.

## 1.0.0

### Major Changes

- ef5a176: react-chart 1.0 — three new chart types, a `variant` prop on every chart for visual alternatives (not just colour), and a deep stack of interactive features that take it well beyond a stock chart kit.

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

## 0.2.0

### Minor Changes

- 1c11e99: Major feature pass on react-chart (non-breaking):

  - `useChart` now accepts `DataPoint[] | SeriesDataPoint[]` and returns a `series` array (`{ name, color?, path, points, values }`) for multi-series line and grouped/stacked bar layouts. New options: `padding`, `smooth`, `stacked`, `donut`, `domain`. Closes the headless-vs-styled drift on series math.
  - `niceDomain(min, max, tickCount?)` and `resolveDomain` exported. Charts gain `domain` prop accepting `[min, max] | "nice"` to round axes.
  - `yTicks` (count or explicit values) and `xTicks` (override category labels) on LineChart and BarChart.
  - `formatValue(value, point, index)` and `formatLabel(label, index)` on all three charts.
  - `renderTooltip(payload)` slot on all three charts. Payload: `{ label, value, series?, color, point, index }`.
  - `responsive` + `aspectRatio` (+ `minWidth` / `minHeight`) — the chart resizes to fit its container via `ResizeObserver`. Default off to preserve current behavior.
  - `colorScheme` prop with named palettes: `default`, `warm`, `cool`, `muted`, `vivid`, `mono`. `PALETTES` and `getPalette()` exported. `colors` continues to override.
  - `loading` / `error` / `emptyText` / `errorText` states with new CSS classes `.rchart-skeleton`, `.rchart-empty`, `.rchart-error` and tokens `--rchart-skeleton-bg`, `--rchart-skeleton-shine`, `--rchart-empty-fg`, `--rchart-error-fg`, `--rchart-error-bg`.
  - `<LineChart variant="sparkline">` — drops padding to 4px and defaults `showDots`, `showLabels`, `showLegend`, `tooltip` to `false`. Lands `[data-variant="sparkline"]` for CSS overrides.
  - `<PieChart hoverOffset>` translates the hovered slice outward; `selectedIndex`, `onSelectedChange`, `selectedOffset` add controlled selection (lands `data-selected="true"` on the slice).

## 0.1.3

### Patch Changes

- 949c5f6: Retry publish after npm rate limit resolved.

## 0.1.2

### Patch Changes

- ebce144: Retry publish — npm rate-limited on two previous attempts.

## 0.1.1

### Patch Changes

- 1df254b: Initial release (republish after npm rate limit during first attempt).

## 0.1.0

### Minor Changes

- 0aecafe: Initial release of 10 new packages: date-picker (single/range calendar), file-upload (drag-and-drop), number-input (decimal/currency/percent), phone-input (country selector + dial code), color-input (hex/rgb/hsl picker), tag-input (chips + autocomplete), rich-text (contentEditable WYSIWYG), table (sort/filter/paginate), chart (SVG bar/line/pie), kanban (HTML5 DnD board).
