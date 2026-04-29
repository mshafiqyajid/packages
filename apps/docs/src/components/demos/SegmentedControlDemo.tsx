import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { SegmentedControlStyled } from "@mshafiqyajid/react-segmented-control/styled";
import "@mshafiqyajid/react-segmented-control/styles.css";

export default function SegmentedControlDemo() {
  const [value, setValue] = useState("Week");

  return (
    <PropPlayground
      componentName="SegmentedControlStyled"
      importLine={`import { SegmentedControlStyled } from "@mshafiqyajid/react-segmented-control/styled";\nimport "@mshafiqyajid/react-segmented-control/styles.css";`}
      props={[
        { name: "variant",   control: { type: "segmented", options: ["solid","pill","underline"] as const },            defaultValue: "solid",  omitWhen: "solid" },
        { name: "size",      control: { type: "segmented", options: ["sm","md","lg"] as const },                        defaultValue: "md",     omitWhen: "md" },
        { name: "tone",      control: { type: "segmented", options: ["neutral","primary","success","danger"] as const },defaultValue: "primary",omitWhen: "primary" },
        { name: "fullWidth", control: { type: "toggle" },                                                               defaultValue: false,    omitWhen: false },
        { name: "disabled",  control: { type: "toggle" },                                                               defaultValue: false,    omitWhen: false },
      ]}
      staticProps={{ options: '["Day","Week","Month","Year"]', value: "{value}", onChange: "{setValue}" }}
      render={(v) => (
        <SegmentedControlStyled
          options={["Day", "Week", "Month", "Year"]}
          value={value}
          onChange={setValue}
          variant={v.variant as "solid"|"pill"|"underline"}
          size={v.size as "sm"|"md"|"lg"}
          tone={v.tone as "neutral"|"primary"|"success"|"danger"}
          fullWidth={v.fullWidth as boolean}
          disabled={v.disabled as boolean}
          label="Time range"
        />
      )}
    />
  );
}
