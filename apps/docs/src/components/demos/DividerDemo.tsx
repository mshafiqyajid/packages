import PropPlayground from "../PropPlayground";
import { DividerStyled } from "@mshafiqyajid/react-divider/styled";
import "@mshafiqyajid/react-divider/styles.css";

function DividerExamples() {
  return (
    <div style={{ marginBottom: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <p style={{ marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.875rem" }}>Horizontal with label</p>
        <DividerStyled label="Section title" tone="neutral" />
      </div>

      <div>
        <p style={{ marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.875rem" }}>Toned dashed</p>
        <DividerStyled tone="primary" lineStyle="dashed" />
      </div>

      <div>
        <p style={{ marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.875rem" }}>Vertical between items</p>
        <div style={{ display: "flex", alignItems: "center", gap: "0", height: "2rem" }}>
          <span style={{ fontSize: "0.875rem" }}>Home</span>
          <DividerStyled orientation="vertical" spacing="sm" />
          <span style={{ fontSize: "0.875rem" }}>About</span>
          <DividerStyled orientation="vertical" spacing="sm" />
          <span style={{ fontSize: "0.875rem" }}>Contact</span>
        </div>
      </div>
    </div>
  );
}

export default function DividerDemo() {
  return (
    <>
      <DividerExamples />
      <PropPlayground
        componentName="DividerStyled"
        importLine={`import { DividerStyled } from "@mshafiqyajid/react-divider/styled";\nimport "@mshafiqyajid/react-divider/styles.css";`}
        props={[
          {
            name: "orientation",
            group: "Appearance",
            control: { type: "segmented", options: ["horizontal", "vertical"] as const },
            defaultValue: "horizontal",
            omitWhen: "horizontal",
          },
          {
            name: "tone",
            group: "Appearance",
            control: { type: "segmented", options: ["neutral", "primary", "success", "warning", "danger", "info"] as const },
            defaultValue: "neutral",
            omitWhen: "neutral",
          },
          {
            name: "lineStyle",
            group: "Appearance",
            control: { type: "segmented", options: ["solid", "dashed", "dotted"] as const },
            defaultValue: "solid",
            omitWhen: "solid",
          },
          {
            name: "size",
            group: "Appearance",
            control: { type: "segmented", options: ["sm", "md", "lg"] as const },
            defaultValue: "md",
            omitWhen: "md",
          },
          {
            name: "spacing",
            group: "Layout",
            control: { type: "segmented", options: ["sm", "md", "lg"] as const },
            defaultValue: "md",
            omitWhen: "md",
          },
          {
            name: "label",
            group: "Content",
            control: { type: "text", placeholder: "Label text (leave empty for none)" },
            defaultValue: "Or continue with",
            omitWhen: "",
          },
          {
            name: "labelAlign",
            group: "Content",
            control: { type: "segmented", options: ["start", "center", "end"] as const },
            defaultValue: "center",
            omitWhen: "center",
          },
        ]}
        render={(v) => (
          <div style={v.orientation === "vertical" ? { display: "flex", alignItems: "center", height: "3rem" } : { width: "100%" }}>
            {v.orientation === "vertical" && <span style={{ fontSize: "0.875rem" }}>Left</span>}
            <DividerStyled
              orientation={v.orientation as "horizontal" | "vertical"}
              tone={v.tone as "neutral" | "primary" | "success" | "warning" | "danger" | "info"}
              lineStyle={v.lineStyle as "solid" | "dashed" | "dotted"}
              size={v.size as "sm" | "md" | "lg"}
              spacing={v.spacing as "sm" | "md" | "lg"}
              labelAlign={v.labelAlign as "start" | "center" | "end"}
              label={(v.label as string) || undefined}
            />
            {v.orientation === "vertical" && <span style={{ fontSize: "0.875rem" }}>Right</span>}
          </div>
        )}
      />
    </>
  );
}
