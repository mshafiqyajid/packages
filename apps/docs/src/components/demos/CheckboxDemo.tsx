import { useState } from "react";
import { CheckboxStyled } from "@mshafiqyajid/react-checkbox/styled";
import { SelectStyled } from "@mshafiqyajid/react-select/styled";
import { SwitchStyled } from "@mshafiqyajid/react-switch/styled";
import "@mshafiqyajid/react-checkbox/styles.css";
import "@mshafiqyajid/react-select/styles.css";
import "@mshafiqyajid/react-switch/styles.css";

const SIZE_ITEMS = [
  { value: "sm", label: "sm" },
  { value: "md", label: "md" },
  { value: "lg", label: "lg" },
];
const TONE_ITEMS = [
  { value: "primary", label: "primary" },
  { value: "neutral", label: "neutral" },
  { value: "success", label: "success" },
  { value: "danger",  label: "danger" },
];

export default function CheckboxDemo() {
  const [size, setSize] = useState<"sm" | "md" | "lg">("md");
  const [tone, setTone] = useState<"primary" | "neutral" | "success" | "danger">("primary");
  const [a, setA] = useState(true);
  const [b, setB] = useState(false);
  const [c, setC] = useState<boolean | "indeterminate">("indeterminate");
  const [disabled, setDisabled] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", fontSize: "0.85rem", alignItems: "center" }}>
        <label style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
          size:
          <SelectStyled items={SIZE_ITEMS} value={size} onChange={(v) => setSize(v as typeof size)} size="sm" />
        </label>
        <label style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
          tone:
          <SelectStyled items={TONE_ITEMS} value={tone} onChange={(v) => setTone(v as typeof tone)} size="sm" />
        </label>
        <SwitchStyled checked={disabled} onChange={setDisabled} label="disabled" size="sm" tone="primary" />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        <CheckboxStyled checked={a} onChange={setA} label="Default checked" size={size} tone={tone} disabled={disabled} />
        <CheckboxStyled checked={b} onChange={setB} label="Unchecked" size={size} tone={tone} disabled={disabled} />
        <CheckboxStyled
          checked={c}
          onChange={(v) => setC(v)}
          label='Indeterminate (click → "checked")'
          size={size}
          tone={tone}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
