import PropPlayground from "../PropPlayground";
import { AccordionStyled } from "@mshafiqyajid/react-accordion/styled";
import "@mshafiqyajid/react-accordion/styles.css";

const items = [
  { title: "What is a headless component?", content: "A headless component provides behaviour and accessibility without any styles, letting you bring your own UI." },
  { title: "Is it SSR-safe?", content: "Yes — all packages in this collection do nothing at import time and work with Next.js App Router, Remix, and Astro." },
  { title: "Can I use my own icons?", content: "The styled component ships a default chevron, but you can override it via CSS or build a custom trigger with the headless hook." },
];

export default function AccordionDemo() {
  return (
    <PropPlayground
      componentName="AccordionStyled"
      importLine={`import { AccordionStyled } from "@mshafiqyajid/react-accordion/styled";\nimport "@mshafiqyajid/react-accordion/styles.css";`}
      props={[
        { name: "type",      control: { type: "segmented", options: ["single","multiple"] as const }, defaultValue: "single",  omitWhen: "single" },
        { name: "size",      control: { type: "segmented", options: ["sm","md","lg"] as const },       defaultValue: "md",      omitWhen: "md" },
        { name: "tone",      control: { type: "segmented", options: ["neutral","primary"] as const },  defaultValue: "neutral", omitWhen: "neutral" },
        { name: "animated",  control: { type: "toggle" },                                              defaultValue: true,      omitWhen: true },
      ]}
      staticProps={{ items: "{items}" }}
      render={(v) => (
        <AccordionStyled
          items={items}
          type={v.type as "single" | "multiple"}
          size={v.size as "sm" | "md" | "lg"}
          tone={v.tone as "neutral" | "primary"}
          animated={v.animated as boolean}
          style={{ width: "100%", maxWidth: 480 } as React.CSSProperties}
        />
      )}
    />
  );
}
