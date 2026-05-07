import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { ProgressBar, ProgressCircle, ProgressCircleStack } from "@mshafiqyajid/react-progress/styled";
import "@mshafiqyajid/react-progress/styles.css";

const SECTIONS_DEMO = [
  { value: 40, tone: "primary"  as const, label: "Design" },
  { value: 30, tone: "success"  as const, label: "Dev" },
  { value: 20, tone: "warning"  as const, label: "QA" },
  { value: 10, tone: "danger"   as const, label: "Ops" },
];

export default function ProgressDemo() {
  const [bufferOn, setBufferOn] = useState(false);

  return (
    <>
      <PropPlayground
        componentName="ProgressBar"
        importLine={`import { ProgressBar } from "@mshafiqyajid/react-progress/styled";\nimport "@mshafiqyajid/react-progress/styles.css";`}
        props={[
          { name: "value",        control: { type: "slider", min: 0, max: 100 },                                                         defaultValue: 60,        omitWhen: 60 },
          { name: "size",         control: { type: "segmented", options: ["sm","md","lg"] as const },                                     defaultValue: "md",      omitWhen: "md" },
          { name: "tone",         control: { type: "segmented", options: ["neutral","primary","success","warning","danger"] as const },   defaultValue: "primary", omitWhen: "neutral" },
          { name: "showValue",    control: { type: "toggle" },                                                                            defaultValue: false,     omitWhen: false },
          { name: "animateValue", control: { type: "toggle" },                                                                            defaultValue: true,      omitWhen: true },
          { name: "animated",     control: { type: "toggle" },                                                                            defaultValue: false,     omitWhen: false },
          { name: "rounded",      control: { type: "toggle" },                                                                            defaultValue: true,      omitWhen: true },
          { name: "segments",     control: { type: "slider", min: 0, max: 10, step: 1 },                                                  defaultValue: 0,         omitWhen: 0 },
        ]}
        render={(v) => (
          <ProgressBar
            value={v.value as number}
            size={v.size as "sm"|"md"|"lg"}
            tone={v.tone as "neutral"|"primary"|"success"|"warning"|"danger"}
            showValue={v.showValue as boolean}
            animated={v.animated as boolean}
            rounded={v.rounded as boolean}
            segments={(v.segments as number) > 0 ? (v.segments as number) : undefined}
            style={{ width: "100%", maxWidth: 400 } as React.CSSProperties}
            {...({ animateValue: v.animateValue as boolean, label: "Progress" } as object)}
          />
        )}
      />

      {/* sections demo */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 400 }}>
        <span style={{ fontSize: "0.8rem", fontWeight: 500 }}>sections — proportional coloured segments</span>
        <ProgressBar sections={SECTIONS_DEMO} size="lg" rounded />
      </div>

      {/* bufferValue demo */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 400 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.8rem", fontWeight: 500 }}>bufferValue — ghost buffered track</span>
          <button
            onClick={() => setBufferOn((b) => !b)}
            style={{ fontSize: "0.75rem", padding: "2px 8px", cursor: "pointer" }}
          >
            {bufferOn ? "hide buffer" : "show buffer"}
          </button>
        </div>
        <ProgressBar
          value={40}
          bufferValue={bufferOn ? 75 : undefined}
          tone="primary"
          size="md"
          rounded
          style={{ width: "100%" }}
        />
      </div>

      <PropPlayground
        componentName="ProgressCircle"
        importLine={`import { ProgressCircle } from "@mshafiqyajid/react-progress/styled";\nimport "@mshafiqyajid/react-progress/styles.css";`}
        props={[
          { name: "value",     control: { type: "slider", min: 0, max: 100 }, defaultValue: 60,        omitWhen: 60 },
          { name: "size",      control: { type: "segmented", options: ["sm","md","lg"] as const },       defaultValue: "md",      omitWhen: "md" },
          { name: "tone",      control: { type: "segmented", options: ["neutral","primary","success","warning","danger"] as const }, defaultValue: "primary", omitWhen: "neutral" },
          { name: "showValue", control: { type: "toggle" },                                              defaultValue: false,     omitWhen: false },
        ]}
        staticProps={{ label: '"Upload"' }}
        render={(v) => (
          <ProgressCircle
            value={v.value as number}
            size={v.size as "sm"|"md"|"lg"}
            tone={v.tone as "neutral"|"primary"|"success"|"warning"|"danger"}
            showValue={v.showValue as boolean}
            {...({ label: "Upload" } as object)}
          />
        )}
      />

      {/* ProgressCircleStack demo */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
        <span style={{ fontSize: "0.8rem", fontWeight: 500 }}>ProgressCircleStack — concentric activity rings</span>
        <ProgressCircleStack
          size={140}
          gap={8}
          rings={[
            { value: 82, tone: "danger",  label: "Move" },
            { value: 64, tone: "success", label: "Exercise" },
            { value: 47, tone: "primary", label: "Stand" },
          ]}
        />
      </div>
    </>
  );
}
