import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { InputMaskStyled } from "@mshafiqyajid/react-input-mask/styled";
import "@mshafiqyajid/react-input-mask/styles.css";

const MASKS: Record<string, string> = {
  phone: "(___) ___-____",
  date: "__/__/____",
  time: "__:__",
  card: "____ ____ ____ ____",
};

export default function InputMaskDemo() {
  const [value, setValue] = useState("");

  return (
    <PropPlayground
      componentName="InputMaskStyled"
      importLine={`import { InputMaskStyled } from "@mshafiqyajid/react-input-mask/styled";\nimport "@mshafiqyajid/react-input-mask/styles.css";`}
      props={[
        {
          name: "mask",
          group: "Mask",
          control: { type: "select", options: ["phone", "date", "time", "card"] as const },
          defaultValue: "phone",
        },
        {
          name: "maskChar",
          group: "Mask",
          control: { type: "select", options: ["_", "•", "-"] as const },
          defaultValue: "_",
          omitWhen: "_",
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
          control: { type: "segmented", options: ["neutral", "primary", "danger"] as const },
          defaultValue: "neutral",
          omitWhen: "neutral",
        },
        {
          name: "disabled",
          group: "State",
          control: { type: "toggle" },
          defaultValue: false,
          omitWhen: false,
        },
        {
          name: "invalid",
          group: "State",
          control: { type: "toggle" },
          defaultValue: false,
          omitWhen: false,
        },
        {
          name: "label",
          group: "Content",
          control: { type: "toggle" },
          defaultValue: true,
          omitWhen: false,
        },
        {
          name: "hint",
          group: "Content",
          control: { type: "toggle" },
          defaultValue: false,
          omitWhen: false,
        },
      ]}
      staticProps={{ onChange: "{(val) => setValue(val)}" }}
      render={(v) => {
        const maskKey = v.mask as string;
        const mask = MASKS[maskKey] ?? MASKS.phone!;
        const maskChar = v.maskChar as string;
        const size = v.size as "sm" | "md" | "lg";
        const tone = v.tone as "neutral" | "primary" | "danger";
        const disabled = v.disabled as boolean;
        const invalid = v.invalid as boolean;
        const showLabel = v.label as boolean;
        const showHint = v.hint as boolean;

        const labelText =
          maskKey === "phone" ? "Phone number" :
          maskKey === "date" ? "Date" :
          maskKey === "time" ? "Time" :
          "Card number";

        const hintText =
          maskKey === "phone" ? "Format: (555) 123-4567" :
          maskKey === "date" ? "Format: MM/DD/YYYY" :
          maskKey === "time" ? "Format: HH:MM" :
          "16-digit card number";

        return (
          <div style={{ width: "100%", maxWidth: 360 }}>
            <InputMaskStyled
              mask={mask}
              maskChar={maskChar !== "_" ? maskChar : undefined}
              size={size}
              tone={tone}
              disabled={disabled}
              invalid={invalid}
              label={showLabel ? labelText : undefined}
              hint={showHint ? hintText : undefined}
              value={value}
              onChange={(val) => setValue(val)}
            />
          </div>
        );
      }}
    />
  );
}
