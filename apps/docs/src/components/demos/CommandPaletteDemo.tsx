import { useState } from "react";
import { CommandPaletteStyled } from "@mshafiqyajid/react-command-palette/styled";
import { ButtonStyled } from "@mshafiqyajid/react-button/styled";
import "@mshafiqyajid/react-command-palette/styles.css";
import "@mshafiqyajid/react-button/styles.css";

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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "flex-start" }}>
      <ButtonStyled
        variant="outline"
        tone="neutral"
        onClick={() => setOpen(true)}
        iconRight={
          <kbd
            style={{
              padding: "1px 6px",
              border: "1px solid currentColor",
              borderRadius: 4,
              fontSize: "0.7rem",
              opacity: 0.7,
              fontFamily: "inherit",
            }}
          >
            ⌘K
          </kbd>
        }
      >
        Open palette
      </ButtonStyled>
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
