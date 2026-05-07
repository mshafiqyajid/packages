import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { CheckboxStyled, CheckboxGroup } from "@mshafiqyajid/react-checkbox/styled";
import type { CheckboxState } from "@mshafiqyajid/react-checkbox";
import "@mshafiqyajid/react-checkbox/styles.css";

export default function CheckboxDemo() {
  const [checked, setChecked] = useState<CheckboxState>(true);
  const [groupValues, setGroupValues] = useState<string[]>(["email"]);

  return (
    <>
      <PropPlayground
        componentName="CheckboxStyled"
        importLine={`import { CheckboxStyled } from "@mshafiqyajid/react-checkbox/styled";\nimport "@mshafiqyajid/react-checkbox/styles.css";`}
        props={[
          { name: "size",          control: { type: "segmented", options: ["sm","md","lg"] as const },                                 defaultValue: "md",      omitWhen: "md" },
          { name: "tone",          control: { type: "segmented", options: ["neutral","primary","success","danger"] as const },          defaultValue: "primary", omitWhen: "primary" },
          { name: "labelPosition", control: { type: "segmented", options: ["left","right"] as const },                                  defaultValue: "right",   omitWhen: "right" },
          { name: "card",          control: { type: "toggle" },                                                                          defaultValue: false,     omitWhen: false },
          { name: "description",   control: { type: "text", placeholder: "Helper text…" },                                              defaultValue: "",        omitWhen: "" },
          { name: "withError",     label: "show error",     control: { type: "toggle" },                                                  defaultValue: false,     omitWhen: false },
          { name: "required",      control: { type: "toggle" },                                                                          defaultValue: false,     omitWhen: false },
          { name: "indeterminate", control: { type: "toggle" },                                                                          defaultValue: false,     omitWhen: false },
          { name: "disabled",      control: { type: "toggle" },                                                                          defaultValue: false,     omitWhen: false },
          { name: "invalid",       control: { type: "toggle" },                                                                          defaultValue: false,     omitWhen: false },
          { name: "name",          control: { type: "text", placeholder: "form field name" },                                             defaultValue: "",        omitWhen: "" },
        ]}
        staticProps={{ checked: "{checked}", onChange: "{setChecked}", label: '"I agree to the terms"' }}
        render={(v) => (
          <CheckboxStyled
            checked={v.indeterminate ? "indeterminate" : checked}
            onChange={setChecked}
            label="I agree to the terms"
            description={(v.description as string) || undefined}
            error={v.withError ? "You must agree to continue" : undefined}
            size={v.size as "sm"|"md"|"lg"}
            tone={v.tone as "neutral"|"primary"|"success"|"danger"}
            labelPosition={v.labelPosition as "left"|"right"}
            card={v.card as boolean}
            required={v.required as boolean}
            disabled={v.disabled as boolean}
            invalid={v.invalid as boolean}
            name={(v.name as string) || undefined}
          />
        )}
      />

      <PropPlayground
        componentName="CheckboxGroup"
        importLine={`import { CheckboxGroup, CheckboxStyled } from "@mshafiqyajid/react-checkbox/styled";\nimport "@mshafiqyajid/react-checkbox/styles.css";`}
        props={[
          { name: "disabled",  control: { type: "toggle" }, defaultValue: false, omitWhen: false },
          { name: "withError", label: "show error", control: { type: "toggle" }, defaultValue: false, omitWhen: false },
        ]}
        staticProps={{ value: "{groupValues}", onChange: "{setGroupValues}", label: '"Notify me about…"' }}
        render={(v) => (
          <CheckboxGroup
            label="Notify me about…"
            hint="Choose the updates you want to receive."
            value={groupValues}
            onChange={setGroupValues}
            disabled={v.disabled as boolean}
            error={v.withError ? "Select at least one option" : undefined}
          >
            <CheckboxStyled value="email" label="Email updates" />
            <CheckboxStyled value="sms" label="SMS alerts" />
            <CheckboxStyled value="push" label="Push notifications" />
          </CheckboxGroup>
        )}
      />
    </>
  );
}
