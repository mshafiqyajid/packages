import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Rating, useRating } from "../src";
import {
  RatingStyled,
  type RatingSize,
  type RatingTone,
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

const SIZES: RatingSize[] = ["sm", "md", "lg"];
const TONES: RatingTone[] = ["neutral", "primary", "success", "warning", "danger"];

function LivePicker() {
  const [size, setSize] = useState<RatingSize>("md");
  const [tone, setTone] = useState<RatingTone>("warning");
  const [count, setCount] = useState(5);
  const [allowHalf, setAllowHalf] = useState(true);
  const [readOnly, setReadOnly] = useState(false);
  const [showValue, setShowValue] = useState(true);
  const [value, setValue] = useState(3.5);

  return (
    <article className="example example--full">
      <header className="example__header">
        <h3 className="example__title">Live playground</h3>
        <p className="example__description">
          Hover the left half of a star for a half-rating, the right half for a full
          one. Click the active star again to clear.
        </p>
      </header>

      <div className="picker">
        <div className="picker__controls">
          <Field label="Size">
            <Segmented options={SIZES} value={size} onChange={setSize} />
          </Field>
          <Field label="Tone">
            <Segmented options={TONES} value={tone} onChange={setTone} />
          </Field>
          <Field label={`Count — ${count}`}>
            <input
              type="range"
              min={3}
              max={10}
              value={count}
              onChange={(e) => setCount(+e.target.value)}
              className="picker__slider"
            />
          </Field>
          <Field label="Half-step">
            <Toggle checked={allowHalf} onChange={setAllowHalf} />
          </Field>
          <Field label="Read-only">
            <Toggle checked={readOnly} onChange={setReadOnly} />
          </Field>
          <Field label="Show value">
            <Toggle checked={showValue} onChange={setShowValue} />
          </Field>
        </div>

        <div className="picker__preview">
          <RatingStyled
            count={count}
            value={value}
            onChange={setValue}
            size={size}
            tone={tone}
            allowHalf={allowHalf}
            readOnly={readOnly}
            showValue={showValue}
            label="How was it?"
            hint={value === 0 ? "Tap a star to rate" : undefined}
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
  const r = useRating({ count: 5, defaultValue: 0 });
  const labelFor = (v: number): string => {
    if (v === 0) return "—";
    if (v <= 1) return "Poor";
    if (v <= 2) return "Fair";
    if (v <= 3) return "Good";
    if (v <= 4) return "Great";
    return "Excellent";
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
      <div {...r.rootProps} style={{ display: "inline-flex", gap: 4 }}>
        {r.items.map((item) => (
          <span
            key={item.index}
            {...item.itemProps}
            ref={item.itemProps.ref as React.Ref<HTMLSpanElement>}
            style={{
              ...item.style,
              position: "relative",
              width: 28,
              height: 28,
              cursor: "pointer",
              color:
                item.fill === 1
                  ? "var(--accent)"
                  : item.fill === 0.5
                    ? "var(--accent)"
                    : "var(--border-strong)",
            }}
          >
            <span
              style={{
                position: "absolute",
                inset: 0,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                color: "var(--border-strong)",
              }}
            >
              ★
            </span>
            <span
              style={{
                position: "absolute",
                inset: 0,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                color: "var(--accent)",
                clipPath: `inset(0 ${(1 - item.fill) * 100}% 0 0)`,
                transition: "clip-path 120ms ease",
              }}
            >
              ★
            </span>
          </span>
        ))}
      </div>
      <div style={{ fontSize: 13, color: "var(--fg-muted)" }}>
        {r.displayValue.toFixed(1)} — {labelFor(r.displayValue)}
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
    document.documentElement.dataset.rrtTheme = theme;
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
        <h1>react-rating</h1>
        <p>
          Headless star-rating hook and styled component for React. Half-step
          support, hover preview, full keyboard nav, custom icons, themable,
          SSR-safe, fully typed.
        </p>
        <div className="hero__install">
          <span className="hero__install-prompt">$</span>
          <span>npm install @mshafiqyajid/react-rating</span>
        </div>
      </header>

      <LivePicker />

      <div className="section-heading">
        <h2>Sizes</h2>
        <p>sm · md · lg.</p>
      </div>

      <div className="examples examples--row examples--align-center">
        <RatingStyled count={5} defaultValue={3.5} size="sm" />
        <RatingStyled count={5} defaultValue={3.5} size="md" />
        <RatingStyled count={5} defaultValue={3.5} size="lg" />
      </div>

      <div className="section-heading">
        <h2>Tones</h2>
        <p>neutral · primary · success · warning · danger.</p>
      </div>

      <div className="examples examples--row examples--align-center">
        <RatingStyled count={5} defaultValue={4} tone="neutral" />
        <RatingStyled count={5} defaultValue={4} tone="primary" />
        <RatingStyled count={5} defaultValue={4} tone="success" />
        <RatingStyled count={5} defaultValue={4} tone="warning" />
        <RatingStyled count={5} defaultValue={4} tone="danger" />
      </div>

      <div className="section-heading">
        <h2>States &amp; extras</h2>
        <p>Read-only, custom icons, custom count.</p>
      </div>

      <div className="examples">
        <Example
          title="Read-only"
          description="Display a rating without letting users edit it."
          demo={
            <RatingStyled
              count={5}
              value={4.5}
              readOnly
              showValue
              label="Avg. rating"
              hint="Based on 248 reviews"
            />
          }
          code={
            <code>
              {"<"}
              <span className="tok-comp">RatingStyled</span>{"\n  "}
              <span className="tok-attr">count</span>={"{5}"}
              {"\n  "}
              <span className="tok-attr">value</span>={"{4.5}"}
              {"\n  "}
              <span className="tok-attr">readOnly</span>
              {"\n  "}
              <span className="tok-attr">showValue</span>
              {"\n/>"}
            </code>
          }
        />

        <Example
          title="Custom icon (heart)"
          description="Pass any SVG as `icon` — empty + filled layers stack automatically."
          demo={
            <RatingStyled
              count={5}
              defaultValue={3}
              tone="danger"
              icon={
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M12 21s-7-4.35-7-10a4.5 4.5 0 0 1 8-2.83A4.5 4.5 0 0 1 19 11c0 5.65-7 10-7 10z" />
                </svg>
              }
            />
          }
          code={
            <code>
              {"<"}
              <span className="tok-comp">RatingStyled</span>{"\n  "}
              <span className="tok-attr">count</span>={"{5}"}
              {"\n  "}
              <span className="tok-attr">tone</span>=
              <span className="tok-string">"danger"</span>
              {"\n  "}
              <span className="tok-attr">icon</span>={"{"}<span className="tok-comp">{"<svg>...</svg>"}</span>{"}"}
              {"\n/>"}
            </code>
          }
        />

        <Example
          title="Higher count (10 stars)"
          description="More granular ratings (e.g. movie scores out of 10)."
          demo={
            <RatingStyled
              count={10}
              defaultValue={7.5}
              size="sm"
              tone="primary"
              showValue
            />
          }
          code={
            <code>
              {"<"}
              <span className="tok-comp">RatingStyled</span>{"\n  "}
              <span className="tok-attr">count</span>={"{10}"}
              {"\n  "}
              <span className="tok-attr">defaultValue</span>={"{7.5}"}
              {"\n  "}
              <span className="tok-attr">tone</span>=
              <span className="tok-string">"primary"</span>
              {"\n/>"}
            </code>
          }
        />

        <Example
          title="Full-step only"
          description="Disable half-step interaction — clicks always commit a whole star."
          demo={
            <RatingStyled
              count={5}
              defaultValue={4}
              allowHalf={false}
              tone="primary"
              showValue
            />
          }
          code={
            <code>
              {"<"}
              <span className="tok-comp">RatingStyled</span>{"\n  "}
              <span className="tok-attr">count</span>={"{5}"}
              {"\n  "}
              <span className="tok-attr">allowHalf</span>={"{false}"}
              {"\n/>"}
            </code>
          }
        />
      </div>

      <div className="section-heading">
        <h2>Headless</h2>
        <p>Bring your own UI. The hook handles everything.</p>
      </div>

      <div className="examples">
        <Example
          title="useRating hook"
          description="Spread itemProps onto your buttons. Each item exposes a `fill` value 0..1 you can render however you like."
          demo={<HookExample />}
          code={
            <code>
              <span className="tok-keyword">const</span> r = <span className="tok-comp">useRating</span>({"{ count: 5 }"});
              {"\n\n"}
              {"<"}
              <span className="tok-comp">div</span>{" "}{"{...r.rootProps}"}{">"}
              {"\n  "}
              {"{r.items.map((item) => <"}
              <span className="tok-comp">span</span>{" "}{"{...item.itemProps}"}{"></"}<span className="tok-comp">span</span>{">)}"}
              {"\n</"}
              <span className="tok-comp">div</span>
              {">"}
            </code>
          }
        />

        <Example
          title="Headless <Rating>"
          description="Default star icons + the empty/fill layering, but no preset styling."
          demo={
            <Rating
              count={5}
              defaultValue={3.5}
              style={{
                display: "inline-flex",
                gap: 4,
                color: "var(--accent)",
              }}
            />
          }
          code={
            <code>
              {"<"}
              <span className="tok-comp">Rating</span>{"\n  "}
              <span className="tok-attr">count</span>={"{5}"}
              {"\n  "}
              <span className="tok-attr">defaultValue</span>={"{3.5}"}
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
