import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { SidebarStyled } from "@mshafiqyajid/react-sidebar/styled";
import "@mshafiqyajid/react-sidebar/styles.css";
import type { SidebarSection } from "@mshafiqyajid/react-sidebar";

// ─── Icons ────────────────────────────────────────────────────────────────────

const HomeIcon = () => (
  <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 6.5L8 2l6 4.5V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6.5z" />
    <path d="M6 15V9h4v6" />
  </svg>
);

const FolderIcon = () => (
  <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 4h4l2 2h6v7a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4z" />
  </svg>
);

const UsersIcon = () => (
  <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="6" cy="5" r="2.5" />
    <path d="M1 14a5 5 0 0 1 10 0" />
    <path d="M11 3a2.5 2.5 0 0 1 0 5" />
    <path d="M15 14a5 5 0 0 0-4-4.9" />
  </svg>
);

const SettingsIcon = () => (
  <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="8" cy="8" r="2.5" />
    <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.22 3.22l1.06 1.06M11.72 11.72l1.06 1.06M3.22 12.78l1.06-1.06M11.72 4.28l1.06-1.06" />
  </svg>
);

const ChartIcon = () => (
  <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="9" width="3" height="5" rx="0.5" />
    <rect x="6.5" y="5" width="3" height="9" rx="0.5" />
    <rect x="11" y="2" width="3" height="12" rx="0.5" />
  </svg>
);

const BellIcon = () => (
  <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8 1.5A4.5 4.5 0 0 0 3.5 6v4.5l-1 1.5h11l-1-1.5V6A4.5 4.5 0 0 0 8 1.5z" />
    <path d="M6.5 12.5a1.5 1.5 0 0 0 3 0" />
  </svg>
);

const KeyIcon = () => (
  <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="5.5" cy="7" r="3.5" />
    <path d="M9 7h6M13 7v2M11 7v2" />
  </svg>
);

const CreditCardIcon = () => (
  <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="1" y="3.5" width="14" height="9" rx="1.5" />
    <path d="M1 6.5h14" />
    <path d="M4 10h2.5" />
  </svg>
);

// ─── Demo data ────────────────────────────────────────────────────────────────

const SECTIONS: SidebarSection[] = [
  {
    label: "Overview",
    items: [
      { id: "dashboard", label: "Dashboard", icon: <HomeIcon /> },
      { id: "analytics", label: "Analytics", icon: <ChartIcon />, badge: "New" },
    ],
  },
  {
    label: "Workspace",
    items: [
      {
        id: "projects",
        label: "Projects",
        icon: <FolderIcon />,
        children: [
          { id: "proj-active", label: "Active", badge: "12" },
          { id: "proj-archived", label: "Archived" },
          { id: "proj-templates", label: "Templates" },
        ],
      },
      {
        id: "team",
        label: "Team",
        icon: <UsersIcon />,
        children: [
          { id: "team-members", label: "Members", badge: "5" },
          { id: "team-invites", label: "Pending invites", badge: "2" },
        ],
      },
    ],
  },
  {
    label: "Account",
    items: [
      { id: "notifications", label: "Notifications", icon: <BellIcon />, badge: "3" },
      { id: "security", label: "Security", icon: <KeyIcon /> },
      { id: "billing", label: "Billing", icon: <CreditCardIcon /> },
      { id: "settings", label: "Settings", icon: <SettingsIcon /> },
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function SidebarDemo() {
  const [activeId, setActiveId] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);

  return (
    <PropPlayground
      layout="side-by-side"
      componentName="SidebarStyled"
      importLine={`import { SidebarStyled } from "@mshafiqyajid/react-sidebar/styled";\nimport "@mshafiqyajid/react-sidebar/styles.css";`}
      props={[
        {
          name: "variant",
          group: "Appearance",
          control: { type: "segmented", options: ["default", "bordered", "filled", "floating"] as const },
          defaultValue: "default",
          omitWhen: "default",
        },
        {
          name: "size",
          group: "Appearance",
          control: { type: "segmented", options: ["sm", "md", "lg"] as const },
          defaultValue: "md",
          omitWhen: "md",
        },
        {
          name: "showCollapseButton",
          group: "Display",
          control: { type: "toggle" },
          defaultValue: true,
          omitWhen: true,
        },
      ]}
      staticProps={{
        items: "{items}",
        activeId: `"${activeId}"`,
        onItemClick: "{(id) => setActiveId(id)}",
        collapsed: "{collapsed}",
        onCollapse: "{setCollapsed}",
      }}
      render={(v) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              style={{
                appearance: "none",
                background: "var(--bg-subtle, #f4f4f5)",
                border: "1px solid var(--border, #e4e4e7)",
                borderRadius: 6,
                padding: "0.3rem 0.75rem",
                fontSize: "0.8125rem",
                color: "var(--fg, #18181b)",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {collapsed ? "Expand sidebar" : "Collapse sidebar"}
            </button>
            <span style={{ fontSize: "0.8rem", color: "var(--fg-muted, #71717a)" }}>
              Active: <strong>{activeId}</strong>
            </span>
          </div>
          <div
            style={{
              display: "flex",
              height: 480,
              background: "var(--bg-subtle, #f4f4f5)",
              borderRadius: 10,
              overflow: "hidden",
              border: "1px solid var(--border, #e4e4e7)",
            }}
          >
            <SidebarStyled
              items={SECTIONS}
              variant={v.variant as "default" | "bordered" | "filled" | "floating"}
              size={v.size as "sm" | "md" | "lg"}
              showCollapseButton={v.showCollapseButton as boolean}
              collapsed={collapsed}
              onCollapse={setCollapsed}
              activeId={activeId}
              onItemClick={(id: string) => setActiveId(id)}
            />
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--fg-muted, #71717a)",
                fontSize: "0.85rem",
              }}
            >
              Select an item from the sidebar
            </div>
          </div>
        </div>
      )}
    />
  );
}
