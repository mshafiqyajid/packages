import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import {
  type ColorScheme,
  type ScatterPoint,
  resolveColor,
  scaleLinear,
  getPalette,
} from "../chartUtils";

export interface ScatterChartHandle {
  exportSVG(): string;
  exportPNG(): Promise<Blob | null>;
}

export interface ScatterSeries {
  name: string;
  color?: string;
  points: ScatterPoint[];
}

export interface ScatterChartProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "color" | "onCopy"> {
  /** Single-series shorthand: an array of points. */
  data?: ScatterPoint[];
  /** Multi-series form. When provided, takes precedence over `data`. */
  series?: ScatterSeries[];
  width?: number;
  height?: number;
  /** Domain for x. Default: derived from data. */
  xDomain?: [number, number];
  yDomain?: [number, number];
  /** Range for bubble radii in px when point.size is set. Default: [4, 24]. */
  bubbleRange?: [number, number];
  showGrid?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  xTicks?: number;
  yTicks?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
  colorScheme?: ColorScheme;
  formatValue?: (value: number) => ReactNode;
  className?: string;
  loading?: boolean;
  emptyText?: ReactNode;
}

function ScatterChartImpl(
  props: ScatterChartProps,
  ref: React.Ref<ScatterChartHandle>,
) {
  const {
    data,
    series: seriesProp,
    width = 600,
    height = 320,
    xDomain,
    yDomain,
    bubbleRange = [4, 24],
    showGrid = true,
    showXAxis = true,
    showYAxis = true,
    xTicks = 5,
    yTicks = 5,
    showLegend,
    showTooltip = true,
    colorScheme = "default",
    formatValue,
    className,
    loading = false,
    emptyText = "No data",
    style,
    ...rest
  } = props;

  const padding = 44;
  const palette = getPalette(colorScheme);

  const series = useMemo<ScatterSeries[]>(() => {
    if (seriesProp && seriesProp.length > 0) return seriesProp;
    if (data && data.length > 0) return [{ name: "values", points: data }];
    return [];
  }, [seriesProp, data]);

  const allPoints = useMemo(() => series.flatMap((s) => s.points), [series]);

  const xExtent = useMemo<[number, number]>(() => {
    if (xDomain) return xDomain;
    if (allPoints.length === 0) return [0, 1];
    const xs = allPoints.map((p) => p.x);
    return [Math.min(...xs), Math.max(...xs)];
  }, [xDomain, allPoints]);
  const yExtent = useMemo<[number, number]>(() => {
    if (yDomain) return yDomain;
    if (allPoints.length === 0) return [0, 1];
    const ys = allPoints.map((p) => p.y);
    return [Math.min(...ys), Math.max(...ys)];
  }, [yDomain, allPoints]);
  const sizeExtent = useMemo<[number, number] | null>(() => {
    const ss = allPoints.filter((p) => typeof p.size === "number").map((p) => p.size!);
    if (ss.length === 0) return null;
    return [Math.min(...ss), Math.max(...ss)];
  }, [allPoints]);

  const plotW = width - padding * 2;
  const plotH = height - padding * 2;
  const xPos = (x: number) =>
    padding + scaleLinear(x, xExtent[0], xExtent[1], 0, plotW);
  const yPos = (y: number) =>
    padding + scaleLinear(y, yExtent[0], yExtent[1], plotH, 0);
  const radius = (size: number | undefined): number => {
    if (size === undefined || !sizeExtent) return 5;
    const [minS, maxS] = sizeExtent;
    if (minS === maxS) return (bubbleRange[0] + bubbleRange[1]) / 2;
    return scaleLinear(size, minS, maxS, bubbleRange[0], bubbleRange[1]);
  };

  // Tooltip: track the closest point under the cursor
  const [hoverPoint, setHoverPoint] = useState<{
    seriesName: string;
    point: ScatterPoint;
    px: number;
    py: number;
  } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!showTooltip) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * width;
    const py = ((e.clientY - rect.top) / rect.height) * height;
    let best: typeof hoverPoint = null;
    let bestDist = Infinity;
    series.forEach((s) => {
      s.points.forEach((p) => {
        const cx = xPos(p.x);
        const cy = yPos(p.y);
        const d = Math.hypot(cx - px, cy - py);
        if (d < bestDist && d < 24) {
          bestDist = d;
          best = { seriesName: s.name, point: p, px: cx, py: cy };
        }
      });
    });
    setHoverPoint(best);
  };
  const handlePointerLeave = () => setHoverPoint(null);

  useImperativeHandle(
    ref,
    () => ({
      exportSVG: () => svgRef.current?.outerHTML ?? "",
      exportPNG: () =>
        new Promise<Blob | null>((resolve) => {
          const svg = svgRef.current;
          if (!svg || typeof window === "undefined") return resolve(null);
          const xml = new XMLSerializer().serializeToString(svg);
          const blob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
          const url = URL.createObjectURL(blob);
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = width * 2;
            canvas.height = height * 2;
            const ctx = canvas.getContext("2d");
            if (!ctx) { URL.revokeObjectURL(url); return resolve(null); }
            ctx.scale(2, 2);
            ctx.drawImage(img, 0, 0, width, height);
            URL.revokeObjectURL(url);
            canvas.toBlob((b) => resolve(b), "image/png");
          };
          img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
          img.src = url;
        }),
    }),
    [width, height],
  );

  if (loading) {
    return (
      <div
        className={["rchart-scatter", "rchart-loading", className].filter(Boolean).join(" ")}
        style={style}
        {...rest}
      >
        <span className="rchart-skeleton" />
      </div>
    );
  }
  if (allPoints.length === 0) {
    return (
      <div className={["rchart-scatter", className].filter(Boolean).join(" ")} style={style} {...rest}>
        <span className="rchart-empty">{emptyText}</span>
      </div>
    );
  }

  // Tick arrays
  const xTickArr: number[] = [];
  const xStep = (xExtent[1] - xExtent[0]) / Math.max(1, xTicks - 1);
  for (let i = 0; i < xTicks; i++) xTickArr.push(xExtent[0] + i * xStep);
  const yTickArr: number[] = [];
  const yStep = (yExtent[1] - yExtent[0]) / Math.max(1, yTicks - 1);
  for (let i = 0; i < yTicks; i++) yTickArr.push(yExtent[0] + i * yStep);

  const wrapperStyle: CSSProperties = { ...style };

  return (
    <div
      className={["rchart-scatter", className].filter(Boolean).join(" ")}
      style={wrapperStyle}
      {...rest}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="rchart-svg"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        role="img"
      >
        {showGrid && (
          <g className="rchart-grid">
            {xTickArr.map((t, i) => (
              <line
                key={`xg-${i}`}
                x1={xPos(t)}
                x2={xPos(t)}
                y1={padding}
                y2={height - padding}
              />
            ))}
            {yTickArr.map((t, i) => (
              <line
                key={`yg-${i}`}
                x1={padding}
                x2={width - padding}
                y1={yPos(t)}
                y2={yPos(t)}
              />
            ))}
          </g>
        )}

        {series.map((s, idx) => {
          const seriesColor = s.color ?? resolveColor(undefined, idx, palette);
          return (
            <g key={s.name} className="rchart-scatter-series" data-series={s.name}>
              {s.points.map((p, pi) => (
                <circle
                  key={pi}
                  cx={xPos(p.x)}
                  cy={yPos(p.y)}
                  r={radius(p.size)}
                  fill={p.color ?? seriesColor}
                  fillOpacity={sizeExtent ? 0.65 : 0.85}
                  stroke="white"
                  strokeWidth={1}
                  className="rchart-scatter-point"
                />
              ))}
            </g>
          );
        })}

        {/* Hover ring */}
        {hoverPoint && (
          <circle
            cx={hoverPoint.px}
            cy={hoverPoint.py}
            r={radius(hoverPoint.point.size) + 4}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.5}
            strokeWidth={1.5}
          />
        )}

        {showXAxis && (
          <g className="rchart-axis rchart-axis--x">
            {xTickArr.map((t, i) => (
              <text key={i} x={xPos(t)} y={height - padding + 16} textAnchor="middle">
                {formatValue ? formatValue(t) : Number(t.toFixed(2))}
              </text>
            ))}
          </g>
        )}
        {showYAxis && (
          <g className="rchart-axis rchart-axis--y">
            {yTickArr.map((t, i) => (
              <text key={i} x={padding - 6} y={yPos(t) + 3} textAnchor="end">
                {formatValue ? formatValue(t) : Number(t.toFixed(2))}
              </text>
            ))}
          </g>
        )}
      </svg>

      {showTooltip && hoverPoint && (
        <div
          className="rchart-tooltip"
          style={{ left: `${(hoverPoint.px / width) * 100}%`, top: `${(hoverPoint.py / height) * 100}%` }}
        >
          <div className="rchart-tooltip-label">{hoverPoint.point.label ?? hoverPoint.seriesName}</div>
          <div className="rchart-tooltip-row">
            <span className="rchart-tooltip-name">x</span>
            <span className="rchart-tooltip-value">
              {formatValue ? formatValue(hoverPoint.point.x) : hoverPoint.point.x}
            </span>
          </div>
          <div className="rchart-tooltip-row">
            <span className="rchart-tooltip-name">y</span>
            <span className="rchart-tooltip-value">
              {formatValue ? formatValue(hoverPoint.point.y) : hoverPoint.point.y}
            </span>
          </div>
          {hoverPoint.point.size !== undefined && (
            <div className="rchart-tooltip-row">
              <span className="rchart-tooltip-name">size</span>
              <span className="rchart-tooltip-value">{hoverPoint.point.size}</span>
            </div>
          )}
        </div>
      )}

      {(showLegend ?? series.length > 1) && (
        <div className="rchart-legend">
          {series.map((s, idx) => (
            <span key={s.name} className="rchart-legend-item">
              <span
                className="rchart-legend-swatch"
                style={{ background: s.color ?? resolveColor(undefined, idx, palette) }}
              />
              <span className="rchart-legend-label">{s.name}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export const ScatterChart = forwardRef<ScatterChartHandle, ScatterChartProps>(ScatterChartImpl);
ScatterChart.displayName = "ScatterChart";
