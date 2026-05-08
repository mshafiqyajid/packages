import type { CSSProperties } from "react";
import PropPlayground from "../PropPlayground";
import { NavbarStyled } from "@mshafiqyajid/react-navbar/styled";
import "@mshafiqyajid/react-navbar/styles.css";
import { ButtonStyled } from "@mshafiqyajid/react-button/styled";
import "@mshafiqyajid/react-button/styles.css";

const navItems = [
  { label: "Home", href: "#", active: true },
  { label: "Docs", href: "#" },
  { label: "Pricing", href: "#" },
  { label: "Blog", href: "#" },
];

function BrandLogo() {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <svg
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
        aria-hidden="true"
      >
        <rect width="22" height="22" rx="6" fill="var(--rnav-accent, #6366f1)" />
        <path
          d="M6 11L10 15L16 7"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span
        style={{
          fontWeight: 700,
          fontSize: "1rem",
          letterSpacing: "-0.02em",
          color: "var(--rnav-fg)",
        }}
      >
        Acme
      </span>
    </span>
  );
}

function NavActions({ variant }: { variant: string }) {
  const isFilled = variant === "filled";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <ButtonStyled
        variant="ghost"
        size="sm"
        style={
          isFilled
            ? ({ color: "rgba(255,255,255,0.85)" } as CSSProperties)
            : undefined
        }
      >
        Sign in
      </ButtonStyled>
      <ButtonStyled
        variant={isFilled ? "outline" : "solid"}
        tone="primary"
        size="sm"
      >
        Get started
      </ButtonStyled>
    </div>
  );
}

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
  const resolvedVariant = variant as
    | "default"
    | "bordered"
    | "filled"
    | "transparent";

  return (
    <div
      style={{
        border: "1px solid var(--border, #e4e4e7)",
        borderRadius: "0.75rem",
        overflow: "hidden",
        width: "100%",
        height: "220px",
        overflowY: "auto",
        position: "relative",
      }}
    >
      <NavbarStyled
        brand={<BrandLogo />}
        items={navItems}
        actions={<NavActions variant={variant} />}
        variant={resolvedVariant}
        size={size as "sm" | "md" | "lg"}
        sticky={sticky}
        transparentOnTop={transparentOnTop}
        scrollThreshold={16}
      />
      {/* Scrollable content to demo sticky + scrolled glassmorphism */}
      <div
        style={{
          padding: "1.25rem 1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            style={{
              height: "40px",
              borderRadius: "8px",
              background: "var(--surface-2, #f4f4f5)",
              opacity: 0.6 + i * 0.06,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function NavbarDemo() {
  return (
    <PropPlayground
      layout="stacked"
      componentName="NavbarStyled"
      importLine={`import { NavbarStyled } from "@mshafiqyajid/react-navbar/styled";\nimport "@mshafiqyajid/react-navbar/styles.css";`}
      props={[
        {
          name: "variant",
          control: {
            type: "segmented",
            options: ["default", "bordered", "filled", "transparent"] as const,
          },
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
