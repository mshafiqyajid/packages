import PropPlayground from "../PropPlayground";
import { DropdownMenuStyled } from "@mshafiqyajid/react-dropdown-menu/styled";
import { ButtonStyled } from "@mshafiqyajid/react-button/styled";
import "@mshafiqyajid/react-dropdown-menu/styles.css";
import "@mshafiqyajid/react-button/styles.css";

const itemsFlat = [
  { label: "Edit",      shortcut: "⌘E", onClick: () => {} },
  { label: "Duplicate", shortcut: "⌘D", onClick: () => {} },
  { label: "Archive",                    onClick: () => {} },
  { label: "", divider: true },
  { label: "Delete",                     onClick: () => {}, disabled: false },
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

const itemsCheckbox = [
  { label: "Bold",          kind: "checkbox" as const, checked: true,  onClick: () => {} },
  { label: "Italic",        kind: "checkbox" as const, checked: false, onClick: () => {} },
  { label: "Underline",     kind: "checkbox" as const, checked: false, onClick: () => {} },
  { label: "", divider: true },
  { label: "Small",  kind: "radio" as const, group: "Size", checked: false, onClick: () => {} },
  { label: "Medium", kind: "radio" as const, group: "Size", checked: true,  onClick: () => {} },
  { label: "Large",  kind: "radio" as const, group: "Size", checked: false, onClick: () => {} },
];

export default function DropdownMenuDemo() {
  return (
    <PropPlayground
      componentName="DropdownMenuStyled"
      importLine={`import { DropdownMenuStyled } from "@mshafiqyajid/react-dropdown-menu/styled";\nimport "@mshafiqyajid/react-dropdown-menu/styles.css";`}
      props={[
        { name: "placement",   control: { type: "segmented", options: ["bottom-start","bottom-end","top-start","top-end"] as const }, defaultValue: "bottom-start", omitWhen: "bottom-start" },
        { name: "size",        control: { type: "segmented", options: ["sm","md","lg"] as const },                                   defaultValue: "md",          omitWhen: "md" },
        { name: "mode", label: "item mode", control: { type: "segmented", options: ["flat", "submenu", "checkbox"] as const }, defaultValue: "flat", omitWhen: "flat" },
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
              {v.mode === "submenu" ? "File" : v.mode === "checkbox" ? "Format" : "Actions"}
            </ButtonStyled>
          }
          items={
            v.mode === "submenu" ? itemsWithSubmenu :
            v.mode === "checkbox" ? itemsCheckbox :
            itemsFlat
          }
          placement={v.placement as "bottom-start"|"bottom-end"|"top-start"|"top-end"}
          size={v.size as "sm"|"md"|"lg"}
        />
      )}
    />
  );
}
