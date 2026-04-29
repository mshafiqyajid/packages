import { useState, useCallback, useMemo, type ReactNode } from "react";
import { tokenize } from "./highlight";

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
  /** Import statement(s) shown above the JSX in the code panel */
  importLine: string;
  /** Prop definitions */
  props: PropDef[];
  /** Renders the live preview given the current prop values */
  render: (values: Record<string, string | number | boolean>) => ReactNode;
  /** Static props to always include in the code output. Pass raw JSX values
   *  (e.g. `value: "{value}"` or `text: '"Hello world"'`). */
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

  if (staticProps) {
    for (const [k, v] of Object.entries(staticProps)) {
      lines.push(`  ${k}=${v}`);
    }
  }

  for (const prop of props) {
    const value = values[prop.name];
    if (value === undefined) continue;
    if (prop.omitWhen !== undefined && value === prop.omitWhen) continue;
    if (typeof value === "boolean") {
      if (value) lines.push(`  ${prop.name}`);
      else lines.push(`  ${prop.name}={false}`);
    } else {
      lines.push(`  ${prop.name}=${formatPropValue(value)}`);
    }
  }

  if (lines.length === 0) return `<${componentName} />`;
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
    <div className="pp-segmented" role="radiogroup">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          role="radio"
          aria-checked={value === opt}
          onClick={() => onChange(opt)}
          data-active={value === opt ? "true" : undefined}
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
      className="pp-toggle"
      data-on={value ? "true" : undefined}
    >
      <span className="pp-toggle__thumb" />
    </button>
  );
}

// ============================================================================
// Highlighted code
// ============================================================================

function HighlightedCode({ source }: { source: string }) {
  const tokens = useMemo(() => tokenize(source), [source]);
  return (
    <pre className="pp-code">
      <code>
        {tokens.map((t, i) => (
          <span key={i} className={`tok-${t.type}`}>{t.value}</span>
        ))}
      </code>
    </pre>
  );
}

// ============================================================================
// Main PropPlayground
// ============================================================================

export default function PropPlayground({
  componentName,
  importLine,
  props,
  render,
  staticProps,
}: PropPlaygroundProps) {
  const initial = useMemo(() => {
    const o: Record<string, string | number | boolean> = {};
    for (const p of props) o[p.name] = p.defaultValue;
    return o;
  }, [props]);

  const [values, setValues] = useState(initial);
  const [copied, setCopied] = useState(false);

  const set = useCallback(
    (name: string, value: string | number | boolean) => {
      setValues((prev) => ({ ...prev, [name]: value }));
    },
    [],
  );

  const reset = useCallback(() => setValues(initial), [initial]);

  const isDirty = useMemo(
    () => props.some((p) => values[p.name] !== p.defaultValue),
    [props, values],
  );

  const jsx = generateCode(componentName, props, values, staticProps);
  const fullCode = `${importLine}\n\n${jsx}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullCode);
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="pp">
      {/* Top: preview + controls */}
      <div className="pp__top">

        {/* Live preview */}
        <div className="pp__preview">
          {render(values)}
        </div>

        {/* Controls */}
        <div className="pp__controls">
          <div className="pp__controls-header">
            <span>Props</span>
            <button
              type="button"
              className="pp__reset"
              onClick={reset}
              disabled={!isDirty}
              aria-label="Reset to defaults"
            >
              Reset
            </button>
          </div>
          <div className="pp__controls-body">
            {props.map((prop) => {
              const value = values[prop.name]!;
              const label = prop.label ?? prop.name;
              return (
                <div key={prop.name} className="pp__field">
                  <label className="pp__field-label">
                    <span className="pp__field-name">{label}</span>
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
                      className="pp-select"
                    >
                      {prop.control.options.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  )}
                  {prop.control.type === "toggle" && (
                    <Toggle value={value as boolean} onChange={(v) => set(prop.name, v)} />
                  )}
                  {prop.control.type === "text" && (
                    <input
                      type="text"
                      value={value as string}
                      placeholder={prop.control.placeholder}
                      onChange={(e) => set(prop.name, e.target.value)}
                      className="pp-text"
                    />
                  )}
                  {(prop.control.type === "number" || prop.control.type === "slider") && (
                    <div className="pp-slider-row">
                      <input
                        type="range"
                        min={prop.control.min}
                        max={prop.control.max}
                        step={prop.control.step ?? 1}
                        value={value as number}
                        onChange={(e) => set(prop.name, Number(e.target.value))}
                      />
                      <span className="pp-slider-value">{value}</span>
                    </div>
                  )}
                  {prop.control.type === "color" && (
                    <input
                      type="color"
                      value={value as string}
                      onChange={(e) => set(prop.name, e.target.value)}
                      className="pp-color"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom: code block */}
      <div className="pp__code-wrap">
        <div className="pp__code-header">
          <span>Usage</span>
          <button
            type="button"
            onClick={handleCopy}
            className="pp__copy"
            data-copied={copied ? "true" : undefined}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <HighlightedCode source={fullCode} />
      </div>

      <style>{`
        .pp {
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
          background: var(--bg-elevated);
        }
        .pp__top {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 240px;
        }
        @media (max-width: 720px) {
          .pp__top { grid-template-columns: 1fr; }
        }
        .pp__preview {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1.5rem;
          border-right: 1px solid var(--border);
          background: radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--accent) 6%, transparent), transparent 70%), var(--bg-elevated);
        }
        @media (max-width: 720px) {
          .pp__preview { border-right: none; border-bottom: 1px solid var(--border); }
        }
        .pp__controls {
          display: flex;
          flex-direction: column;
          background: var(--bg-elevated);
        }
        .pp__controls-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem 1rem;
          background: var(--bg-subtle);
          border-bottom: 1px solid var(--border);
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--fg-subtle);
        }
        .pp__reset {
          font: inherit;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.04em;
          padding: 2px 8px;
          border-radius: 4px;
          border: 1px solid var(--border);
          background: var(--bg-elevated);
          color: var(--fg-muted);
          cursor: pointer;
          text-transform: uppercase;
          transition: color 140ms, background 140ms, border-color 140ms;
        }
        .pp__reset:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .pp__reset:not(:disabled):hover {
          color: var(--accent);
          border-color: var(--accent);
        }
        .pp__controls-body {
          padding: 0.85rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          max-height: 360px;
          overflow-y: auto;
        }
        .pp__field {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .pp__field-label {
          font-size: 12px;
          font-family: "JetBrains Mono", monospace;
          color: var(--fg-muted);
        }
        .pp__field-name { color: var(--fg); }

        /* Segmented control */
        .pp-segmented {
          display: flex;
          flex-wrap: wrap;
          gap: 2px;
          padding: 2px;
          background: var(--bg-subtle);
          border: 1px solid var(--border);
          border-radius: 7px;
        }
        .pp-segmented button {
          font: inherit;
          font-size: 11.5px;
          font-weight: 500;
          padding: 4px 9px;
          border: none;
          border-radius: 5px;
          background: transparent;
          color: var(--fg-muted);
          cursor: pointer;
          text-transform: capitalize;
          transition: background 140ms, color 140ms;
        }
        .pp-segmented button:hover { color: var(--fg); }
        .pp-segmented button[data-active="true"] {
          background: var(--bg-elevated);
          color: var(--fg);
          box-shadow: var(--shadow-sm);
        }

        /* Toggle */
        .pp-toggle {
          width: 36px;
          height: 20px;
          border-radius: 999px;
          border: none;
          background: var(--border-strong);
          cursor: pointer;
          padding: 0;
          position: relative;
          transition: background 160ms ease;
          align-self: flex-start;
        }
        .pp-toggle__thumb {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          transition: left 180ms cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .pp-toggle[data-on="true"] { background: var(--accent); }
        .pp-toggle[data-on="true"] .pp-toggle__thumb { left: 18px; }

        /* Text input */
        .pp-text, .pp-select {
          font: inherit;
          font-size: 12px;
          padding: 5px 8px;
          border-radius: 6px;
          border: 1px solid var(--border);
          background: var(--bg-subtle);
          color: var(--fg);
          outline: none;
          transition: border-color 140ms ease;
        }
        .pp-text:focus, .pp-select:focus {
          border-color: var(--accent);
          background: var(--bg-elevated);
        }
        .pp-color {
          width: 36px;
          height: 28px;
          padding: 2px;
          border: 1px solid var(--border);
          border-radius: 6px;
          cursor: pointer;
          background: var(--bg-subtle);
          align-self: flex-start;
        }

        /* Slider */
        .pp-slider-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .pp-slider-row input[type="range"] {
          flex: 1;
          accent-color: var(--accent);
        }
        .pp-slider-value {
          font-size: 11px;
          font-family: "JetBrains Mono", monospace;
          color: var(--fg-muted);
          min-width: 30px;
          text-align: right;
          padding: 1px 6px;
          border-radius: 4px;
          background: var(--bg-subtle);
        }

        /* Code block */
        .pp__code-wrap {
          border-top: 1px solid var(--border);
          background: var(--bg-subtle);
        }
        .pp__code-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem 1rem;
          border-bottom: 1px solid var(--border);
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--fg-subtle);
        }
        .pp__copy {
          font: inherit;
          font-size: 11px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 4px;
          border: 1px solid var(--border);
          background: var(--bg-elevated);
          color: var(--fg-muted);
          cursor: pointer;
          transition: all 160ms ease;
        }
        .pp__copy:hover {
          color: var(--fg);
          border-color: var(--border-strong);
        }
        .pp__copy[data-copied="true"] {
          background: color-mix(in srgb, var(--success) 15%, transparent);
          color: var(--success);
          border-color: color-mix(in srgb, var(--success) 30%, transparent);
        }
        .pp-code {
          margin: 0;
          padding: 1rem 1.25rem;
          font-size: 0.78rem;
          line-height: 1.7;
          font-family: "JetBrains Mono", ui-monospace, monospace;
          overflow-x: auto;
          background: var(--bg-subtle);
          border: none;
          border-radius: 0;
          white-space: pre;
        }
      `}</style>
    </div>
  );
}
