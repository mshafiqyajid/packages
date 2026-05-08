import PropPlayground from "../PropPlayground";
import { AlertStyled } from "@mshafiqyajid/react-alert/styled";
import "@mshafiqyajid/react-alert/styles.css";
import { ButtonStyled } from "@mshafiqyajid/react-button/styled";
import "@mshafiqyajid/react-button/styles.css";

function AlertExamples() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
      <AlertStyled variant="soft" tone="success" title="Changes saved" description="Your changes have been saved successfully." />
      <AlertStyled variant="soft" tone="warning" title="Attention required" description="Your subscription expires in 3 days." dismissible />
      <AlertStyled variant="soft" tone="danger" title="Error" description="Failed to process your request. Please try again." dismissible />
      <AlertStyled variant="soft" tone="info" title="New feature" description="You can now export reports as PDF." action={<ButtonStyled size="sm" variant="outline" tone="neutral">Learn more</ButtonStyled>} />
    </div>
  );
}

export default function AlertDemo() {
  return (
    <>
      <AlertExamples />
      <PropPlayground
        componentName="AlertStyled"
        importLine={`import { AlertStyled } from "@mshafiqyajid/react-alert/styled";\nimport "@mshafiqyajid/react-alert/styles.css";`}
        props={[
          { name: "variant",     control: { type: "segmented", options: ["soft","filled","outline","banner"] as const },                           defaultValue: "soft",    omitWhen: "soft" },
          { name: "tone",        control: { type: "segmented", options: ["neutral","primary","success","warning","danger","info"] as const },       defaultValue: "neutral", omitWhen: "neutral" },
          { name: "size",        control: { type: "segmented", options: ["sm","md","lg"] as const },                                               defaultValue: "md",      omitWhen: "md" },
          { name: "title",       control: { type: "text" },                                                                                        defaultValue: "Alert title" },
          { name: "description", control: { type: "text" },                                                                                        defaultValue: "This is the alert description." },
          { name: "showIcon",    control: { type: "toggle" },                                                                                      defaultValue: true,      omitWhen: true },
          { name: "dismissible", control: { type: "toggle" },                                                                                      defaultValue: false,     omitWhen: false },
        ]}
        render={(v) => (
          <AlertStyled
            variant={v.variant as "soft"|"filled"|"outline"|"banner"}
            tone={v.tone as "neutral"|"primary"|"success"|"warning"|"danger"|"info"}
            size={v.size as "sm"|"md"|"lg"}
            title={v.title as string}
            description={v.description as string}
            showIcon={v.showIcon as boolean}
            dismissible={v.dismissible as boolean}
          />
        )}
      />
    </>
  );
}
