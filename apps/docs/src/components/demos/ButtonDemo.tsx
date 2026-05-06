import { useState } from "react";
import { ButtonStyled } from "@mshafiqyajid/react-button/styled";
import { SelectStyled } from "@mshafiqyajid/react-select/styled";
import { SwitchStyled } from "@mshafiqyajid/react-switch/styled";
import "@mshafiqyajid/react-button/styles.css";
import "@mshafiqyajid/react-select/styles.css";
import "@mshafiqyajid/react-switch/styles.css";

const VARIANT_ITEMS = [
  { value: "solid",   label: "solid" },
  { value: "outline", label: "outline" },
  { value: "ghost",   label: "ghost" },
  { value: "link",    label: "link" },
];
const TONE_ITEMS = [
  { value: "primary", label: "primary" },
  { value: "neutral", label: "neutral" },
  { value: "success", label: "success" },
  { value: "danger",  label: "danger" },
];
const SIZE_ITEMS = [
  { value: "sm", label: "sm" },
  { value: "md", label: "md" },
  { value: "lg", label: "lg" },
];

export default function ButtonDemo() {
  const [variant, setVariant] = useState<"solid" | "outline" | "ghost" | "link">("solid");
  const [tone, setTone] = useState<"primary" | "neutral" | "success" | "danger">("primary");
  const [size, setSize] = useState<"sm" | "md" | "lg">("md");
  const [block, setBlock] = useState(false);
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [count, setCount] = useState(0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", fontSize: "0.85rem", alignItems: "center" }}>
        <label style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
          variant:
          <SelectStyled items={VARIANT_ITEMS} value={variant} onChange={(v) => setVariant(v as typeof variant)} size="sm" />
        </label>
        <label style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
          tone:
          <SelectStyled items={TONE_ITEMS} value={tone} onChange={(v) => setTone(v as typeof tone)} size="sm" />
        </label>
        <label style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
          size:
          <SelectStyled items={SIZE_ITEMS} value={size} onChange={(v) => setSize(v as typeof size)} size="sm" />
        </label>
        <SwitchStyled checked={block} onChange={setBlock} label="block" size="sm" tone="primary" />
        <SwitchStyled checked={loading} onChange={setLoading} label="loading" size="sm" tone="primary" />
        <SwitchStyled checked={disabled} onChange={setDisabled} label="disabled" size="sm" tone="primary" />
      </div>

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
        <ButtonStyled
          variant={variant}
          tone={tone}
          size={size}
          block={block}
          loading={loading}
          disabled={disabled}
          onClick={() => setCount((c) => c + 1)}
        >
          Click me
        </ButtonStyled>
        <span style={{ fontSize: "0.8rem", color: "var(--fg-muted, #71717a)" }}>
          clicked: {count}
        </span>
      </div>

      <div style={{ fontSize: "0.78rem", color: "var(--fg-muted, #71717a)" }}>
        Async — return a Promise from <code>onClick</code> to drive the spinner:
      </div>
      <ButtonStyled
        variant="solid"
        tone="primary"
        size="md"
        onClick={() => new Promise((r) => setTimeout(r, 1500))}
      >
        Save (1.5s)
      </ButtonStyled>
    </div>
  );
}
