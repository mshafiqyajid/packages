import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { RangeStyled } from "@mshafiqyajid/react-range/styled";
import type { RangeValue } from "@mshafiqyajid/react-range";
import "@mshafiqyajid/react-range/styles.css";

const LABELLED_MARKS = [
  { value: 0, label: "0%" },
  { value: 25, label: "¼" },
  { value: 50, label: "½" },
  { value: 75, label: "¾" },
  { value: 100, label: "100%" },
];

function RangeWrapper({
  size,
  tone,
  mode,
  showTooltip,
  marks,
  labelledMarks,
  formatValue,
  disabled,
  inverted,
  label,
  hint,
  min,
  max,
  step,
}: {
  size: string;
  tone: string;
  mode: string;
  showTooltip: string;
  marks: boolean;
  labelledMarks: boolean;
  formatValue: boolean;
  disabled: boolean;
  inverted: boolean;
  label: string;
  hint: string;
  min: number;
  max: number;
  step: number;
}) {
  const isRange = mode === "range";
  const [value, setValue] = useState<RangeValue>(isRange ? [20, 70] : 40);
  const [committed, setCommitted] = useState<RangeValue>(value);

  const marksProp = labelledMarks ? LABELLED_MARKS : marks;

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 380,
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}
    >
      <RangeStyled
        value={value as number | [number, number]}
        onChange={(v: number | [number, number]) => setValue(v)}
        onChangeEnd={(v: number | [number, number]) => setCommitted(v)}
        size={size as "sm" | "md" | "lg"}
        tone={tone as "neutral" | "primary" | "success" | "warning" | "danger"}
        mode={mode as "single" | "range"}
        showTooltip={showTooltip as "always" | "drag" | "never"}
        tooltipFormat={formatValue ? (v: number) => `${v}%` : undefined}
        marks={marksProp as boolean}
        disabled={disabled}
        inverted={inverted}
        label={label || undefined}
        hint={hint || undefined}
        min={min}
        max={max}
        step={step}
      />
      <span style={{ fontSize: "0.78rem", color: "var(--fg-muted)" }}>
        committed:{" "}
        {Array.isArray(committed) ? committed.join("–") : committed}
      </span>
    </div>
  );
}

function ToneSlider({ tone }: { tone: "primary" | "success" | "warning" | "danger" | "neutral" }) {
  const [v, setV] = useState(40);
  return (
    <RangeStyled
      mode="single"
      value={v}
      onChange={(val: number | [number, number]) => setV(val as number)}
      tone={tone}
      label={tone}
      showTooltip="drag"
    />
  );
}

function ToneShowcase() {
  const tones = ["primary", "success", "warning", "danger", "neutral"] as const;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        width: "100%",
        maxWidth: 380,
      }}
    >
      {tones.map((tone) => (
        <ToneSlider key={tone} tone={tone} />
      ))}
    </div>
  );
}

function MarksShowcase() {
  const [single, setSingle] = useState(50);
  const [range, setRange] = useState<[number, number]>([20, 80]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
        width: "100%",
        maxWidth: 380,
      }}
    >
      <RangeStyled
        mode="single"
        value={single}
        onChange={(v: number | [number, number]) => setSingle(v as number)}
        min={0}
        max={100}
        step={25}
        marks
        showTooltip="always"
        label="Step marks (step=25)"
      />
      <RangeStyled
        mode="range"
        value={range}
        onChange={(v: number | [number, number]) => setRange(v as [number, number])}
        marks={LABELLED_MARKS}
        showTooltip="drag"
        label="Labelled marks"
        tone="success"
      />
    </div>
  );
}

export default function RangeDemo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <PropPlayground
        componentName="RangeStyled"
        importLine={`import { RangeStyled } from "@mshafiqyajid/react-range/styled";\nimport "@mshafiqyajid/react-range/styles.css";`}
        props={[
          {
            name: "mode",
            group: "Appearance",
            control: { type: "segmented", options: ["range", "single"] as const },
            defaultValue: "range",
            omitWhen: "range",
          },
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
              options: ["primary", "neutral", "success", "warning", "danger"] as const,
            },
            defaultValue: "primary",
            omitWhen: "primary",
          },
          {
            name: "showTooltip",
            group: "Display",
            control: {
              type: "segmented",
              options: ["drag", "always", "never"] as const,
            },
            defaultValue: "drag",
            omitWhen: "drag",
          },
          {
            name: "marks",
            group: "Display",
            control: { type: "toggle" },
            defaultValue: false,
            omitWhen: false,
          },
          {
            name: "labelledMarks",
            group: "Display",
            label: "labelled marks",
            control: { type: "toggle" },
            defaultValue: false,
            omitWhen: false,
          },
          {
            name: "formatValue",
            group: "Display",
            label: "tooltipFormat (% suffix)",
            control: { type: "toggle" },
            defaultValue: false,
            omitWhen: false,
          },
          {
            name: "inverted",
            group: "Behaviour",
            control: { type: "toggle" },
            defaultValue: false,
            omitWhen: false,
          },
          {
            name: "disabled",
            group: "State",
            control: { type: "toggle" },
            defaultValue: false,
            omitWhen: false,
          },
          {
            name: "label",
            group: "Content",
            control: { type: "text", placeholder: "e.g. Price range" },
            defaultValue: "",
            omitWhen: "",
          },
          {
            name: "hint",
            group: "Content",
            control: { type: "text", placeholder: "Helper text…" },
            defaultValue: "",
            omitWhen: "",
          },
          {
            name: "min",
            group: "Behaviour",
            control: { type: "number", min: -100, max: 0, step: 1 },
            defaultValue: 0,
            omitWhen: 0,
          },
          {
            name: "max",
            group: "Behaviour",
            control: { type: "number", min: 100, max: 1000, step: 1 },
            defaultValue: 100,
            omitWhen: 100,
          },
          {
            name: "step",
            group: "Behaviour",
            control: { type: "number", min: 1, max: 25, step: 1 },
            defaultValue: 1,
            omitWhen: 1,
          },
        ]}
        staticProps={{ value: "{value}", onChange: "{setValue}" }}
        render={(v) => (
          <RangeWrapper
            key={`${String(v.mode)}-${String(v.labelledMarks)}-${String(v.min)}-${String(v.max)}`}
            size={v.size as string}
            tone={v.tone as string}
            mode={v.mode as string}
            showTooltip={v.showTooltip as string}
            marks={v.marks as boolean}
            labelledMarks={v.labelledMarks as boolean}
            formatValue={v.formatValue as boolean}
            disabled={v.disabled as boolean}
            inverted={v.inverted as boolean}
            label={v.label as string}
            hint={v.hint as string}
            min={v.min as number}
            max={v.max as number}
            step={v.step as number}
          />
        )}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <p style={{ fontSize: "0.85rem", fontWeight: 600, margin: 0 }}>
          Tone variants — single slider
        </p>
        <ToneShowcase />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <p style={{ fontSize: "0.85rem", fontWeight: 600, margin: 0 }}>
          Marks showcase
        </p>
        <MarksShowcase />
      </div>
    </div>
  );
}
