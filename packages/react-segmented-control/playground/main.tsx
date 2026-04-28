import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { SegmentedControl, useSegmentedControl } from "../src";
import {
  SegmentedControlStyled,
  type SegmentedSize,
  type SegmentedTone,
  type SegmentedVariant,
} from "../src/styled";
import "../src/styled/styles.css";

type Theme = "light" | "dark";

function ThemeToggle({
  theme,
  onToggle,
}: {
  theme: Theme;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={onToggle}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      )}
    </button>
  );
}

function Example({
  title,
  description,
  demo,
  code,
}: {
  title: string;
  description: string;
  demo: React.ReactNode;
  code: React.ReactNode;
}) {
  return (
    <article className="example">
      <header className="example__header">
        <h3 className="example__title">{title}</h3>
        <p className="example__description">{description}</p>
      </header>
      <div className="example__body">
        <div className="example__demo">{demo}</div>
        <pre className="example__code">{code}</pre>
      </div>
    </article>
  );
}

const VARIANTS: SegmentedVariant[] = ["solid", "pill", "underline"];
const SIZES: SegmentedSize[] = ["sm", "md", "lg"];
const TONES: SegmentedTone[] = ["neutral", "primary", "success", "danger"];

function LivePicker() {
  const [variant, setVariant] = useState<SegmentedVariant>("solid");
  const [size, setSize] = useState<SegmentedSize>("md");
  const [tone, setTone] = useState<SegmentedTone>("primary");
  const [fullWidth, setFullWidth] = useState(false);
  const [optionCount, setOptionCount] = useState(3);
  const [value, setValue] = useState("Day");

  const optionPool = ["Day", "Week", "Month", "Quarter", "Year"];
  const options = optionPool.slice(0, optionCount);
  const safeValue = options.includes(value) ? value : options[0]!;

  return (
    <article className="example example--full">
      <header className="example__header">
        <h3 className="example__title">Live playground</h3>
        <p className="example__description">
          Tweak each prop in real time — watch the indicator slide between segments.
        </p>
      </header>

      <div className="picker">
        <div className="picker__controls">
          <Field label="Variant">
            <Segmented options={VARIANTS} value={variant} onChange={setVariant} />
          </Field>
          <Field label="Size">
            <Segmented options={SIZES} value={size} onChange={setSize} />
          </Field>
          <Field label="Tone">
            <Segmented options={TONES} value={tone} onChange={setTone} />
          </Field>
          <Field label="Full width">
            <Toggle checked={fullWidth} onChange={setFullWidth} />
          </Field>
          <Field label={`Options — ${optionCount}`}>
            <input
              type="range"
              min={2}
              max={5}
              value={optionCount}
              onChange={(e) => setOptionCount(+e.target.value)}
              className="picker__slider"
            />
          </Field>
        </div>

        <div className="picker__preview">
          <SegmentedControlStyled
            options={options}
            value={safeValue}
            onChange={setValue}
            variant={variant}
            size={size}
            tone={tone}
            fullWidth={fullWidth}
            label="Time range"
          />
        </div>
      </div>
    </article>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      {children}
    </label>
  );
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (next: T) => void;
}) {
  return (
    <div className="segmented" role="radiogroup">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          role="radio"
          aria-checked={value === opt}
          className="segmented__item"
          data-active={value === opt ? "true" : undefined}
          onClick={() => onChange(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className="toggle"
      data-on={checked ? "true" : undefined}
      onClick={() => onChange(!checked)}
    >
      <span className="toggle__thumb" />
    </button>
  );
}

function HookExample() {
  const sc = useSegmentedControl({
    options: ["Code", "Preview", "Tests"],
  });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
      <div
        {...sc.rootProps}
        style={{
          ...sc.indicatorStyle,
          position: "relative",
          display: "inline-flex",
          gap: 4,
          padding: 4,
          background: "var(--bg-code)",
          border: "1px solid var(--border)",
          borderRadius: 8,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 4,
            bottom: 4,
            left: 0,
            width: "var(--rsc-indicator-width, 0)",
            transform: "translateX(var(--rsc-indicator-x, 0))",
            background: "var(--accent)",
            borderRadius: 6,
            transition:
              "transform 320ms cubic-bezier(0.34, 1.56, 0.64, 1), width 320ms cubic-bezier(0.34, 1.56, 0.64, 1)",
            opacity: "var(--rsc-indicator-ready, 0)",
            zIndex: 0,
          }}
        />
        {sc.options.map((opt) => (
          <button
            key={opt.index}
            {...opt.buttonProps}
            style={{
              position: "relative",
              zIndex: 1,
              background: "transparent",
              border: "none",
              padding: "6px 12px",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 500,
              color: opt.isSelected ? "white" : "var(--fg-muted)",
              cursor: "pointer",
              transition: "color 200ms",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div style={{ fontSize: 12, color: "var(--fg-muted)" }}>
        value: <code>{String(sc.value)}</code>
      </div>
    </div>
  );
}

function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    const saved = window.localStorage.getItem("theme") as Theme | null;
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.rscTheme = theme;
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((t) => (t === "light" ? "dark" : "light"));

  return (
    <div className="app">
      <ThemeToggle theme={theme} onToggle={toggleTheme} />

      <header className="hero">
        <span className="hero__badge">
          <span className="hero__badge-dot" />
          v0.1.0 — public preview
        </span>
        <h1>react-segmented-control</h1>
        <p>
          Headless segmented-control hook and styled component for React with
          a buttery sliding indicator. Full keyboard nav, themable, SSR-safe,
          fully typed.
        </p>
        <div className="hero__install">
          <span className="hero__install-prompt">$</span>
          <span>npm install @mshafiqyajid/react-segmented-control</span>
        </div>
      </header>

      <LivePicker />

      <div className="section-heading">
        <h2>Variants</h2>
        <p>solid · pill · underline.</p>
      </div>

      <div className="examples examples--row examples--align-center">
        <SegmentedControlStyled options={["Day", "Week", "Month"]} variant="solid"     tone="primary" />
        <SegmentedControlStyled options={["Day", "Week", "Month"]} variant="pill"      tone="primary" />
        <SegmentedControlStyled options={["Day", "Week", "Month"]} variant="underline" tone="primary" />
      </div>

      <div className="section-heading">
        <h2>Sizes</h2>
        <p>sm · md · lg.</p>
      </div>

      <div className="examples examples--row examples--align-center">
        <SegmentedControlStyled options={["A", "B", "C"]} size="sm" />
        <SegmentedControlStyled options={["A", "B", "C"]} size="md" />
        <SegmentedControlStyled options={["A", "B", "C"]} size="lg" />
      </div>

      <div className="section-heading">
        <h2>Tones</h2>
        <p>neutral · primary · success · danger.</p>
      </div>

      <div className="examples examples--row examples--align-center">
        <SegmentedControlStyled options={["A", "B", "C"]} tone="neutral" />
        <SegmentedControlStyled options={["A", "B", "C"]} tone="primary" />
        <SegmentedControlStyled options={["A", "B", "C"]} tone="success" />
        <SegmentedControlStyled options={["A", "B", "C"]} tone="danger" />
      </div>

      <div className="section-heading">
        <h2>States &amp; extras</h2>
        <p>Disabled options, full width, custom labels.</p>
      </div>

      <div className="examples">
        <Example
          title="Disabled options"
          description="Skipped by arrow keys, ignores clicks. Other options stay reachable."
          demo={
            <SegmentedControlStyled
              options={[
                "Free",
                { value: "Pro", label: "Pro" },
                { value: "Enterprise", label: "Enterprise", disabled: true },
              ]}
              tone="primary"
            />
          }
          code={
            <code>
              {"<"}
              <span className="tok-comp">SegmentedControlStyled</span>{"\n  "}
              <span className="tok-attr">options</span>={"{["}
              {"\n    "}
              <span className="tok-string">"Free"</span>
              ,{"\n    "}
              {"{ value: "}<span className="tok-string">"Pro"</span>{" }"}
              ,{"\n    "}
              {"{ value: "}<span className="tok-string">"Enterprise"</span>
              {", "}
              <span className="tok-attr">disabled</span>: <span className="tok-keyword">true</span>{" }"}
              {"\n  ]}"}
              {"\n/>"}
            </code>
          }
        />

        <Example
          title="Full width"
          description="Stretches to its container; segments distribute evenly."
          demo={
            <div style={{ width: 380, maxWidth: "100%" }}>
              <SegmentedControlStyled
                options={["Newest", "Top", "Following"]}
                fullWidth
                tone="primary"
              />
            </div>
          }
          code={
            <code>
              {"<"}
              <span className="tok-comp">SegmentedControlStyled</span>{"\n  "}
              <span className="tok-attr">options</span>={"{["}
              <span className="tok-string">"Newest"</span>
              {", "}
              <span className="tok-string">"Top"</span>
              {", "}
              <span className="tok-string">"Following"</span>
              {"]}"}
              {"\n  "}
              <span className="tok-attr">fullWidth</span>
              {"\n/>"}
            </code>
          }
        />

        <Example
          title="Object options with labels"
          description="Pass {value, label} when the rendered text differs from the underlying value."
          demo={
            <SegmentedControlStyled
              options={[
                { value: "asc", label: "↑ Ascending" },
                { value: "desc", label: "↓ Descending" },
              ]}
              tone="success"
            />
          }
          code={
            <code>
              {"<"}
              <span className="tok-comp">SegmentedControlStyled</span>{"\n  "}
              <span className="tok-attr">options</span>={"{["}
              {"\n    "}
              {"{ value: "}<span className="tok-string">"asc"</span>
              {", label: "}<span className="tok-string">"↑ Ascending"</span>{" }"}
              ,{"\n    "}
              {"{ value: "}<span className="tok-string">"desc"</span>
              {", label: "}<span className="tok-string">"↓ Descending"</span>{" }"}
              {"\n  ]}"}
              {"\n/>"}
            </code>
          }
        />
      </div>

      <div className="section-heading">
        <h2>Headless</h2>
        <p>Bring your own UI. Use the hook's CSS vars to animate your own indicator.</p>
      </div>

      <div className="examples">
        <Example
          title="useSegmentedControl"
          description="Spread buttonProps onto your own buttons. The hook hands you indicatorStyle (CSS vars) and rootProps."
          demo={<HookExample />}
          code={
            <code>
              <span className="tok-keyword">const</span> sc = <span className="tok-comp">useSegmentedControl</span>({"{"}
              {"\n  "}options: [<span className="tok-string">"Code"</span>, ...],
              {"\n}"});
              {"\n\n"}
              {"<"}
              <span className="tok-comp">div</span> {"{...sc.rootProps}"} {"\n   style={sc.indicatorStyle}>"}
              {"\n  "}
              {"{sc.options.map(o => <"}
              <span className="tok-comp">button</span>{" "}{"{...o.buttonProps}"}{"></"}<span className="tok-comp">button</span>{">)}"}
              {"\n</"}
              <span className="tok-comp">div</span>
              {">"}
            </code>
          }
        />

        <Example
          title="Headless <SegmentedControl>"
          description="Same as styled, just unstyled. Apply your own className and styles."
          demo={
            <SegmentedControl
              options={["Hour", "Day", "Week"]}
              defaultValue="Day"
              style={{
                display: "inline-flex",
                gap: 4,
                padding: 3,
                background: "var(--bg-code)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                position: "relative",
              }}
              optionProps={{
                style: {
                  position: "relative",
                  zIndex: 1,
                  background: "transparent",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--fg-muted)",
                  cursor: "pointer",
                },
              }}
              showIndicator={false}
            />
          }
          code={
            <code>
              {"<"}
              <span className="tok-comp">SegmentedControl</span>{"\n  "}
              <span className="tok-attr">options</span>={"{["}
              <span className="tok-string">"Hour"</span>
              {", "}
              <span className="tok-string">"Day"</span>
              {", ...]}"}
              {"\n  "}
              <span className="tok-attr">defaultValue</span>=
              <span className="tok-string">"Day"</span>
              {"\n/>"}
            </code>
          }
        />
      </div>

      <footer className="footer">
        Made by{" "}
        <a href="https://github.com/mshafiqyajid" target="_blank" rel="noreferrer">
          @mshafiqyajid
        </a>
        . MIT licensed.
      </footer>
    </div>
  );
}

const container = document.getElementById("root");
if (container) {
  createRoot(container).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
