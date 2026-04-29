import { useState, useCallback, type ReactNode } from "react";

// ============================================================================
// Prop definition types
// ============================================================================

export type PropControl =
  | { type: "segmented"; options: readonly string[] }
  | { type: "toggle" }
  | { type: "text"; placeholder?: string }
  | { type: "number"; min: number; max: number; step?: number }
  | { type: "slider"; min: number; max: number; step?: number }
  | { type: "color" }
  | { type: "select"; options: readonly string[] };

export interface PropDef {
  name: string;
  label?: string;
  control: PropControl;
  defaultValue: string | number | boolean;
  /** Don't include in generated code when value matches this. */
  omitWhen?: string | number | boolean;
}

export interface PropPlaygroundProps {
  /** Component name shown in code (e.g. "RatingStyled") */
  componentName: string;
  /** Import statement shown in the code block */
  importLine: string;
  /** Import for styles if needed */
  stylesImport?: string;
  /** Prop definitions */
  props: PropDef[];
  /** Renders the live preview given the current prop values */
  render: (values: Record<string, string | number | boolean>) => ReactNode;
  /** Optional static props to always include in the code output */
  staticProps?: Record<string, string>;
}

// ============================================================================
// Code generation
// ============================================================================

function formatPropValue(value: string | number | boolean): string {
  if (typeof value === "boolean") return value ? "" : "{false}";
  if (typeof value === "number") return `{${value}}`;
  return `"${value}"`;
}

function generateCode(
  componentName: string,
  props: PropDef[],
  values: Record<string, string | number | boolean>,
  staticProps?: Record<string, string>,
): string {
  const lines: string[] = [];

  for (const prop of props) {
    const value = values[prop.name];
    if (value === undefined) continue;
    if (prop.omitWhen !== undefined && value === prop.omitWhen) continue;
    if (typeof value === "boolean" && value === false) {
      lines.push(`  ${prop.name}={false}`);
    } else if (typeof value === "boolean") {
      lines.push(`  ${prop.name}`);
    } else {
      lines.push(`  ${prop.name}=${formatPropValue(value)}`);
    }
  }

  if (staticProps) {
    for (const [k, v] of Object.entries(staticProps)) {
      lines.push(`  ${k}=${v}`);
    }
  }

  if (lines.length === 0) {
    return `<${componentName} />`;
  }
  return `<${componentName}\n${lines.join("\n")}\n/>`;
}

// ============================================================================
// Individual control renderers
// ============================================================================

function SegmentedControl({
  options,
  value,
  onChange,
}: {
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: 8, padding: 2, gap: 2, flexWrap: "wrap" }}>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          style={{
            font: "inherit",
            fontSize: 12,
            fontWeight: 500,
            padding: "3px 8px",
            borderRadius: 6,
            border: "none",
            cursor: "pointer",
            background: value === opt ? "var(--bg-elevated)" : "transparent",
            color: value === opt ? "var(--fg)" : "var(--fg-muted)",
            boxShadow: value === opt ? "var(--shadow-sm)" : "none",
            transition: "background 140ms, color 140ms",
            textTransform: "capitalize",
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      style={{
        width: 36,
        height: 20,
        borderRadius: 999,
        border: "none",
        background: value ? "var(--accent)" : "var(--border-strong)",
        cursor: "pointer",
        padding: 0,
        position: "relative",
        transition: "background 160ms ease",
        flexShrink: 0,
      }}
    >
      <span style={{
        position: "absolute",
        top: 2,
        left: value ? 18 : 2,
        width: 16,
        height: 16,
        borderRadius: "50%",
        background: "white",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        transition: "left 160ms cubic-bezier(0.34, 1.56, 0.64, 1)",
      }} />
    </button>
  );
}

// ============================================================================
// Main PropPlayground component
// ============================================================================

export default function PropPlayground({
  componentName,
  importLine,
  stylesImport,
  props,
  render,
  staticProps,
}: PropPlaygroundProps) {
  const initial: Record<string, string | number | boolean> = {};
  for (const p of props) initial[p.name] = p.defaultValue;
  const [values, setValues] = useState(initial);
  const [copied, setCopied] = useState(false);

  const set = useCallback((name: string, value: string | number | boolean) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const code = generateCode(componentName, props, values, staticProps);
  const fullCode = [
    importLine,
    stylesImport ?? null,
    "",
    code,
  ].filter((l) => l !== null).join("\n");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", background: "var(--bg-elevated)" }}>
      {/* Top: preview + controls */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: 220 }}>

        {/* Live preview */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem 1.5rem",
          borderRight: "1px solid var(--border)",
          background: "radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--accent) 6%, transparent), transparent 70%), var(--bg-elevated)",
        }}>
          {render(values)}
        </div>

        {/* Controls */}
        <div style={{ padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: 12, overflowY: "auto", maxHeight: 400 }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--fg-subtle)" }}>
            Props
          </div>
          {props.map((prop) => {
            const value = values[prop.name]!;
            const label = prop.label ?? prop.name;
            return (
              <div key={prop.name} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: "var(--fg-muted)", fontFamily: '"JetBrains Mono", monospace' }}>
                  {label}
                  {typeof value !== "boolean" && (
                    <span style={{ color: "var(--fg-subtle)", fontWeight: 400 }}>
                      {" "}
                      {prop.control.type === "number" || prop.control.type === "slider"
                        ? `= ${value}`
                        : ""}
                    </span>
                  )}
                </label>

                {prop.control.type === "segmented" && (
                  <SegmentedControl
                    options={prop.control.options}
                    value={value as string}
                    onChange={(v) => set(prop.name, v)}
                  />
                )}

                {prop.control.type === "select" && (
                  <select
                    value={value as string}
                    onChange={(e) => set(prop.name, e.target.value)}
                    style={{
                      font: "inherit",
                      fontSize: 12,
                      padding: "4px 8px",
                      borderRadius: 6,
                      border: "1px solid var(--border)",
                      background: "var(--bg-subtle)",
                      color: "var(--fg)",
                      cursor: "pointer",
                    }}
                  >
                    {prop.control.options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}

                {prop.control.type === "toggle" && (
                  <Toggle
                    value={value as boolean}
                    onChange={(v) => set(prop.name, v)}
                  />
                )}

                {prop.control.type === "text" && (
                  <input
                    type="text"
                    value={value as string}
                    placeholder={prop.control.placeholder}
                    onChange={(e) => set(prop.name, e.target.value)}
                    style={{
                      font: "inherit",
                      fontSize: 12,
                      padding: "4px 8px",
                      borderRadius: 6,
                      border: "1px solid var(--border)",
                      background: "var(--bg-subtle)",
                      color: "var(--fg)",
                      outline: "none",
                    }}
                  />
                )}

                {(prop.control.type === "number" || prop.control.type === "slider") && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="range"
                      min={prop.control.min}
                      max={prop.control.max}
                      step={prop.control.step ?? 1}
                      value={value as number}
                      onChange={(e) => set(prop.name, Number(e.target.value))}
                      style={{ flex: 1, accentColor: "var(--accent)" }}
                    />
                    <span style={{ fontSize: 11, fontFamily: "monospace", color: "var(--fg-muted)", minWidth: 24, textAlign: "right" }}>
                      {value}
                    </span>
                  </div>
                )}

                {prop.control.type === "color" && (
                  <input
                    type="color"
                    value={value as string}
                    onChange={(e) => set(prop.name, e.target.value)}
                    style={{ width: 36, height: 28, padding: 2, border: "1px solid var(--border)", borderRadius: 6, cursor: "pointer", background: "var(--bg-subtle)" }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom: code block */}
      <div style={{ borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 1rem", background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)" }}>
          <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--fg-subtle)" }}>Usage</span>
          <button
            type="button"
            onClick={handleCopy}
            style={{
              font: "inherit",
              fontSize: 11,
              fontWeight: 600,
              padding: "3px 10px",
              borderRadius: 6,
              border: "1px solid var(--border)",
              background: copied ? "color-mix(in srgb, var(--success) 15%, transparent)" : "var(--bg-elevated)",
              color: copied ? "var(--success)" : "var(--fg-muted)",
              cursor: "pointer",
              transition: "all 160ms ease",
            }}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <pre style={{ margin: 0, padding: "1rem 1.25rem", fontSize: "0.78rem", lineHeight: 1.65, overflowX: "auto", background: "var(--bg-subtle)" }}>
          <code style={{ color: "var(--fg)" }}>{fullCode}</code>
        </pre>
      </div>
    </div>
  );
}
