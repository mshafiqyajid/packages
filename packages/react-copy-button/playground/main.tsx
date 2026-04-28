import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { CopyButton, useCopyToClipboard } from "../src";
import {
  CopyButtonStyled,
  type CopyButtonSize,
  type CopyButtonTone,
  type CopyButtonVariant,
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

function HookExample() {
  const { copy, copied } = useCopyToClipboard({ resetAfter: 1500 });
  return (
    <button
      type="button"
      className="hl-button"
      data-copied={copied ? "true" : undefined}
      onClick={() => void copy("hello from the hook")}
    >
      {copied ? "Copied ✓" : "Copy via hook"}
    </button>
  );
}

const VARIANTS: CopyButtonVariant[] = ["solid", "outline", "ghost", "subtle"];
const SIZES: CopyButtonSize[] = ["sm", "md", "lg", "icon"];
const TONES: CopyButtonTone[] = ["neutral", "primary", "success", "danger"];

function LivePicker() {
  const [variant, setVariant] = useState<CopyButtonVariant>("solid");
  const [size, setSize] = useState<CopyButtonSize>("md");
  const [tone, setTone] = useState<CopyButtonTone>("primary");
  const [iconPosition, setIconPosition] = useState<"left" | "right">("left");
  const [icon, setIcon] = useState(true);
  const [fullWidth, setFullWidth] = useState(false);
  const [tooltip, setTooltip] = useState(true);
  const [radius, setRadius] = useState(8);
  const [paddingX, setPaddingX] = useState(15);
  const [paddingY, setPaddingY] = useState(8);

  const cssVars = useMemo<React.CSSProperties>(
    () => ({
      ["--rcb-radius" as string]: `${radius}px`,
      ["--rcb-padding-x" as string]: `${paddingX}px`,
      ["--rcb-padding-y" as string]: `${paddingY}px`,
    }),
    [radius, paddingX, paddingY],
  );

  const labelText = size === "icon" ? "" : "Copy snippet";

  return (
    <article className="example example--full">
      <header className="example__header">
        <h3 className="example__title">Live playground</h3>
        <p className="example__description">
          Tweak the props in real time. Every option below maps 1:1 to a prop
          or a CSS variable.
        </p>
      </header>

      <div className="picker">
        <div className="picker__controls">
          <Field label="Variant">
            <Segmented
              options={VARIANTS}
              value={variant}
              onChange={setVariant}
            />
          </Field>
          <Field label="Size">
            <Segmented options={SIZES} value={size} onChange={setSize} />
          </Field>
          <Field label="Tone">
            <Segmented options={TONES} value={tone} onChange={setTone} />
          </Field>
          <Field label="Icon position">
            <Segmented
              options={["left", "right"] as const}
              value={iconPosition}
              onChange={setIconPosition}
            />
          </Field>
          <Field label="Icon">
            <Toggle checked={icon} onChange={setIcon} />
          </Field>
          <Field label="Full width">
            <Toggle checked={fullWidth} onChange={setFullWidth} />
          </Field>
          <Field label="Tooltip">
            <Toggle checked={tooltip} onChange={setTooltip} />
          </Field>
          <Field label={`Radius — ${radius}px`}>
            <input
              type="range"
              min={0}
              max={24}
              value={radius}
              onChange={(e) => setRadius(+e.target.value)}
              className="picker__slider"
            />
          </Field>
          <Field label={`Padding X — ${paddingX}px`}>
            <input
              type="range"
              min={4}
              max={32}
              value={paddingX}
              onChange={(e) => setPaddingX(+e.target.value)}
              className="picker__slider"
            />
          </Field>
          <Field label={`Padding Y — ${paddingY}px`}>
            <input
              type="range"
              min={2}
              max={20}
              value={paddingY}
              onChange={(e) => setPaddingY(+e.target.value)}
              className="picker__slider"
            />
          </Field>
        </div>

        <div className="picker__preview">
          <CopyButtonStyled
            text="snippet copied via the live picker"
            label={labelText}
            variant={variant}
            size={size}
            tone={tone}
            icon={icon}
            iconPosition={iconPosition}
            fullWidth={fullWidth}
            tooltip={tooltip ? "Copy snippet" : undefined}
            aria-label={size === "icon" ? "Copy snippet" : undefined}
            style={cssVars}
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
    document.documentElement.dataset.rcbTheme = theme;
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
        <h1>react-copy-button</h1>
        <p>
          A tiny, headless copy-to-clipboard hook and a beautifully styled
          button primitive for React. Zero dependencies, SSR-safe, fully typed.
        </p>
        <div className="hero__install">
          <span className="hero__install-prompt">$</span>
          <span>npm install @shafiqyajid/react-copy-button</span>
        </div>
      </header>

      <LivePicker />

      <div className="section-heading">
        <h2>Variants</h2>
        <p>solid · outline · ghost · subtle.</p>
      </div>

      <div className="examples examples--row">
        <CopyButtonStyled text="solid" variant="solid" tone="primary" label="Solid" />
        <CopyButtonStyled text="outline" variant="outline" tone="primary" label="Outline" />
        <CopyButtonStyled text="ghost" variant="ghost" tone="primary" label="Ghost" />
        <CopyButtonStyled text="subtle" variant="subtle" tone="primary" label="Subtle" />
      </div>

      <div className="section-heading">
        <h2>Sizes</h2>
        <p>sm · md · lg · icon.</p>
      </div>

      <div className="examples examples--row examples--align-center">
        <CopyButtonStyled text="sm" size="sm" label="Small" />
        <CopyButtonStyled text="md" size="md" label="Medium" />
        <CopyButtonStyled text="lg" size="lg" label="Large" />
        <CopyButtonStyled
          text="icon"
          size="icon"
          tooltip="Copy"
          aria-label="Copy"
        />
      </div>

      <div className="section-heading">
        <h2>Tones</h2>
        <p>neutral · primary · success · danger.</p>
      </div>

      <div className="examples examples--row">
        <CopyButtonStyled text="n" tone="neutral" label="Neutral" />
        <CopyButtonStyled text="p" tone="primary" label="Primary" />
        <CopyButtonStyled text="s" tone="success" label="Success" />
        <CopyButtonStyled text="d" tone="danger" label="Danger" />
      </div>

      <div className="section-heading">
        <h2>States &amp; extras</h2>
        <p>Async source, tooltip, custom icon, loading.</p>
      </div>

      <div className="examples">
        <Example
          title="Async source (auto loading)"
          description="Pass an async function — the spinner appears while it resolves."
          demo={
            <CopyButtonStyled
              tone="primary"
              text={async () => {
                await new Promise((r) => setTimeout(r, 700));
                return `token-${Math.random().toString(36).slice(2, 10)}`;
              }}
              label="Generate &amp; copy"
            />
          }
          code={
            <code>
              {"<"}
              <span className="tok-comp">CopyButtonStyled</span>{"\n  "}
              <span className="tok-attr">text</span>={"{"}
              <span className="tok-keyword">async</span> () ={">"}{" "}
              <span className="tok-comp">fetchToken</span>()
              {"}"}
              {"\n  "}
              <span className="tok-attr">label</span>=
              <span className="tok-string">"Generate"</span>
              {"\n/>"}
            </code>
          }
        />

        <Example
          title="Tooltip"
          description="Shows on hover and keyboard focus."
          demo={
            <CopyButtonStyled
              text="tooltip"
              tone="neutral"
              tooltip="Copy to clipboard (⌘C)"
              label="Hover me"
            />
          }
          code={
            <code>
              {"<"}
              <span className="tok-comp">CopyButtonStyled</span>{"\n  "}
              <span className="tok-attr">text</span>=
              <span className="tok-string">"hi"</span>
              {"\n  "}
              <span className="tok-attr">tooltip</span>=
              <span className="tok-string">"Copy to clipboard"</span>
              {"\n/>"}
            </code>
          }
        />

        <Example
          title="Custom icons"
          description="Pass your own copy/check icons."
          demo={
            <CopyButtonStyled
              text="custom-icons"
              tone="primary"
              icon={{
                copy: <span style={{ fontSize: "1em" }}>📋</span>,
                check: <span style={{ fontSize: "1em" }}>🎉</span>,
              }}
              label="Custom"
            />
          }
          code={
            <code>
              {"<"}
              <span className="tok-comp">CopyButtonStyled</span>{"\n  "}
              <span className="tok-attr">text</span>=
              <span className="tok-string">"x"</span>
              {"\n  "}
              <span className="tok-attr">icon</span>={"{{ copy: ..., check: ... }}"}
              {"\n/>"}
            </code>
          }
        />
      </div>

      <div className="section-heading">
        <h2>Headless</h2>
        <p>Bring your own UI. The package handles the logic.</p>
      </div>

      <div className="examples">
        <Example
          title="useCopyToClipboard hook"
          description="copy(), copied, error, reset."
          demo={<HookExample />}
          code={
            <code>
              <span className="tok-keyword">const</span> {"{ "}copy, copied{" }"}{" "}
              ={" "}
              <span className="tok-comp">useCopyToClipboard</span>();
            </code>
          }
        />

        <Example
          title="<CopyButton> render-prop"
          description="Headless component with a function child."
          demo={
            <CopyButton text="render-prop value">
              {({ copied, copy }) => (
                <button
                  type="button"
                  className="hl-button"
                  data-copied={copied ? "true" : undefined}
                  onClick={copy}
                >
                  {copied ? "Done ✓" : "Render-prop"}
                </button>
              )}
            </CopyButton>
          }
          code={
            <code>
              {"<"}
              <span className="tok-comp">CopyButton</span>{" "}
              <span className="tok-attr">text</span>=
              <span className="tok-string">"v"</span>
              {">"}
              {"\n  "}
              {"{({ copied, copy }) => (...)}"}
              {"\n</"}
              <span className="tok-comp">CopyButton</span>
              {">"}
            </code>
          }
        />
      </div>

      <footer className="footer">
        Made by{" "}
        <a href="https://github.com/mshafiqyajid" target="_blank" rel="noreferrer">
          @shafiqyajid
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
