import PropPlayground from "../PropPlayground";
import { PopoverStyled } from "@mshafiqyajid/react-popover/styled";
import "@mshafiqyajid/react-popover/styles.css";

export default function PopoverDemo() {
  return (
    <PropPlayground
      componentName="PopoverStyled"
      importLine={`import { PopoverStyled } from "@mshafiqyajid/react-popover/styled";\nimport "@mshafiqyajid/react-popover/styles.css";`}
      props={[
        { name: "placement",         control: { type: "segmented", options: ["top","bottom","left","right"] as const }, defaultValue: "bottom",  omitWhen: "bottom" },
        { name: "trigger",           control: { type: "segmented", options: ["click","hover"] as const },               defaultValue: "click",   omitWhen: "click" },
        { name: "size",              control: { type: "segmented", options: ["sm","md","lg"] as const },                defaultValue: "md",      omitWhen: "md" },
        { name: "showArrow",           control: { type: "toggle" },                                                     defaultValue: true,  omitWhen: true },
        { name: "closeOnOutsideClick", control: { type: "toggle" },                                                     defaultValue: true,  omitWhen: true },
        { name: "closeOnEsc",          control: { type: "toggle" },                                                     defaultValue: true,  omitWhen: true },
      ]}
      staticProps={{ title: '"More info"', content: '"This is the popover content."' }}
      render={(v) => (
        <PopoverStyled
          placement={v.placement as "top"|"bottom"|"left"|"right"}
          trigger={v.trigger as "click"|"hover"}
          size={v.size as "sm"|"md"|"lg"}
          showArrow={v.showArrow as boolean}
          closeOnOutsideClick={v.closeOnOutsideClick as boolean}
          closeOnEsc={v.closeOnEsc as boolean}
          title="More info"
          content={<p style={{ margin: 0, fontSize: "0.875rem", color: "var(--fg-muted)" }}>This is the popover content. Add any rich content here.</p>}
        >
          <button style={{ padding: "0.5rem 1.25rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-elevated)", color: "var(--fg)", cursor: "pointer", fontSize: "0.875rem", fontWeight: 500 }}>
            Open popover
          </button>
        </PopoverStyled>
      )}
    />
  );
}
