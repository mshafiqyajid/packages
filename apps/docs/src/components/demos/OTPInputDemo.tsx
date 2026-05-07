import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { OTPInputStyled } from "@mshafiqyajid/react-otp-input/styled";
import { useOTPResend } from "@mshafiqyajid/react-otp-input";
import "@mshafiqyajid/react-otp-input/styles.css";

function ResendDemo() {
  const [log, setLog] = useState<string[]>([]);
  const { resend, canResend, secondsLeft, isPending } = useOTPResend({
    cooldownMs: 15_000,
    onResend: () =>
      new Promise<void>((resolve) => {
        setLog((prev) => [...prev, "Sending…"]);
        setTimeout(() => {
          setLog((prev) => [...prev, "Code sent!"]);
          resolve();
        }, 1200);
      }),
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "flex-start" }}>
      <OTPInputStyled length={6} label="Verification code" hint="Enter the code from your email" />
      <button
        type="button"
        onClick={resend}
        disabled={!canResend}
        style={{
          fontSize: "0.875rem",
          padding: "0.35rem 0.9rem",
          borderRadius: 6,
          border: "1px solid #e4e4e7",
          background: canResend ? "#fff" : "#f4f4f5",
          color: canResend ? "#18181b" : "#71717a",
          cursor: canResend ? "pointer" : "not-allowed",
          transition: "all 150ms",
        }}
      >
        {isPending
          ? "Sending…"
          : secondsLeft > 0
          ? `Resend code (${secondsLeft}s)`
          : "Resend code"}
      </button>
      {log.length > 0 && (
        <ul style={{ margin: 0, paddingLeft: "1rem", fontSize: "0.8rem", color: "#71717a" }}>
          {log.map((entry, i) => (
            <li key={i}>{entry}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function OTPInputDemo() {
  return (
    <>
      <PropPlayground
        componentName="OTPInputStyled"
        importLine={`import { OTPInputStyled } from "@mshafiqyajid/react-otp-input/styled";\nimport "@mshafiqyajid/react-otp-input/styles.css";`}
        props={[
          { name: "length",    control: { type: "slider", min: 3, max: 8 },                                              defaultValue: 6,           omitWhen: 6 },
          { name: "variant",   control: { type: "segmented", options: ["solid","outline","underline"] as const },         defaultValue: "solid",     omitWhen: "solid" },
          { name: "size",      control: { type: "segmented", options: ["sm","md","lg"] as const },                        defaultValue: "md",        omitWhen: "md" },
          { name: "tone",      control: { type: "segmented", options: ["neutral","primary","success","danger"] as const },defaultValue: "neutral",   omitWhen: "neutral" },
          { name: "pattern",   control: { type: "segmented", options: ["numeric","alphanumeric"] as const },              defaultValue: "numeric",   omitWhen: "numeric" },
          { name: "mask",      control: { type: "segmented", options: ["none", "always", "after-blur", "after-complete"] as const }, defaultValue: "none", omitWhen: "none" },
          { name: "autoFocus", control: { type: "toggle" },                                                               defaultValue: false,       omitWhen: false },
        ]}
        staticProps={{ onComplete: "{handleComplete}" }}
        render={(v) => (
          <OTPInputStyled
            key={`${v.length}-${v.pattern}`}
            length={v.length as number}
            variant={v.variant as "solid"|"outline"|"underline"}
            size={v.size as "sm"|"md"|"lg"}
            tone={v.tone as "neutral"|"primary"|"success"|"danger"}
            pattern={v.pattern as "numeric"|"alphanumeric"}
            mask={v.mask === "none" ? false : v.mask as "always" | "after-blur" | "after-complete"}
            label="Verification code"
            hint="Type or paste to auto-fill"
          />
        )}
      />

      <h3 style={{ marginTop: "2rem", marginBottom: "0.5rem", fontSize: "1rem", fontWeight: 600 }}>
        useOTPResend demo
      </h3>
      <p style={{ fontSize: "0.875rem", color: "#71717a", marginBottom: "1rem" }}>
        15-second cooldown. Click <em>Resend code</em> to trigger a mock async send.
      </p>
      <ResendDemo />
    </>
  );
}
