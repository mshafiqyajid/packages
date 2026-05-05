import PropPlayground from "../PropPlayground";
import { TimelineStyled } from "@mshafiqyajid/react-timeline/styled";
import type { TimelineItem } from "@mshafiqyajid/react-timeline";
import "@mshafiqyajid/react-timeline/styles.css";

const items: TimelineItem[] = [
  {
    id: "1",
    title: "Order placed",
    date: "Today · 10:24",
    description: "Confirmation email sent.",
    status: "completed",
    groupId: "today",
    timestamp: new Date(2026, 4, 5, 10, 24).getTime(),
  },
  {
    id: "2",
    title: "Payment captured",
    date: "Today · 10:25",
    status: "completed",
    groupId: "today",
    details: "Stripe charge ch_3OqK2pAB12 — $124.00 (USD)",
    timestamp: new Date(2026, 4, 5, 10, 25).getTime(),
  },
  {
    id: "3",
    title: "Processing",
    date: "Today · 11:50",
    status: "active",
    groupId: "today",
    description: "Picking from warehouse #4.",
    timestamp: new Date(2026, 4, 5, 11, 50).getTime(),
  },
  {
    id: "4",
    title: "Shipped",
    date: "Yesterday · 09:00",
    status: "default",
    groupId: "earlier",
    details: (
      <div>
        Tracking <strong>1Z999AA1</strong> · UPS Ground · ETA Wed.
      </div>
    ),
    timestamp: new Date(2026, 4, 4, 9, 0).getTime(),
  },
  {
    id: "5",
    title: "Awaiting confirmation",
    date: "—",
    status: "default",
    groupId: "earlier",
    timestamp: new Date(2026, 4, 4, 12, 0).getTime(),
  },
];

const groupLabels = { today: "Today", earlier: "Earlier this week" };

export default function TimelineDemo() {
  return (
    <PropPlayground
      componentName="TimelineStyled"
      importLine={`import { TimelineStyled } from "@mshafiqyajid/react-timeline/styled";\nimport "@mshafiqyajid/react-timeline/styles.css";`}
      props={[
        { name: "orientation", control: { type: "segmented", options: ["vertical","horizontal"] as const }, defaultValue: "vertical", omitWhen: "vertical" },
        { name: "size",        control: { type: "segmented", options: ["sm","md","lg"] as const },          defaultValue: "md",       omitWhen: "md" },
        { name: "tone",        control: { type: "segmented", options: ["neutral","primary","success","danger"] as const }, defaultValue: "primary", omitWhen: "neutral" },
        { name: "connector",   control: { type: "segmented", options: ["line","dashed","none"] as const },  defaultValue: "line",     omitWhen: "line" },
        { name: "align",       control: { type: "segmented", options: ["left","right","center","alternate"] as const }, defaultValue: "left", omitWhen: "left" },
        { name: "spacing",     control: { type: "segmented", options: ["uniform","time"] as const },        defaultValue: "uniform",  omitWhen: "uniform" },
        { name: "reverse",     control: { type: "toggle" }, defaultValue: false, omitWhen: false },
        { name: "animate",     control: { type: "toggle" }, defaultValue: false, omitWhen: false },
        { name: "grouped",     control: { type: "toggle" }, defaultValue: false, omitWhen: false },
        { name: "withPending", label: "pending tail", control: { type: "toggle" }, defaultValue: false, omitWhen: false },
      ]}
      staticProps={{ items: "{items}" }}
      render={(v) => (
        <TimelineStyled
          key={`${v.spacing}-${v.grouped}-${v.animate}`}
          items={items}
          orientation={v.orientation as "vertical"|"horizontal"}
          size={v.size as "sm"|"md"|"lg"}
          tone={v.tone as "neutral"|"primary"|"success"|"danger"}
          connector={v.connector as "line"|"dashed"|"none"}
          align={v.align as "left"|"right"|"center"|"alternate"}
          spacing={v.spacing as "uniform"|"time"}
          reverse={v.reverse as boolean}
          animate={v.animate as boolean}
          groupBy={v.grouped ? "groupId" : undefined}
          groupLabels={v.grouped ? groupLabels : undefined}
          pendingId={v.withPending ? "5" : undefined}
        />
      )}
    />
  );
}
