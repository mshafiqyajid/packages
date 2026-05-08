import PropPlayground from "../PropPlayground";
import { NavbarStyled } from "@mshafiqyajid/react-navbar/styled";
import "@mshafiqyajid/react-navbar/styles.css";

const navItems = [
  { label: "Home", href: "#", active: true },
  { label: "Docs", href: "#" },
  { label: "Pricing", href: "#" },
  { label: "Blog", href: "#" },
];

function NavbarWrapper({
  variant,
  size,
  sticky,
  transparentOnTop,
}: {
  variant: string;
  size: string;
  sticky: boolean;
  transparentOnTop: boolean;
}) {
  return (
    <div
      style={{
        border: "1px solid var(--border, #e4e4e7)",
        borderRadius: "0.5rem",
        overflow: "hidden",
        width: "100%",
      }}
    >
      <NavbarStyled
        brand={
          <span style={{ fontWeight: 700, fontSize: "1rem", letterSpacing: "-0.01em" }}>
            Acme
          </span>
        }
        items={navItems}
        actions={
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              style={{
                padding: "0.375rem 0.875rem",
                borderRadius: "0.375rem",
                border: "1px solid var(--border, #e4e4e7)",
                background: "transparent",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "inherit",
              }}
            >
              Sign in
            </button>
            <button
              style={{
                padding: "0.375rem 0.875rem",
                borderRadius: "0.375rem",
                border: "none",
                background: "#18181b",
                color: "#fff",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              Get started
            </button>
          </div>
        }
        variant={variant as "default" | "bordered" | "filled" | "transparent"}
        size={size as "sm" | "md" | "lg"}
        sticky={sticky}
        transparentOnTop={transparentOnTop}
      />
    </div>
  );
}

export default function NavbarDemo() {
  return (
    <PropPlayground
      componentName="NavbarStyled"
      importLine={`import { NavbarStyled } from "@mshafiqyajid/react-navbar/styled";\nimport "@mshafiqyajid/react-navbar/styles.css";`}
      props={[
        {
          name: "variant",
          control: { type: "segmented", options: ["default", "bordered", "filled", "transparent"] as const },
          defaultValue: "default",
          omitWhen: "default",
        },
        {
          name: "size",
          control: { type: "segmented", options: ["sm", "md", "lg"] as const },
          defaultValue: "md",
          omitWhen: "md",
        },
        {
          name: "sticky",
          control: { type: "toggle" },
          defaultValue: false,
          omitWhen: false,
        },
        {
          name: "transparentOnTop",
          label: "transparent on top",
          control: { type: "toggle" },
          defaultValue: false,
          omitWhen: false,
        },
      ]}
      staticProps={{
        brand: "{brand}",
        items: "{navItems}",
        actions: "{actions}",
      }}
      render={(v) => (
        <NavbarWrapper
          variant={v.variant as string}
          size={v.size as string}
          sticky={v.sticky as boolean}
          transparentOnTop={v.transparentOnTop as boolean}
        />
      )}
    />
  );
}
