import PropPlayground from "../PropPlayground";
import { ProgressBar } from "@mshafiqyajid/react-progress/styled";
import "@mshafiqyajid/react-progress/styles.css";

export default function ProgressDemo() {
  return (
    <PropPlayground
      componentName="ProgressBar"
      importLine={`import { ProgressBar } from "@mshafiqyajid/react-progress/styled";\nimport "@mshafiqyajid/react-progress/styles.css";`}
      props={[
        { name: "value",     control: { type: "slider", min: 0, max: 100 },                                                         defaultValue: 60,        omitWhen: 60 },
        { name: "size",      control: { type: "segmented", options: ["sm","md","lg"] as const },                                     defaultValue: "md",      omitWhen: "md" },
        { name: "tone",      control: { type: "segmented", options: ["neutral","primary","success","warning","danger"] as const },   defaultValue: "primary", omitWhen: "neutral" },
        { name: "showValue", control: { type: "toggle" },                                                                            defaultValue: false,     omitWhen: false },
        { name: "animated",  control: { type: "toggle" },                                                                            defaultValue: false,     omitWhen: false },
        { name: "rounded",   control: { type: "toggle" },                                                                            defaultValue: true,      omitWhen: true },
      ]}
      render={(v) => (
        <ProgressBar
          value={v.value as number}
          size={v.size as "sm"|"md"|"lg"}
          tone={v.tone as "neutral"|"primary"|"success"|"warning"|"danger"}
          showValue={v.showValue as boolean}
          animated={v.animated as boolean}
          rounded={v.rounded as boolean}
          label="Progress"
          style={{ width: "100%", maxWidth: 400 } as React.CSSProperties}
        />
      )}
    />
  );
}
