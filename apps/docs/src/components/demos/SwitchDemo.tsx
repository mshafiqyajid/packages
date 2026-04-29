import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { SwitchStyled } from "@mshafiqyajid/react-switch/styled";
import "@mshafiqyajid/react-switch/styles.css";

export default function SwitchDemo() {
  const [checked, setChecked] = useState(false);
  return (
    <PropPlayground
      componentName="SwitchStyled"
      importLine={`import { SwitchStyled } from "@mshafiqyajid/react-switch/styled";\nimport "@mshafiqyajid/react-switch/styles.css";`}
      props={[
        { name: "size",          control: { type: "segmented", options: ["sm","md","lg"] as const },                        defaultValue: "md",      omitWhen: "md" },
        { name: "tone",          control: { type: "segmented", options: ["neutral","primary","success","danger"] as const }, defaultValue: "primary",  omitWhen: "primary" },
        { name: "labelPosition", control: { type: "segmented", options: ["left","right"] as const },                        defaultValue: "right",   omitWhen: "right" },
        { name: "loading",       control: { type: "toggle" },                                                               defaultValue: false,     omitWhen: false },
        { name: "disabled",      control: { type: "toggle" },                                                               defaultValue: false,     omitWhen: false },
      ]}
      staticProps={{ checked: "{checked}", onChange: "{setChecked}", label: '"Enable notifications"' }}
      render={(v) => (
        <SwitchStyled
          checked={checked}
          onChange={setChecked}
          label="Enable notifications"
          size={v.size as "sm"|"md"|"lg"}
          tone={v.tone as "neutral"|"primary"|"success"|"danger"}
          labelPosition={v.labelPosition as "left"|"right"}
          loading={v.loading as boolean}
          disabled={v.disabled as boolean}
        />
      )}
    />
  );
}
