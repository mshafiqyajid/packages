import PropPlayground from "../PropPlayground";
import { TimelineStyled } from "@mshafiqyajid/react-timeline/styled";
import "@mshafiqyajid/react-timeline/styles.css";

const items = [
  { id: "1", title: "Order placed",    date: "Jan 1",  status: "completed" as const },
  { id: "2", title: "Processing",      date: "Jan 2",  status: "completed" as const },
  { id: "3", title: "Shipped",         date: "Jan 3",  status: "active" as const },
  { id: "4", title: "Out for delivery", date: "Jan 4", status: "default" as const },
  { id: "5", title: "Delivered",       date: "Jan 5",  status: "default" as const },
];

export default function TimelineDemo() {
  return (
    <PropPlayground
      componentName="TimelineStyled"
      importLine={`import { TimelineStyled } from "@mshafiqyajid/react-timeline/styled";\nimport "@mshafiqyajid/react-timeline/styles.css";`}
      props={[
        { name: "orientation", control: { type: "segmented", options: ["vertical","horizontal"] as const },      defaultValue: "vertical", omitWhen: "vertical" },
        { name: "size",        control: { type: "segmented", options: ["sm","md","lg"] as const },               defaultValue: "md",       omitWhen: "md" },
        { name: "tone",        control: { type: "segmented", options: ["neutral","primary"] as const },          defaultValue: "primary",  omitWhen: "neutral" },
        { name: "connector",   control: { type: "segmented", options: ["line","dashed","none"] as const },       defaultValue: "line",     omitWhen: "line" },
        { name: "align",       control: { type: "segmented", options: ["left","right","center"] as const },      defaultValue: "left",     omitWhen: "left" },
      ]}
      staticProps={{ items: "{items}" }}
      render={(v) => (
        <TimelineStyled
          items={items}
          orientation={v.orientation as "vertical"|"horizontal"}
          size={v.size as "sm"|"md"|"lg"}
          tone={v.tone as "neutral"|"primary"}
          connector={v.connector as "line"|"dashed"|"none"}
          align={v.align as "left"|"right"|"center"}
        />
      )}
    />
  );
}
