import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { SortableStyled } from "@mshafiqyajid/react-sortable/styled";
import type { SortableItem } from "@mshafiqyajid/react-sortable";
import "@mshafiqyajid/react-sortable/styles.css";

interface Task extends SortableItem {
  id: string;
  title: string;
  tag: string;
  tagColor: string;
}

const INITIAL_ITEMS: Task[] = [
  { id: "1", title: "Design system tokens", tag: "Design",    tagColor: "#6366f1" },
  { id: "2", title: "Set up CI pipeline",   tag: "DevOps",   tagColor: "#22c55e" },
  { id: "3", title: "Write onboarding docs",tag: "Docs",     tagColor: "#f59e0b" },
  { id: "4", title: "Component library",    tag: "Dev",      tagColor: "#3b82f6" },
  { id: "5", title: "Performance audit",    tag: "QA",       tagColor: "#ef4444" },
  { id: "6", title: "Accessibility review", tag: "A11y",     tagColor: "#8b5cf6" },
];

function SortableWrapper({
  orientation,
  handle,
  disabled,
}: {
  orientation: string;
  handle: boolean;
  disabled: boolean;
}) {
  const [items, setItems] = useState<Task[]>(INITIAL_ITEMS);

  return (
    <div style={{ maxWidth: orientation === "horizontal" ? "100%" : 420, width: "100%" }}>
      <SortableStyled
        items={items}
        onReorder={(next: { id: string | number }[]) => setItems(next as Task[])}
        orientation={orientation as "vertical" | "horizontal"}
        handle={handle}
        disabled={disabled}
        renderItem={(item: { id: string | number }, { isDragging, isOver }: { isDragging: boolean; isOver: boolean; handleProps: object }) => {
          const task = item as Task;
          return (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                width: "100%",
                opacity: isDragging ? 0.7 : 1,
                transition: "opacity 150ms ease",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "2px 8px",
                  borderRadius: 4,
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                  background: `${task.tagColor}22`,
                  color: task.tagColor,
                  flexShrink: 0,
                }}
              >
                {task.tag}
              </span>
              <span
                style={{
                  flex: 1,
                  fontWeight: isOver ? 600 : 400,
                  transition: "font-weight 100ms ease",
                }}
              >
                {task.title}
              </span>
            </span>
          );
        }}
      />
    </div>
  );
}

export default function SortableDemo() {
  return (
    <PropPlayground
      layout="stacked"
      componentName="SortableStyled"
      importLine={`import { SortableStyled } from "@mshafiqyajid/react-sortable/styled";\nimport "@mshafiqyajid/react-sortable/styles.css";`}
      props={[
        {
          name: "orientation",
          control: { type: "segmented", options: ["vertical", "horizontal"] as const },
          defaultValue: "vertical",
          omitWhen: "vertical",
        },
        {
          name: "handle",
          control: { type: "toggle" },
          defaultValue: true,
          omitWhen: true,
        },
        {
          name: "disabled",
          control: { type: "toggle" },
          defaultValue: false,
          omitWhen: false,
        },
      ]}
      staticProps={{
        items: "{items}",
        onReorder: "{setItems}",
        renderItem: "{renderItem}",
      }}
      render={(v) => (
        <SortableWrapper
          orientation={v["orientation"] as string}
          handle={v["handle"] as boolean}
          disabled={v["disabled"] as boolean}
        />
      )}
    />
  );
}
