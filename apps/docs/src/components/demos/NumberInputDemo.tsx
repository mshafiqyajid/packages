import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { NumberInputStyled } from "@mshafiqyajid/react-number-input/styled";
import "@mshafiqyajid/react-number-input/styles.css";

function NumberInputWrapper({ size, tone, format, disabled }: { size: string; tone: string; format: string; disabled: boolean }) {
  const [value, setValue] = useState<number | undefined>(42);
  return (
    <NumberInputStyled
      value={value}
      onChange={setValue}
      size={size as "sm" | "md" | "lg"}
      tone={tone as "neutral" | "primary" | "success" | "danger"}
      format={format as "decimal" | "currency" | "percent"}
      currency="USD"
      label="Amount"
      style={{ width: "100%", maxWidth: 280 } as React.CSSProperties}
      disabled={disabled}
    />
  );
}

export default function NumberInputDemo() {
  return (
    <PropPlayground
      componentName="NumberInputStyled"
      importLine={`import { NumberInputStyled } from "@mshafiqyajid/react-number-input/styled";\nimport "@mshafiqyajid/react-number-input/styles.css";`}
      props={[
        { name: "size",     control: { type: "segmented", options: ["sm","md","lg"] as const },                              defaultValue: "md",      omitWhen: "md" },
        { name: "tone",     control: { type: "segmented", options: ["neutral","primary","success","danger"] as const },      defaultValue: "neutral", omitWhen: "neutral" },
        { name: "format",   control: { type: "segmented", options: ["decimal","currency","percent"] as const },              defaultValue: "decimal", omitWhen: "decimal" },
        { name: "disabled", control: { type: "toggle" },                                                                     defaultValue: false,     omitWhen: false },
      ]}
      staticProps={{ value: "{value}", onChange: "{setValue}" }}
      render={(v) => (
        <NumberInputWrapper
          key={String(v.format)}
          size={v.size as string}
          tone={v.tone as string}
          format={v.format as string}
          disabled={v.disabled as boolean}
        />
      )}
    />
  );
}
