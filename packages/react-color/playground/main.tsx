import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  type HsvaColor,
  hsvaToHex,
  hsvaToHsla,
  hsvaToRgba,
  useColorPicker,
} from "../src";
import { HexColorPicker, HslaColorPicker, RgbaColorPicker } from "../src/styled";
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

function ColorValueDisplay({ hsva }: { hsva: HsvaColor }) {
  const hex = hsvaToHex(hsva);
  const rgba = hsvaToRgba(hsva);
  const hsla = hsvaToHsla(hsva);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, fontFamily: "JetBrains Mono, monospace" }}>
      <div style={{ color: "var(--fg-muted)" }}>
        HEX: <span style={{ color: "var(--fg)", fontWeight: 500 }}>{hex.toUpperCase()}</span>
      </div>
      <div style={{ color: "var(--fg-muted)" }}>
        RGB: <span style={{ color: "var(--fg)", fontWeight: 500 }}>
          {rgba.r}, {rgba.g}, {rgba.b}
          {rgba.a < 1 ? `, ${rgba.a}` : ""}
        </span>
      </div>
      <div style={{ color: "var(--fg-muted)" }}>
        HSL: <span style={{ color: "var(--fg)", fontWeight: 500 }}>
          {Math.round(hsla.h)}°, {Math.round(hsla.s)}%, {Math.round(hsla.l)}%
        </span>
      </div>
    </div>
  );
}

function LivePicker() {
  const [hex, setHex] = useState("#6366f1");
  const hsva = { ...useColorPicker({ value: hex, onChange: (h) => setHex(hsvaToHex(h)) }).hsva };

  return (
    <article className="example example--full">
      <header className="example__header">
        <h3 className="example__title">Live playground</h3>
        <p className="example__description">
          Drag the saturation field, the hue strip, or type a hex value. Zero
          dependencies — all color math happens in this package.
        </p>
      </header>

      <div className="picker" style={{ padding: "2rem 1.5rem" }}>
        <div className="picker__preview" style={{ gap: "1.5rem", flexDirection: "row", flexWrap: "wrap", justifyContent: "center", alignItems: "flex-start" }}>
          <HexColorPicker value={hex} onChange={setHex} />
          <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 160 }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 12,
                background: hex,
                boxShadow: "0 4px 16px -4px rgba(0,0,0,0.2)",
              }}
            />
            <ColorValueDisplay hsva={hsva} />
          </div>
        </div>
      </div>
    </article>
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
    document.documentElement.dataset.rcpTheme = theme;
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div className="app">
      <ThemeToggle theme={theme} onToggle={() => setTheme(t => t === "light" ? "dark" : "light")} />

      <header className="hero">
        <span className="hero__badge">
          <span className="hero__badge-dot" />
          v0.1.0 — drop-in replacement for react-color
        </span>
        <h1>react-color</h1>
        <p>
          Tiny, modern color picker for React. Zero dependencies, ~11 KB
          (vs 37 KB). TypeScript-first, SSR-safe. Drop-in for react-color.
        </p>
        <div className="hero__install">
          <span className="hero__install-prompt">$</span>
          <span>npm install @mshafiqyajid/react-color</span>
        </div>
      </header>

      <LivePicker />

      <div className="section-heading">
        <h2>Picker variants</h2>
        <p>HexColorPicker · RgbaColorPicker · HslaColorPicker</p>
      </div>

      <div className="examples">
        <Example
          title="HexColorPicker"
          description="Outputs a hex string. The simplest drop-in for the classic react-color API."
          demo={
            <HexColorPicker
              defaultValue="#ec4899"
              onChange={(hex) => console.log("hex:", hex)}
            />
          }
          code={
            <code>
              <span className="tok-keyword">import</span>{" "}
              {"{ "}
              <span className="tok-comp">HexColorPicker</span>
              {" }"}{" "}
              <span className="tok-keyword">from</span>{" "}
              <span className="tok-string">"@mshafiqyajid/react-color/styled"</span>
              ;{"\n\n"}
              {"<"}
              <span className="tok-comp">HexColorPicker</span>
              {"\n  "}
              <span className="tok-attr">value</span>={"{color}"}
              {"\n  "}
              <span className="tok-attr">onChange</span>={"{setColor}"}
              {"\n/>"}
            </code>
          }
        />

        <Example
          title="With alpha channel"
          description="showAlpha adds a checkerboard alpha slider. The hex output includes an alpha suffix when a < 1."
          demo={
            <HexColorPicker
              defaultValue="#16a34a"
              showAlpha
              onChange={(hex) => console.log("hexa:", hex)}
            />
          }
          code={
            <code>
              {"<"}
              <span className="tok-comp">HexColorPicker</span>
              {"\n  "}
              <span className="tok-attr">value</span>={"{color}"}
              {"\n  "}
              <span className="tok-attr">showAlpha</span>
              {"\n/>"}
            </code>
          }
        />

        <Example
          title="RgbaColorPicker"
          description="Outputs { r, g, b, a }. Useful when feeding values into canvas or CSS-in-JS."
          demo={
            <RgbaColorPicker
              defaultValue={{ r: 220, g: 38, b: 38, a: 1 }}
              onChange={(rgba) => console.log("rgba:", rgba)}
            />
          }
          code={
            <code>
              {"<"}
              <span className="tok-comp">RgbaColorPicker</span>
              {"\n  "}
              <span className="tok-attr">value</span>={"{rgba}"}
              {"\n  "}
              <span className="tok-attr">onChange</span>={"{setRgba}"}
              {"\n/>"}
            </code>
          }
        />

        <Example
          title="HslaColorPicker"
          description="Outputs { h, s, l, a }. Great for design systems that work in HSL."
          demo={
            <HslaColorPicker
              defaultValue={{ h: 262, s: 83, l: 58, a: 1 }}
              onChange={(hsla) => console.log("hsla:", hsla)}
            />
          }
          code={
            <code>
              {"<"}
              <span className="tok-comp">HslaColorPicker</span>
              {"\n  "}
              <span className="tok-attr">value</span>={"{hsla}"}
              {"\n  "}
              <span className="tok-attr">onChange</span>={"{setHsla}"}
              {"\n/>"}
            </code>
          }
        />

        <Example
          title="No hex input"
          description="Hide the text field for a compact inline picker."
          demo={
            <HexColorPicker
              defaultValue="#f59e0b"
              showHexInput={false}
            />
          }
          code={
            <code>
              {"<"}
              <span className="tok-comp">HexColorPicker</span>
              {"\n  "}
              <span className="tok-attr">showHexInput</span>={"{false}"}
              {"\n/>"}
            </code>
          }
        />
      </div>

      <div className="section-heading">
        <h2>Headless</h2>
        <p>Bring your own UI using the hook and primitives.</p>
      </div>

      <div className="examples">
        <Example
          title="useColorPicker hook"
          description="Full control — hook provides saturationFieldProps, hueSliderProps, alphaSliderProps, sbPosition, hsva."
          demo={<HeadlessExample />}
          code={
            <code>
              <span className="tok-keyword">const</span> picker ={" "}
              <span className="tok-comp">useColorPicker</span>
              {"({ value, onChange });"}{"\n\n"}
              {"<"}
              <span className="tok-comp">SaturationField</span>{" "}
              <span className="tok-attr">picker</span>={"{picker}"}{" />"}
              {"\n"}
              {"<"}
              <span className="tok-comp">HueSlider</span>{" "}
              <span className="tok-attr">picker</span>={"{picker}"}{" />"}
            </code>
          }
        />
      </div>

      <footer className="footer">
        Made by{" "}
        <a href="https://github.com/mshafiqyajid" target="_blank" rel="noreferrer">
          @mshafiqyajid
        </a>
        . MIT licensed. Drop-in replacement for{" "}
        <a href="https://www.npmjs.com/package/react-color" target="_blank" rel="noreferrer">
          react-color
        </a>
        .
      </footer>
    </div>
  );
}

function HeadlessExample() {
  const [hex, setHex] = useState("#22c55e");
  const picker = useColorPicker({
    value: hex,
    onChange: (h) => setHex(hsvaToHex(h)),
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div
        {...picker.saturationFieldProps}
        style={{
          ...picker.saturationFieldProps.style,
          position: "relative",
          width: 200,
          height: 120,
          borderRadius: 8,
          cursor: "crosshair",
          backgroundImage: "linear-gradient(to right, #fff, transparent), linear-gradient(to top, #000, transparent)",
          overflow: "hidden",
        }}
      >
        <div style={{
          position: "absolute",
          left: `${picker.sbPosition.left}%`,
          top: `${picker.sbPosition.top}%`,
          width: 14,
          height: 14,
          borderRadius: "50%",
          border: "2px solid #fff",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.3)",
          transform: "translate(-50%,-50%)",
          pointerEvents: "none",
        }} />
      </div>
      <div
        {...picker.hueSliderProps}
        style={{
          position: "relative",
          width: 200,
          height: 10,
          borderRadius: 10,
          cursor: "pointer",
          background: "linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)",
        }}
      >
        <div style={{
          position: "absolute",
          left: `${picker.huePosition}%`,
          top: "50%",
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.3)",
          transform: "translate(-50%,-50%)",
          pointerEvents: "none",
        }} />
      </div>
      <div style={{ fontSize: 12, fontFamily: "monospace", color: "var(--fg-muted)" }}>
        → <span style={{ color: hex, fontWeight: 700 }}>{hex.toUpperCase()}</span>
      </div>
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
