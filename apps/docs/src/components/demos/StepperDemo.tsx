import { useState } from "react";
import { StepperStyled } from "@mshafiqyajid/react-stepper/styled";
import "@mshafiqyajid/react-stepper/styles.css";

export default function StepperDemo() {
  const [orientation, setOrientation] = useState<"horizontal" | "vertical">("horizontal");
  const [tone, setTone] = useState<"primary" | "neutral">("primary");
  const [size, setSize] = useState<"sm" | "md" | "lg">("md");
  const [agree, setAgree] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", fontSize: "0.85rem", alignItems: "center" }}>
        <label>orientation:&nbsp;
          <select value={orientation} onChange={(e) => setOrientation(e.target.value as "horizontal" | "vertical")}>
            <option value="horizontal">horizontal</option>
            <option value="vertical">vertical</option>
          </select>
        </label>
        <label>tone:&nbsp;
          <select value={tone} onChange={(e) => setTone(e.target.value as "primary" | "neutral")}>
            <option value="primary">primary</option>
            <option value="neutral">neutral</option>
          </select>
        </label>
        <label>size:&nbsp;
          <select value={size} onChange={(e) => setSize(e.target.value as "sm" | "md" | "lg")}>
            <option value="sm">sm</option>
            <option value="md">md</option>
            <option value="lg">lg</option>
          </select>
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
                <label style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                  I agree to the terms
                </label>
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
