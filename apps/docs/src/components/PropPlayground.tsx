import React, { useState, useCallback, useMemo, useEffect, useRef, type ReactNode } from "react";
import { tokenize } from "./highlight";
import { SegmentedControlStyled } from "@mshafiqyajid/react-segmented-control/styled";
import "@mshafiqyajid/react-segmented-control/styles.css";
import { SwitchStyled } from "@mshafiqyajid/react-switch/styled";
import "@mshafiqyajid/react-switch/styles.css";
import { ButtonStyled } from "@mshafiqyajid/react-button/styled";
import "@mshafiqyajid/react-button/styles.css";
import { SelectStyled } from "@mshafiqyajid/react-select/styled";
import "@mshafiqyajid/react-select/styles.css";
import { TextInputStyled } from "@mshafiqyajid/react-text-input/styled";
import "@mshafiqyajid/react-text-input/styles.css";
import { SliderStyled } from "@mshafiqyajid/react-slider/styled";
import "@mshafiqyajid/react-slider/styles.css";
import { ColorInputStyled } from "@mshafiqyajid/react-color-input/styled";
import "@mshafiqyajid/react-color-input/styles.css";
import { CopyButtonStyled } from "@mshafiqyajid/react-copy-button/styled";
import "@mshafiqyajid/react-copy-button/styles.css";
import { TabsStyled } from "@mshafiqyajid/react-tabs/styled";
import "@mshafiqyajid/react-tabs/styles.css";

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
  /**
   * Group name. Props sharing the same group are visually grouped together
   * with a header label in stacked layout. When any prop has a group, auto-sort
   * is disabled so the declared order is preserved.
   */
  group?: string;
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
  /**
   * `"side-by-side"` (default) — preview on the left, controls on the right.
   * `"stacked"` — preview takes full width on top, controls collapse into a
   * toggleable panel below. Best for wide components (rich-text, table, kanban).
   */
  layout?: "side-by-side" | "stacked";
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
  const items = useMemo(
    () => options.map((opt) => ({ value: opt, label: opt })),
    [options],
  );
  return (
    <SegmentedControlStyled
      options={items}
      value={value}
      onChange={onChange}
      size="sm"
    />
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <SwitchStyled
      checked={value}
      onChange={onChange}
      size="sm"
    />
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
  layout = "side-by-side",
}: PropPlaygroundProps) {
  const initial = useMemo(() => {
    const o: Record<string, string | number | boolean> = {};
    for (const p of props) o[p.name] = p.defaultValue;
    return o;
  }, [props]);

  const [values, setValues] = useState(initial);
  const [controlsOpen, setControlsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showFade, setShowFade] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const overflows = el.scrollHeight > el.clientHeight + 2;
    const atBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 2;
    setShowFade(overflows && !atBottom);
  }, []);

  const groupNames = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const p of props) {
      const g = p.group ?? "Other";
      if (!seen.has(g)) {
        seen.add(g);
        out.push(g);
      }
    }
    return out;
  }, [props]);

  const showTabs = props.some((p) => p.group !== undefined) && groupNames.length > 1;

  useEffect(() => {
    checkScroll();
  }, [values, checkScroll]);

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


  const isStacked = layout === "stacked";

  // In stacked mode: auto-sort toggles → segmented/select → text/slider/color,
  // unless any prop defines a group (which implies intentional ordering).
  const hasGroups = props.some((p) => p.group !== undefined);
  const displayProps = useMemo(() => {
    if (!isStacked || hasGroups) return props;
    const order = (p: PropDef) => {
      if (p.control.type === "toggle") return 0;
      if (p.control.type === "segmented") return 1;
      if (p.control.type === "select") return 2;
      return 3;
    };
    return [...props].sort((a, b) => order(a) - order(b));
  }, [props, isStacked, hasGroups]);

  const renderField = (prop: PropDef) => {
    const value = values[prop.name]!;
    const label = prop.label ?? prop.name;
    return (
      <div className="pp__field" key={prop.name}>
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
          <SelectStyled
            items={prop.control.options.map((opt) => ({ value: opt, label: opt }))}
            value={value as string}
            onChange={(v) => set(prop.name, v as string)}
            size="sm"
          />
        )}
        {prop.control.type === "toggle" && (
          <Toggle value={value as boolean} onChange={(v) => set(prop.name, v)} />
        )}
        {prop.control.type === "text" && (
          <TextInputStyled
            value={value as string}
            placeholder={prop.control.placeholder}
            onChange={(v) => set(prop.name, v)}
            size="sm"
          />
        )}
        {(prop.control.type === "number" || prop.control.type === "slider") && (
          <SliderStyled
            value={value as number}
            min={prop.control.min}
            max={prop.control.max}
            step={prop.control.step ?? 1}
            onChange={(v) => set(prop.name, typeof v === "number" ? v : (v as number[])[0]!)}
            size="sm"
            showValue
          />
        )}
        {prop.control.type === "color" && (
          <ColorInputStyled
            value={value as string}
            onChange={(v) => set(prop.name, v)}
            size="sm"
          />
        )}
      </div>
    );
  };

  const tabItems = useMemo(
    () =>
      groupNames.map((g) => ({
        value: g,
        label: g,
        content: (
          <div className="pp__controls-body">
            {displayProps
              .filter((p) => (p.group ?? "Other") === g)
              .map(renderField)}
          </div>
        ),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [groupNames, displayProps, values],
  );

  return (
    <div className="pp" data-layout={layout}>
      {/* Top: preview (+ controls if side-by-side) */}
      <div className="pp__top">

        {/* Live preview */}
        <div className="pp__preview">
          {render(values)}
        </div>

        {/* Controls — always rendered in side-by-side; toggled in stacked */}
        <div className={`pp__controls${isStacked && !controlsOpen ? " pp__controls--hidden" : ""}`}>
          <div className="pp__controls-header">
            <span>Props</span>
            <ButtonStyled
              size="sm"
              variant="ghost"
              tone="neutral"
              onClick={reset}
              disabled={!isDirty}
              aria-label="Reset to defaults"
            >
              Reset
            </ButtonStyled>
          </div>
          {showTabs ? (
            <div className="pp__controls-tabs">
              <TabsStyled
                tabs={tabItems}
                defaultValue={groupNames[0]}
                size="sm"
                variant="line"
              />
            </div>
          ) : (
            <div className="pp__controls-scroll" ref={scrollRef} onScroll={checkScroll}>
              <div className="pp__controls-body">
                {displayProps.map((prop, idx) => {
                  const prevGroup = idx > 0 ? displayProps[idx - 1]?.group : undefined;
                  const showGroupHeader = prop.group !== undefined && prop.group !== prevGroup;
                  return (
                    <React.Fragment key={prop.name}>
                      {showGroupHeader && (
                        <div className="pp__group-header" aria-hidden="true">{prop.group}</div>
                      )}
                      {renderField(prop)}
                    </React.Fragment>
                  );
                })}
              </div>
              {showFade && <div className="pp__controls-fade" aria-hidden="true" />}
            </div>
          )}
        </div>
      </div>

      {/* Stacked layout: toggle bar for controls */}
      {isStacked && (
        <div className="pp__stacked-bar">
          <ButtonStyled
            variant="ghost"
            tone="neutral"
            size="sm"
            onClick={() => setControlsOpen((o) => !o)}
            aria-expanded={controlsOpen}
            className="pp__stacked-toggle"
            iconLeft={
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M1 3h10M3 6h6M5 9h2" />
              </svg>
            }
            iconRight={
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="pp__stacked-chevron" data-open={controlsOpen ? "true" : undefined}>
                <path d="M2 3.5l3 3 3-3" />
              </svg>
            }
          >
            Props
          </ButtonStyled>
          {isDirty && (
            <ButtonStyled size="sm" variant="ghost" tone="neutral" onClick={reset}>
              Reset
            </ButtonStyled>
          )}
        </div>
      )}

      {/* Bottom: code block */}
      <div className="pp__code-wrap">
        <div className="pp__code-header">
          <div className="pp__code-header-left">
            <span className="pp__code-lang">TSX</span>
          </div>
          <CopyButtonStyled
            text={fullCode}
            size="sm"
            variant="ghost"
            className="pp__copy"
          />
        </div>
        <HighlightedCode source={fullCode} />
      </div>

      {/* CSS lives in global.css — no inline style needed */}
      {false && <style>{`
        .pp {
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: clip;
          background: var(--bg-elevated);
        }
        /* ── side-by-side (default) ── */
        .pp__top {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 240px;
        }
        @media (max-width: 860px) {
          .pp__top { grid-template-columns: 1fr; }
        }
        .pp__preview {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1.5rem;
          background: radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--accent) 6%, transparent), transparent 70%), var(--bg-subtle);
          overflow-x: auto;
          min-width: 0;
          position: sticky;
          top: calc(var(--header-height) + 0.5rem);
          align-self: start;
          min-height: 240px;
        }
        @media (max-width: 860px) {
          .pp__preview {
            position: static;
            border-bottom: 1px solid var(--border);
          }
          .pp__controls { border-left: none; }
        }

        /* ── stacked layout ── */
        .pp[data-layout="stacked"] .pp__top {
          grid-template-columns: 1fr;
          min-height: 0;
        }
        .pp[data-layout="stacked"] .pp__preview {
          position: static;
          align-self: auto;
          border-right: none;
          border-bottom: 1px solid var(--border);
          align-items: flex-start;
          justify-content: flex-start;
          min-height: 280px;
          padding: 1.5rem;
        }
        .pp[data-layout="stacked"] .pp__controls {
          border-top: none;
          border-left: none;
        }
        .pp__controls--hidden {
          display: none;
        }
        /* Stacked toggle bar */
        .pp__stacked-bar {
          display: none;
        }
        .pp[data-layout="stacked"] .pp__stacked-bar {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.45rem 1rem;
          border-bottom: 1px solid var(--border);
          background: var(--bg-subtle);
        }
        .pp__stacked-toggle {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.78rem;
          font-weight: 500;
          color: var(--fg-muted);
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          transition: color 140ms ease, background 140ms ease;
        }
        .pp__stacked-toggle:hover { color: var(--fg); background: var(--bg-elevated); }
        .pp__stacked-chevron {
          transition: transform 200ms cubic-bezier(0.32, 0.72, 0, 1);
        }
        .pp__stacked-chevron[data-open="true"] { transform: rotate(180deg); }
        .pp__reset--inline {
          margin-left: auto;
          font-size: 0.72rem;
          font-weight: 500;
          color: var(--fg-subtle);
          background: transparent;
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 2px 8px;
          cursor: pointer;
          transition: color 140ms ease, border-color 140ms ease;
        }
        .pp__reset--inline:hover { color: var(--fg); border-color: var(--border-strong); }
        @media (max-width: 480px) {
          .pp__preview { padding: 1.25rem 0.85rem; }
          .pp__controls-body { padding: 0.65rem 0.85rem; gap: 0.7rem; }
          .pp__code-header { padding: 0.4rem 0.85rem; }
          .pp-code { padding: 0.85rem 1rem; font-size: 0.74rem; }
        }
        .pp__controls {
          display: flex;
          flex-direction: column;
          background: var(--bg-elevated);
          min-width: 0;
          border-left: 1px solid var(--border);
        }
        .pp__controls-scroll {
          position: relative;
          flex: 1;
          overflow-y: auto;
          max-height: 480px;
          scrollbar-width: thin;
          scrollbar-color: transparent transparent;
          transition: scrollbar-color 200ms ease;
        }
        .pp__controls-scroll:hover {
          scrollbar-color: var(--border) transparent;
        }
        /* Fade-out gradient — signals more props to scroll */
        .pp__controls-fade {
          position: sticky;
          bottom: 0;
          left: 0;
          right: 0;
          display: block;
          height: 48px;
          margin-top: -48px;
          background: linear-gradient(to bottom, transparent, var(--bg-elevated) 85%);
          pointer-events: none;
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
          /* Show all controls without forcing a scrollbar — the preview will
             stretch to match. */
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
          max-width: 100%;
          overflow: hidden;
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

        /* Code block — always dark, like shadcn/Radix */
        .pp__code-wrap {
          border-top: 1px solid var(--border);
          background: #0d0d0f;
        }
        .pp__code-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.45rem 1rem;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          background: #0d0d0f;
        }
        .pp__code-header-left {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .pp__code-lang {
          font-size: 10px;
          font-weight: 600;
          font-family: "JetBrains Mono", monospace;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.25);
        }
        .pp__copy {
          font: inherit;
          font-size: 11px;
          font-weight: 500;
          padding: 3px 10px;
          border-radius: 5px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.45);
          cursor: pointer;
          transition: background 140ms ease, color 140ms ease, border-color 140ms ease;
          letter-spacing: 0.02em;
        }
        .pp__copy:hover {
          background: rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.75);
          border-color: rgba(255,255,255,0.18);
        }
        .pp__copy[data-copied="true"] {
          background: rgba(74, 222, 128, 0.12);
          color: #4ade80;
          border-color: rgba(74, 222, 128, 0.25);
        }
        .pp-code {
          margin: 0;
          padding: 1.1rem 1.25rem;
          font-size: 0.79rem;
          line-height: 1.75;
          font-family: "JetBrains Mono", ui-monospace, monospace;
          overflow-x: auto;
          background: #0d0d0f;
          border: none;
          border-radius: 0;
          white-space: pre;
          /* always-dark token palette */
          --tok-keyword:   #c084fc;
          --tok-comp:      #93c5fd;
          --tok-tag-punct: #6b7280;
          --tok-attr:      #fdba74;
          --tok-string:    #86efac;
          --tok-number:    #67e8f9;
          --tok-boolean:   #67e8f9;
          --tok-comment:   #4b5563;
          --tok-expr:      #fcd34d;
          --tok-plain:     #e2e8f0;
        }
        .pp-code .tok-keyword   { color: var(--tok-keyword); }
        .pp-code .tok-comp      { color: var(--tok-comp); }
        .pp-code .tok-tag-punct { color: var(--tok-tag-punct); }
        .pp-code .tok-attr      { color: var(--tok-attr); }
        .pp-code .tok-string    { color: var(--tok-string); }
        .pp-code .tok-number    { color: var(--tok-number); }
        .pp-code .tok-boolean   { color: var(--tok-boolean); }
        .pp-code .tok-comment   { color: var(--tok-comment); font-style: italic; }
        .pp-code .tok-expr      { color: var(--tok-expr); }
        .pp-code .tok-plain     { color: var(--tok-plain); }
      `}</style>}
    </div>
  );
}
