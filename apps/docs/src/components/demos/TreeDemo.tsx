import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { TreeStyled } from "@mshafiqyajid/react-tree/styled";
import { TextInputStyled } from "@mshafiqyajid/react-text-input/styled";
import type { TreeNode } from "@mshafiqyajid/react-tree";
import "@mshafiqyajid/react-tree/styles.css";
import "@mshafiqyajid/react-text-input/styles.css";

const ITEMS: TreeNode[] = [
  {
    id: "src",
    label: "src",
    children: [
      {
        id: "components",
        label: "components",
        children: [
          { id: "Button.tsx", label: "Button.tsx" },
          { id: "Card.tsx",   label: "Card.tsx" },
          { id: "Modal.tsx",  label: "Modal.tsx" },
        ],
      },
      {
        id: "hooks",
        label: "hooks",
        children: [
          { id: "useToggle.ts", label: "useToggle.ts" },
          { id: "useDebounce.ts", label: "useDebounce.ts" },
        ],
      },
      { id: "index.ts", label: "index.ts" },
      { id: "App.tsx",  label: "App.tsx" },
    ],
  },
  {
    id: "public",
    label: "public",
    children: [
      { id: "favicon.ico", label: "favicon.ico" },
      { id: "logo.svg",    label: "logo.svg" },
    ],
  },
  { id: "package.json", label: "package.json" },
  { id: "README.md",    label: "README.md" },
];

const FolderIcon = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 4h4l2 2h6v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4z" />
  </svg>
);
const FileIcon = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 1.5h6L13 4.5v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1zM10 1.5V4.5H13" />
  </svg>
);

const decorate = (nodes: TreeNode[]): TreeNode[] =>
  nodes.map((n) => ({
    ...n,
    icon: n.children !== undefined ? <FolderIcon /> : <FileIcon />,
    children: n.children !== undefined ? decorate(n.children) : undefined,
  }));

const ITEMS_DECORATED = decorate(ITEMS);

export default function TreeDemo() {
  const [single, setSingle] = useState<string | null>(null);
  const [multiSel, setMultiSel] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  return (
    <PropPlayground
      componentName="TreeStyled"
      importLine={`import { TreeStyled } from "@mshafiqyajid/react-tree/styled";\nimport "@mshafiqyajid/react-tree/styles.css";`}
      props={[
        { name: "size",           control: { type: "segmented", options: ["sm","md","lg"] as const },         defaultValue: "md",       omitWhen: "md" },
        { name: "tone",           control: { type: "segmented", options: ["primary","neutral"] as const },    defaultValue: "primary",  omitWhen: "primary" },
        { name: "showGuides",     control: { type: "toggle" },                                                  defaultValue: true,       omitWhen: true },
        { name: "checkboxes",     control: { type: "toggle" },                                                  defaultValue: false,      omitWhen: false },
        { name: "highlightMatches", control: { type: "toggle" },                                                defaultValue: true,       omitWhen: true },
        { name: "selectionMode",  control: { type: "segmented", options: ["single","multiple"] as const },     defaultValue: "single",   omitWhen: "single" },
      ]}
      staticProps={{ items: "{items}", searchQuery: "{search}", defaultExpandedIds: '{["src", "components"]}' }}
      render={(v) => {
        const multi = v.selectionMode === "multiple";
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", width: "100%", maxWidth: 360 }}>
            <TextInputStyled
              type="search"
              size="sm"
              placeholder="Filter…"
              value={search}
              onChange={setSearch}
              clearable
              block
            />
            <TreeStyled
              key={multi ? "multi" : "single"}
              items={ITEMS_DECORATED}
              defaultExpandedIds={["src", "components"]}
              size={v.size as "sm"|"md"|"lg"}
              tone={v.tone as "primary"|"neutral"}
              showGuides={v.showGuides as boolean}
              checkboxes={v.checkboxes as boolean}
              highlightMatches={v.highlightMatches as boolean}
              searchQuery={search}
              selectionMode={multi ? "multiple" : "single"}
              onSelectedChange={(id) => setSingle(id)}
              onSelectedIdsChange={(ids) => setMultiSel(ids)}
            />
            <div style={{ fontSize: "0.78rem", color: "var(--fg-muted)" }}>
              {multi
                ? `selected: ${multiSel.length === 0 ? "(none)" : multiSel.join(", ")}`
                : `selected: ${single ?? "(none)"}`}
            </div>
          </div>
        );
      }}
    />
  );
}
