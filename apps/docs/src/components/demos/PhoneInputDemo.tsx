import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { PhoneInputStyled } from "@mshafiqyajid/react-phone-input/styled";
import "@mshafiqyajid/react-phone-input/styles.css";

function PhoneInputWrapper({ size, tone, showFlag, disabled, outputFormat }: { size: string; tone: string; showFlag: boolean; disabled: boolean; outputFormat: string }) {
  const [value, setValue] = useState("");
  return (
    <PhoneInputStyled
      value={value}
      onChange={setValue}
      size={size as "sm" | "md" | "lg"}
      tone={tone as "neutral" | "primary" | "success" | "danger"}
      showFlag={showFlag}
      outputFormat={outputFormat as "national" | "international" | "e164"}
      label="Phone number"
      disabled={disabled}
      style={{ width: "100%", maxWidth: 320 } as React.CSSProperties}
    />
  );
}

export default function PhoneInputDemo() {
  return (
    <PropPlayground
      componentName="PhoneInputStyled"
      importLine={`import { PhoneInputStyled } from "@mshafiqyajid/react-phone-input/styled";\nimport "@mshafiqyajid/react-phone-input/styles.css";`}
      props={[
        { name: "size",     control: { type: "segmented", options: ["sm","md","lg"] as const },                         defaultValue: "md",      omitWhen: "md" },
        { name: "tone",     control: { type: "segmented", options: ["neutral","primary","success","danger"] as const }, defaultValue: "neutral", omitWhen: "neutral" },
        { name: "showFlag", control: { type: "toggle" },                                                                defaultValue: true,      omitWhen: true },
        { name: "disabled",      control: { type: "toggle" },                                                             defaultValue: false,        omitWhen: false },
        { name: "outputFormat",  control: { type: "segmented", options: ["national","international","e164"] as const },  defaultValue: "national",   omitWhen: "national" },
      ]}
      staticProps={{ value: "{value}", onChange: "{setValue}" }}
      render={(v) => (
        <PhoneInputWrapper
          size={v.size as string}
          tone={v.tone as string}
          showFlag={v.showFlag as boolean}
          disabled={v.disabled as boolean}
          outputFormat={v.outputFormat as string}
        />
      )}
    />
  );
}
