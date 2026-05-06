import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { TabsStyled } from "@mshafiqyajid/react-tabs/styled";
import "@mshafiqyajid/react-tabs/styles.css";

const baseTabs = [
  { value: "overview", label: "Overview", content: <p style={{ margin: 0, padding: "1rem 0", color: "var(--fg-muted)", fontSize: "0.875rem" }}>Overview content goes here.</p> },
  { value: "features", label: "Features", content: <p style={{ margin: 0, padding: "1rem 0", color: "var(--fg-muted)", fontSize: "0.875rem" }}>Features content goes here.</p> },
  { value: "pricing",  label: "Pricing",  content: <p style={{ margin: 0, padding: "1rem 0", color: "var(--fg-muted)", fontSize: "0.875rem" }}>Pricing content goes here.</p> },
];

const manyTabs = [
  ...baseTabs,
  { value: "docs",     label: "Docs",     content: <p style={{ margin: 0, padding: "1rem 0", color: "var(--fg-muted)", fontSize: "0.875rem" }}>Docs.</p> },
  { value: "api",      label: "API",      content: <p style={{ margin: 0, padding: "1rem 0", color: "var(--fg-muted)", fontSize: "0.875rem" }}>API.</p> },
  { value: "examples", label: "Examples", content: <p style={{ margin: 0, padding: "1rem 0", color: "var(--fg-muted)", fontSize: "0.875rem" }}>Examples.</p> },
  { value: "support",  label: "Support",  content: <p style={{ margin: 0, padding: "1rem 0", color: "var(--fg-muted)", fontSize: "0.875rem" }}>Support.</p> },
  { value: "changelog",label: "Changelog",content: <p style={{ margin: 0, padding: "1rem 0", color: "var(--fg-muted)", fontSize: "0.875rem" }}>Changelog.</p> },
];

function TabsWrapper({ variant, size, tone, scrollable, sortable, closable }: {
  variant: string; size: string; tone: string; scrollable: boolean; sortable: boolean; closable: boolean;
}) {
  const initial = scrollable ? manyTabs : baseTabs;
  const [items, setItems] = useState(initial.map((t) => ({ ...t, closable })));

  return (
    <div style={{ width: "100%", maxWidth: 480 }}>
      <TabsStyled
        key={`${scrollable}-${closable}-${sortable}`}
        tabs={items.map((t) => ({ ...t, closable }))}
        variant={variant as "line" | "solid" | "pill"}
        size={size as "sm" | "md" | "lg"}
        tone={tone as "neutral" | "primary"}
        defaultValue={items[0]?.value}
        scrollable={scrollable}
        sortable={sortable}
        onTabClose={(value) => setItems((cur) => cur.filter((t) => t.value !== value))}
        onReorder={(values) =>
          setItems((cur) => values.map((v) => cur.find((t) => t.value === v)!).filter(Boolean))
        }
      />
    </div>
  );
}

export default function TabsDemo() {
  return (
    <PropPlayground
      componentName="TabsStyled"
      importLine={`import { TabsStyled } from "@mshafiqyajid/react-tabs/styled";\nimport "@mshafiqyajid/react-tabs/styles.css";`}
      props={[
        { name: "variant",    control: { type: "segmented", options: ["line","solid","pill"] as const },  defaultValue: "line",    omitWhen: "line" },
        { name: "size",       control: { type: "segmented", options: ["sm","md","lg"] as const },         defaultValue: "md",      omitWhen: "md" },
        { name: "tone",       control: { type: "segmented", options: ["neutral","primary"] as const },    defaultValue: "neutral", omitWhen: "neutral" },
        { name: "scrollable", label: "scroll overflow",  control: { type: "toggle" }, defaultValue: false, omitWhen: false },
        { name: "sortable",   label: "drag to reorder",  control: { type: "toggle" }, defaultValue: false, omitWhen: false },
        { name: "closable",   label: "closable tabs (×)", control: { type: "toggle" }, defaultValue: false, omitWhen: false },
      ]}
      staticProps={{ tabs: "{tabs}", defaultValue: '"overview"' }}
      render={(v) => (
        <TabsWrapper
          variant={v.variant as string}
          size={v.size as string}
          tone={v.tone as string}
          scrollable={v.scrollable as boolean}
          sortable={v.sortable as boolean}
          closable={v.closable as boolean}
        />
      )}
    />
  );
}
