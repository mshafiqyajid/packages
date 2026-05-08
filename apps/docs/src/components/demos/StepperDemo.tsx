import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { StepperStyled } from "@mshafiqyajid/react-stepper/styled";
import { TextInputStyled } from "@mshafiqyajid/react-text-input/styled";
import { CheckboxStyled } from "@mshafiqyajid/react-checkbox/styled";
import "@mshafiqyajid/react-stepper/styles.css";
import "@mshafiqyajid/react-text-input/styles.css";
import "@mshafiqyajid/react-checkbox/styles.css";

export default function StepperDemo() {
  const [agree, setAgree] = useState(false);
  return (
    <PropPlayground
      layout="stacked"
      componentName="StepperStyled"
      importLine={`import { StepperStyled } from "@mshafiqyajid/react-stepper/styled";\nimport "@mshafiqyajid/react-stepper/styles.css";`}
      props={[
        { name: "orientation",    group: "Appearance", control: { type: "segmented", options: ["horizontal","vertical"] as const },        defaultValue: "horizontal", omitWhen: "horizontal" },
        { name: "tone",           group: "Appearance", control: { type: "segmented", options: ["primary","neutral"] as const },             defaultValue: "primary",    omitWhen: "primary" },
        { name: "size",           group: "Appearance", control: { type: "segmented", options: ["sm","md","lg"] as const },                  defaultValue: "md",          omitWhen: "md" },
        { name: "mode",           group: "Behaviour",  control: { type: "segmented", options: ["linear","non-linear"] as const },           defaultValue: "linear",     omitWhen: "linear" },
        { name: "clickableSteps", group: "Behaviour",  control: { type: "toggle" },                                                          defaultValue: true,         omitWhen: true },
        { name: "progressBar",    group: "Display",    control: { type: "toggle" },                                                          defaultValue: false,        omitWhen: false },
        { name: "lastOptional",   group: "Display",    label: "last step optional", control: { type: "toggle" },                              defaultValue: false,        omitWhen: false },
        { name: "billingError",   group: "Display",    label: "billing has error",  control: { type: "toggle" },                              defaultValue: false,        omitWhen: false },
        { name: "showFooter",     group: "Display",    control: { type: "toggle" },                                                          defaultValue: true,         omitWhen: true },
      ]}
      staticProps={{ steps: "{steps}", onFinish: "{() => /* submit */}" }}
      render={(v) => (
        <div style={{ width: "100%" }}>
          <StepperStyled
            steps={[
              { id: "account", label: "Account", description: "Email + password" },
              {
                id: "billing",
                label: "Billing",
                description: "Card details",
                error: v.billingError as boolean,
                validate: () => agree || "Please confirm the terms below",
              },
              {
                id: "review",
                label: "Review",
                optional: v.lastOptional as boolean,
              },
            ]}
            orientation={v.orientation as "horizontal"|"vertical"}
            tone={v.tone as "primary"|"neutral"}
            size={v.size as "sm"|"md"|"lg"}
            mode={v.mode as "linear"|"non-linear"}
            clickableSteps={v.clickableSteps as boolean}
            progressBar={v.progressBar as boolean}
            showFooter={v.showFooter as boolean}
            renderContent={({ step }) => {
              if (step.id === "account") {
                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    <TextInputStyled placeholder="Email" type="email" block />
                    <TextInputStyled placeholder="Password" type="password" block passwordToggle />
                  </div>
                );
              }
              if (step.id === "billing") {
                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    <TextInputStyled placeholder="Card number" block />
                    <CheckboxStyled
                      checked={agree}
                      onChange={setAgree}
                      label="I agree to the terms"
                      size="sm"
                      tone="primary"
                    />
                  </div>
                );
              }
              return (
                <div style={{ fontSize: "0.9rem", color: "var(--fg-muted)" }}>
                  All set. Click <strong>Finish</strong> to submit.
                </div>
              );
            }}
            onFinish={() => alert("Submitted!")}
          />
        </div>
      )}
    />
  );
}
