import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { SortableStyled } from "@mshafiqyajid/react-sortable/styled";
import type { SortableItem } from "@mshafiqyajid/react-sortable";
import "@mshafiqyajid/react-sortable/styles.css";

interface Task extends SortableItem {
  id: string;
  title: string;
  description: string;
  tag: string;
  tagColor: string;
}

const INITIAL_ITEMS: Task[] = [
  {
    id: "1",
    title: "Design system tokens",
    description: "Define colour, spacing, and type scales",
    tag: "Design",
    tagColor: "#6366f1",
  },
  {
    id: "2",
    title: "Set up CI pipeline",
    description: "GitHub Actions for build, test, and publish",
    tag: "DevOps",
    tagColor: "#22c55e",
  },
  {
    id: "3",
    title: "Write onboarding docs",
    description: "Quick-start guide for new contributors",
    tag: "Docs",
    tagColor: "#f59e0b",
  },
  {
    id: "4",
    title: "Component library",
    description: "Headless primitives with styled variants",
    tag: "Dev",
    tagColor: "#3b82f6",
  },
  {
    id: "5",
    title: "Performance audit",
    description: "Lighthouse and bundle-size benchmarks",
    tag: "QA",
    tagColor: "#ef4444",
  },
  {
    id: "6",
    title: "Accessibility review",
    description: "WCAG 2.2 AA compliance across all components",
    tag: "A11y",
    tagColor: "#8b5cf6",
  },
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
    <div
      style={{
        maxWidth: orientation === "horizontal" ? "100%" : 460,
        width: "100%",
      }}
    >
      <SortableStyled
        items={items}
        onReorder={(next) => setItems(next as Task[])}
        orientation={orientation as "vertical" | "horizontal"}
        handle={handle}
        disabled={disabled}
        renderItem={(item) => {
          const task = item as Task;
          return (
            <span
              style={{
                display: "flex",
                flexDirection: orientation === "horizontal" ? "column" : "row",
                alignItems: orientation === "horizontal" ? "flex-start" : "center",
                gap: orientation === "horizontal" ? 4 : 10,
                width: "100%",
                minWidth: 0,
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "2px 8px",
                  borderRadius: 4,
                  fontSize: "0.70rem",
                  fontWeight: 600,
                  letterSpacing: "0.03em",
                  background: `${task.tagColor}1a`,
                  color: task.tagColor,
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}
              >
                {task.tag}
              </span>
              <span
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  minWidth: 0,
                  flex: 1,
                }}
              >
                <span
                  style={{
                    fontWeight: 500,
                    fontSize: "0.875rem",
                    color: "inherit",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {task.title}
                </span>
                {orientation !== "horizontal" && (
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "#71717a",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {task.description}
                  </span>
                )}
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
          group: "Appearance",
          control: { type: "segmented", options: ["vertical", "horizontal"] as const },
          defaultValue: "vertical",
          omitWhen: "vertical",
        },
        {
          name: "handle",
          group: "Behaviour",
          control: { type: "toggle" },
          defaultValue: true,
          omitWhen: true,
        },
        {
          name: "disabled",
          group: "Behaviour",
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
