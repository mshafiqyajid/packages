import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { ColorInputStyled } from "@mshafiqyajid/react-color-input/styled";
import "@mshafiqyajid/react-color-input/styles.css";

const PRESETS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#6366f1", "#a855f7", "#ec4899"];

function ColorInputWrapper({ size, tone, format, showCopyButton, disabled, showAlpha, showPresets, trackRecents }: { size: string; tone: string; format: string; showCopyButton: boolean; disabled: boolean; showAlpha: boolean; showPresets: boolean; trackRecents: boolean }) {
  const [value, setValue] = useState("#6366f1");
  const [recents, setRecents] = useState<string[]>([]);
  return (
    <ColorInputStyled
      value={value}
      onChange={setValue}
      size={size as "sm" | "md" | "lg"}
      tone={tone as "neutral" | "primary" | "danger"}
      format={format as "hex" | "rgb" | "hsl"}
      showCopyButton={showCopyButton}
      showAlpha={showAlpha}
      presets={showPresets ? PRESETS : undefined}
      recentColors={trackRecents ? recents : undefined}
      onRecentColorsChange={trackRecents ? setRecents : undefined}
      label="Color"
      disabled={disabled}
      style={{ width: "100%", maxWidth: 300 } as React.CSSProperties}
    />
  );
}

export default function ColorInputDemo() {
  return (
    <PropPlayground
      componentName="ColorInputStyled"
      importLine={`import { ColorInputStyled } from "@mshafiqyajid/react-color-input/styled";\nimport "@mshafiqyajid/react-color-input/styles.css";`}
      props={[
        { name: "size",           control: { type: "segmented", options: ["sm","md","lg"] as const },           defaultValue: "md",      omitWhen: "md" },
        { name: "tone",           control: { type: "segmented", options: ["neutral","primary","danger"] as const }, defaultValue: "neutral", omitWhen: "neutral" },
        { name: "format",         control: { type: "segmented", options: ["hex","rgb","hsl"] as const },         defaultValue: "hex",     omitWhen: "hex" },
        { name: "showCopyButton", control: { type: "toggle" },                                                   defaultValue: true,      omitWhen: true },
        { name: "showAlpha",      control: { type: "toggle" },                                                   defaultValue: false,     omitWhen: false },
        { name: "showPresets",    control: { type: "toggle" },                                                   defaultValue: false,     omitWhen: false },
        { name: "trackRecents",   label: "recentColors (auto)", control: { type: "toggle" },                    defaultValue: false,     omitWhen: false },
        { name: "disabled",       control: { type: "toggle" },                                                   defaultValue: false,     omitWhen: false },
      ]}
      staticProps={{ value: "{value}", onChange: "{setValue}" }}
      render={(v) => (
        <ColorInputWrapper
          size={v.size as string}
          tone={v.tone as string}
          format={v.format as string}
          showCopyButton={v.showCopyButton as boolean}
          disabled={v.disabled as boolean}
          showAlpha={v.showAlpha as boolean}
          showPresets={v.showPresets as boolean}
          trackRecents={v.trackRecents as boolean}
        />
      )}
    />
  );
}
