import { useState } from "react";
import PropPlayground from "../PropPlayground";
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
    <PropPlayground
      componentName="CommandPaletteStyled"
      importLine={`import { CommandPaletteStyled } from "@mshafiqyajid/react-command-palette/styled";\nimport "@mshafiqyajid/react-command-palette/styles.css";`}
      props={[
        { name: "placeholder",       control: { type: "text", placeholder: "Type a command…" }, defaultValue: "Type a command…", omitWhen: "Type a command…" },
        { name: "highlightMatches",  control: { type: "toggle" },                                 defaultValue: true,             omitWhen: true },
        { name: "loading",           control: { type: "toggle" },                                 defaultValue: false,            omitWhen: false },
        { name: "withRecent",        label: "track recent",    control: { type: "toggle" },        defaultValue: true,             omitWhen: false },
        { name: "withFooter",        label: "footer hint row", control: { type: "toggle" },        defaultValue: true,             omitWhen: false },
      ]}
      staticProps={{ items: "{items}", open: "{open}", onOpenChange: "{setOpen}", onSelect: "{(item) => /* … */}" }}
      render={(v) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem", alignItems: "center" }}>
          <ButtonStyled variant="outline" tone="neutral" onClick={() => setOpen(true)}>
            Open palette&nbsp;
            <kbd style={{ padding: "1px 6px", border: "1px solid currentColor", borderRadius: 4, fontSize: "0.7rem", opacity: 0.7, fontFamily: "inherit" }}>⌘K</kbd>
          </ButtonStyled>
          {last && (
            <div style={{ fontSize: "0.78rem", color: "var(--fg-muted, #71717a)" }}>
              Last selected: <code>{last}</code>
            </div>
          )}
          <CommandPaletteStyled
            items={ITEMS}
            open={open}
            onOpenChange={setOpen}
            onSelect={(item) => setLast(item.label)}
            placeholder={v.placeholder as string}
            loading={v.loading as boolean}
            highlightMatches={v.highlightMatches as boolean}
            recentStorageKey={v.withRecent ? "rcmd-demo-recent" : undefined}
            footer={
              v.withFooter ? (
                <>
                  <span><kbd className="rcmd-kbd">↵</kbd> select</span>
                  <span><kbd className="rcmd-kbd">↑</kbd><kbd className="rcmd-kbd">↓</kbd> nav</span>
                  <span><kbd className="rcmd-kbd">esc</kbd> close</span>
                </>
              ) : undefined
            }
          />
        </div>
      )}
    />
  );
}
