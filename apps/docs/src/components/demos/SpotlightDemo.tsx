import { useRef, useState } from "react";
import PropPlayground from "../PropPlayground";
import { SpotlightStyled } from "@mshafiqyajid/react-spotlight/styled";
import "@mshafiqyajid/react-spotlight/styles.css";

function SpotlightPreview({
  padding,
  radius,
  placement,
  closeOnOverlayClick,
  closeOnEscape,
  scrollIntoView,
  overlayColor,
  pulse,
  backdropBlur,
}: {
  padding: number;
  radius: number;
  placement: string;
  closeOnOverlayClick: boolean;
  closeOnEscape: boolean;
  scrollIntoView: boolean;
  overlayColor: string;
  pulse: boolean;
  backdropBlur: number;
}) {
  const [open, setOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1.25rem",
      }}
    >
      <div
        ref={cardRef}
        style={{
          background: "var(--bg-subtle, #f4f4f5)",
          border: "1px solid var(--border, #e4e4e7)",
          borderRadius: 12,
          padding: "1.25rem 1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          width: 260,
        }}
      >
        <div
          style={{
            fontWeight: 600,
            fontSize: "0.9375rem",
            color: "var(--fg, #18181b)",
          }}
        >
          Feature card
        </div>
        <div
          style={{
            fontSize: "0.8125rem",
            color: "var(--fg-muted, #71717a)",
          }}
        >
          Click "Start tour" to highlight this card with a spotlight overlay.
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          padding: "0.5rem 1.25rem",
          background: "#18181b",
          color: "#fafafa",
          border: "none",
          borderRadius: 8,
          fontSize: "0.875rem",
          fontWeight: 500,
          cursor: "pointer",
          transition: "background 150ms",
        }}
      >
        Start tour
      </button>

      <SpotlightStyled
        target={cardRef}
        open={open}
        onOpenChange={setOpen}
        padding={padding}
        radius={radius}
        placement={
          placement as
            | "top"
            | "bottom"
            | "left"
            | "right"
            | "top-start"
            | "top-end"
            | "bottom-start"
            | "bottom-end"
        }
        closeOnOverlayClick={closeOnOverlayClick}
        closeOnEscape={closeOnEscape}
        scrollIntoView={scrollIntoView}
        overlayColor={overlayColor}
        pulse={pulse}
        backdropBlur={backdropBlur}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <div style={{ fontWeight: 600, fontSize: "1rem" }}>
            Welcome to the tour!
          </div>
          <div style={{ fontSize: "0.875rem", color: "inherit" }}>
            This is the feature card. It&apos;s highlighted so you can see it
            clearly during onboarding.
          </div>
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                padding: "0.4rem 1rem",
                background: "#18181b",
                color: "#fafafa",
                border: "none",
                borderRadius: 6,
                fontSize: "0.8125rem",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Got it
            </button>
          </div>
        </div>
      </SpotlightStyled>
    </div>
  );
}

// ============================================================================
// Multi-step tour demo — realistic mock app UI with 5 steps
// ============================================================================

const STEP_META = [
  { emoji: "🧭", title: "Navigation", color: "#6366f1" },
  { emoji: "🔍", title: "Search",     color: "#0ea5e9" },
  { emoji: "📊", title: "Dashboard",  color: "#10b981" },
  { emoji: "✨", title: "New item",   color: "#f59e0b" },
  { emoji: "⚙️", title: "Settings",   color: "#8b5cf6" },
];

function StepContent({ index, total }: { index: number; total: number }) {
  const meta = STEP_META[index];
  const descriptions = [
    "Use the sidebar to jump between sections. Each item highlights your current location.",
    "Hit the search bar to find anything instantly — commands, pages, and records.",
    "Your dashboard shows live stats. Click any card to drill into the details.",
    "Use the + button to create a new item. It opens a full-screen editor.",
    "Settings let you customise your workspace, integrations, and notifications.",
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", minWidth: 220 }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span
          style={{
            width: 28, height: 28, borderRadius: 6,
            background: `${meta.color}22`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1rem", flexShrink: 0,
          }}
        >
          {meta.emoji}
        </span>
        <span style={{ fontWeight: 600, fontSize: "0.9375rem" }}>
          {index + 1} / {total} — {meta.title}
        </span>
      </div>
      <p style={{ margin: 0, fontSize: "0.8125rem", color: "inherit", lineHeight: 1.5 }}>
        {descriptions[index]}
      </p>
    </div>
  );
}

function MultiStepDemo() {
  const [open, setOpen] = useState(false);

  const navRef    = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const statsRef  = useRef<HTMLDivElement>(null);
  const newBtnRef = useRef<HTMLButtonElement>(null);
  const settingsRef = useRef<HTMLButtonElement>(null);

  const total = 5;

  const steps = [
    { target: navRef,     padding: 8,  radius: 10, placement: "right"  as const },
    { target: searchRef,  padding: 8,  radius: 8,  placement: "bottom" as const },
    { target: statsRef,   padding: 10, radius: 12, placement: "bottom" as const },
    { target: newBtnRef,  padding: 8,  radius: 8,  placement: "bottom" as const },
    { target: settingsRef,padding: 8,  radius: 8,  placement: "top"    as const },
  ].map((s, i) => ({
    ...s,
    content: <StepContent index={i} total={total} />,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem", marginBottom: "1.5rem" }}>
      {/* ── Mock app shell ───────────────────────────────────────────── */}
      <div
        style={{
          width: "100%", maxWidth: 480,
          border: "1px solid var(--border, #e4e4e7)",
          borderRadius: 14,
          overflow: "hidden",
          background: "var(--bg-elevated, #fff)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex", alignItems: "center", gap: "0.75rem",
            padding: "0.625rem 1rem",
            borderBottom: "1px solid var(--border, #e4e4e7)",
            background: "var(--bg-elevated, #fafafa)",
          }}
        >
          <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--fg, #18181b)", marginRight: "auto" }}>
            Acme App
          </div>
          {/* Search bar */}
          <div
            ref={searchRef}
            style={{
              display: "flex", alignItems: "center", gap: "0.4rem",
              background: "var(--bg-subtle, #f4f4f5)",
              border: "1px solid var(--border, #e4e4e7)",
              borderRadius: 7, padding: "0.3rem 0.75rem",
              fontSize: "0.8125rem", color: "var(--fg-subtle, #a1a1aa)",
              width: 140,
            }}
          >
            <span>🔍</span> Search…
          </div>
          {/* New item button */}
          <button
            ref={newBtnRef}
            type="button"
            style={{
              padding: "0.3rem 0.875rem",
              background: "#6366f1", color: "#fff",
              border: "none", borderRadius: 7,
              fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer",
            }}
          >
            + New
          </button>
        </div>

        {/* Body */}
        <div style={{ display: "flex" }}>
          {/* Sidebar */}
          <div
            ref={navRef}
            style={{
              width: 130, flexShrink: 0,
              borderRight: "1px solid var(--border, #e4e4e7)",
              padding: "0.75rem 0.5rem",
              display: "flex", flexDirection: "column", gap: "0.25rem",
              background: "var(--bg-elevated, #fafafa)",
            }}
          >
            {["Dashboard", "Projects", "Team", "Reports"].map((item, i) => (
              <div
                key={item}
                style={{
                  padding: "0.35rem 0.625rem",
                  borderRadius: 6, fontSize: "0.8125rem",
                  fontWeight: i === 0 ? 600 : 400,
                  color: i === 0 ? "#6366f1" : "var(--fg-muted, #52525b)",
                  background: i === 0 ? "#eef2ff" : "transparent",
                  cursor: "default",
                }}
              >
                {item}
              </div>
            ))}
          </div>

          {/* Main content */}
          <div style={{ flex: 1, padding: "0.875rem 1rem" }}>
            {/* Stats row */}
            <div
              ref={statsRef}
              style={{ display: "flex", gap: "0.625rem", marginBottom: "0.75rem" }}
            >
              {[
                { label: "Revenue",  value: "$24k",  delta: "+12%", c: "#10b981" },
                { label: "Users",    value: "1,842", delta: "+5%",  c: "#6366f1" },
                { label: "Orders",   value: "384",   delta: "+8%",  c: "#f59e0b" },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    flex: 1, padding: "0.625rem 0.75rem",
                    background: "var(--bg-subtle, #f4f4f5)",
                    border: "1px solid var(--border, #e4e4e7)",
                    borderRadius: 10,
                  }}
                >
                  <div style={{ fontSize: "0.7rem", color: "var(--fg-muted, #71717a)", marginBottom: "0.2rem" }}>{s.label}</div>
                  <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--fg, #18181b)" }}>{s.value}</div>
                  <div style={{ fontSize: "0.7rem", color: s.c, fontWeight: 600 }}>{s.delta}</div>
                </div>
              ))}
            </div>

            {/* Placeholder rows */}
            {[80, 60, 70].map((w, i) => (
              <div
                key={i}
                style={{
                  height: 10, borderRadius: 4, marginBottom: "0.5rem",
                  background: "var(--border, #e4e4e7)",
                  width: `${w}%`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0.5rem 1rem",
            borderTop: "1px solid var(--border, #e4e4e7)",
            background: "var(--bg-elevated, #fafafa)",
          }}
        >
          <span style={{ fontSize: "0.75rem", color: "var(--fg-subtle, #a1a1aa)" }}>Acme Inc © 2026</span>
          <button
            ref={settingsRef}
            type="button"
            style={{
              background: "none", border: "none",
              fontSize: "1rem", cursor: "pointer", color: "var(--fg-muted, #71717a)",
              padding: "0.1rem 0.4rem", borderRadius: 4,
            }}
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* Start button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          padding: "0.5rem 1.5rem",
          background: "#18181b", color: "#fafafa",
          border: "none", borderRadius: 8,
          fontSize: "0.875rem", fontWeight: 500, cursor: "pointer",
          transition: "background 150ms",
        }}
      >
        Start 5-step tour
      </button>

      <SpotlightStyled
        target={navRef}
        open={open}
        onOpenChange={setOpen}
        steps={steps}
        defaultStep={0}
        overlayColor="rgba(0,0,0,0.68)"
        pulse
      />
    </div>
  );
}

// ============================================================================
// Pulse demo
// ============================================================================

function PulseDemo() {
  const [open, setOpen] = useState(false);
  const [pulse, setPulse] = useState(true);
  const btnRef = useRef<HTMLButtonElement>(null);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1rem",
        marginBottom: "1.5rem",
      }}
    >
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontSize: "0.875rem",
          cursor: "pointer",
        }}
      >
        <input
          type="checkbox"
          checked={pulse}
          onChange={(e) => setPulse(e.target.checked)}
        />
        pulse
      </label>

      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(true)}
        style={{
          padding: "0.5rem 1.25rem",
          background: "#18181b",
          color: "#fafafa",
          border: "none",
          borderRadius: 8,
          fontSize: "0.875rem",
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        Open with pulse
      </button>

      <SpotlightStyled
        target={btnRef}
        open={open}
        onOpenChange={setOpen}
        pulse={pulse}
        placement="bottom"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div style={{ fontWeight: 600 }}>Pulse ring</div>
          <div style={{ fontSize: "0.875rem", color: "inherit" }}>
            The pulse ring animates outward from the cutout border. It respects
            prefers-reduced-motion.
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            style={{
              alignSelf: "flex-end",
              padding: "0.4rem 1rem",
              background: "#18181b",
              color: "#fafafa",
              border: "none",
              borderRadius: 6,
              fontSize: "0.8125rem",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </SpotlightStyled>
    </div>
  );
}

// ============================================================================
// Backdrop blur demo
// ============================================================================

function BackdropBlurDemo() {
  const [open, setOpen] = useState(false);
  const [blur, setBlur] = useState(6);
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1rem",
        marginBottom: "1.5rem",
      }}
    >
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          fontSize: "0.875rem",
        }}
      >
        <span>backdropBlur</span>
        <input
          type="range"
          min={0}
          max={20}
          step={2}
          value={blur}
          onChange={(e) => setBlur(Number(e.target.value))}
          style={{ width: 120 }}
        />
        <span style={{ fontVariantNumeric: "tabular-nums", minWidth: "2ch" }}>
          {blur}px
        </span>
      </label>

      <div
        ref={cardRef}
        style={{
          background: "var(--bg-subtle, #f4f4f5)",
          border: "1px solid var(--border, #e4e4e7)",
          borderRadius: 12,
          padding: "1rem 1.5rem",
          width: 240,
          fontSize: "0.875rem",
          color: "var(--fg, #18181b)",
        }}
      >
        Frosted glass target
      </div>

      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          padding: "0.5rem 1.25rem",
          background: "#18181b",
          color: "#fafafa",
          border: "none",
          borderRadius: 8,
          fontSize: "0.875rem",
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        Open with blur
      </button>

      <SpotlightStyled
        target={cardRef}
        open={open}
        onOpenChange={setOpen}
        backdropBlur={blur}
        overlayColor="rgba(0,0,0,0.4)"
        placement="bottom"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div style={{ fontWeight: 600 }}>Frosted glass overlay</div>
          <div style={{ fontSize: "0.875rem", color: "inherit" }}>
            backdrop-filter blurs content behind the overlay. Combine with a
            lower overlay opacity for a frosted glass look.
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            style={{
              alignSelf: "flex-end",
              padding: "0.4rem 1rem",
              background: "#18181b",
              color: "#fafafa",
              border: "none",
              borderRadius: 6,
              fontSize: "0.8125rem",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </SpotlightStyled>
    </div>
  );
}

// ============================================================================
// Main export
// ============================================================================

export default function SpotlightDemo() {
  return (
    <PropPlayground
      layout="stacked"
      componentName="SpotlightStyled"
      importLine={`import { SpotlightStyled } from "@mshafiqyajid/react-spotlight/styled";\nimport "@mshafiqyajid/react-spotlight/styles.css";`}
      props={[
        {
          name: "placement",
          group: "Behaviour",
          control: {
            type: "select",
            options: [
              "bottom",
              "top",
              "left",
              "right",
              "bottom-start",
              "bottom-end",
              "top-start",
              "top-end",
            ] as const,
          },
          defaultValue: "bottom",
          omitWhen: "bottom",
        },
        {
          name: "padding",
          group: "Appearance",
          control: { type: "slider", min: 0, max: 32, step: 4 },
          defaultValue: 8,
          omitWhen: 8,
        },
        {
          name: "radius",
          group: "Appearance",
          control: { type: "slider", min: 0, max: 24, step: 4 },
          defaultValue: 8,
          omitWhen: 8,
        },
        {
          name: "overlayColor",
          group: "Appearance",
          control: {
            type: "select",
            options: [
              "rgba(0,0,0,0.6)",
              "rgba(0,0,0,0.85)",
              "rgba(15,23,42,0.7)",
              "rgba(88,28,135,0.65)",
              "rgba(5,46,22,0.65)",
            ] as const,
          },
          defaultValue: "rgba(0,0,0,0.6)",
          omitWhen: "rgba(0,0,0,0.6)",
        },
        {
          name: "pulse",
          group: "Appearance",
          control: { type: "toggle" },
          defaultValue: false,
          omitWhen: false,
        },
        {
          name: "backdropBlur",
          group: "Appearance",
          control: { type: "slider", min: 0, max: 20, step: 2 },
          defaultValue: 0,
          omitWhen: 0,
        },
        {
          name: "closeOnOverlayClick",
          group: "Behaviour",
          control: { type: "toggle" },
          defaultValue: true,
          omitWhen: true,
        },
        {
          name: "closeOnEscape",
          group: "Behaviour",
          control: { type: "toggle" },
          defaultValue: true,
          omitWhen: true,
        },
        {
          name: "scrollIntoView",
          group: "Behaviour",
          control: { type: "toggle" },
          defaultValue: true,
          omitWhen: true,
        },
      ]}
      render={(v) => (
        <SpotlightPreview
          padding={v.padding as number}
          radius={v.radius as number}
          placement={v.placement as string}
          closeOnOverlayClick={v.closeOnOverlayClick as boolean}
          closeOnEscape={v.closeOnEscape as boolean}
          scrollIntoView={v.scrollIntoView as boolean}
          overlayColor={v.overlayColor as string}
          pulse={v.pulse as boolean}
          backdropBlur={v.backdropBlur as number}
        />
      )}
    />
  );
}

export { MultiStepDemo, PulseDemo, BackdropBlurDemo };
