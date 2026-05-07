import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { SliderStyled } from "@mshafiqyajid/react-slider/styled";
import type { SliderValue } from "@mshafiqyajid/react-slider";
import "@mshafiqyajid/react-slider/styles.css";

const LABELLED_MARKS = [
  { value: 0,   label: "0%" },
  { value: 25,  label: "¼" },
  { value: 50,  label: "½" },
  { value: 75,  label: "¾" },
  { value: 100, label: "100%" },
];

function SliderWrapper({ size, tone, range, showValue, showValueOnInteraction, marks, labelledMarks, formatPercent, disabled, orientation, label, hint, min, max, step }: {
  size: string; tone: string; range: boolean; showValue: boolean; showValueOnInteraction: boolean; marks: boolean; labelledMarks: boolean; formatPercent: boolean; disabled: boolean; orientation: string; label: string; hint: string; min: number; max: number; step: number;
}) {
  const [value, setValue] = useState<SliderValue>(range ? [20, 70] : 40);
  const [committed, setCommitted] = useState<SliderValue>(value);

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
        label={label || undefined}
        hint={hint || undefined}
        min={min}
        max={max}
        step={step}
      />
      <span style={{ fontSize: "0.78rem", color: "var(--fg-muted)" }}>
        committed: {Array.isArray(committed) ? committed.join("–") : committed}
      </span>
    </div>
  );
}

const SNAP_MARKS = [0, 20, 40, 60, 80, 100];

function MultiThumbWrapper({ snapToMarks }: { snapToMarks: boolean }) {
  const [value, setValue] = useState<number[]>([20, 50, 80]);
  return (
    <div style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <SliderStyled
        value={value as unknown as import("@mshafiqyajid/react-slider").SliderValue}
        onChange={(v) => setValue(v as unknown as number[])}
        tone="primary"
        marks={SNAP_MARKS}
        {...({ snapToMarks: snapToMarks } as object)}
        showValue
      />
      <span style={{ fontSize: "0.78rem", color: "var(--fg-muted)" }}>
        values: {value.join(" · ")}
      </span>
    </div>
  );
}

function LogScaleWrapper({ scale }: { scale: "linear" | "log" }) {
  const [value, setValue] = useState(100);
  return (
    <div style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <SliderStyled
        value={value}
        onChange={(v) => setValue(v as number)}
        tone="success"
        min={1}
        max={10000}
        step={1}
        {...({ scale: scale, scaleBase: 10 } as object)}
        showValue
        formatValue={(v) => v.toLocaleString()}
      />
      <span style={{ fontSize: "0.78rem", color: "var(--fg-muted)" }}>
        value: {value.toLocaleString()}
      </span>
    </div>
  );
}

export default function SliderDemo() {
  const [snapToMarks, setSnapToMarks] = useState(false);
  const [scale, setScale] = useState<"linear" | "log">("linear");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
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
          { name: "label",                control: { type: "text", placeholder: "e.g. Volume" },                                    defaultValue: "",        omitWhen: "" },
          { name: "hint",                 control: { type: "text", placeholder: "Helper text…" },                                   defaultValue: "",        omitWhen: "" },
          { name: "min",                  control: { type: "number", min: -100, max: 0, step: 1 },                                   defaultValue: 0,         omitWhen: 0 },
          { name: "max",                  control: { type: "number", min: 100, max: 1000, step: 1 },                                 defaultValue: 100,       omitWhen: 100 },
          { name: "step",                 control: { type: "number", min: 1, max: 25, step: 1 },                                     defaultValue: 1,         omitWhen: 1 },
        ]}
        staticProps={{ value: "{value}", onChange: "{setValue}" }}
        render={(v) => (
          <SliderWrapper
            key={`${v.range}-${v.orientation}-${v.labelledMarks}-${String(v.min)}-${String(v.max)}`}
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
            label={v.label as string}
            hint={v.hint as string}
            min={v.min as number}
            max={v.max as number}
            step={v.step as number}
          />
        )}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <p style={{ fontSize: "0.85rem", fontWeight: 600, margin: 0 }}>Multi-thumb — 3 independent thumbs</p>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", fontSize: "0.82rem" }}>
          <label style={{ display: "flex", gap: "0.4rem", alignItems: "center", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={snapToMarks}
              onChange={(e) => setSnapToMarks(e.target.checked)}
            />
            snapToMarks
          </label>
        </div>
        <MultiThumbWrapper snapToMarks={snapToMarks} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <p style={{ fontSize: "0.85rem", fontWeight: 600, margin: 0 }}>Log scale (min=1, max=10 000)</p>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", fontSize: "0.82rem" }}>
          {(["linear", "log"] as const).map((s) => (
            <label key={s} style={{ display: "flex", gap: "0.4rem", alignItems: "center", cursor: "pointer" }}>
              <input
                type="radio"
                name="scale"
                value={s}
                checked={scale === s}
                onChange={() => setScale(s)}
              />
              {s}
            </label>
          ))}
        </div>
        <LogScaleWrapper key={scale} scale={scale} />
      </div>
    </div>
  );
}
