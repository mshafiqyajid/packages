import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { KanbanStyled } from "@mshafiqyajid/react-kanban/styled";
import type { KanbanColumn } from "@mshafiqyajid/react-kanban";
import "@mshafiqyajid/react-kanban/styles.css";

const TODAY = new Date();
function offsetDate(days: number): string {
  const d = new Date(TODAY);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const INITIAL: KanbanColumn[] = [
  {
    id: "backlog",
    title: "Backlog",
    accent: "neutral",
    cards: [
      {
        id: "k1",
        content: "Refresh marketing site hero",
        description: "Add a new gradient mesh and product cover.",
        priority: "low",
        tags: ["design"],
        assignees: [{ id: "u1", name: "Maya Linn", color: "#a78bfa" }],
        comments: 4,
      },
      {
        id: "k2",
        content: "Investigate SSO login bug",
        description: "Some Okta users see a redirect loop on Safari 17.",
        priority: "medium",
        tags: ["bug", "auth"],
        assignees: [{ id: "u2", name: "Amir Park", color: "#22c55e" }],
        attachments: 2,
      },
    ],
  },
  {
    id: "todo",
    title: "To Do",
    accent: "blue",
    cards: [
      {
        id: "k3",
        content: "Ship dashboard tooltips",
        description: "Final pass on copy + a11y review.",
        priority: "high",
        tags: ["docs"],
        dueDate: offsetDate(1),
        assignees: [
          { id: "u1", name: "Maya Linn", color: "#a78bfa" },
          { id: "u3", name: "Kerry Ito", color: "#06b6d4" },
        ],
        checklist: { done: 3, total: 5 },
      },
      {
        id: "k4",
        content: "Migrate billing portal to v3 SDK",
        priority: "urgent",
        tags: ["billing", "infra"],
        dueDate: offsetDate(-1),
        assignees: [{ id: "u4", name: "Sam Vega", color: "#f97316" }],
        comments: 12,
        attachments: 1,
      },
    ],
  },
  {
    id: "doing",
    title: "In Progress",
    accent: "amber",
    wipLimit: 3,
    wipWarnThreshold: 2,
    cards: [
      {
        id: "k5",
        content: "New onboarding flow",
        description: "Three-step wizard with skip-for-now.",
        priority: "high",
        cover: "linear-gradient(120deg, #6366f1 0%, #ec4899 100%)",
        tags: ["growth"],
        dueDate: offsetDate(0),
        assignees: [
          { id: "u3", name: "Kerry Ito", color: "#06b6d4" },
          { id: "u2", name: "Amir Park", color: "#22c55e" },
        ],
        checklist: { done: 4, total: 6 },
        comments: 7,
      },
    ],
  },
  {
    id: "review",
    title: "In Review",
    accent: "violet",
    cards: [
      {
        id: "k6",
        content: "Audit billing emails",
        priority: "medium",
        tags: ["billing", "compliance"],
        assignees: [{ id: "u4", name: "Sam Vega", color: "#f97316" }],
        checklist: { done: 2, total: 2 },
        comments: 1,
      },
    ],
  },
  {
    id: "done",
    title: "Shipped",
    accent: "green",
    cards: [
      {
        id: "k7",
        content: "Color tokens v2",
        tags: ["design-system"],
        cover: "linear-gradient(120deg, #10b981 0%, #06b6d4 100%)",
        assignees: [{ id: "u1", name: "Maya Linn", color: "#a78bfa" }],
        checklist: { done: 8, total: 8 },
      },
    ],
  },
];

function KanbanWrapper(p: {
  size: string;
  tone: string;
  disabled: boolean;
  searchable: boolean;
  selectable: boolean;
  reorderable: boolean;
  columnReorderable: boolean;
  collapsible: boolean;
  showWipBadge: boolean;
  showCardRemoveButton: boolean;
  renameColumnInline: boolean;
  animateLayout: boolean;
}) {
  const [columns, setColumns] = useState<KanbanColumn[]>(INITIAL);
  return (
    <div style={{ width: "100%", minHeight: 380 }}>
      <KanbanStyled
        columns={columns}
        onChange={setColumns}
        size={p.size as "sm" | "md" | "lg"}
        tone={p.tone as "neutral" | "primary" | "success" | "warning" | "danger"}
        disabled={p.disabled}
        searchable={p.searchable}
        selectable={p.selectable}
        reorderable={p.reorderable}
        columnReorderable={p.columnReorderable}
        collapsible={p.collapsible}
        showWipBadge={p.showWipBadge}
        showCardRemoveButton={p.showCardRemoveButton}
        renameColumnInline={p.renameColumnInline}
        animateLayout={p.animateLayout}
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
      layout="stacked"
      componentName="KanbanStyled"
      importLine={`import { KanbanStyled } from "@mshafiqyajid/react-kanban/styled";\nimport "@mshafiqyajid/react-kanban/styles.css";`}
      props={[
        {
          name: "size",
          group: "Appearance",
          control: { type: "segmented", options: ["sm", "md", "lg"] as const },
          defaultValue: "md",
          omitWhen: "md",
        },
        {
          name: "tone",
          group: "Appearance",
          control: {
            type: "segmented",
            options: [
              "neutral",
              "primary",
              "success",
              "warning",
              "danger",
            ] as const,
          },
          defaultValue: "primary",
          omitWhen: "neutral",
        },
        {
          name: "searchable",
          group: "Behaviour",
          control: { type: "toggle" },
          defaultValue: true,
          omitWhen: false,
        },
        {
          name: "selectable",
          group: "Behaviour",
          control: { type: "toggle" },
          defaultValue: true,
          omitWhen: false,
        },
        {
          name: "reorderable",
          group: "Behaviour",
          control: { type: "toggle" },
          defaultValue: true,
          omitWhen: false,
        },
        {
          name: "columnReorderable",
          group: "Behaviour",
          control: { type: "toggle" },
          defaultValue: true,
          omitWhen: false,
        },
        {
          name: "animateLayout",
          group: "Behaviour",
          control: { type: "toggle" },
          defaultValue: true,
          omitWhen: false,
        },
        {
          name: "collapsible",
          group: "Behaviour",
          control: { type: "toggle" },
          defaultValue: false,
          omitWhen: false,
        },
        {
          name: "showWipBadge",
          group: "Display",
          control: { type: "toggle" },
          defaultValue: true,
          omitWhen: false,
        },
        {
          name: "showCardRemoveButton",
          group: "Display",
          control: { type: "toggle" },
          defaultValue: false,
          omitWhen: false,
        },
        {
          name: "renameColumnInline",
          group: "Display",
          control: { type: "toggle" },
          defaultValue: true,
          omitWhen: false,
        },
        {
          name: "disabled",
          group: "Behaviour",
          control: { type: "toggle" },
          defaultValue: false,
          omitWhen: false,
        },
      ]}
      staticProps={{ columns: "{columns}", onChange: "{setColumns}" }}
      render={(v) => (
        <KanbanWrapper
          key={String(v.size) + String(v.tone)}
          size={v.size as string}
          tone={v.tone as string}
          disabled={v.disabled as boolean}
          searchable={v.searchable as boolean}
          selectable={v.selectable as boolean}
          reorderable={v.reorderable as boolean}
          columnReorderable={v.columnReorderable as boolean}
          animateLayout={v.animateLayout as boolean}
          collapsible={v.collapsible as boolean}
          showWipBadge={v.showWipBadge as boolean}
          showCardRemoveButton={v.showCardRemoveButton as boolean}
          renameColumnInline={v.renameColumnInline as boolean}
        />
      )}
    />
  );
}
