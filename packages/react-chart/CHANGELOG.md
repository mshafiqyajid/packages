# @mshafiqyajid/react-chart

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
