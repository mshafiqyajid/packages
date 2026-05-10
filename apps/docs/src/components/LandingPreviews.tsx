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
import { ButtonStyled } from "@mshafiqyajid/react-button/styled";
import { CheckboxStyled } from "@mshafiqyajid/react-checkbox/styled";
import { TextInputStyled } from "@mshafiqyajid/react-text-input/styled";
import { NumberInputStyled } from "@mshafiqyajid/react-number-input/styled";
import { PhoneInputStyled } from "@mshafiqyajid/react-phone-input/styled";
import { TagInputStyled } from "@mshafiqyajid/react-tag-input/styled";
// New packages
import { RadioGroupStyled, RadioItem } from "@mshafiqyajid/react-radio/styled";
import { TextareaStyled } from "@mshafiqyajid/react-textarea/styled";
import { AlertStyled } from "@mshafiqyajid/react-alert/styled";
import { SpinnerStyled } from "@mshafiqyajid/react-spinner/styled";
import { ChipStyled } from "@mshafiqyajid/react-chip/styled";
import { EmptyStateStyled } from "@mshafiqyajid/react-empty-state/styled";
import { AvatarGroupStyled } from "@mshafiqyajid/react-avatar-group/styled";
import { StatStyled } from "@mshafiqyajid/react-stat/styled";
import { CardStyled, Card } from "@mshafiqyajid/react-card/styled";
import { DividerStyled } from "@mshafiqyajid/react-divider/styled";
import { PaginationStyled } from "@mshafiqyajid/react-pagination/styled";
import { BreadcrumbStyled } from "@mshafiqyajid/react-breadcrumb/styled";
import { RangeStyled } from "@mshafiqyajid/react-range/styled";
import { ComboboxStyled } from "@mshafiqyajid/react-combobox/styled";
import { MultiSelectStyled } from "@mshafiqyajid/react-multi-select/styled";
import { NavbarStyled } from "@mshafiqyajid/react-navbar/styled";
import { SidebarStyled } from "@mshafiqyajid/react-sidebar/styled";
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
import "@mshafiqyajid/react-button/styles.css";
import "@mshafiqyajid/react-checkbox/styles.css";
import "@mshafiqyajid/react-text-input/styles.css";
import "@mshafiqyajid/react-number-input/styles.css";
import "@mshafiqyajid/react-phone-input/styles.css";
import "@mshafiqyajid/react-tag-input/styles.css";
import "@mshafiqyajid/react-radio/styles.css";
import "@mshafiqyajid/react-textarea/styles.css";
import "@mshafiqyajid/react-alert/styles.css";
import "@mshafiqyajid/react-spinner/styles.css";
import "@mshafiqyajid/react-chip/styles.css";
import "@mshafiqyajid/react-empty-state/styles.css";
import "@mshafiqyajid/react-avatar-group/styles.css";
import "@mshafiqyajid/react-stat/styles.css";
import "@mshafiqyajid/react-card/styles.css";
import "@mshafiqyajid/react-divider/styles.css";
import "@mshafiqyajid/react-pagination/styles.css";
import "@mshafiqyajid/react-breadcrumb/styles.css";
import "@mshafiqyajid/react-range/styles.css";
import "@mshafiqyajid/react-combobox/styles.css";
import "@mshafiqyajid/react-multi-select/styles.css";
import "@mshafiqyajid/react-navbar/styles.css";
import "@mshafiqyajid/react-sidebar/styles.css";

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
  const [v, setV] = useState<number>(60);
  return (
    <div style={{ width: 180 }}>
      <SliderStyled value={v} onChange={(val) => setV(val as number)} tone="primary" size="sm" />
    </div>
  );
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

export function ButtonPreview() {
  return (
    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
      <ButtonStyled tone="primary" size="sm">Primary</ButtonStyled>
      <ButtonStyled variant="outline" tone="neutral" size="sm">Outline</ButtonStyled>
      <ButtonStyled variant="ghost" tone="neutral" size="sm">Ghost</ButtonStyled>
    </div>
  );
}

export function CheckboxPreview() {
  const [a, setA] = useState(true);
  const [b, setB] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-start" }}>
      <CheckboxStyled checked={a} onChange={setA} label="Email me updates" tone="primary" size="sm" />
      <CheckboxStyled checked={b} onChange={setB} label="Subscribe to digest" tone="primary" size="sm" />
      <CheckboxStyled checked={false} onChange={() => {}} label="Disabled option" disabled size="sm" />
    </div>
  );
}

export function TextInputPreview() {
  const [v, setV] = useState("hello@example.com");
  return (
    <div style={{ width: 220 }}>
      <TextInputStyled value={v} onChange={setV} placeholder="Email address" size="sm" tone="primary" />
    </div>
  );
}

export function NumberInputPreview() {
  const [v, setV] = useState<number | undefined>(1299);
  return (
    <div style={{ width: 180 }}>
      <NumberInputStyled value={v} onChange={(n) => setV(n ?? undefined)} format="currency" currency="USD" size="sm" tone="primary" />
    </div>
  );
}

export function PhoneInputPreview() {
  const [v, setV] = useState("+14155552671");
  return (
    <div style={{ width: 220 }}>
      <PhoneInputStyled value={v} onChange={setV} size="sm" tone="primary" />
    </div>
  );
}

export function TagInputPreview() {
  const [tags, setTags] = useState<string[]>(["react", "typescript", "ui"]);
  return (
    <div style={{ width: 240 }}>
      <TagInputStyled value={tags} onChange={setTags} placeholder="Add tag…" size="sm" tone="primary" />
    </div>
  );
}

export function StepperPreview() {
  const steps = [
    { label: "Cart",    state: "done" as const },
    { label: "Address", state: "active" as const },
    { label: "Pay",     state: "todo" as const },
  ];
  const dotStyle = (state: "done" | "active" | "todo"): React.CSSProperties => ({
    width: 22, height: 22, borderRadius: "50%",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    fontSize: "0.68rem", fontWeight: 600, flexShrink: 0,
    background: state === "done" ? "#16a34a"
              : state === "active" ? "var(--accent)"
              : "var(--bg-elevated)",
    color: state === "todo" ? "var(--fg-subtle)" : "white",
    border: state === "todo" ? "1px solid var(--border)" : "none",
    boxShadow: state === "active" ? "0 0 0 3px color-mix(in srgb, var(--accent) 18%, transparent)" : "none",
  });
  return (
    <div style={{ pointerEvents: "none", display: "flex", alignItems: "center", gap: 4, width: 240 }}>
      {steps.map((s, i) => (
        <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 4, flex: i === steps.length - 1 ? "0 0 auto" : 1 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span style={dotStyle(s.state)}>
              {s.state === "done" ? (
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="2.5,6.5 5,9 9.5,3.5" />
                </svg>
              ) : (i + 1)}
            </span>
            <span style={{
              fontSize: "0.66rem",
              fontWeight: s.state === "active" ? 600 : 500,
              color: s.state === "todo" ? "var(--fg-subtle)" : "var(--fg)",
              whiteSpace: "nowrap",
            }}>{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <span style={{
              flex: 1, height: 2, borderRadius: 1, marginBottom: 16,
              background: steps[i + 1].state !== "todo" || s.state === "done"
                ? "color-mix(in srgb, var(--accent) 50%, transparent)"
                : "var(--border)",
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

export function ColorInputPreview() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", pointerEvents: "none" }}>
      {["#6366f1", "#22c55e", "#f59e0b", "#ec4899"].map((c) => (
        <span key={c} style={{ width: 28, height: 28, borderRadius: 8, background: c, border: "1px solid rgba(0,0,0,0.06)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25), 0 1px 2px rgba(0,0,0,0.08)" }} />
      ))}
      <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.72rem", color: "var(--fg-muted)", padding: "3px 7px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 5 }}>#6366F1</span>
    </div>
  );
}

export function DatePickerPreview() {
  const days = ["S", "M", "T", "W", "T", "F", "S"];
  const cells = Array.from({ length: 28 }, (_, i) => i + 1);
  return (
    <div style={{ pointerEvents: "none", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 10, padding: "8px 10px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.7rem", fontWeight: 600, color: "var(--fg)", marginBottom: 4 }}>
        <span style={{ color: "var(--fg-subtle)" }}>‹</span>
        <span>May 2026</span>
        <span style={{ color: "var(--fg-subtle)" }}>›</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, fontSize: "0.6rem", color: "var(--fg-subtle)" }}>
        {days.map((d, i) => <span key={i} style={{ textAlign: "center" }}>{d}</span>)}
        {cells.map((d) => (
          <span key={d} style={{
            textAlign: "center",
            padding: "1px 0",
            borderRadius: 3,
            color: d === 14 ? "white" : "var(--fg-muted)",
            background: d === 14 ? "var(--accent)" : "transparent",
            fontWeight: d === 14 ? 600 : 400,
          }}>{d}</span>
        ))}
      </div>
    </div>
  );
}

export function FileUploadPreview() {
  return (
    <div style={{ pointerEvents: "none", width: 240, padding: "14px 12px", textAlign: "center", border: "1.5px dashed color-mix(in srgb, var(--accent) 40%, var(--border))", borderRadius: 10, background: "color-mix(in srgb, var(--accent) 4%, var(--bg-elevated))", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
      <span style={{ fontSize: "0.78rem", fontWeight: 500, color: "var(--fg)" }}>Drop files here</span>
      <span style={{ fontSize: "0.68rem", color: "var(--fg-subtle)" }}>or click to browse</span>
    </div>
  );
}

export function RichTextPreview() {
  const ToolBtn = ({ children, active }: { children: React.ReactNode; active?: boolean }) => (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 22, height: 22, borderRadius: 4,
      fontSize: "0.72rem", fontWeight: 700,
      color: active ? "var(--accent)" : "var(--fg-muted)",
      background: active ? "color-mix(in srgb, var(--accent) 12%, transparent)" : "transparent",
    }}>{children}</span>
  );
  return (
    <div style={{ pointerEvents: "none", width: 230, background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
      <div style={{ display: "flex", gap: 2, padding: "4px 6px", borderBottom: "1px solid var(--border)", background: "var(--bg-subtle)" }}>
        <ToolBtn active><b>B</b></ToolBtn>
        <ToolBtn><i>I</i></ToolBtn>
        <ToolBtn><span style={{ textDecoration: "underline" }}>U</span></ToolBtn>
        <span style={{ width: 1, background: "var(--border)", margin: "2px 4px" }} />
        <ToolBtn>•</ToolBtn>
        <ToolBtn>1.</ToolBtn>
      </div>
      <div style={{ padding: "8px 10px", fontSize: "0.78rem", color: "var(--fg)", lineHeight: 1.5 }}>
        <span style={{ fontWeight: 700 }}>Hello</span>, this is a <span style={{ fontStyle: "italic" }}>rich</span> text editor.
      </div>
    </div>
  );
}

export function TablePreview() {
  const rows = [
    { name: "Alice", role: "Admin", status: "Active" },
    { name: "Bob",   role: "Editor", status: "Pending" },
    { name: "Carol", role: "Viewer", status: "Active" },
  ];
  return (
    <div style={{ pointerEvents: "none", width: 240, background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", fontSize: "0.72rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "5px 8px", background: "var(--bg-subtle)", color: "var(--fg-subtle)", fontWeight: 600, borderBottom: "1px solid var(--border)" }}>
        <span>Name ↑</span><span>Role</span><span>Status</span>
      </div>
      {rows.map((r, i) => (
        <div key={r.name} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "5px 8px", color: "var(--fg)", borderBottom: i < rows.length - 1 ? "1px solid var(--border)" : "none" }}>
          <span>{r.name}</span><span style={{ color: "var(--fg-muted)" }}>{r.role}</span>
          <span style={{ color: r.status === "Active" ? "#16a34a" : "#d97706", fontWeight: 500 }}>● {r.status}</span>
        </div>
      ))}
    </div>
  );
}

export function ChartPreview() {
  const bars = [40, 65, 50, 80, 60, 90, 75];
  return (
    <svg width="180" height="80" viewBox="0 0 180 80" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="barg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.55" />
        </linearGradient>
      </defs>
      {bars.map((h, i) => (
        <rect key={i} x={i * 24 + 4} y={80 - h * 0.7} width={16} height={h * 0.7} rx="3" fill="url(#barg)" />
      ))}
      <line x1="0" y1="80" x2="180" y2="80" stroke="var(--border)" strokeWidth="1" />
    </svg>
  );
}

export function KanbanPreview() {
  const cols = [
    { title: "To Do", count: 3, items: ["Wireframes", "API spec"] },
    { title: "Doing", count: 2, items: ["Auth flow"] },
  ];
  return (
    <div style={{ pointerEvents: "none", display: "flex", gap: 6 }}>
      {cols.map((c) => (
        <div key={c.title} style={{ width: 110, background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: 8, padding: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", fontWeight: 600, color: "var(--fg-muted)", marginBottom: 5 }}>
            <span>{c.title}</span><span>{c.count}</span>
          </div>
          {c.items.map((it) => (
            <div key={it} style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 5, padding: "4px 6px", fontSize: "0.7rem", color: "var(--fg)", marginBottom: 4, boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>{it}</div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function CommandPalettePreview() {
  return (
    <div style={{ pointerEvents: "none", width: 240, background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 10px", borderBottom: "1px solid var(--border)" }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--fg-subtle)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
        </svg>
        <span style={{ fontSize: "0.75rem", color: "var(--fg-muted)", flex: 1 }}>Type a command…</span>
        <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.62rem", padding: "1px 4px", border: "1px solid var(--border)", borderRadius: 3, color: "var(--fg-subtle)" }}>⌘K</span>
      </div>
      {[
        { icon: "📄", label: "New file", hint: "⌘N" },
        { icon: "🔍", label: "Search project", hint: "⌘P", active: true },
        { icon: "⚙",  label: "Open settings", hint: "⌘," },
      ].map((it) => (
        <div key={it.label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 10px", fontSize: "0.74rem", color: "var(--fg)", background: it.active ? "color-mix(in srgb, var(--accent) 10%, transparent)" : "transparent" }}>
          <span style={{ width: 14 }}>{it.icon}</span>
          <span style={{ flex: 1 }}>{it.label}</span>
          <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.62rem", color: "var(--fg-subtle)" }}>{it.hint}</span>
        </div>
      ))}
    </div>
  );
}

export function TreePreview() {
  const Row = ({ depth, icon, label, bold }: { depth: number; icon: string; label: string; bold?: boolean }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "2px 4px", paddingLeft: 4 + depth * 12, fontSize: "0.72rem", color: "var(--fg)", fontWeight: bold ? 600 : 400 }}>
      <span style={{ color: "var(--fg-subtle)", width: 8, textAlign: "center" }}>{icon}</span>
      <span>{label}</span>
    </div>
  );
  return (
    <div style={{ pointerEvents: "none", width: 200, background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, padding: "5px 4px", fontFamily: "JetBrains Mono, monospace" }}>
      <Row depth={0} icon="▾" label="src" bold />
      <Row depth={1} icon="▾" label="components" bold />
      <Row depth={2} icon="▸" label="Button.tsx" />
      <Row depth={2} icon="▸" label="Card.tsx" />
      <Row depth={1} icon="▸" label="App.tsx" />
      <Row depth={0} icon="▸" label="public" bold />
    </div>
  );
}

// ── New packages ─────────────────────────────────────────────────────────────

export function RadioPreview() {
  const [v, setV] = useState("monthly");
  return (
    <div style={{ pointerEvents: "none" }}>
      <RadioGroupStyled
        value={v}
        onChange={setV}
        size="sm"
        tone="primary"
        orientation="vertical"
      >
        <RadioItem value="monthly" label="Monthly" />
        <RadioItem value="yearly" label="Yearly" />
        <RadioItem value="lifetime" label="Lifetime" />
      </RadioGroupStyled>
    </div>
  );
}

export function TextareaPreview() {
  return (
    <div style={{ width: 240, pointerEvents: "none" }}>
      <TextareaStyled
        value="This is a resizable textarea with character count, auto-resize, and form integration."
        rows={3}
        size="sm"
        tone="primary"
        showCount
        maxLength={120}
      />
    </div>
  );
}

export function AlertPreview() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, width: 260, pointerEvents: "none" }}>
      <AlertStyled tone="success" size="sm" title="Saved!" variant="soft" showIcon />
      <AlertStyled tone="warning" size="sm" title="Review required" variant="soft" showIcon />
      <AlertStyled tone="danger"  size="sm" title="Action failed" variant="soft" showIcon />
    </div>
  );
}

export function SpinnerPreview() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, pointerEvents: "none" }}>
      <SpinnerStyled variant="spin"  tone="primary" size="md" />
      <SpinnerStyled variant="dots"  tone="primary" size="md" />
      <SpinnerStyled variant="ring"  tone="primary" size="md" />
      <SpinnerStyled variant="pulse" tone="primary" size="md" />
    </div>
  );
}

export function ChipPreview() {
  return (
    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", pointerEvents: "none" }}>
      <ChipStyled tone="primary"  variant="subtle">Design</ChipStyled>
      <ChipStyled tone="success"  variant="subtle">Shipped</ChipStyled>
      <ChipStyled tone="warning"  variant="subtle">In Review</ChipStyled>
      <ChipStyled tone="danger"   variant="subtle">Blocked</ChipStyled>
    </div>
  );
}

export function EmptyStatePreview() {
  return (
    <div style={{ pointerEvents: "none", transform: "scale(0.85)", transformOrigin: "top center" }}>
      <EmptyStateStyled
        preset="no-results"
        size="sm"
        title="No results"
        description="Try a different search term."
      />
    </div>
  );
}

export function AvatarGroupPreview() {
  return (
    <div style={{ pointerEvents: "none" }}>
      <AvatarGroupStyled
        size="md"
        gap={-8}
        showTooltip={false}
        avatars={[
          { name: "Alice Smith" },
          { name: "Bob Jones" },
          { name: "Carol White" },
          { name: "Dave Brown" },
          { name: "Eve Davis" },
          { name: "Frank Lee" },
        ]}
        max={4}
      />
    </div>
  );
}

export function StatPreview() {
  return (
    <div style={{ display: "flex", gap: 8, pointerEvents: "none" }}>
      <StatStyled value="$12.4k" label="Revenue" trend={18.2} trendLabel="vs last month" size="sm" countUp={false} />
      <StatStyled value="2.4k"  label="Users"   trend={-3.1}  trendLabel="vs last month" size="sm" countUp={false} />
    </div>
  );
}

export function CardPreview() {
  return (
    <div style={{ pointerEvents: "none", width: 220 }}>
      <CardStyled variant="elevated" size="sm" radius="md">
        <Card.Body>
          <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--fg)", marginBottom: 4 }}>Project Alpha</div>
          <div style={{ fontSize: "0.72rem", color: "var(--fg-muted)", lineHeight: 1.5 }}>Flexible card with header, body, and footer slots.</div>
        </Card.Body>
      </CardStyled>
    </div>
  );
}

export function DividerPreview() {
  return (
    <div style={{ width: 220, pointerEvents: "none", display: "flex", flexDirection: "column", gap: 8 }}>
      <DividerStyled />
      <DividerStyled label="or continue with" tone="neutral" />
      <DividerStyled lineStyle="dashed" tone="primary" />
    </div>
  );
}

export function PaginationPreview() {
  const [page, setPage] = useState(3);
  return (
    <div style={{ pointerEvents: "none" }}>
      <PaginationStyled page={page} onChange={setPage} total={100} pageSize={10} size="sm" siblings={1} boundaries={1} />
    </div>
  );
}

export function BreadcrumbPreview() {
  return (
    <div style={{ pointerEvents: "none" }}>
      <BreadcrumbStyled
        size="sm"
        separator="chevron"
        items={[
          { label: "Home", href: "/" },
          { label: "Docs", href: "/docs" },
          { label: "Components" },
        ]}
      />
    </div>
  );
}

export function RangePreview() {
  const [v, setV] = useState<[number, number]>([25, 75]);
  return (
    <div style={{ width: 220, pointerEvents: "none" }}>
      <RangeStyled
        mode="range"
        value={v}
        onChange={(val) => setV(val as [number, number])}
        tone="primary"
        size="sm"
        showTooltip="always"
      />
    </div>
  );
}

export function ComboboxPreview() {
  const [v, setV] = useState<string | null>("react");
  return (
    <div style={{ width: 200, pointerEvents: "none" }}>
      <ComboboxStyled
        value={v}
        onChange={setV}
        size="sm"
        placeholder="Select framework…"
        options={[
          { value: "react",   label: "React" },
          { value: "vue",     label: "Vue" },
          { value: "svelte",  label: "Svelte" },
          { value: "solid",   label: "Solid" },
        ]}
      />
    </div>
  );
}

export function MultiSelectPreview() {
  const [v, setV] = useState(["ts", "react"]);
  return (
    <div style={{ width: 220, pointerEvents: "none" }}>
      <MultiSelectStyled
        value={v}
        onChange={setV}
        size="sm"
        triggerMode="chips"
        maxChips={3}
        options={[
          { value: "ts",     label: "TypeScript" },
          { value: "react",  label: "React" },
          { value: "vite",   label: "Vite" },
          { value: "vitest", label: "Vitest" },
        ]}
      />
    </div>
  );
}

export function NavbarPreview() {
  return (
    <div style={{ pointerEvents: "none", width: 280, transform: "scale(0.9)", transformOrigin: "top left" }}>
      <NavbarStyled
        brand={<span style={{ fontWeight: 700, fontSize: "0.9rem" }}>Acme</span>}
        items={[
          { label: "Home",  href: "#", active: true },
          { label: "Docs",  href: "#" },
          { label: "Blog",  href: "#" },
        ]}
        variant="default"
        size="sm"
      />
    </div>
  );
}

export function SidebarPreview() {
  return (
    <div style={{ pointerEvents: "none", width: 180, height: 130, overflow: "hidden", borderRadius: 8, border: "1px solid var(--border)" }}>
      <SidebarStyled
        size="sm"
        variant="default"
        showCollapseButton={false}
        activeId="dash"
        items={[
          { label: "Main", items: [
            { id: "dash",     label: "Dashboard", icon: "⊞" },
            { id: "users",    label: "Users",     icon: "👥" },
            { id: "settings", label: "Settings",  icon: "⚙" },
          ]},
        ]}
      />
    </div>
  );
}

export function SheetPreview() {
  return (
    <div style={{ pointerEvents: "none", position: "relative", width: 220, height: 110, overflow: "hidden", borderRadius: 8, background: "rgba(0,0,0,0.35)" }}>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "10px 10px 0 0", padding: "10px 14px 8px", boxShadow: "0 -4px 20px rgba(0,0,0,0.15)" }}>
        <div style={{ width: 32, height: 4, borderRadius: 2, background: "var(--border)", margin: "0 auto 10px" }} />
        <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--fg)", marginBottom: 4 }}>Quick actions</div>
        <div style={{ display: "flex", gap: 6 }}>
          {["Share", "Edit", "Delete"].map((a) => (
            <span key={a} style={{ padding: "3px 8px", borderRadius: 5, border: "1px solid var(--border)", fontSize: "0.68rem", color: "var(--fg-muted)", background: "var(--bg-subtle)" }}>{a}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function HoverCardPreview() {
  return (
    <div style={{ pointerEvents: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px", boxShadow: "0 6px 20px rgba(0,0,0,0.12)", width: 200 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "0.8rem", fontWeight: 700, flexShrink: 0 }}>SY</div>
          <div>
            <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--fg)" }}>Shafiq Yajid</div>
            <div style={{ fontSize: "0.68rem", color: "var(--fg-muted)" }}>@mshafiqyajid</div>
          </div>
        </div>
        <div style={{ fontSize: "0.7rem", color: "var(--fg-muted)", lineHeight: 1.5 }}>Building open-source React UI primitives.</div>
      </div>
      <div style={{ padding: "4px 12px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg-elevated)", fontSize: "0.75rem", color: "var(--fg)" }}>Hover over me</div>
    </div>
  );
}

export function ContextMenuPreview() {
  return (
    <div style={{ pointerEvents: "none", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", width: 170, boxShadow: "0 6px 20px rgba(0,0,0,0.12)" }}>
      {[
        { label: "Open",      icon: "↗" },
        { label: "Rename",    icon: "✏" },
        { label: "Duplicate", icon: "⧉" },
        null,
        { label: "Delete",    icon: "🗑", danger: true },
      ].map((item, i) =>
        item === null ? (
          <div key={i} style={{ height: 1, background: "var(--border)", margin: "2px 0" }} />
        ) : (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", fontSize: "0.78rem", color: item.danger ? "#dc2626" : "var(--fg)" }}>
            <span style={{ width: 14, fontSize: "0.7rem" }}>{item.icon}</span>
            {item.label}
          </div>
        )
      )}
    </div>
  );
}

export function LightboxPreview() {
  return (
    <div style={{ pointerEvents: "none", background: "rgba(0,0,0,0.9)", borderRadius: 8, padding: "10px", width: 220, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
        <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.5)" }}>2 / 5</span>
        <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)" }}>✕</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "1.2rem" }}>‹</span>
        <div style={{ width: 130, height: 72, borderRadius: 6, background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)" }} />
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "1.2rem" }}>›</span>
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        {[0,1,2,3,4].map((i) => (
          <div key={i} style={{ width: 28, height: 18, borderRadius: 3, background: i === 1 ? "var(--accent)" : "rgba(255,255,255,0.2)", border: i === 1 ? "2px solid white" : "1px solid transparent" }} />
        ))}
      </div>
    </div>
  );
}

export function SortablePreview() {
  const items = [
    { id: "1", label: "Design tokens" },
    { id: "2", label: "Component library" },
    { id: "3", label: "Documentation" },
  ];
  return (
    <div style={{ pointerEvents: "none", width: 220 }}>
      {items.map((item, i) => (
        <div key={item.id} style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "6px 10px", marginBottom: 4,
          background: "var(--bg-elevated)", border: "1px solid var(--border)",
          borderRadius: 6, fontSize: "0.75rem", color: "var(--fg)",
          opacity: i === 1 ? 0.5 : 1,
          boxShadow: i === 1 ? "0 4px 12px rgba(0,0,0,0.12)" : "none",
        }}>
          <svg width="10" height="14" viewBox="0 0 10 14" fill="var(--fg-subtle)" aria-hidden="true">
            {[2,6,10].map((y) => [2,7].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.2" />))}
          </svg>
          {item.label}
        </div>
      ))}
    </div>
  );
}

export function MentionPreview() {
  return (
    <div style={{ pointerEvents: "none", width: 220 }}>
      <div style={{ background: "var(--bg-elevated)", border: "1.5px solid #6366f1", borderRadius: 8, padding: "8px 10px", fontSize: "0.78rem", color: "var(--fg)", lineHeight: 1.6, marginBottom: 6 }}>
        Hey{" "}
        <mark style={{ background: "rgba(99,102,241,0.15)", color: "#6366f1", borderRadius: 3, padding: "0 3px" }}>@Alice</mark>
        {" "}can you review{" "}
        <mark style={{ background: "rgba(16,185,129,0.15)", color: "#059669", borderRadius: 3, padding: "0 3px" }}>#react</mark>
        {" "}PR?
      </div>
      <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", boxShadow: "0 4px 14px rgba(0,0,0,0.1)" }}>
        {[{ label: "Alice", sub: "Product Design", active: true }, { label: "Bob", sub: "Engineering" }, { label: "Carol", sub: "Marketing" }].map((item) => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 10px", background: item.active ? "rgba(99,102,241,0.08)" : "transparent" }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", background: item.active ? "#6366f1" : "var(--bg-subtle)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", fontWeight: 700, color: item.active ? "#fff" : "var(--fg-muted)", flexShrink: 0 }}>{item.label[0]}</div>
            <div>
              <div style={{ fontSize: "0.72rem", fontWeight: 500, color: item.active ? "#6366f1" : "var(--fg)" }}>{item.label}</div>
              <div style={{ fontSize: "0.62rem", color: "var(--fg-subtle)" }}>{item.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SignaturePreview() {
  return (
    <div style={{ pointerEvents: "none", width: 220 }}>
      <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
        <div style={{ padding: "10px 12px 4px", height: 64, position: "relative" }}>
          <svg viewBox="0 0 200 50" width="100%" height="100%" fill="none" stroke="var(--fg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 35 C20 10, 30 10, 35 25 C40 38, 38 42, 35 40" />
            <path d="M42 20 C45 15, 52 15, 55 25 C58 35, 55 40, 50 38 C60 37, 65 30, 63 22" />
            <path d="M70 38 C72 20, 78 15, 82 25 C85 32, 83 40, 78 38" />
            <path d="M88 15 L88 40 M88 25 C92 20, 100 18, 102 25 C104 32, 100 38, 94 37" />
            <path d="M108 38 C112 20, 118 15, 122 28 C124 35, 120 40, 116 38" />
          </svg>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 8px", background: "var(--bg-subtle)", borderTop: "1px solid var(--border)" }}>
          {["Pen", "Brush", "Marker"].map((s, i) => (
            <div key={s} style={{ padding: "2px 7px", borderRadius: 4, fontSize: "0.62rem", background: i === 0 ? "#6366f1" : "transparent", color: i === 0 ? "#fff" : "var(--fg-muted)", border: i === 0 ? "none" : "1px solid var(--border)" }}>{s}</div>
          ))}
          <div style={{ marginLeft: "auto", fontSize: "0.62rem", color: "var(--fg-subtle)" }}>Undo · Clear</div>
        </div>
      </div>
    </div>
  );
}

export function SplitPreview() {
  return (
    <div style={{ pointerEvents: "none", width: 220, height: 100, border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", display: "flex" }}>
      <div style={{ flex: "0 0 38%", background: "#f0f9ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.68rem", fontWeight: 600, color: "#0369a1" }}>Panel A</div>
      <div style={{ width: 5, background: "var(--border)", position: "relative", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 2, height: 24, borderRadius: 2, background: "var(--border-strong)" }} />
      </div>
      <div style={{ flex: 1, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.68rem", fontWeight: 600, color: "#15803d" }}>Panel B</div>
    </div>
  );
}

export function SpotlightPreview() {
  return (
    <div style={{ pointerEvents: "none", width: 220, position: "relative" }}>
      <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", fontSize: "0.72rem", color: "var(--fg)", marginBottom: 6, opacity: 0.4 }}>
        <div style={{ height: 6, width: "70%", borderRadius: 3, background: "var(--border)", marginBottom: 5 }} />
        <div style={{ height: 6, width: "50%", borderRadius: 3, background: "var(--border)" }} />
      </div>
      <div style={{ position: "relative" }}>
        <div style={{ background: "var(--bg-elevated)", border: "2px solid #6366f1", borderRadius: 8, padding: "8px 12px", boxShadow: "0 0 0 4px rgba(99,102,241,0.15)" }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--fg)", marginBottom: 3 }}>✨ New feature</div>
          <div style={{ fontSize: "0.65rem", color: "var(--fg-muted)" }}>Click here to get started</div>
        </div>
        <div style={{ position: "absolute", top: "100%", left: 12, marginTop: 6, background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 7, padding: "7px 10px", boxShadow: "0 4px 14px rgba(0,0,0,0.12)", width: 160 }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 600, marginBottom: 3, color: "var(--fg)" }}>Step 1 / 3 — Feature</div>
          <div style={{ fontSize: "0.62rem", color: "var(--fg-muted)", marginBottom: 6 }}>Highlight any element for onboarding tours.</div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ flex: 1, display: "flex", gap: 3, justifyContent: "center" }}>
              {[0,1,2].map((i) => <div key={i} style={{ height: 5, width: i === 0 ? 14 : 5, borderRadius: 99, background: i === 0 ? "#6366f1" : "var(--border)" }} />)}
            </div>
            <div style={{ padding: "2px 8px", borderRadius: 4, background: "#6366f1", color: "#fff", fontSize: "0.6rem", fontWeight: 600 }}>Next →</div>
          </div>
        </div>
      </div>
    </div>
  );
}
