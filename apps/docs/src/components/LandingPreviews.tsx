import { useState } from "react";
import { CopyButtonStyled } from "@mshafiqyajid/react-copy-button/styled";
import { OTPInputStyled } from "@mshafiqyajid/react-otp-input/styled";
import { SegmentedControlStyled } from "@mshafiqyajid/react-segmented-control/styled";
import { RatingStyled } from "@mshafiqyajid/react-rating/styled";
import { HexColorPicker } from "@mshafiqyajid/react-color/styled";
import { TooltipStyled } from "@mshafiqyajid/react-tooltip/styled";
import "@mshafiqyajid/react-copy-button/styles.css";
import "@mshafiqyajid/react-otp-input/styles.css";
import "@mshafiqyajid/react-segmented-control/styles.css";
import "@mshafiqyajid/react-rating/styles.css";
import "@mshafiqyajid/react-color/styles.css";
import "@mshafiqyajid/react-tooltip/styles.css";

export function CopyButtonPreview() {
  return <CopyButtonStyled text="Hello!" tone="primary" label="Copy" size="sm" />;
}

export function OTPInputPreview() {
  return <OTPInputStyled length={4} defaultValue="42" tone="primary" size="sm" />;
}

export function SegmentedControlPreview() {
  const [v, setV] = useState("Day");
  return (
    <SegmentedControlStyled
      options={["Day", "Week", "Month"]}
      value={v}
      onChange={setV}
      tone="primary"
      size="sm"
    />
  );
}

export function RatingPreview() {
  const [v, setV] = useState(3.5);
  return <RatingStyled count={5} value={v} onChange={setV} tone="warning" size="sm" />;
}

export function ColorPreview() {
  const [c, setC] = useState("#6366f1");
  return (
    <div style={{ pointerEvents: "none", transform: "scale(0.7)", transformOrigin: "top left" }}>
      <HexColorPicker value={c} onChange={setC} showHexInput={false} style={{ ["--rcp-saturation-height" as string]: "100px" }} />
    </div>
  );
}

export function TooltipPreview() {
  return (
    <TooltipStyled content="Hello there!" placement="top" tone="neutral">
      <button style={{ padding: "0.4rem 1rem", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--bg-elevated)", color: "var(--fg)", cursor: "pointer", fontSize: "0.8rem" }}>
        Hover me
      </button>
    </TooltipStyled>
  );
}
