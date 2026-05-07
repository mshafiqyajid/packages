import { useState, useRef, useCallback, useEffect, useId, useMemo } from "react";
import { tokenize } from "../highlight";
import { BarChart, LineChart, PieChart, AreaChart, ScatterChart, GaugeChart } from "@mshafiqyajid/react-chart/styled";
import type { ColorScheme } from "@mshafiqyajid/react-chart";
import "@mshafiqyajid/react-chart/styles.css";

// ── static data ────────────────────────────────────────────────────────────

const AREA_DATA = [
  { label: "Jan", series: [{ name: "Sales", values: [120] }, { name: "Refunds", values: [12] }] },
  { label: "Feb", series: [{ name: "Sales", values: [180] }, { name: "Refunds", values: [8]  }] },
  { label: "Mar", series: [{ name: "Sales", values: [240] }, { name: "Refunds", values: [15] }] },
  { label: "Apr", series: [{ name: "Sales", values: [200] }, { name: "Refunds", values: [22] }] },
  { label: "May", series: [{ name: "Sales", values: [280] }, { name: "Refunds", values: [18] }] },
  { label: "Jun", series: [{ name: "Sales", values: [320] }, { name: "Refunds", values: [10] }] },
];
const SCATTER_SERIES = [
  { name: "Cohort A", points: [{ x: 0.4, y: 12, size: 4 }, { x: 0.55, y: 22, size: 12 }, { x: 0.7, y: 28, size: 18 }, { x: 0.85, y: 18, size: 8 }] },
  { name: "Cohort B", points: [{ x: 0.5, y: 22, size: 8 }, { x: 0.65, y: 32, size: 14 }, { x: 0.9, y: 35, size: 26 }, { x: 1.1, y: 24, size: 10 }] },
];
const BAR_DATA  = [{ label:"Jan",value:42},{ label:"Feb",value:68},{ label:"Mar",value:55},{ label:"Apr",value:87},{ label:"May",value:73},{ label:"Jun",value:91}];
const LINE_DATA = [{ label:"Jan",value:30},{ label:"Feb",value:52},{ label:"Mar",value:45},{ label:"Apr",value:78},{ label:"May",value:65},{ label:"Jun",value:89}];
const SPARK_DATA = [{ label:"1",value:12},{ label:"2",value:18},{ label:"3",value:9},{ label:"4",value:24},{ label:"5",value:16},{ label:"6",value:30},{ label:"7",value:22}];
const PIE_DATA  = [{ label:"React",value:45},{ label:"Vue",value:25},{ label:"Angular",value:18},{ label:"Svelte",value:12}];

type ChartKind = "bar" | "line" | "area" | "pie" | "scatter" | "gauge";

const VARIANTS: Record<ChartKind, readonly string[]> = {
  bar:     ["default","rounded","lollipop"],
  line:    ["default","sparkline","stepped","dashed"],
  area:    ["default","stepped"],
  pie:     ["default","donut","semi"],
  scatter: ["points","connected"],
  gauge:   ["arc","ring","linear"],
};

const CHART_LABELS: Record<ChartKind, string> = {
  bar: "Bar Chart", line: "Line Chart", area: "Area Chart",
  pie: "Pie Chart", scatter: "Scatter Chart", gauge: "Gauge Chart",
};

// ── code snippets ──────────────────────────────────────────────────────────

function buildCode(type: ChartKind, variant: string, colorScheme: ColorScheme, animated: boolean, tooltip: boolean): string {
  const shared = [
    `import { ${type === "scatter" ? "ScatterChart" : type.charAt(0).toUpperCase() + type.slice(1) + "Chart"} } from "@mshafiqyajid/react-chart/styled";`,
    `import "@mshafiqyajid/react-chart/styles.css";`,
    ``,
  ];
  const props: string[] = [];
  if (colorScheme !== "default") props.push(`colorScheme="${colorScheme}"`);
  if (!animated) props.push(`animated={false}`);
  if (type === "scatter") {
    if (!tooltip) props.push(`showTooltip={false}`);
    if (variant !== "points") props.push(`variant="${variant}"`);
    return [...shared, `<ScatterChart series={series} height={280}${props.length ? " " + props.join(" ") : ""} showLegend />`].join("\n");
  }
  if (!tooltip) props.push(`tooltip={false}`);
  if (variant !== "default") props.push(`variant="${variant}"`);
  if (type === "bar")  return [...shared, `<BarChart data={data} height={240}${props.length ? " " + props.join(" ") : ""} domain="nice" />`].join("\n");
  if (type === "line") return [...shared, `<LineChart data={data} height={240}${props.length ? " " + props.join(" ") : ""} showDots showGrid />`].join("\n");
  if (type === "area") return [...shared, `<AreaChart data={data} height={260}${props.length ? " " + props.join(" ") : ""} smooth stacked showLegend />`].join("\n");
  if (type === "pie")  return [...shared, `<PieChart data={data} size={260}${props.length ? " " + props.join(" ") : ""} showLegend />`].join("\n");
  return [...shared, `<GaugeChart value={72} min={0} max={100}${props.length ? " " + props.join(" ") : ""} />`].join("\n");
}

// ── segmented control ──────────────────────────────────────────────────────

function Seg({ options, value, onChange }: { options: readonly string[]; value: string; onChange: (v: string) => void }) {
  const id = useId();
  return (
    <div className="pp-segmented" role="radiogroup">
      {options.map((o) => (
        <label key={o} className={`pp-segmented__option${value === o ? " pp-segmented__option--active" : ""}`}>
          <input type="radio" name={id} checked={value === o} onChange={() => onChange(o)} />
          <span>{o}</span>
        </label>
      ))}
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div className="pp__field">
      <label className="pp__field-label">
        <span className="pp__field-name">{label}</span>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          className="pp-toggle"
          onClick={() => onChange(!checked)}
        >
          <span className="pp-toggle__thumb" />
        </button>
      </label>
    </div>
  );
}

// ── main component ─────────────────────────────────────────────────────────

export default function ChartDemo() {
  const [type, setType]             = useState<ChartKind>("bar");
  const [animated, setAnimated]     = useState(true);
  const [tooltip, setTooltip]       = useState(true);
  const [showValues, setShowValues] = useState(false);
  const [area, setArea]             = useState(false);
  const [colorScheme, setColorScheme] = useState<ColorScheme>("default");
  const [pieSelected, setPieSelected] = useState<number | null>(null);
  const [variant, setVariant]       = useState("default");
  const [tooltipPin, setTooltipPin] = useState(true);
  const [hoverDim, setHoverDim]     = useState(true);
  const [drillClick, setDrillClick] = useState(false);
  const [brush, setBrush]           = useState(false);
  const [lastClick, setLastClick]   = useState<string | null>(null);
  const [lastRange, setLastRange]   = useState<string | null>(null);
  const [copied, setCopied]         = useState(false);

  // scroll-fade state for controls body
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showFade, setShowFade] = useState(false);
  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setShowFade(el.scrollHeight > el.clientHeight + 2 && el.scrollHeight - el.scrollTop > el.clientHeight + 2);
  }, []);
  useEffect(() => { checkScroll(); }, [type, colorScheme, variant, checkScroll]);

  const onTypeChange = (t: ChartKind) => {
    setType(t);
    setVariant(VARIANTS[t][0] as string);
    setShowValues(false);
    setArea(false);
  };

  const code = buildCode(type, variant, colorScheme, animated, tooltip);
  const tokens = useMemo(() => tokenize(code), [code]);

  const copy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="pp" data-layout="stacked">

      {/* ── Preview ─────────────────────────────────── */}
      <div className="pp__preview" style={{ alignItems: "flex-start", justifyContent: "flex-start", padding: "1.5rem", minHeight: 300 }}>
        {type === "bar" && (
          <BarChart data={BAR_DATA} height={240} showValues={showValues} animated={animated}
            tooltip={tooltip} colorScheme={colorScheme} domain="nice" radius={4}
            variant={variant as "default"|"rounded"|"lollipop"} style={{ width:"100%" }} />
        )}
        {type === "line" && (
          <LineChart key={variant} data={LINE_DATA} height={240} showDots showGrid animated={animated}
            area={area} tooltip={tooltip} colorScheme={colorScheme} domain="nice"
            formatValue={(v) => `${v}k`} variant={variant as "default"|"sparkline"|"stepped"|"dashed"}
            style={{ width:"100%" }} />
        )}
        {type === "pie" && (
          <PieChart data={PIE_DATA} size={260} showLegend animated={animated}
            donut={variant === "donut" || variant === "semi"}
            tooltip={tooltip} colorScheme={colorScheme} hoverOffset={6}
            selectedIndex={pieSelected} onSelectedChange={setPieSelected}
            variant={variant as "default"|"donut"|"semi"} style={{ margin:"0 auto" }} />
        )}
        {type === "area" && (
          <AreaChart key={variant} data={AREA_DATA} height={260} smooth stacked
            fill={{ from:"#6366f1", to:"#6366f1", fromOpacity:0.45, toOpacity:0 }}
            showTooltip={tooltip} showLegend animate={animated} colorScheme={colorScheme}
            referenceLines={[{ value:250, label:"target", color:"#dc2626", dashed:true }]}
            annotations={[{ x:"Apr", label:"launch", color:"#16a34a" }]}
            variant={variant as "default"|"stepped"} tooltipPin={tooltipPin} hoverDim={hoverDim}
            onPointClick={drillClick ? (rows) => setLastClick(`${rows[0]?.label ?? "?"} (${rows.length} series)`) : undefined}
            onRangeSelect={brush ? (r) => setLastRange(`${r.startLabel} → ${r.endLabel}`) : undefined}
            style={{ width:"100%" }} />
        )}
        {type === "scatter" && (
          <ScatterChart series={SCATTER_SERIES} height={280} bubbleRange={[4,26]}
            colorScheme={colorScheme} showTooltip={tooltip} showLegend
            variant={variant as "points"|"connected"} style={{ width:"100%" }} />
        )}
        {type === "gauge" && (
          <div style={{ display:"flex", justifyContent:"center", width:"100%" }}>
            <GaugeChart key={variant} value={72} min={0} max={100}
              sweep={variant === "ring" ? 360 : 220} size={240}
              thresholds={[{ from:0, color:"#dc2626", label:"Critical" }, { from:50, color:"#eab308", label:"Warning" }, { from:80, color:"#16a34a", label:"Healthy" }]}
              formatValue={(v) => `${v}%`} variant={variant as "arc"|"ring"|"linear"} />
          </div>
        )}
        {type === "line" && (
          <div style={{ marginTop:"0.5rem", width:"100%" }}>
            <div style={{ fontSize:"0.75rem", color:"var(--fg-muted)", marginBottom:"0.25rem" }}>Sparkline (no axes):</div>
            <LineChart data={SPARK_DATA} variant="sparkline" width={260} height={36} colorScheme={colorScheme} smooth />
          </div>
        )}
        {type === "area" && (lastClick || lastRange) && (
          <div style={{ marginTop:"0.5rem", fontSize:"0.78rem", color:"var(--fg-muted)", display:"flex", gap:"1rem" }}>
            {lastClick && <span>clicked → {lastClick}</span>}
            {lastRange && <span>range → {lastRange}</span>}
          </div>
        )}
      </div>

      {/* ── Stacked toggle bar ─────────────────────── */}
      <div className="pp__stacked-bar" style={{ flexWrap:"wrap", gap:"0.35rem", padding:"0.5rem 1rem" }}>
        {(["bar","line","area","pie","scatter","gauge"] as ChartKind[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onTypeChange(t)}
            style={{
              fontSize:"0.75rem",
              fontWeight: type === t ? 600 : 450,
              padding:"2px 10px",
              borderRadius:4,
              border:`1px solid ${type === t ? "var(--accent)" : "var(--border)"}`,
              background: type === t ? "color-mix(in srgb,var(--accent) 12%,transparent)" : "transparent",
              color: type === t ? "var(--accent)" : "var(--fg-muted)",
              cursor:"pointer",
              transition:"all 120ms ease",
            }}
          >
            {CHART_LABELS[t]}
          </button>
        ))}
      </div>

      {/* ── Controls ──────────────────────────────── */}
      <div className="pp__controls" style={{ borderLeft:"none", borderTop:"1px solid var(--border)" }}>
        <div className="pp__controls-header">
          <span>Props</span>
        </div>
        <div className="pp__controls-scroll" ref={scrollRef} onScroll={checkScroll}>
          <div className="pp__controls-body">

            <div className="pp__field">
              <label className="pp__field-label"><span className="pp__field-name">variant</span></label>
              <Seg options={VARIANTS[type]} value={variant} onChange={setVariant} />
            </div>

            <div className="pp__field">
              <label className="pp__field-label"><span className="pp__field-name">colorScheme</span></label>
              <Seg options={["default","warm","cool","muted","vivid","mono"]} value={colorScheme} onChange={(v) => setColorScheme(v as ColorScheme)} />
            </div>

            <Toggle checked={animated}   onChange={setAnimated}   label="animated" />
            <Toggle checked={tooltip}    onChange={setTooltip}    label="tooltip" />

            {type !== "pie" && type !== "gauge" && (
              <Toggle checked={showValues} onChange={setShowValues} label="showValues" />
            )}
            {type === "line" && (
              <Toggle checked={area} onChange={setArea} label="area fill" />
            )}
            {type === "area" && <>
              <Toggle checked={tooltipPin} onChange={setTooltipPin} label="tooltipPin" />
              <Toggle checked={hoverDim}   onChange={setHoverDim}   label="hoverDim" />
              <Toggle checked={drillClick} onChange={setDrillClick} label="onPointClick" />
              <Toggle checked={brush}      onChange={setBrush}      label="onRangeSelect (brush)" />
            </>}

          </div>
          {showFade && <div className="pp__controls-fade" aria-hidden="true" />}
        </div>
      </div>

      {/* ── Code snippet ─────────────────────────── */}
      <div className="pp__code-wrap">
        <div className="pp__code-header">
          <div className="pp__code-header-left">
            <span className="pp__code-lang">TSX</span>
          </div>
          <button type="button" className="pp__copy" onClick={copy}>
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <pre className="pp-code"><code>{tokens.map((t, i) => <span key={i} className={`tok-${t.type}`}>{t.value}</span>)}</code></pre>
      </div>

    </div>
  );
}
