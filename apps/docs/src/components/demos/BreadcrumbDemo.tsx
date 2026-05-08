import PropPlayground from "../PropPlayground";
import { BreadcrumbStyled } from "@mshafiqyajid/react-breadcrumb/styled";
import "@mshafiqyajid/react-breadcrumb/styles.css";

const HomeIcon = (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 5L6 1l5 4M2 4.5V10h3V7h2v3h3V4.5" />
  </svg>
);

const demoItems = [
  { label: "Home", href: "#", icon: HomeIcon },
  { label: "Products", href: "#" },
  { label: "Electronics", href: "#" },
  { label: "Smartphones" },
];

export default function BreadcrumbDemo() {
  return (
    <>
      <div style={{ marginBottom: "1.5rem" }}>
        <BreadcrumbStyled items={demoItems} />
      </div>
      <PropPlayground
        layout="stacked"
        componentName="BreadcrumbStyled"
        importLine={`import { BreadcrumbStyled } from "@mshafiqyajid/react-breadcrumb/styled";\nimport "@mshafiqyajid/react-breadcrumb/styles.css";`}
        props={[
          { name: "variant",   control: { type: "segmented", options: ["plain", "pills", "underline"] as const },   defaultValue: "plain",   omitWhen: "plain" },
          { name: "size",      control: { type: "segmented", options: ["sm", "md", "lg"] as const },                defaultValue: "md",      omitWhen: "md" },
          { name: "separator", control: { type: "segmented", options: ["chevron", "slash", "arrow"] as const },     defaultValue: "chevron", omitWhen: "chevron" },
          { name: "maxItems",  control: { type: "slider", min: 0, max: 5, step: 1 },                               defaultValue: 0,         omitWhen: 0 },
        ]}
        render={(v) => (
          <BreadcrumbStyled
            items={demoItems}
            variant={v.variant as "plain" | "pills" | "underline"}
            size={v.size as "sm" | "md" | "lg"}
            separator={v.separator as "chevron" | "slash" | "arrow"}
            maxItems={(v.maxItems as number) > 0 ? (v.maxItems as number) : undefined}
          />
        )}
      />
    </>
  );
}
