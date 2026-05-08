import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { TextInputStyled } from "@mshafiqyajid/react-text-input/styled";
import "@mshafiqyajid/react-text-input/styles.css";

export default function TextInputDemo() {
  const [value, setValue] = useState("");
  return (
    <PropPlayground
      componentName="TextInputStyled"
      importLine={`import { TextInputStyled } from "@mshafiqyajid/react-text-input/styled";\nimport "@mshafiqyajid/react-text-input/styles.css";`}
      props={[
        { name: "type",           group: "Appearance", control: { type: "segmented", options: ["text","email","password","url","search","tel"] as const }, defaultValue: "email",   omitWhen: "text" },
        { name: "size",           group: "Appearance", control: { type: "segmented", options: ["sm","md","lg"] as const },                                   defaultValue: "md",      omitWhen: "md" },
        { name: "tone",           group: "Appearance", control: { type: "segmented", options: ["neutral","primary","success","danger"] as const },           defaultValue: "neutral", omitWhen: "neutral" },
        { name: "label",          group: "Content",    control: { type: "text", placeholder: "Field label" },                                                 defaultValue: "Email",  omitWhen: "" },
        { name: "required",       group: "Content",    control: { type: "toggle" },                                                                            defaultValue: false,     omitWhen: false },
        { name: "block",          group: "Layout",     control: { type: "toggle" },                                                                            defaultValue: true,      omitWhen: false },
        { name: "clearable",      group: "Behaviour",  control: { type: "toggle" },                                                                            defaultValue: true,      omitWhen: false },
        { name: "passwordToggle", group: "Behaviour",  control: { type: "toggle" },                                                                            defaultValue: false,     omitWhen: false },
        { name: "loading",        group: "State",      control: { type: "toggle" },                                                                            defaultValue: false,     omitWhen: false },
        { name: "success",        group: "State",      control: { type: "toggle" },                                                                            defaultValue: false,     omitWhen: false },
        { name: "withError",      group: "State",      label: "show validation", control: { type: "toggle" },                                                   defaultValue: false,     omitWhen: false },
        { name: "maxLength",      group: "State",      control: { type: "slider", min: 0, max: 80, step: 5 },                                                 defaultValue: 0,         omitWhen: 0 },
        { name: "disabled",       group: "State",      control: { type: "toggle" },                                                                            defaultValue: false,     omitWhen: false },
        { name: "readOnly",       group: "State",      control: { type: "toggle" },                                                                            defaultValue: false,     omitWhen: false },
      ]}
      staticProps={{ value: "{value}", onChange: "{setValue}", placeholder: '"Type something…"' }}
      render={(v) => {
        const error = v.withError && value && !value.includes("@") ? "Must include @" : undefined;
        const max = v.maxLength as number;
        return (
          <div style={{ width: "100%", maxWidth: 360 }}>
            <TextInputStyled
              type={v.type as "text"|"email"|"password"|"url"|"search"|"tel"}
              size={v.size as "sm"|"md"|"lg"}
              tone={v.tone as "neutral"|"primary"|"success"|"danger"}
              label={(v.label as string) || undefined}
              required={v.required as boolean}
              block={v.block as boolean}
              clearable={v.clearable as boolean}
              passwordToggle={v.passwordToggle as boolean}
              loading={v.loading as boolean}
              success={v.success as boolean}
              maxLength={max > 0 ? max : undefined}
              disabled={v.disabled as boolean}
              readOnly={v.readOnly as boolean}
              value={value}
              onChange={setValue}
              placeholder="Type something…"
              error={error}
              hint={!error ? "Hint text appears here." : undefined}
            />
          </div>
        );
      }}
    />
  );
}
