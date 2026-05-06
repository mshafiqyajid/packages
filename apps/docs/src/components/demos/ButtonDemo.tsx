import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { ButtonStyled } from "@mshafiqyajid/react-button/styled";
import "@mshafiqyajid/react-button/styles.css";

export default function ButtonDemo() {
  const [count, setCount] = useState(0);
  return (
    <PropPlayground
      componentName="ButtonStyled"
      importLine={`import { ButtonStyled } from "@mshafiqyajid/react-button/styled";\nimport "@mshafiqyajid/react-button/styles.css";`}
      props={[
        { name: "variant",     control: { type: "segmented", options: ["solid","outline","ghost","link"] as const },              defaultValue: "solid",   omitWhen: "solid" },
        { name: "tone",        control: { type: "segmented", options: ["neutral","primary","success","danger"] as const },         defaultValue: "primary", omitWhen: "primary" },
        { name: "size",        control: { type: "segmented", options: ["sm","md","lg"] as const },                                  defaultValue: "md",      omitWhen: "md" },
        { name: "radius",      control: { type: "segmented", options: ["default","pill","sharp"] as const },                        defaultValue: "default", omitWhen: "default" },
        { name: "block",       control: { type: "toggle" },                                                                          defaultValue: false,     omitWhen: false },
        { name: "loading",     control: { type: "toggle" },                                                                          defaultValue: false,     omitWhen: false },
        { name: "loadingText", control: { type: "text", placeholder: "Saving…" },                                                   defaultValue: "",        omitWhen: "" },
        { name: "pulse",       control: { type: "toggle" },                                                                          defaultValue: false,     omitWhen: false },
        { name: "ripple",      control: { type: "toggle" },                                                                          defaultValue: true,      omitWhen: true },
        { name: "disabled",    control: { type: "toggle" },                                                                          defaultValue: false,     omitWhen: false },
      ]}
      staticProps={{ onClick: "{() => setCount(c => c + 1)}", children: '"Click me"' }}
      render={(v) => (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.6rem" }}>
          <ButtonStyled
            variant={v.variant as "solid"|"outline"|"ghost"|"link"}
            tone={v.tone as "neutral"|"primary"|"success"|"danger"}
            size={v.size as "sm"|"md"|"lg"}
            radius={v.radius as "default"|"pill"|"sharp"}
            block={v.block as boolean}
            loading={v.loading as boolean}
            loadingText={v.loadingText ? (v.loadingText as string) : undefined}
            pulse={v.pulse as boolean}
            ripple={v.ripple as boolean}
            disabled={v.disabled as boolean}
            onClick={() => setCount((c) => c + 1)}
          >
            Click me
          </ButtonStyled>
          <span style={{ fontSize: "0.78rem", color: "var(--fg-muted, #71717a)" }}>
            clicked: {count}
          </span>
        </div>
      )}
    />
  );
}
