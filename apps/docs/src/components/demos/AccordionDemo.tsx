import React from "react";
import PropPlayground from "../PropPlayground";
import { AccordionStyled as _AccordionStyled } from "@mshafiqyajid/react-accordion/styled";
import "@mshafiqyajid/react-accordion/styles.css";

const AccordionStyled = _AccordionStyled as React.ComponentType<
  React.ComponentProps<typeof _AccordionStyled> & {
    variant?: "bordered" | "separated" | "flush";
    lazy?: boolean;
  }
>;

const items = [
  {
    title: (
      <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "#6366f1",
            color: "#fff",
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          1
        </span>
        What is a headless component?
        <span
          style={{
            marginLeft: "auto",
            fontSize: 11,
            fontWeight: 600,
            padding: "2px 6px",
            borderRadius: 4,
            background: "#eef2ff",
            color: "#4338ca",
          }}
        >
          New
        </span>
      </span>
    ),
    renderHeader: ({ isOpen, toggle }: { isOpen: boolean; toggle: () => void }) => (
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          width: "100%",
          padding: 0,
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "#6366f1",
            color: "#fff",
            fontSize: 11,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          1
        </span>
        <span style={{ flex: 1, textAlign: "left" }}>What is a headless component?</span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: "2px 6px",
            borderRadius: 4,
            background: "#eef2ff",
            color: "#4338ca",
          }}
        >
          New
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          style={{
            marginLeft: 4,
            transition: "transform 220ms cubic-bezier(0.34,1.56,0.64,1)",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            color: "#71717a",
            flexShrink: 0,
          }}
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    ),
    content:
      "A headless component provides behaviour and accessibility without any styles, letting you bring your own UI.",
  },
  {
    title: "Is it SSR-safe?",
    content:
      "Yes — all packages in this collection do nothing at import time and work with Next.js App Router, Remix, and Astro.",
  },
  {
    title: "Can I use my own icons?",
    content:
      "The styled component ships a default chevron, but you can override it via renderHeader or build a custom trigger with the headless hook.",
  },
];

export default function AccordionDemo() {
  return (
    <PropPlayground
      componentName="AccordionStyled"
      importLine={`import { AccordionStyled } from "@mshafiqyajid/react-accordion/styled";\nimport "@mshafiqyajid/react-accordion/styles.css";`}
      props={[
        { name: "type",     control: { type: "segmented", options: ["single","multiple"] as const }, defaultValue: "single",   omitWhen: "single" },
        { name: "size",     control: { type: "segmented", options: ["sm","md","lg"] as const },       defaultValue: "md",       omitWhen: "md" },
        { name: "tone",     control: { type: "segmented", options: ["neutral","primary"] as const },  defaultValue: "neutral",  omitWhen: "neutral" },
        { name: "variant",  control: { type: "segmented", options: ["bordered","separated","flush"] as const }, defaultValue: "bordered", omitWhen: "bordered" },
        { name: "animated",    control: { type: "toggle" },                                              defaultValue: true,       omitWhen: true },
        { name: "lazy",        control: { type: "toggle" },                                              defaultValue: false,      omitWhen: false },
        { name: "collapsible", control: { type: "toggle" },                                              defaultValue: true,       omitWhen: true },
        { name: "disabled",    control: { type: "toggle" },                                              defaultValue: false,      omitWhen: false },
      ]}
      staticProps={{ items: "{items}" }}
      render={(v) => (
        <div style={{ width: "100%", maxWidth: 480 }}>
          <AccordionStyled
            items={items}
            type={v.type as "single" | "multiple"}
            size={v.size as "sm" | "md" | "lg"}
            tone={v.tone as "neutral" | "primary"}
            variant={v.variant as "bordered" | "separated" | "flush"}
            animated={v.animated as boolean}
            lazy={v.lazy as boolean}
            collapsible={v.collapsible as boolean}
            disabled={v.disabled as boolean}
          />
        </div>
      )}
    />
  );
}
