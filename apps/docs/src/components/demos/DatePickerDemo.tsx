import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { DatePickerStyled } from "@mshafiqyajid/react-date-picker/styled";
import "@mshafiqyajid/react-date-picker/styles.css";

function DatePickerWrapper({ mode, size, tone, disabled, clearable }: { mode: string; size: string; tone: string; disabled: boolean; clearable: boolean }) {
  const [value, setValue] = useState<Date | [Date, Date] | null>(null);
  return (
    <DatePickerStyled
      value={value}
      onChange={setValue as any}
      mode={mode as "single" | "range"}
      size={size as "sm" | "md" | "lg"}
      tone={tone as "neutral" | "primary"}
      disabled={disabled}
      clearable={clearable}
      placeholder={mode === "range" ? "Select date range" : "Select date"}
    />
  );
}

export default function DatePickerDemo() {
  return (
    <PropPlayground
      componentName="DatePickerStyled"
      importLine={`import { DatePickerStyled } from "@mshafiqyajid/react-date-picker/styled";\nimport "@mshafiqyajid/react-date-picker/styles.css";`}
      props={[
        { name: "mode",     control: { type: "segmented", options: ["single","range"] as const },     defaultValue: "single",  omitWhen: "single" },
        { name: "size",     control: { type: "segmented", options: ["sm","md","lg"] as const },        defaultValue: "md",      omitWhen: "md" },
        { name: "tone",     control: { type: "segmented", options: ["neutral","primary"] as const },   defaultValue: "neutral", omitWhen: "neutral" },
        { name: "disabled",  control: { type: "toggle" },                                               defaultValue: false,     omitWhen: false },
        { name: "clearable", control: { type: "toggle" },                                               defaultValue: false,     omitWhen: false },
      ]}
      staticProps={{ value: "{value}", onChange: "{setValue}" }}
      render={(v) => (
        <DatePickerWrapper
          key={String(v.mode)}
          mode={v.mode as string}
          size={v.size as string}
          tone={v.tone as string}
          disabled={v.disabled as boolean}
          clearable={v.clearable as boolean}
        />
      )}
    />
  );
}
