import { useState } from "react";
import { HexColorPicker, RgbaColorPicker } from "@mshafiqyajid/react-color/styled";
import { hsvaToRgba, hsvaToHex, toHsva } from "@mshafiqyajid/react-color";
import "@mshafiqyajid/react-color/styles.css";

export default function ColorPickerDemo() {
  const [hex, setHex] = useState("#6366f1");
  const rgba = hsvaToRgba(toHsva(hex));

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 24, padding: "1.5rem", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 12 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <HexColorPicker value={hex} onChange={setHex} />
        <div style={{ display: "flex", gap: 8, fontSize: 12, fontFamily: "JetBrains Mono, monospace", color: "var(--fg-muted)", flexWrap: "wrap" }}>
          <span>HEX: <strong style={{ color: "var(--fg)" }}>{hex.toUpperCase()}</strong></span>
          <span>RGB: <strong style={{ color: "var(--fg)" }}>{rgba.r}, {rgba.g}, {rgba.b}</strong></span>
        </div>
        <div style={{ width: 60, height: 60, borderRadius: 10, background: hex, boxShadow: "0 4px 14px -4px rgba(0,0,0,0.25)" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <p style={{ fontSize: 13, color: "var(--fg-muted)", margin: 0 }}>With alpha slider</p>
        <HexColorPicker defaultValue="#16a34a" showAlpha />
      </div>
    </div>
  );
}
