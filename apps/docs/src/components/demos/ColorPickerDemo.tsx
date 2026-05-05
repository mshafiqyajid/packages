import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { HexColorPicker } from "@mshafiqyajid/react-color/styled";
import { hsvaToRgba, toHsva } from "@mshafiqyajid/react-color";
import "@mshafiqyajid/react-color/styles.css";

const PRESET_ROW = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#6366f1", "#a855f7", "#ec4899"];

function LivePicker({ showAlpha, showHexInput, showPresets, disabled, width }: { showAlpha: boolean; showHexInput: boolean; showPresets: boolean; disabled: boolean; width: number }) {
  const [hex, setHex] = useState("#6366f1");
  const rgba = hsvaToRgba(toHsva(hex));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
      <HexColorPicker
        value={hex}
        onChange={setHex}
        showAlpha={showAlpha}
        showHexInput={showHexInput}
        presets={showPresets ? PRESET_ROW : undefined}
        disabled={disabled}
        style={{ ["--rcp-width" as string]: `${width}px` }}
      />
      <div style={{ display: "flex", gap: 12, fontSize: 11, fontFamily: "JetBrains Mono, monospace", color: "var(--fg-muted)" }}>
        <span style={{ color: "var(--fg)", fontWeight: 600 }}>{hex.toUpperCase()}</span>
        <span>rgb({rgba.r},{rgba.g},{rgba.b})</span>
      </div>
    </div>
  );
}

export default function ColorPickerDemo() {
  return (
    <PropPlayground
      componentName="HexColorPicker"
      importLine={`import { HexColorPicker } from "@mshafiqyajid/react-color/styled";\nimport "@mshafiqyajid/react-color/styles.css";`}
      props={[
        { name: "showAlpha",    control: { type: "toggle" },                           defaultValue: false, omitWhen: false },
        { name: "showHexInput", control: { type: "toggle" },                           defaultValue: true,  omitWhen: true },
        { name: "showPresets",  control: { type: "toggle" },                           defaultValue: false, omitWhen: false },
        { name: "disabled",     control: { type: "toggle" },                           defaultValue: false, omitWhen: false },
        { name: "width",        label: "--rcp-width (px)", control: { type: "slider", min: 200, max: 360 }, defaultValue: 240, omitWhen: 240 },
      ]}
      staticProps={{ value: "{color}", onChange: "{setColor}" }}
      render={(v) => (
        <LivePicker
          showAlpha={v.showAlpha as boolean}
          showHexInput={v.showHexInput as boolean}
          showPresets={v.showPresets as boolean}
          disabled={v.disabled as boolean}
          width={v.width as number}
        />
      )}
    />
  );
}
