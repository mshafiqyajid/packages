import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { OTPInput, useOTP } from "../src";
import {
  OTPInputStyled,
  type OTPSize,
  type OTPTone,
  type OTPVariant,
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

const VARIANTS: OTPVariant[] = ["solid", "outline", "underline"];
const SIZES: OTPSize[] = ["sm", "md", "lg"];
const TONES: OTPTone[] = ["neutral", "primary", "success", "danger"];

function LivePicker() {
  const [variant, setVariant] = useState<OTPVariant>("solid");
  const [size, setSize] = useState<OTPSize>("md");
  const [tone, setTone] = useState<OTPTone>("primary");
  const [length, setLength] = useState(6);
  const [groupSize, setGroupSize] = useState(0);
  const [mask, setMask] = useState(false);
  const [pattern, setPattern] = useState<"numeric" | "alphanumeric">("numeric");
  const [completed, setCompleted] = useState<string | null>(null);

  return (
    <article className="example example--full">
      <header className="example__header">
        <h3 className="example__title">Live playground</h3>
        <p className="example__description">
          Tweak each prop in real time. Type or paste to see all the
          interactions — paste a long string to watch slots auto-fill.
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
          <Field label="Pattern">
            <Segmented
              options={["numeric", "alphanumeric"] as const}
              value={pattern}
              onChange={setPattern}
            />
          </Field>
          <Field label={`Length — ${length}`}>
            <input
              type="range"
              min={3}
              max={8}
              value={length}
              onChange={(e) => {
                setLength(+e.target.value);
                setCompleted(null);
              }}
              className="picker__slider"
            />
          </Field>
          <Field label={`Group size — ${groupSize === 0 ? "none" : groupSize}`}>
            <input
              type="range"
              min={0}
              max={Math.floor(length / 2)}
              value={groupSize}
              onChange={(e) => setGroupSize(+e.target.value)}
              className="picker__slider"
            />
          </Field>
          <Field label="Mask">
            <Toggle checked={mask} onChange={setMask} />
          </Field>
        </div>

        <div className="picker__preview">
          <OTPInputStyled
            key={`${length}-${pattern}`}
            length={length}
            variant={variant}
            size={size}
            tone={tone}
            mask={mask}
            pattern={pattern}
            groupSize={groupSize === 0 ? undefined : groupSize}
            label="Verification code"
            hint={
              completed
                ? `Completed: ${completed}`
                : "Type, or paste a code"
            }
            onComplete={(code) => setCompleted(code)}
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
  const { slots, value, isComplete, clear } = useOTP({
    length: 4,
    onComplete: (code) => console.log("Complete:", code),
  });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
      <div style={{ display: "flex", gap: 6 }}>
        {slots.map((slot) => (
          <input
            key={slot.index}
            {...slot.inputProps}
            style={{
              width: 40,
              height: 40,
              fontSize: 18,
              textAlign: "center",
              border: "2px solid var(--border-strong)",
              borderRadius: 6,
              outline: "none",
              background: "var(--bg-elevated)",
              color: "var(--fg)",
              fontFamily: "JetBrains Mono, monospace",
            }}
          />
        ))}
      </div>
      <div style={{ fontSize: 12, color: "var(--fg-muted)" }}>
        value: <code>{value || "<empty>"}</code> · {isComplete ? "✓ complete" : "incomplete"}
      </div>
      <button
        type="button"
        onClick={clear}
        style={{
          font: "inherit",
          fontSize: 12,
          padding: "4px 10px",
          border: "1px solid var(--border-strong)",
          borderRadius: 6,
          background: "var(--bg-elevated)",
          color: "var(--fg)",
          cursor: "pointer",
        }}
      >
        Clear
      </button>
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
    document.documentElement.dataset.rotpTheme = theme;
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
        <h1>react-otp-input</h1>
        <p>
          Headless OTP / verification-code input hook and styled component
          for React. Smart paste, full keyboard nav, themable, SSR-safe,
          fully typed.
        </p>
        <div className="hero__install">
          <span className="hero__install-prompt">$</span>
          <span>npm install @mshafiqyajid/react-otp-input</span>
        </div>
      </header>

      <LivePicker />

      <div className="section-heading">
        <h2>Variants</h2>
        <p>solid · outline · underline.</p>
      </div>

      <div className="examples examples--row examples--align-center">
        <OTPInputStyled length={4} variant="solid"     tone="primary" defaultValue="12" />
        <OTPInputStyled length={4} variant="outline"   tone="primary" defaultValue="12" />
        <OTPInputStyled length={4} variant="underline" tone="primary" defaultValue="12" />
      </div>

      <div className="section-heading">
        <h2>Sizes</h2>
        <p>sm · md · lg.</p>
      </div>

      <div className="examples examples--row examples--align-center">
        <OTPInputStyled length={4} size="sm" defaultValue="12" />
        <OTPInputStyled length={4} size="md" defaultValue="12" />
        <OTPInputStyled length={4} size="lg" defaultValue="12" />
      </div>

      <div className="section-heading">
        <h2>States &amp; extras</h2>
        <p>Group separators, masking, error.</p>
      </div>

      <div className="examples">
        <Example
          title="Group separator"
          description="Insert a divider after every N slots — easier to scan long codes."
          demo={
            <OTPInputStyled
              length={6}
              groupSize={3}
              tone="primary"
              defaultValue="123"
            />
          }
          code={
            <code>
              {"<"}
              <span className="tok-comp">OTPInputStyled</span>{"\n  "}
              <span className="tok-attr">length</span>={"{6}"}
              {"\n  "}
              <span className="tok-attr">groupSize</span>={"{3}"}
              {"\n/>"}
            </code>
          }
        />

        <Example
          title="Masked"
          description="Hide the typed character — useful for sensitive secrets."
          demo={
            <OTPInputStyled length={6} mask defaultValue="1234" tone="neutral" />
          }
          code={
            <code>
              {"<"}
              <span className="tok-comp">OTPInputStyled</span>{"\n  "}
              <span className="tok-attr">length</span>={"{6}"}
              {"\n  "}
              <span className="tok-attr">mask</span>
              {"\n/>"}
            </code>
          }
        />

        <Example
          title="Error state"
          description="Pass an `error` to flip the tone, set aria-invalid, and shake."
          demo={
            <OTPInputStyled
              length={6}
              defaultValue="123456"
              error="That code is incorrect."
            />
          }
          code={
            <code>
              {"<"}
              <span className="tok-comp">OTPInputStyled</span>{"\n  "}
              <span className="tok-attr">length</span>={"{6}"}
              {"\n  "}
              <span className="tok-attr">error</span>=
              <span className="tok-string">"That code is incorrect."</span>
              {"\n/>"}
            </code>
          }
        />

        <Example
          title="Alphanumeric"
          description="Accept letters and numbers. Auto-uppercases by default."
          demo={
            <OTPInputStyled
              length={6}
              pattern="alphanumeric"
              tone="primary"
            />
          }
          code={
            <code>
              {"<"}
              <span className="tok-comp">OTPInputStyled</span>{"\n  "}
              <span className="tok-attr">length</span>={"{6}"}
              {"\n  "}
              <span className="tok-attr">pattern</span>=
              <span className="tok-string">"alphanumeric"</span>
              {"\n/>"}
            </code>
          }
        />
      </div>

      <div className="section-heading">
        <h2>Headless</h2>
        <p>Bring your own UI. The hook handles the logic.</p>
      </div>

      <div className="examples">
        <Example
          title="useOTP hook"
          description="slots[i].inputProps spreads onto your <input />. value and isComplete are derived."
          demo={<HookExample />}
          code={
            <code>
              <span className="tok-keyword">const</span> {"{ "}slots, value, isComplete, clear{" }"}{"\n  "}
              = <span className="tok-comp">useOTP</span>({"{ length: 4 }"});
              {"\n\n"}
              {"slots.map((s) => "}
              <span className="tok-comp">{"<input"}</span>{" "}{"{...s.inputProps} "}
              <span className="tok-comp">{"/>"}</span>
              {")"}
            </code>
          }
        />

        <Example
          title="Headless <OTPInput>"
          description="Same as the styled version, just unstyled. You control the look."
          demo={
            <OTPInput
              length={4}
              defaultValue="12"
              style={{ display: "flex", gap: 6 }}
              inputProps={{
                style: {
                  width: 40,
                  height: 40,
                  textAlign: "center",
                  fontSize: 18,
                  border: "2px solid var(--border-strong)",
                  borderRadius: 6,
                  outline: "none",
                  background: "var(--bg-elevated)",
                  color: "var(--fg)",
                  fontFamily: "JetBrains Mono, monospace",
                },
              }}
            />
          }
          code={
            <code>
              {"<"}
              <span className="tok-comp">OTPInput</span>{"\n  "}
              <span className="tok-attr">length</span>={"{4}"}
              {"\n  "}
              <span className="tok-attr">style</span>={"{{"} display: <span className="tok-string">"flex"</span>, gap: 6 {"}}"}
              {"\n  "}
              <span className="tok-attr">inputProps</span>={"{{"} style: ... {"}}"}
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
