import { useState } from "react";
import { TextInputStyled } from "@mshafiqyajid/react-text-input/styled";
import { SelectStyled } from "@mshafiqyajid/react-select/styled";
import { SwitchStyled } from "@mshafiqyajid/react-switch/styled";
import "@mshafiqyajid/react-text-input/styles.css";
import "@mshafiqyajid/react-select/styles.css";
import "@mshafiqyajid/react-switch/styles.css";

const SIZE_ITEMS = [
  { value: "sm", label: "sm" },
  { value: "md", label: "md" },
  { value: "lg", label: "lg" },
];
const TYPE_ITEMS = [
  { value: "text",     label: "text" },
  { value: "email",    label: "email" },
  { value: "password", label: "password" },
  { value: "url",      label: "url" },
  { value: "search",   label: "search" },
];

export default function TextInputDemo() {
  const [size, setSize] = useState<"sm" | "md" | "lg">("md");
  const [type, setType] = useState<"text" | "email" | "password" | "url" | "search">("email");
  const [clearable, setClearable] = useState(true);
  const [disabled, setDisabled] = useState(false);
  const [value, setValue] = useState("");
  const [withError, setWithError] = useState(false);

  const error = withError && value && !value.includes("@")
    ? "Must include @"
    : undefined;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%", maxWidth: 480 }}>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", fontSize: "0.85rem", alignItems: "center" }}>
        <label style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
          size:
          <SelectStyled items={SIZE_ITEMS} value={size} onChange={(v) => setSize(v as typeof size)} size="sm" />
        </label>
        <label style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
          type:
          <SelectStyled items={TYPE_ITEMS} value={type} onChange={(v) => setType(v as typeof type)} size="sm" />
        </label>
        <SwitchStyled checked={clearable} onChange={setClearable} label="clearable" size="sm" tone="primary" />
        <SwitchStyled checked={disabled} onChange={setDisabled} label="disabled" size="sm" tone="primary" />
        <SwitchStyled checked={withError} onChange={setWithError} label="show validation" size="sm" tone="primary" />
      </div>

      <TextInputStyled
        type={type}
        size={size}
        value={value}
        onChange={setValue}
        placeholder="Type something…"
        clearable={clearable}
        disabled={disabled}
        error={error}
        hint={!error ? "Hint text appears here." : undefined}
        block
      />
    </div>
  );
}
