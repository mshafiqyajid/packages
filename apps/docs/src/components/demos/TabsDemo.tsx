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

function TabsWrapper({ variant, size, tone, scrollable, reorderable, closeable, activationMode, orientation, lazyMount, forceMount }: {
  variant: string; size: string; tone: string; scrollable: boolean; reorderable: boolean; closeable: boolean; activationMode: string; orientation: string; lazyMount: boolean; forceMount: boolean;
}) {
  const initial = scrollable ? manyTabs : baseTabs;
  const [items, setItems] = useState(initial.map((t) => ({ ...t, closeable })));

  return (
    <div style={{ width: "100%", maxWidth: 480 }}>
      <TabsStyled
        key={`${scrollable}-${closeable}-${reorderable}-${activationMode}-${orientation}`}
        tabs={items.map((t) => ({ ...t, closeable }))}
        variant={variant as "line" | "solid" | "pill"}
        size={size as "sm" | "md" | "lg"}
        tone={tone as "neutral" | "primary"}
        defaultValue={items[0]?.value}
        scrollable={scrollable}
        reorderable={reorderable}
        activationMode={activationMode as "automatic" | "manual"}
        orientation={orientation as "horizontal" | "vertical"}
        lazyMount={lazyMount}
        forceMount={forceMount}
        onClose={(value) => setItems((cur) => cur.filter((t) => t.value !== value))}
        onReorder={(fromIndex, toIndex) => {
          setItems((cur) => {
            const next = [...cur];
            const [moved] = next.splice(fromIndex as number, 1);
            next.splice(toIndex as number, 0, moved);
            return next;
          });
        }}
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
        { name: "variant",        group: "Appearance", control: { type: "segmented", options: ["line","solid","pill"] as const },          defaultValue: "line",      omitWhen: "line" },
        { name: "size",           group: "Appearance", control: { type: "segmented", options: ["sm","md","lg"] as const },                 defaultValue: "md",        omitWhen: "md" },
        { name: "tone",           group: "Appearance", control: { type: "segmented", options: ["neutral","primary"] as const },            defaultValue: "neutral",   omitWhen: "neutral" },
        { name: "activationMode", group: "Behaviour",  label: "activation mode", control: { type: "segmented", options: ["automatic","manual"] as const }, defaultValue: "automatic", omitWhen: "automatic" },
        { name: "orientation",    group: "Behaviour",  control: { type: "segmented", options: ["horizontal","vertical"] as const }, defaultValue: "horizontal", omitWhen: "horizontal" },
        { name: "scrollable",     group: "Behaviour",  label: "scroll overflow",    control: { type: "toggle" }, defaultValue: false, omitWhen: false },
        { name: "reorderable",    group: "Behaviour",  label: "drag to reorder",    control: { type: "toggle" }, defaultValue: false, omitWhen: false },
        { name: "closeable",      group: "Behaviour",  label: "closeable tabs (×)", control: { type: "toggle" }, defaultValue: false, omitWhen: false },
        { name: "lazyMount",      group: "Display",    label: "lazy mount panels",  control: { type: "toggle" }, defaultValue: false, omitWhen: false },
        { name: "forceMount",     group: "Display",    label: "force mount panels", control: { type: "toggle" }, defaultValue: false, omitWhen: false },
      ]}
      staticProps={{ tabs: "{tabs}", defaultValue: '"overview"' }}
      render={(v) => (
        <TabsWrapper
          variant={v.variant as string}
          size={v.size as string}
          tone={v.tone as string}
          scrollable={v.scrollable as boolean}
          reorderable={v.reorderable as boolean}
          closeable={v.closeable as boolean}
          activationMode={v.activationMode as string}
          orientation={v.orientation as string}
          lazyMount={v.lazyMount as boolean}
          forceMount={v.forceMount as boolean}
        />
      )}
    />
  );
}
