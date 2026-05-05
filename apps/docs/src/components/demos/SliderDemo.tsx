import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { SliderStyled } from "@mshafiqyajid/react-slider/styled";
import "@mshafiqyajid/react-slider/styles.css";

function SliderWrapper({ size, tone, range, showValue, marks, disabled }: {
  size: string; tone: string; range: boolean; showValue: boolean; marks: boolean; disabled: boolean;
}) {
  const [value, setValue] = useState<number | [number, number]>(range ? [20, 70] : 40);
  return (
    <div style={{ width: "100%", maxWidth: 360 }}>
      <SliderStyled
        value={value}
        onChange={setValue}
        size={size as "sm"|"md"|"lg"}
        tone={tone as "neutral"|"primary"|"success"|"danger"}
        range={range}
        showValue={showValue}
        marks={marks}
        disabled={disabled}
      />
    </div>
  );
}

export default function SliderDemo() {
  return (
    <PropPlayground
      componentName="SliderStyled"
      importLine={`import { SliderStyled } from "@mshafiqyajid/react-slider/styled";\nimport "@mshafiqyajid/react-slider/styles.css";`}
      props={[
        { name: "size",      control: { type: "segmented", options: ["sm","md","lg"] as const },                        defaultValue: "md",      omitWhen: "md" },
        { name: "tone",      control: { type: "segmented", options: ["neutral","primary","success","danger"] as const }, defaultValue: "primary", omitWhen: "neutral" },
        { name: "range",     control: { type: "toggle" },                                                               defaultValue: false,     omitWhen: false },
        { name: "showValue", control: { type: "toggle" },                                                               defaultValue: false,     omitWhen: false },
        { name: "marks",     control: { type: "toggle" },                                                               defaultValue: false,     omitWhen: false },
        { name: "disabled",  control: { type: "toggle" },                                                               defaultValue: false,     omitWhen: false },
      ]}
      staticProps={{ value: "{value}", onChange: "{setValue}" }}
      render={(v) => (
        <SliderWrapper
          key={String(v.range)}
          size={v.size as string}
          tone={v.tone as string}
          range={v.range as boolean}
          showValue={v.showValue as boolean}
          marks={v.marks as boolean}
          disabled={v.disabled as boolean}
        />
      )}
    />
  );
}
