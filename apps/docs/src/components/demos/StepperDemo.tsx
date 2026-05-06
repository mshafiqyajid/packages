import { useState } from "react";
import { StepperStyled } from "@mshafiqyajid/react-stepper/styled";
import { SelectStyled } from "@mshafiqyajid/react-select/styled";
import { SwitchStyled } from "@mshafiqyajid/react-switch/styled";
import "@mshafiqyajid/react-stepper/styles.css";
import "@mshafiqyajid/react-select/styles.css";
import "@mshafiqyajid/react-switch/styles.css";

const ORIENTATION_ITEMS = [
  { value: "horizontal", label: "horizontal" },
  { value: "vertical",   label: "vertical" },
];
const TONE_ITEMS = [
  { value: "primary", label: "primary" },
  { value: "neutral", label: "neutral" },
];
const SIZE_ITEMS = [
  { value: "sm", label: "sm" },
  { value: "md", label: "md" },
  { value: "lg", label: "lg" },
];

export default function StepperDemo() {
  const [orientation, setOrientation] = useState<"horizontal" | "vertical">("horizontal");
  const [tone, setTone] = useState<"primary" | "neutral">("primary");
  const [size, setSize] = useState<"sm" | "md" | "lg">("md");
  const [agree, setAgree] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", fontSize: "0.85rem", alignItems: "center" }}>
        <label style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
          orientation:
          <SelectStyled
            items={ORIENTATION_ITEMS}
            value={orientation}
            onChange={(v) => setOrientation(v as "horizontal" | "vertical")}
            size="sm"
          />
        </label>
        <label style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
          tone:
          <SelectStyled
            items={TONE_ITEMS}
            value={tone}
            onChange={(v) => setTone(v as "primary" | "neutral")}
            size="sm"
          />
        </label>
        <label style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
          size:
          <SelectStyled
            items={SIZE_ITEMS}
            value={size}
            onChange={(v) => setSize(v as "sm" | "md" | "lg")}
            size="sm"
          />
        </label>
      </div>

      <StepperStyled
        steps={[
          { id: "account", label: "Account", description: "Email + password" },
          {
            id: "billing",
            label: "Billing",
            description: "Card details",
            validate: () => agree || "Please confirm the terms below",
          },
          { id: "review", label: "Review" },
        ]}
        orientation={orientation}
        tone={tone}
        size={size}
        renderContent={({ step }) => {
          if (step.id === "account") {
            return (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <input placeholder="Email" type="email" style={{ padding: "0.4rem 0.6rem" }} />
                <input placeholder="Password" type="password" style={{ padding: "0.4rem 0.6rem" }} />
              </div>
            );
          }
          if (step.id === "billing") {
            return (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <input placeholder="Card number" style={{ padding: "0.4rem 0.6rem" }} />
                <SwitchStyled
                  checked={agree}
                  onChange={setAgree}
                  label="I agree to the terms"
                  size="sm"
                  tone="primary"
                />
              </div>
            );
          }
          return (
            <div style={{ fontSize: "0.9rem", color: "var(--fg-muted)" }}>
              All set. Click <strong>Finish</strong> to submit.
            </div>
          );
        }}
        onFinish={() => alert("Submitted!")}
      />
    </div>
  );
}
