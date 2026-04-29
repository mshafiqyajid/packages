import PropPlayground from "../PropPlayground";
import { TooltipStyled } from "@mshafiqyajid/react-tooltip/styled";
import "@mshafiqyajid/react-tooltip/styles.css";

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
        { name: "multiline", control: { type: "toggle" },                                                               defaultValue: false,     omitWhen: false },
        { name: "disabled",  control: { type: "toggle" },                                                               defaultValue: false,     omitWhen: false },
      ]}
      staticProps={{ content: '"Copy to clipboard"' }}
      render={(v) => (
        <TooltipStyled
          content="Copy to clipboard"
          placement={v.placement as "top" | "bottom" | "left" | "right"}
          size={v.size as "sm" | "md" | "lg"}
          tone={v.tone as "neutral" | "primary" | "success" | "danger"}
          delay={v.delay as number}
          multiline={v.multiline as boolean}
          disabled={v.disabled as boolean}
        >
          <button
            style={{
              padding: "0.5rem 1.25rem",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              background: "var(--bg-elevated)",
              color: "var(--fg)",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
          >
            Hover me
          </button>
        </TooltipStyled>
      )}
    />
  );
}
