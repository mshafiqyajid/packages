import PropPlayground from "../PropPlayground";
import { DropdownMenuStyled } from "@mshafiqyajid/react-dropdown-menu/styled";
import { ButtonStyled } from "@mshafiqyajid/react-button/styled";
import "@mshafiqyajid/react-dropdown-menu/styles.css";
import "@mshafiqyajid/react-button/styles.css";

const itemsFlat = [
  { label: "Edit",     onClick: () => {} },
  { label: "Duplicate", onClick: () => {} },
  { label: "Archive",  onClick: () => {} },
  { label: "", divider: true },
  { label: "Delete",   onClick: () => {}, disabled: false },
];

const itemsWithSubmenu = [
  { label: "New",          onClick: () => {} },
  {
    label: "Open recent",
    items: [
      { label: "report.pdf", onClick: () => {} },
      { label: "notes.md",   onClick: () => {} },
      { label: "", divider: true },
      { label: "Clear",      onClick: () => {} },
    ],
  },
  {
    label: "Share",
    items: [
      { label: "Copy link",  onClick: () => {} },
      { label: "Email",      onClick: () => {} },
    ],
  },
  { label: "", divider: true },
  { label: "Quit",         onClick: () => {} },
];

export default function DropdownMenuDemo() {
  return (
    <PropPlayground
      componentName="DropdownMenuStyled"
      importLine={`import { DropdownMenuStyled } from "@mshafiqyajid/react-dropdown-menu/styled";\nimport "@mshafiqyajid/react-dropdown-menu/styles.css";`}
      props={[
        { name: "placement",   control: { type: "segmented", options: ["bottom-start","bottom-end","top-start","top-end"] as const }, defaultValue: "bottom-start", omitWhen: "bottom-start" },
        { name: "size",        control: { type: "segmented", options: ["sm","md","lg"] as const },                                   defaultValue: "md",          omitWhen: "md" },
        { name: "withSubmenus", label: "use nested items", control: { type: "toggle" }, defaultValue: false, omitWhen: false },
      ]}
      staticProps={{ items: "{items}" }}
      render={(v) => (
        <DropdownMenuStyled
          trigger={
            <ButtonStyled
              variant="outline"
              tone="neutral"
              iconRight={
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4l4 4 4-4"/></svg>
              }
            >
              {v.withSubmenus ? "File" : "Actions"}
            </ButtonStyled>
          }
          items={v.withSubmenus ? itemsWithSubmenu : itemsFlat}
          placement={v.placement as "bottom-start"|"bottom-end"|"top-start"|"top-end"}
          size={v.size as "sm"|"md"|"lg"}
        />
      )}
    />
  );
}
