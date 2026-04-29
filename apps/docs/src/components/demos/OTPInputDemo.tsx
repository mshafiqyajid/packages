import { useState } from "react";
import { OTPInputStyled } from "@mshafiqyajid/react-otp-input/styled";
import "@mshafiqyajid/react-otp-input/styles.css";

export default function OTPInputDemo() {
  const [code, setCode] = useState("");
  const [completed, setCompleted] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "1.5rem", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 12 }}>
      <OTPInputStyled
        length={6}
        value={code}
        onChange={(v) => { setCode(v); setCompleted(false); }}
        onComplete={() => setCompleted(true)}
        tone="primary"
        variant="solid"
        label="Verification code"
        hint={completed ? "✓ Code accepted!" : "Paste a 6-digit code to auto-fill"}
      />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        <OTPInputStyled length={4} variant="outline" tone="success" label="Outline / Success" />
        <OTPInputStyled length={4} variant="underline" tone="danger" label="Underline / Error" error="Incorrect code" />
        <OTPInputStyled length={6} groupSize={3} tone="primary" label="Grouped (3+3)" />
        <OTPInputStyled length={4} mask tone="neutral" label="Masked" />
      </div>
    </div>
  );
}
