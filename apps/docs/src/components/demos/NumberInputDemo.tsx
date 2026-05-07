import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { NumberInputStyled } from "@mshafiqyajid/react-number-input/styled";
import "@mshafiqyajid/react-number-input/styles.css";

function NumberInputWrapper({
  size,
  tone,
  format,
  disabled,
  showStepper,
  step,
  bigStep,
  repeat,
  scrubable,
  largeStep,
}: {
  size: string;
  tone: string;
  format: string;
  disabled: boolean;
  showStepper: boolean;
  step: number;
  bigStep: number;
  repeat: boolean;
  scrubable: boolean;
  largeStep: number;
}) {
  const [value, setValue] = useState<number | undefined>(42);
  return (
    <NumberInputStyled
      value={value}
      onChange={setValue}
      size={size as "sm" | "md" | "lg"}
      tone={tone as "neutral" | "primary" | "success" | "danger"}
      format={format as "decimal" | "currency" | "percent"}
      currency={format === "currency" ? "MYR" : undefined}
      showStepper={showStepper}
      step={step}
      bigStep={bigStep > 0 ? bigStep : undefined}
      {...({ largeStep: largeStep > 0 ? largeStep : undefined } as object)}
      label="Amount"
      hint={
        scrubable
          ? "Drag the label left/right to scrub. Hold +/− to repeat."
          : "Hold +/− to repeat. Shift+arrows or PageUp/PageDown for large step."
      }
      style={{ width: "100%", maxWidth: 280 } as React.CSSProperties}
      disabled={disabled}
      {...({ repeat: repeat ? { initialDelay: 500, interval: 80, accel: 0.9 } : undefined, scrubable: scrubable } as object)}
    />
  );
}

export default function NumberInputDemo() {
  return (
    <PropPlayground
      componentName="NumberInputStyled"
      importLine={`import { NumberInputStyled } from "@mshafiqyajid/react-number-input/styled";\nimport "@mshafiqyajid/react-number-input/styles.css";`}
      props={[
        { name: "size",        control: { type: "segmented", options: ["sm","md","lg"] as const },                              defaultValue: "md",      omitWhen: "md" },
        { name: "tone",        control: { type: "segmented", options: ["neutral","primary","success","danger"] as const },      defaultValue: "neutral", omitWhen: "neutral" },
        { name: "format",      control: { type: "segmented", options: ["decimal","currency","percent"] as const },              defaultValue: "decimal", omitWhen: "decimal" },
        { name: "step",        control: { type: "slider", min: 1, max: 50, step: 1 },                                           defaultValue: 1,         omitWhen: 1 },
        { name: "bigStep",     control: { type: "slider", min: 0, max: 100, step: 1 },                                          defaultValue: 0,         omitWhen: 0 },
        { name: "largeStep",   control: { type: "slider", min: 0, max: 200, step: 1 },                                          defaultValue: 0,         omitWhen: 0 },
        { name: "showStepper", control: { type: "toggle" },                                                                     defaultValue: true,      omitWhen: true },
        { name: "repeat",      control: { type: "toggle" },                                                                     defaultValue: true,      omitWhen: true },
        { name: "scrubable",   control: { type: "toggle" },                                                                     defaultValue: false,     omitWhen: false },
        { name: "disabled",    control: { type: "toggle" },                                                                     defaultValue: false,     omitWhen: false },
      ]}
      staticProps={{ value: "{value}", onChange: "{setValue}" }}
      render={(v) => (
        <NumberInputWrapper
          key={String(v.format)}
          size={v.size as string}
          tone={v.tone as string}
          format={v.format as string}
          disabled={v.disabled as boolean}
          showStepper={v.showStepper as boolean}
          step={v.step as number}
          bigStep={v.bigStep as number}
          repeat={v.repeat as boolean}
          scrubable={v.scrubable as boolean}
          largeStep={v.largeStep as number}
        />
      )}
    />
  );
}
