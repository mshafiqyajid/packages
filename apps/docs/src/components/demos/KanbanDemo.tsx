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
      { id: "1", content: "Design system tokens" },
      { id: "2", content: "Set up CI pipeline" },
      { id: "3", content: "Write onboarding docs" },
    ],
  },
  {
    id: "prog",
    title: "In Progress",
    cards: [
      { id: "4", content: "Component library" },
      { id: "5", content: "Docs site" },
    ],
  },
  {
    id: "done",
    title: "Done",
    cards: [
      { id: "6", content: "Monorepo setup" },
    ],
  },
];

function KanbanWrapper({ size, tone, disabled }: { size: string; tone: string; disabled: boolean }) {
  const [columns, setColumns] = useState<KanbanColumn[]>(INITIAL);
  return (
    <div style={{ width: "100%", minHeight: 320 }}>
      <KanbanStyled
        columns={columns}
        onChange={setColumns}
        size={size as "sm" | "md" | "lg"}
        tone={tone as "neutral" | "primary"}
        disabled={disabled}
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
        { name: "size",     control: { type: "segmented", options: ["sm", "md", "lg"] as const },      defaultValue: "md",      omitWhen: "md" },
        { name: "tone",     control: { type: "segmented", options: ["neutral", "primary"] as const },  defaultValue: "neutral", omitWhen: "neutral" },
        { name: "disabled", control: { type: "toggle" },                                               defaultValue: false,     omitWhen: false },
      ]}
      staticProps={{ columns: "{columns}", onChange: "{setColumns}" }}
      render={(v) => (
        <KanbanWrapper
          key={String(v.size)}
          size={v.size as string}
          tone={v.tone as string}
          disabled={v.disabled as boolean}
        />
      )}
    />
  );
}
