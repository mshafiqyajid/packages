import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { RadioGroupStyled, RadioItem } from "@mshafiqyajid/react-radio/styled";
import "@mshafiqyajid/react-radio/styles.css";

export default function RadioDemo() {
  const [val, setVal] = useState("b");
  return (
    <>
      <div style={{ marginBottom: "1.5rem" }}>
        <RadioGroupStyled value={val} onChange={setVal} label="Preferred plan">
          <RadioItem value="a" label="Starter" description="Up to 5 projects" />
          <RadioItem value="b" label="Pro" description="Unlimited projects" />
          <RadioItem value="c" label="Enterprise" description="Custom limits" />
        </RadioGroupStyled>
      </div>
      <PropPlayground
        componentName="RadioGroupStyled"
        importLine={`import { RadioGroupStyled, RadioItem } from "@mshafiqyajid/react-radio/styled";\nimport "@mshafiqyajid/react-radio/styles.css";`}
        props={[
          { name: "variant",     group: "Appearance", control: { type: "segmented", options: ["default", "card", "button-group"] as const }, defaultValue: "default", omitWhen: "default" },
          { name: "size",        group: "Appearance", control: { type: "segmented", options: ["sm", "md", "lg"] as const },                  defaultValue: "md",      omitWhen: "md" },
          { name: "tone",        group: "Appearance", control: { type: "segmented", options: ["neutral", "primary", "success", "danger"] as const }, defaultValue: "neutral", omitWhen: "neutral" },
          { name: "orientation", group: "Appearance", control: { type: "segmented", options: ["vertical", "horizontal"] as const },           defaultValue: "vertical", omitWhen: "vertical" },
          { name: "disabled",    group: "State",      control: { type: "toggle" },                                                            defaultValue: false,     omitWhen: false },
          { name: "invalid",     group: "State",      control: { type: "toggle" },                                                            defaultValue: false,     omitWhen: false },
          { name: "required",    group: "State",      control: { type: "toggle" },                                                            defaultValue: false,     omitWhen: false },
        ]}
        render={(v) => (
          <RadioGroupStyled
            defaultValue="a"
            variant={v.variant as "default" | "card" | "button-group"}
            size={v.size as "sm" | "md" | "lg"}
            tone={v.tone as "neutral" | "primary" | "success" | "danger"}
            orientation={v.orientation as "vertical" | "horizontal"}
            disabled={v.disabled as boolean}
            invalid={v.invalid as boolean}
            required={v.required as boolean}
            label="Choose an option"
          >
            <RadioItem value="a" label="Option A" description="First choice" />
            <RadioItem value="b" label="Option B" description="Second choice" />
            <RadioItem value="c" label="Option C" description="Third choice" />
          </RadioGroupStyled>
        )}
      />
    </>
  );
}
