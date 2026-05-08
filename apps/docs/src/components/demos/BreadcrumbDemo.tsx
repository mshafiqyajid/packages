import PropPlayground from "../PropPlayground";
import { BreadcrumbStyled } from "@mshafiqyajid/react-breadcrumb/styled";
import "@mshafiqyajid/react-breadcrumb/styles.css";

const demoItems = [
  { label: "Home", href: "#" },
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
        componentName="BreadcrumbStyled"
        importLine={`import { BreadcrumbStyled } from "@mshafiqyajid/react-breadcrumb/styled";\nimport "@mshafiqyajid/react-breadcrumb/styles.css";`}
        props={[
          { name: "size",      control: { type: "segmented", options: ["sm", "md", "lg"] as const },              defaultValue: "md",      omitWhen: "md" },
          { name: "separator", control: { type: "segmented", options: ["chevron", "slash", "arrow"] as const },   defaultValue: "chevron", omitWhen: "chevron" },
          { name: "maxItems",  control: { type: "slider", min: 0, max: 5, step: 1 },                             defaultValue: 0,         omitWhen: 0 },
        ]}
        render={(v) => (
          <BreadcrumbStyled
            items={demoItems}
            size={v.size as "sm" | "md" | "lg"}
            separator={v.separator as "chevron" | "slash" | "arrow"}
            maxItems={(v.maxItems as number) > 0 ? (v.maxItems as number) : undefined}
          />
        )}
      />
    </>
  );
}
