import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { DatePickerStyled } from "@mshafiqyajid/react-date-picker/styled";
import "@mshafiqyajid/react-date-picker/styles.css";

function DatePickerWrapper({
  mode,
  size,
  tone,
  disabled,
  clearable,
  numberOfMonths,
  captionLayout,
  showOutsideDays,
  fixedWeeks,
  inline,
  showTime,
  pagedBy,
}: {
  mode: string;
  size: string;
  tone: string;
  disabled: boolean;
  clearable: boolean;
  numberOfMonths: number;
  captionLayout: string;
  showOutsideDays: boolean;
  fixedWeeks: boolean;
  inline: boolean;
  showTime: boolean;
  pagedBy: string;
}) {
  const [value, setValue] = useState<Date | [Date, Date] | null>(null);
  return (
    <DatePickerStyled
      value={value}
      onChange={setValue as (v: Date | [Date, Date] | null) => void}
      mode={mode as "single" | "range"}
      size={size as "sm" | "md" | "lg"}
      tone={tone as "neutral" | "primary"}
      disabled={disabled}
      clearable={clearable}
      numberOfMonths={numberOfMonths as 1 | 2 | 3}
      captionLayout={captionLayout as "label" | "dropdown"}
      showOutsideDays={showOutsideDays}
      fixedWeeks={fixedWeeks}
      inline={inline}
      showTime={showTime && mode === "single"}
      pagedBy={pagedBy === "all" ? "all" : 1}
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
        { name: "mode",            group: "Appearance", control: { type: "segmented", options: ["single","range"] as const },          defaultValue: "single",  omitWhen: "single" },
        { name: "size",            group: "Appearance", control: { type: "segmented", options: ["sm","md","lg"] as const },             defaultValue: "md",      omitWhen: "md" },
        { name: "tone",            group: "Appearance", control: { type: "segmented", options: ["neutral","primary"] as const },        defaultValue: "neutral", omitWhen: "neutral" },
        { name: "numberOfMonths",  group: "Layout",     control: { type: "segmented", options: ["1","2","3"] as const },                defaultValue: "1",       omitWhen: "1" },
        { name: "captionLayout",   group: "Layout",     control: { type: "segmented", options: ["label","dropdown"] as const },         defaultValue: "label",   omitWhen: "label" },
        { name: "pagedBy",         group: "Layout",     control: { type: "segmented", options: ["1","all"] as const }, defaultValue: "1", omitWhen: "1" },
        { name: "inline",          group: "Display",    control: { type: "toggle" }, defaultValue: false, omitWhen: false },
        { name: "showOutsideDays", group: "Display",    control: { type: "toggle" }, defaultValue: true,  omitWhen: true  },
        { name: "fixedWeeks",      group: "Display",    control: { type: "toggle" }, defaultValue: true,  omitWhen: true  },
        { name: "showTime",        group: "Display",    label: "show time (single)", control: { type: "toggle" }, defaultValue: false, omitWhen: false },
        { name: "clearable",       group: "Behaviour",  control: { type: "toggle" }, defaultValue: false, omitWhen: false },
        { name: "disabled",        group: "State",      control: { type: "toggle" }, defaultValue: false, omitWhen: false },
      ]}
      staticProps={{ value: "{value}", onChange: "{setValue}" }}
      render={(v) => (
        <DatePickerWrapper
          key={`${String(v.mode)}-${String(v.inline)}-${String(v.showTime)}`}
          mode={v.mode as string}
          size={v.size as string}
          tone={v.tone as string}
          disabled={v.disabled as boolean}
          clearable={v.clearable as boolean}
          numberOfMonths={Number(v.numberOfMonths)}
          captionLayout={v.captionLayout as string}
          showOutsideDays={v.showOutsideDays as boolean}
          fixedWeeks={v.fixedWeeks as boolean}
          inline={v.inline as boolean}
          showTime={v.showTime as boolean}
          pagedBy={v.pagedBy as string}
        />
      )}
    />
  );
}
