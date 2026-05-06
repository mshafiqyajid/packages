import { useState } from "react";
import { TreeStyled } from "@mshafiqyajid/react-tree/styled";
import type { TreeNode } from "@mshafiqyajid/react-tree";
import { SelectStyled } from "@mshafiqyajid/react-select/styled";
import { SwitchStyled } from "@mshafiqyajid/react-switch/styled";
import "@mshafiqyajid/react-tree/styles.css";
import "@mshafiqyajid/react-select/styles.css";
import "@mshafiqyajid/react-switch/styles.css";

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
      { id: "index.ts",   label: "index.ts" },
      { id: "App.tsx",    label: "App.tsx" },
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

const SIZE_ITEMS = [
  { value: "sm", label: "sm" },
  { value: "md", label: "md" },
  { value: "lg", label: "lg" },
];

export default function TreeDemo() {
  const [size, setSize] = useState<"sm" | "md" | "lg">("md");
  const [showGuides, setShowGuides] = useState(true);
  const [multi, setMulti] = useState(false);
  const [single, setSingle] = useState<string | null>(null);
  const [multiSel, setMultiSel] = useState<string[]>([]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%", maxWidth: 480 }}>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", fontSize: "0.85rem", alignItems: "center" }}>
        <label style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
          size:
          <SelectStyled
            items={SIZE_ITEMS}
            value={size}
            onChange={(v) => setSize(v as "sm" | "md" | "lg")}
            size="sm"
          />
        </label>
        <SwitchStyled
          checked={showGuides}
          onChange={setShowGuides}
          label="guides"
          size="sm"
          tone="primary"
        />
        <SwitchStyled
          checked={multi}
          onChange={setMulti}
          label="multi-select"
          size="sm"
          tone="primary"
        />
      </div>

      <TreeStyled
        key={multi ? "multi" : "single"}
        items={ITEMS_DECORATED}
        defaultExpandedIds={["src", "components"]}
        size={size}
        showGuides={showGuides}
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
}
