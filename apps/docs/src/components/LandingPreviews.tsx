import { useState } from "react";
import { CopyButtonStyled } from "@mshafiqyajid/react-copy-button/styled";
import { OTPInputStyled } from "@mshafiqyajid/react-otp-input/styled";
import { SegmentedControlStyled } from "@mshafiqyajid/react-segmented-control/styled";
import { RatingStyled } from "@mshafiqyajid/react-rating/styled";
import { HexColorPicker } from "@mshafiqyajid/react-color/styled";
import { TooltipStyled } from "@mshafiqyajid/react-tooltip/styled";
import { AccordionStyled } from "@mshafiqyajid/react-accordion/styled";
import { TabsStyled } from "@mshafiqyajid/react-tabs/styled";
import { SelectStyled } from "@mshafiqyajid/react-select/styled";
import { SwitchStyled } from "@mshafiqyajid/react-switch/styled";
import { BadgeStyled } from "@mshafiqyajid/react-badge/styled";
import { AvatarStyled, AvatarGroup } from "@mshafiqyajid/react-avatar/styled";
import { ProgressBar } from "@mshafiqyajid/react-progress/styled";
import { SliderStyled } from "@mshafiqyajid/react-slider/styled";
import { TimelineStyled } from "@mshafiqyajid/react-timeline/styled";
import "@mshafiqyajid/react-copy-button/styles.css";
import "@mshafiqyajid/react-otp-input/styles.css";
import "@mshafiqyajid/react-segmented-control/styles.css";
import "@mshafiqyajid/react-rating/styles.css";
import "@mshafiqyajid/react-color/styles.css";
import "@mshafiqyajid/react-tooltip/styles.css";
import "@mshafiqyajid/react-accordion/styles.css";
import "@mshafiqyajid/react-tabs/styles.css";
import "@mshafiqyajid/react-select/styles.css";
import "@mshafiqyajid/react-switch/styles.css";
import "@mshafiqyajid/react-badge/styles.css";
import "@mshafiqyajid/react-avatar/styles.css";
import "@mshafiqyajid/react-progress/styles.css";
import "@mshafiqyajid/react-slider/styles.css";
import "@mshafiqyajid/react-timeline/styles.css";

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

export function AccordionPreview() {
  return (
    <div style={{ width: "100%", maxWidth: 280, pointerEvents: "none" }}>
      <AccordionStyled
        size="sm"
        tone="primary"
        defaultOpen={0}
        items={[
          { title: "What is this?", content: "A headless accordion." },
          { title: "Is it accessible?", content: "Yes." },
        ]}
      />
    </div>
  );
}

export function TabsPreview() {
  const [v, setV] = useState("a");
  return (
    <div style={{ width: "100%", maxWidth: 260 }}>
      <TabsStyled
        variant="pill"
        size="sm"
        tone="primary"
        value={v}
        onChange={setV}
        tabs={[
          { value: "a", label: "Overview", content: null },
          { value: "b", label: "Features", content: null },
          { value: "c", label: "Pricing",  content: null },
        ]}
      />
    </div>
  );
}

export function ToastPreview() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", pointerEvents: "none", width: 200 }}>
      {(["success", "error", "warning"] as const).map((type) => (
        <div key={type} style={{
          padding: "8px 12px",
          borderRadius: "8px",
          fontSize: "0.75rem",
          fontWeight: 500,
          background: type === "success" ? "rgba(22,163,74,0.12)" : type === "error" ? "rgba(220,38,38,0.12)" : "rgba(245,158,11,0.12)",
          color: type === "success" ? "#16a34a" : type === "error" ? "#dc2626" : "#d97706",
          border: `1px solid ${type === "success" ? "rgba(22,163,74,0.25)" : type === "error" ? "rgba(220,38,38,0.25)" : "rgba(245,158,11,0.25)"}`,
        }}>
          {type === "success" ? "✓ Saved successfully!" : type === "error" ? "✕ Something went wrong." : "⚠ Check your input."}
        </div>
      ))}
    </div>
  );
}

export function SelectPreview() {
  const [v, setValue] = useState("");
  return (
    <div style={{ width: 180 }}>
      <SelectStyled
        items={[
          { value: "react",  label: "React" },
          { value: "vue",    label: "Vue" },
          { value: "svelte", label: "Svelte" },
        ]}
        value={v}
        onChange={(val) => setValue(val as string)}
        placeholder="Select framework…"
        size="sm"
      />
    </div>
  );
}

export function ModalPreview() {
  return (
    <div style={{ pointerEvents: "none", width: 200, background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "10px", overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
      <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--fg)" }}>Confirm action</span>
        <span style={{ fontSize: "0.75rem", color: "var(--fg-muted)", cursor: "pointer" }}>✕</span>
      </div>
      <div style={{ padding: "10px 14px" }}>
        <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--fg-muted)", lineHeight: 1.5 }}>Are you sure you want to proceed?</p>
      </div>
      <div style={{ padding: "8px 14px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: "6px" }}>
        <span style={{ padding: "3px 10px", borderRadius: "5px", border: "1px solid var(--border)", fontSize: "0.72rem", color: "var(--fg-muted)" }}>Cancel</span>
        <span style={{ padding: "3px 10px", borderRadius: "5px", background: "var(--accent)", fontSize: "0.72rem", color: "white" }}>Confirm</span>
      </div>
    </div>
  );
}

export function SwitchPreview() {
  const [on, setOn] = useState(true);
  return <SwitchStyled checked={on} onChange={setOn} label="Notifications" tone="primary" size="sm" />;
}

export function BadgePreview() {
  return (
    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "center" }}>
      <BadgeStyled tone="success" variant="subtle">Active</BadgeStyled>
      <BadgeStyled tone="danger" variant="subtle">Error</BadgeStyled>
      <BadgeStyled tone="primary" variant="subtle" dot>New</BadgeStyled>
      <BadgeStyled tone="warning" variant="subtle">Pending</BadgeStyled>
    </div>
  );
}

export function AvatarPreview() {
  return (
    <AvatarGroup max={4} size="md">
      <AvatarStyled name="Alice Smith" status="online" />
      <AvatarStyled name="Bob Jones" status="busy" />
      <AvatarStyled name="Carol White" status="away" />
      <AvatarStyled name="Dave Brown" />
      <AvatarStyled name="Eve Davis" />
    </AvatarGroup>
  );
}

export function ProgressPreview() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: 200, pointerEvents: "none" }}>
      <ProgressBar value={75} tone="primary" size="sm" rounded />
      <ProgressBar value={45} tone="success" size="sm" rounded />
      <ProgressBar value={20} tone="danger" size="sm" rounded />
    </div>
  );
}

export function SliderPreview() {
  const [v, setV] = useState(60);
  return <SliderStyled value={v} onChange={setV} tone="primary" size="sm" style={{ width: 180 } as React.CSSProperties} />;
}

export function PopoverPreview() {
  return (
    <div style={{ pointerEvents: "none", position: "relative", display: "inline-flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
      <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "8px", padding: "8px 12px", fontSize: "0.75rem", color: "var(--fg-muted)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", whiteSpace: "nowrap" }}>
        More information here
      </div>
      <button style={{ padding: "4px 12px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--bg-elevated)", color: "var(--fg)", fontSize: "0.78rem" }}>Open</button>
    </div>
  );
}

export function DropdownMenuPreview() {
  return (
    <div style={{ pointerEvents: "none", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "8px", overflow: "hidden", width: 160, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
      {["Edit", "Duplicate", "Archive"].map((item) => (
        <div key={item} style={{ padding: "7px 12px", fontSize: "0.8rem", color: "var(--fg)", borderBottom: "1px solid var(--border)" }}>{item}</div>
      ))}
      <div style={{ padding: "7px 12px", fontSize: "0.8rem", color: "#dc2626" }}>Delete</div>
    </div>
  );
}

export function TimelinePreview() {
  return (
    <div style={{ pointerEvents: "none" }}>
      <TimelineStyled
        size="sm"
        tone="primary"
        items={[
          { id: "1", title: "Ordered", status: "completed" as const },
          { id: "2", title: "Shipped", status: "active" as const },
          { id: "3", title: "Delivered", status: "default" as const },
        ]}
      />
    </div>
  );
}
