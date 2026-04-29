import PropPlayground from "../PropPlayground";
import { TabsStyled } from "@mshafiqyajid/react-tabs/styled";
import "@mshafiqyajid/react-tabs/styles.css";

const tabs = [
  { value: "overview", label: "Overview", content: <p style={{ margin: 0, padding: "1rem 0", color: "var(--fg-muted)", fontSize: "0.875rem" }}>Overview content goes here.</p> },
  { value: "features", label: "Features", content: <p style={{ margin: 0, padding: "1rem 0", color: "var(--fg-muted)", fontSize: "0.875rem" }}>Features content goes here.</p> },
  { value: "pricing",  label: "Pricing",  content: <p style={{ margin: 0, padding: "1rem 0", color: "var(--fg-muted)", fontSize: "0.875rem" }}>Pricing content goes here.</p> },
];

export default function TabsDemo() {
  return (
    <PropPlayground
      componentName="TabsStyled"
      importLine={`import { TabsStyled } from "@mshafiqyajid/react-tabs/styled";\nimport "@mshafiqyajid/react-tabs/styles.css";`}
      props={[
        { name: "variant", control: { type: "segmented", options: ["line","solid","pill"] as const },  defaultValue: "line",    omitWhen: "line" },
        { name: "size",    control: { type: "segmented", options: ["sm","md","lg"] as const },         defaultValue: "md",      omitWhen: "md" },
        { name: "tone",    control: { type: "segmented", options: ["neutral","primary"] as const },    defaultValue: "neutral", omitWhen: "neutral" },
      ]}
      staticProps={{ tabs: "{tabs}", defaultValue: '"overview"' }}
      render={(v) => (
        <TabsStyled
          tabs={tabs}
          variant={v.variant as "line" | "solid" | "pill"}
          size={v.size as "sm" | "md" | "lg"}
          tone={v.tone as "neutral" | "primary"}
          defaultValue="overview"
          style={{ width: "100%", maxWidth: 480 } as React.CSSProperties}
        />
      )}
    />
  );
}
