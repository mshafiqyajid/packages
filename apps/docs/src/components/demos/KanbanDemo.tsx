import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { KanbanStyled } from "@mshafiqyajid/react-kanban/styled";
import type { KanbanColumn } from "@mshafiqyajid/react-kanban";
import "@mshafiqyajid/react-kanban/styles.css";

const INITIAL: KanbanColumn[] = [
  {
    id: "todo",
    title: "To Do",
    cards: [
      { id: "1", content: "Design system tokens", priority: "high" },
      { id: "2", content: "Set up CI pipeline", priority: "medium" },
      { id: "3", content: "Write onboarding docs", priority: "low" },
    ],
  },
  {
    id: "prog",
    title: "In Progress",
    cards: [
      { id: "4", content: "Component library", priority: "urgent" },
      { id: "5", content: "Docs site", priority: "high" },
    ],
    wipLimit: 3,
    wipWarnThreshold: 2,
  },
  {
    id: "done",
    title: "Done",
    cards: [{ id: "6", content: "Monorepo setup" }],
  },
];

function KanbanWrapper({
  size,
  tone,
  disabled,
  collapsible,
  reorderable,
  showCardRemoveButton,
  renameColumnInline,
}: {
  size: string;
  tone: string;
  disabled: boolean;
  collapsible: boolean;
  reorderable: boolean;
  showCardRemoveButton: boolean;
  renameColumnInline: boolean;
}) {
  const [columns, setColumns] = useState<KanbanColumn[]>(INITIAL);
  return (
    <div style={{ width: "100%", minHeight: 320 }}>
      <KanbanStyled
        columns={columns}
        onChange={setColumns}
        size={size as "sm" | "md" | "lg"}
        tone={tone as "neutral" | "primary"}
        disabled={disabled}
        collapsible={collapsible}
        reorderable={reorderable}
        showCardRemoveButton={showCardRemoveButton}
        renameColumnInline={renameColumnInline}
        showWipBadge
        addCardPlaceholder="Add card"
        addColumnPlaceholder="Add column"
        onColumnRemove={(col) =>
          setColumns((prev) => prev.filter((c) => c.id !== col.id))
        }
      />
    </div>
  );
}

export default function KanbanDemo() {
  return (
    <PropPlayground
      componentName="KanbanStyled"
      importLine={`import { KanbanStyled } from "@mshafiqyajid/react-kanban/styled";\nimport "@mshafiqyajid/react-kanban/styles.css";`}
      props={[
        { name: "size",                 control: { type: "segmented", options: ["sm", "md", "lg"] as const },     defaultValue: "md",      omitWhen: "md" },
        { name: "tone",                 control: { type: "segmented", options: ["neutral", "primary"] as const }, defaultValue: "neutral", omitWhen: "neutral" },
        { name: "disabled",             control: { type: "toggle" }, defaultValue: false, omitWhen: false },
        { name: "collapsible",          control: { type: "toggle" }, defaultValue: false, omitWhen: false },
        { name: "reorderable",          control: { type: "toggle" }, defaultValue: true,  omitWhen: false },
        { name: "showCardRemoveButton", control: { type: "toggle" }, defaultValue: true,  omitWhen: false },
        { name: "renameColumnInline",   control: { type: "toggle" }, defaultValue: true,  omitWhen: false },
      ]}
      staticProps={{ columns: "{columns}", onChange: "{setColumns}" }}
      render={(v) => (
        <KanbanWrapper
          key={String(v.size)}
          size={v.size as string}
          tone={v.tone as string}
          disabled={v.disabled as boolean}
          collapsible={v.collapsible as boolean}
          reorderable={v.reorderable as boolean}
          showCardRemoveButton={v.showCardRemoveButton as boolean}
          renameColumnInline={v.renameColumnInline as boolean}
        />
      )}
    />
  );
}
