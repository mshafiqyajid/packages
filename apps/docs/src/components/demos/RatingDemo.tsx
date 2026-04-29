import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { RatingStyled } from "@mshafiqyajid/react-rating/styled";
import "@mshafiqyajid/react-rating/styles.css";

export default function RatingDemo() {
  const [value, setValue] = useState(3);

  return (
    <PropPlayground
      componentName="RatingStyled"
      importLine={`import { RatingStyled } from "@mshafiqyajid/react-rating/styled";\nimport "@mshafiqyajid/react-rating/styles.css";`}
      props={[
        {
          name: "count",
          control: { type: "slider", min: 3, max: 10 },
          defaultValue: 5,
          omitWhen: 5,
        },
        {
          name: "size",
          control: { type: "segmented", options: ["sm", "md", "lg"] as const },
          defaultValue: "md",
          omitWhen: "md",
        },
        {
          name: "tone",
          control: { type: "segmented", options: ["neutral", "primary", "success", "warning", "danger"] as const },
          defaultValue: "warning",
          omitWhen: "warning",
        },
        {
          name: "allowHalf",
          control: { type: "toggle" },
          defaultValue: true,
          omitWhen: true,
        },
        {
          name: "clearable",
          control: { type: "toggle" },
          defaultValue: true,
          omitWhen: true,
        },
        {
          name: "readOnly",
          control: { type: "toggle" },
          defaultValue: false,
          omitWhen: false,
        },
        {
          name: "showValue",
          control: { type: "toggle" },
          defaultValue: false,
          omitWhen: false,
        },
      ]}
      render={(v) => (
        <RatingStyled
          count={v.count as number}
          value={value}
          onChange={setValue}
          size={v.size as "sm" | "md" | "lg"}
          tone={v.tone as "neutral" | "primary" | "success" | "warning" | "danger"}
          allowHalf={v.allowHalf as boolean}
          clearable={v.clearable as boolean}
          readOnly={v.readOnly as boolean}
          showValue={v.showValue as boolean}
          label="Rate this"
        />
      )}
    />
  );
}
