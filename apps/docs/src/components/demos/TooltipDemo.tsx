import PropPlayground from "../PropPlayground";
import { TooltipStyled } from "@mshafiqyajid/react-tooltip/styled";
import { ButtonStyled } from "@mshafiqyajid/react-button/styled";
import "@mshafiqyajid/react-tooltip/styles.css";
import "@mshafiqyajid/react-button/styles.css";

export default function TooltipDemo() {
  return (
    <PropPlayground
      componentName="TooltipStyled"
      importLine={`import { TooltipStyled } from "@mshafiqyajid/react-tooltip/styled";\nimport "@mshafiqyajid/react-tooltip/styles.css";`}
      props={[
        { name: "placement", control: { type: "segmented", options: ["top","bottom","left","right"] as const },         defaultValue: "top",     omitWhen: "top" },
        { name: "size",      control: { type: "segmented", options: ["sm","md","lg"] as const },                        defaultValue: "md",      omitWhen: "md" },
        { name: "tone",      control: { type: "segmented", options: ["neutral","primary","success","danger"] as const }, defaultValue: "neutral", omitWhen: "neutral" },
        { name: "delay",     control: { type: "slider", min: 0, max: 1000, step: 100 },                                 defaultValue: 0,         omitWhen: 0 },
        { name: "multiline",      control: { type: "toggle" },                                                          defaultValue: false,     omitWhen: false },
        { name: "disabled",       control: { type: "toggle" },                                                          defaultValue: false,     omitWhen: false },
        { name: "sticky",         label: "sticky-on-hover",         control: { type: "toggle" },                       defaultValue: false,     omitWhen: false },
        { name: "withSlots",      label: "header + footer slots",   control: { type: "toggle" },                       defaultValue: false,     omitWhen: false },
        { name: "longPressDelay", control: { type: "slider", min: 0, max: 1500, step: 100 },                            defaultValue: 500,        omitWhen: 500 },
      ]}
      staticProps={{ content: '"Copy to clipboard"' }}
      render={(v) => (
        <TooltipStyled
          content={
            v.sticky ? (
              <span>
                Hover me — I stay open. <a href="#tooltip" style={{ color: "white", textDecoration: "underline" }}>Click this link</a>.
              </span>
            ) : (
              "Copy to clipboard"
            )
          }
          header={v.withSlots ? <span>⌘C</span> : undefined}
          footer={v.withSlots ? <span style={{ fontSize: "0.7rem" }}>Press Enter to confirm</span> : undefined}
          placement={v.placement as "top" | "bottom" | "left" | "right"}
          size={v.size as "sm" | "md" | "lg"}
          tone={v.tone as "neutral" | "primary" | "success" | "danger"}
          delay={v.delay as number}
          multiline={v.multiline as boolean}
          disabled={v.disabled as boolean}
          sticky={v.sticky as boolean}
          longPressDelay={v.longPressDelay as number}
        >
          <ButtonStyled variant="outline" tone="neutral">Hover me</ButtonStyled>
        </TooltipStyled>
      )}
    />
  );
}
