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
  const [v, setV] = useState<number | [number, number]>(60);
  return (
    <div style={{ width: 180 }}>
      <SliderStyled value={v} onChange={setV} tone="primary" size="sm" />
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
