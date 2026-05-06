import { useState } from "react";
import { CommandPaletteStyled } from "@mshafiqyajid/react-command-palette/styled";
import "@mshafiqyajid/react-command-palette/styles.css";

const ITEMS = [
  { id: "new",       label: "New file",         group: "File", shortcut: "⌘N" },
  { id: "open",      label: "Open recent…",     group: "File", keywords: ["recent", "history"] },
  { id: "save",      label: "Save",             group: "File", shortcut: "⌘S" },
  { id: "find",      label: "Find in files",    group: "Edit", shortcut: "⌘⇧F" },
  { id: "replace",   label: "Find and replace", group: "Edit" },
  { id: "format",    label: "Format document",  group: "Edit", shortcut: "⌘⇧I" },
  { id: "settings",  label: "Open settings",    group: "App",  shortcut: "⌘," },
  { id: "theme",     label: "Toggle theme",     group: "App" },
  { id: "shortcuts", label: "Keyboard shortcuts", group: "App", shortcut: "⌘K ⌘S" },
  { id: "logout",    label: "Sign out",         group: "App",  disabled: true },
];

export default function CommandPaletteDemo() {
  const [open, setOpen] = useState(false);
  const [last, setLast] = useState<string | null>(null);

  const btn: React.CSSProperties = {
    padding: "0.55rem 1rem",
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "var(--bg-elevated)",
    color: "var(--fg)",
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: 500,
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4rem",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "flex-start" }}>
      <button onClick={() => setOpen(true)} style={btn}>
        Open palette
        <kbd
          style={{
            padding: "1px 6px",
            border: "1px solid var(--border)",
            borderRadius: 4,
            background: "var(--bg-subtle, transparent)",
            fontSize: "0.7rem",
            color: "var(--fg-muted)",
          }}
        >
          ⌘K
        </kbd>
      </button>
      {last && (
        <div style={{ fontSize: "0.85rem", color: "var(--fg-muted)" }}>
          Last selected: <code>{last}</code>
        </div>
      )}
      <CommandPaletteStyled
        items={ITEMS}
        open={open}
        onOpenChange={setOpen}
        onSelect={(item) => setLast(item.label)}
        recentStorageKey="rcmd-demo-recent"
        footer={
          <>
            <span><kbd className="rcmd-kbd">↵</kbd> select</span>
            <span><kbd className="rcmd-kbd">↑</kbd><kbd className="rcmd-kbd">↓</kbd> nav</span>
            <span><kbd className="rcmd-kbd">esc</kbd> close</span>
          </>
        }
      />
    </div>
  );
}
