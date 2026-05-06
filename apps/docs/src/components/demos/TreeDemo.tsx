import { useState } from "react";
import { TreeStyled } from "@mshafiqyajid/react-tree/styled";
import type { TreeNode } from "@mshafiqyajid/react-tree";
import "@mshafiqyajid/react-tree/styles.css";

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

export default function TreeDemo() {
  const [size, setSize] = useState<"sm" | "md" | "lg">("md");
  const [showGuides, setShowGuides] = useState(true);
  const [multi, setMulti] = useState(false);
  const [single, setSingle] = useState<string | null>(null);
  const [multiSel, setMultiSel] = useState<string[]>([]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%", maxWidth: 480 }}>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", fontSize: "0.85rem", alignItems: "center" }}>
        <label>size:&nbsp;
          <select value={size} onChange={(e) => setSize(e.target.value as "sm" | "md" | "lg")}>
            <option value="sm">sm</option>
            <option value="md">md</option>
            <option value="lg">lg</option>
          </select>
        </label>
        <label>
          <input type="checkbox" checked={showGuides} onChange={(e) => setShowGuides(e.target.checked)} />
          &nbsp;guides
        </label>
        <label>
          <input type="checkbox" checked={multi} onChange={(e) => setMulti(e.target.checked)} />
          &nbsp;multi-select
        </label>
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
