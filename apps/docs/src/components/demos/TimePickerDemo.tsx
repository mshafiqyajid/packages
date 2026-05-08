import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { TimePickerStyled } from "@mshafiqyajid/react-time-picker/styled";
import "@mshafiqyajid/react-time-picker/styles.css";

function TimePickerWrapper({
  format,
  showSeconds,
  step,
  size,
  tone,
  disabled,
  readOnly,
  invalid,
  showLabel,
  showHint,
}: {
  format: string;
  showSeconds: boolean;
  step: number;
  size: string;
  tone: string;
  disabled: boolean;
  readOnly: boolean;
  invalid: boolean;
  showLabel: boolean;
  showHint: boolean;
}) {
  const [value, setValue] = useState("");
  return (
    <TimePickerStyled
      value={value}
      onChange={setValue}
      format={format as "12h" | "24h"}
      showSeconds={showSeconds}
      step={step}
      size={size as "sm" | "md" | "lg"}
      tone={tone as "neutral" | "primary" | "success" | "danger"}
      disabled={disabled}
      readOnly={readOnly}
      invalid={invalid}
      label={showLabel ? "Meeting time" : undefined}
      hint={showHint ? "Select a time for the meeting" : undefined}
    />
  );
}

export default function TimePickerDemo() {
  return (
    <PropPlayground
      componentName="TimePickerStyled"
      importLine={`import { TimePickerStyled } from "@mshafiqyajid/react-time-picker/styled";\nimport "@mshafiqyajid/react-time-picker/styles.css";`}
      props={[
        { name: "format",      group: "Format",     control: { type: "segmented", options: ["24h", "12h"] as const },                           defaultValue: "24h",     omitWhen: "24h" },
        { name: "showSeconds", group: "Format",     control: { type: "toggle" },                                                                 defaultValue: false,     omitWhen: false },
        { name: "step",        group: "Format",     label: "minute step", control: { type: "select", options: ["1", "5", "15", "30"] as const }, defaultValue: "1",       omitWhen: "1" },
        { name: "size",        group: "Appearance", control: { type: "segmented", options: ["sm", "md", "lg"] as const },                        defaultValue: "md",      omitWhen: "md" },
        { name: "tone",        group: "Appearance", control: { type: "segmented", options: ["neutral", "primary", "danger"] as const },          defaultValue: "neutral", omitWhen: "neutral" },
        { name: "disabled",    group: "State",      control: { type: "toggle" },                                                                 defaultValue: false,     omitWhen: false },
        { name: "readOnly",    group: "State",      control: { type: "toggle" },                                                                 defaultValue: false,     omitWhen: false },
        { name: "invalid",     group: "State",      control: { type: "toggle" },                                                                 defaultValue: false,     omitWhen: false },
        { name: "showLabel",   group: "Content",    label: "label",  control: { type: "toggle" },                                                defaultValue: false,     omitWhen: false },
        { name: "showHint",    group: "Content",    label: "hint",   control: { type: "toggle" },                                                defaultValue: false,     omitWhen: false },
      ]}
      staticProps={{ value: "{value}", onChange: "{setValue}" }}
      render={(v) => (
        <TimePickerWrapper
          key={`${String(v.format)}-${String(v.showSeconds)}`}
          format={v.format as string}
          showSeconds={v.showSeconds as boolean}
          step={Number(v.step)}
          size={v.size as string}
          tone={v.tone as string}
          disabled={v.disabled as boolean}
          readOnly={v.readOnly as boolean}
          invalid={v.invalid as boolean}
          showLabel={v.showLabel as boolean}
          showHint={v.showHint as boolean}
        />
      )}
    />
  );
}
