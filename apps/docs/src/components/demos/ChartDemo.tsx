import { useState } from "react";
import { BarChart, LineChart, PieChart } from "@mshafiqyajid/react-chart/styled";
import type { ColorScheme } from "@mshafiqyajid/react-chart";
import "@mshafiqyajid/react-chart/styles.css";

const BAR_DATA = [
  { label: "Jan", value: 42 },
  { label: "Feb", value: 68 },
  { label: "Mar", value: 55 },
  { label: "Apr", value: 87 },
  { label: "May", value: 73 },
  { label: "Jun", value: 91 },
];

const LINE_DATA = [
  { label: "Jan", value: 30 },
  { label: "Feb", value: 52 },
  { label: "Mar", value: 45 },
  { label: "Apr", value: 78 },
  { label: "May", value: 65 },
  { label: "Jun", value: 89 },
];

const SPARK_DATA = [
  { label: "1", value: 12 },
  { label: "2", value: 18 },
  { label: "3", value: 9 },
  { label: "4", value: 24 },
  { label: "5", value: 16 },
  { label: "6", value: 30 },
  { label: "7", value: 22 },
];

const PIE_DATA = [
  { label: "React",   value: 45 },
  { label: "Vue",     value: 25 },
  { label: "Angular", value: 18 },
  { label: "Svelte",  value: 12 },
];

type ChartKind = "bar" | "line" | "pie";

export default function ChartDemo() {
  const [type, setType] = useState<ChartKind>("bar");
  const [animated, setAnimated] = useState(true);
  const [tooltip, setTooltip] = useState(true);
  const [showValues, setShowValues] = useState(false);
  const [area, setArea] = useState(false);
  const [donut, setDonut] = useState(false);
  const [colorScheme, setColorScheme] = useState<ColorScheme>("default");
  const [pieSelected, setPieSelected] = useState<number | null>(null);

  const checkboxStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.375rem",
    fontSize: "0.875rem",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", width: "100%", maxWidth: 560 }}>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {(["bar", "line", "pie"] as ChartKind[]).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            style={{
              padding: "0.25rem 0.75rem",
              borderRadius: "0.375rem",
              border: "1px solid var(--border, #e2e8f0)",
              background: type === t ? "var(--accent, #6366f1)" : "transparent",
              color: type === t ? "#fff" : "inherit",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)} Chart
          </button>
        ))}
        <label style={{ ...checkboxStyle, marginLeft: "auto" }}>
          <input type="checkbox" checked={animated} onChange={(e) => setAnimated(e.target.checked)} />
          Animated
        </label>
        <label style={checkboxStyle}>
          <input type="checkbox" checked={tooltip} onChange={(e) => setTooltip(e.target.checked)} />
          Tooltip
        </label>
        {type !== "pie" && (
          <label style={checkboxStyle}>
            <input type="checkbox" checked={showValues} onChange={(e) => setShowValues(e.target.checked)} />
            Values
          </label>
        )}
        {type === "line" && (
          <label style={checkboxStyle}>
            <input type="checkbox" checked={area} onChange={(e) => setArea(e.target.checked)} />
            Area
          </label>
        )}
        {type === "pie" && (
          <label style={checkboxStyle}>
            <input type="checkbox" checked={donut} onChange={(e) => setDonut(e.target.checked)} />
            Donut
          </label>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
        <span>Palette:</span>
        {(["default", "warm", "cool", "muted", "vivid", "mono"] as ColorScheme[]).map((s) => (
          <button
            key={s}
            onClick={() => setColorScheme(s)}
            style={{
              padding: "0.15rem 0.5rem",
              borderRadius: "0.25rem",
              border: "1px solid var(--border, #e2e8f0)",
              background: colorScheme === s ? "var(--accent, #6366f1)" : "transparent",
              color: colorScheme === s ? "#fff" : "inherit",
              cursor: "pointer",
              fontSize: "0.78rem",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {type === "bar" && (
        <BarChart
          data={BAR_DATA}
          height={240}
          showValues={showValues}
          animated={animated}
          tooltip={tooltip}
          colorScheme={colorScheme}
          domain="nice"
          radius={4}
          style={{ width: "100%" }}
        />
      )}
      {type === "line" && (
        <LineChart
          data={LINE_DATA}
          height={240}
          showDots
          showGrid
          animated={animated}
          area={area}
          tooltip={tooltip}
          colorScheme={colorScheme}
          domain="nice"
          formatValue={(v) => `${v}k`}
          style={{ width: "100%" }}
        />
      )}
      {type === "pie" && (
        <PieChart
          data={PIE_DATA}
          size={260}
          showLegend
          animated={animated}
          donut={donut}
          tooltip={tooltip}
          colorScheme={colorScheme}
          hoverOffset={6}
          selectedIndex={pieSelected}
          onSelectedChange={setPieSelected}
          style={{ margin: "0 auto" }}
        />
      )}

      {type === "line" && (
        <div style={{ marginTop: "0.25rem" }}>
          <div style={{ fontSize: "0.78rem", color: "#6b7280", marginBottom: "0.25rem" }}>
            Sparkline variant (no axes, dots, or tooltip):
          </div>
          <LineChart
            data={SPARK_DATA}
            variant="sparkline"
            width={260}
            height={36}
            colorScheme={colorScheme}
            smooth
          />
        </div>
      )}
    </div>
  );
}
