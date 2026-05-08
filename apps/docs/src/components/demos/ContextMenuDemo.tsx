import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { ContextMenuStyled } from "@mshafiqyajid/react-context-menu/styled";
import "@mshafiqyajid/react-context-menu/styles.css";

// ---------------------------------------------------------------------------
// Sample item sets
// ---------------------------------------------------------------------------

const itemsFile = [
  { label: "New File",       shortcut: "⌘N",   onClick: () => {} },
  { label: "New Folder",     shortcut: "⌘⇧N",  onClick: () => {} },
  { type: "separator" as const },
  { label: "Open",           shortcut: "⌘O",   onClick: () => {} },
  { label: "Open Recent",
    items: [
      { label: "report.pdf",  onClick: () => {} },
      { label: "notes.md",    onClick: () => {} },
      { type: "separator" as const },
      { label: "Clear Recent", onClick: () => {} },
    ],
  },
  { type: "separator" as const },
  { label: "Rename",          onClick: () => {} },
  { label: "Delete",          onClick: () => {}, disabled: true },
];

const itemsEdit = [
  { type: "label" as const, label: "Clipboard" },
  { label: "Cut",            shortcut: "⌘X",   onClick: () => {} },
  { label: "Copy",           shortcut: "⌘C",   onClick: () => {} },
  { label: "Paste",          shortcut: "⌘V",   onClick: () => {} },
  { type: "separator" as const },
  { type: "label" as const, label: "History" },
  { label: "Undo",           shortcut: "⌘Z",   onClick: () => {} },
  { label: "Redo",           shortcut: "⌘⇧Z",  onClick: () => {} },
];

// Minimal icon SVG
function FolderIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 4a1 1 0 0 1 1-1h3l1 1.5h6a1 1 0 0 1 1 1V11a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4z" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 1H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5L8 1z" />
      <path d="M8 1v4h4" />
    </svg>
  );
}

const itemsWithIcons = [
  { label: "New File",   icon: <FileIcon />,   shortcut: "⌘N", onClick: () => {} },
  { label: "New Folder", icon: <FolderIcon />, shortcut: "⌘⇧N", onClick: () => {} },
  { type: "separator" as const },
  { label: "Delete",     onClick: () => {}, disabled: true },
];

// ---------------------------------------------------------------------------
// Demo
// ---------------------------------------------------------------------------

export default function ContextMenuDemo() {
  const [lastAction, setLastAction] = useState<string | null>(null);

  const itemsFileWithCallback = itemsFile.map((item) =>
    "label" in item && item.label && item.type !== "separator" && item.type !== "label"
      ? { ...item, onClick: () => setLastAction(item.label as string) }
      : item,
  );

  return (
    <PropPlayground
      componentName="ContextMenuStyled"
      importLine={`import { ContextMenuStyled } from "@mshafiqyajid/react-context-menu/styled";\nimport "@mshafiqyajid/react-context-menu/styles.css";`}
      props={[
        {
          name: "mode",
          group: "Content",
          label: "item set",
          control: { type: "segmented", options: ["file", "edit", "icons"] as const },
          defaultValue: "file",
          omitWhen: "file",
        },
        {
          name: "disabled",
          group: "State",
          control: { type: "toggle" },
          defaultValue: false,
          omitWhen: false,
        },
      ]}
      staticProps={{ items: "{items}" }}
      render={(v) => (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
          <ContextMenuStyled
            items={
              v.mode === "edit"
                ? itemsEdit
                : v.mode === "icons"
                ? itemsWithIcons
                : itemsFileWithCallback
            }
            disabled={v.disabled as boolean}
          >
            <div
              style={{
                width: "100%",
                maxWidth: 400,
                minHeight: 120,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px dashed var(--border, #e4e4e7)",
                borderRadius: 10,
                color: "var(--fg-muted, #71717a)",
                fontSize: "0.875rem",
                userSelect: "none",
                cursor: "context-menu",
                padding: "1.5rem",
              }}
            >
              Right-click anywhere in this area
            </div>
          </ContextMenuStyled>
          {lastAction && (
            <div style={{ fontSize: "0.78rem", color: "var(--fg-muted, #71717a)" }}>
              Last action: <code>{lastAction}</code>
            </div>
          )}
        </div>
      )}
    />
  );
}
