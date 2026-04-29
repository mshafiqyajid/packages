import PropPlayground from "../PropPlayground";
import { DropdownMenuStyled } from "@mshafiqyajid/react-dropdown-menu/styled";
import "@mshafiqyajid/react-dropdown-menu/styles.css";

const items = [
  { label: "Edit",     onClick: () => {} },
  { label: "Duplicate", onClick: () => {} },
  { label: "Archive",  onClick: () => {} },
  { label: "", divider: true },
  { label: "Delete",   onClick: () => {}, disabled: false },
];

export default function DropdownMenuDemo() {
  return (
    <PropPlayground
      componentName="DropdownMenuStyled"
      importLine={`import { DropdownMenuStyled } from "@mshafiqyajid/react-dropdown-menu/styled";\nimport "@mshafiqyajid/react-dropdown-menu/styles.css";`}
      props={[
        { name: "placement", control: { type: "segmented", options: ["bottom-start","bottom-end","top-start","top-end"] as const }, defaultValue: "bottom-start", omitWhen: "bottom-start" },
        { name: "size",      control: { type: "segmented", options: ["sm","md","lg"] as const },                                   defaultValue: "md",          omitWhen: "md" },
      ]}
      staticProps={{ items: "{items}" }}
      render={(v) => (
        <DropdownMenuStyled
          trigger={
            <button type="button" style={{ padding: "0.5rem 1.25rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-elevated)", color: "var(--fg)", cursor: "pointer", fontSize: "0.875rem", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
              Actions
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4l4 4 4-4"/></svg>
            </button>
          }
          items={items}
          placement={v.placement as "bottom-start"|"bottom-end"|"top-start"|"top-end"}
          size={v.size as "sm"|"md"|"lg"}
        />
      )}
    />
  );
}
