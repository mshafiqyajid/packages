import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { SliderStyled } from "@mshafiqyajid/react-slider/styled";
import "@mshafiqyajid/react-slider/styles.css";

const LABELLED_MARKS = [
  { value: 0,   label: "0%" },
  { value: 25,  label: "¼" },
  { value: 50,  label: "½" },
  { value: 75,  label: "¾" },
  { value: 100, label: "100%" },
];

function SliderWrapper({ size, tone, range, showValue, showValueOnInteraction, marks, labelledMarks, formatPercent, disabled, orientation }: {
  size: string; tone: string; range: boolean; showValue: boolean; showValueOnInteraction: boolean; marks: boolean; labelledMarks: boolean; formatPercent: boolean; disabled: boolean; orientation: string;
}) {
  const [value, setValue] = useState<number | [number, number]>(range ? [20, 70] : 40);
  const [committed, setCommitted] = useState<number | [number, number]>(value);

  const marksProp = labelledMarks ? LABELLED_MARKS : marks;

  return (
    <div style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <SliderStyled
        value={value}
        onChange={setValue}
        onCommit={setCommitted}
        size={size as "sm"|"md"|"lg"}
        tone={tone as "neutral"|"primary"|"success"|"danger"}
        range={range}
        showValue={showValue}
        showValueOnInteraction={showValueOnInteraction}
        formatValue={formatPercent ? (v) => `${v}%` : undefined}
        marks={marksProp as boolean}
        orientation={orientation as "horizontal" | "vertical"}
        disabled={disabled}
      />
      <span style={{ fontSize: "0.78rem", color: "var(--fg-muted)" }}>
        committed: {Array.isArray(committed) ? committed.join("–") : committed}
      </span>
    </div>
  );
}

export default function SliderDemo() {
  return (
    <PropPlayground
      componentName="SliderStyled"
      importLine={`import { SliderStyled } from "@mshafiqyajid/react-slider/styled";\nimport "@mshafiqyajid/react-slider/styles.css";`}
      props={[
        { name: "size",                 control: { type: "segmented", options: ["sm","md","lg"] as const },                        defaultValue: "md",      omitWhen: "md" },
        { name: "tone",                 control: { type: "segmented", options: ["neutral","primary","success","danger"] as const }, defaultValue: "primary", omitWhen: "neutral" },
        { name: "orientation",          control: { type: "segmented", options: ["horizontal","vertical"] as const },                defaultValue: "horizontal", omitWhen: "horizontal" },
        { name: "range",                control: { type: "toggle" },                                                                defaultValue: false,     omitWhen: false },
        { name: "showValue",            control: { type: "toggle" },                                                                defaultValue: false,     omitWhen: false },
        { name: "showValueOnInteraction", label: "bubble on hover/active", control: { type: "toggle" },                             defaultValue: false,     omitWhen: false },
        { name: "formatPercent",        label: "formatValue (% suffix)", control: { type: "toggle" },                               defaultValue: false,     omitWhen: false },
        { name: "marks",                control: { type: "toggle" },                                                                defaultValue: false,     omitWhen: false },
        { name: "labelledMarks",        label: "labelled marks",         control: { type: "toggle" },                              defaultValue: false,     omitWhen: false },
        { name: "disabled",             control: { type: "toggle" },                                                                defaultValue: false,     omitWhen: false },
      ]}
      staticProps={{ value: "{value}", onChange: "{setValue}" }}
      render={(v) => (
        <SliderWrapper
          key={`${v.range}-${v.orientation}-${v.labelledMarks}`}
          size={v.size as string}
          tone={v.tone as string}
          range={v.range as boolean}
          showValue={v.showValue as boolean}
          showValueOnInteraction={v.showValueOnInteraction as boolean}
          marks={v.marks as boolean}
          labelledMarks={v.labelledMarks as boolean}
          formatPercent={v.formatPercent as boolean}
          disabled={v.disabled as boolean}
          orientation={v.orientation as string}
        />
      )}
    />
  );
}
