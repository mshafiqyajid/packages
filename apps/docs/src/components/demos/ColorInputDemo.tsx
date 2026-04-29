import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { ColorInputStyled } from "@mshafiqyajid/react-color-input/styled";
import "@mshafiqyajid/react-color-input/styles.css";

function ColorInputWrapper({ size, tone, format, showCopyButton, disabled, showAlpha }: { size: string; tone: string; format: string; showCopyButton: boolean; disabled: boolean; showAlpha: boolean }) {
  const [value, setValue] = useState("#6366f1");
  return (
    <ColorInputStyled
      value={value}
      onChange={setValue}
      size={size as "sm" | "md" | "lg"}
      tone={tone as "neutral" | "primary" | "danger"}
      format={format as "hex" | "rgb" | "hsl"}
      showCopyButton={showCopyButton}
      showAlpha={showAlpha}
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
        { name: "disabled",   control: { type: "toggle" },                                                       defaultValue: false,  omitWhen: false },
        { name: "showAlpha",  control: { type: "toggle" },                                                       defaultValue: false,  omitWhen: false },
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
        />
      )}
    />
  );
}
