import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { MentionStyled } from "@mshafiqyajid/react-mention/styled";
import "@mshafiqyajid/react-mention/styles.css";
import type { MentionSuggestion } from "@mshafiqyajid/react-mention";

const USERS: MentionSuggestion[] = [
  { id: "u1", label: "Alice",   description: "Product Design",  avatar: "https://i.pravatar.cc/40?img=1" },
  { id: "u2", label: "Bob",     description: "Engineering",     avatar: "https://i.pravatar.cc/40?img=2" },
  { id: "u3", label: "Carol",   description: "Marketing",       avatar: "https://i.pravatar.cc/40?img=3" },
  { id: "u4", label: "Dave",    description: "Data Science",    avatar: "https://i.pravatar.cc/40?img=4" },
  { id: "u5", label: "Eve",     description: "DevOps",          avatar: "https://i.pravatar.cc/40?img=5" },
];

const TAGS: MentionSuggestion[] = [
  { id: "t1", label: "react",       description: "UI library" },
  { id: "t2", label: "typescript",  description: "Typed JavaScript" },
  { id: "t3", label: "css",         description: "Styling" },
  { id: "t4", label: "design",      description: "UI/UX" },
  { id: "t5", label: "a11y",        description: "Accessibility" },
];

function filterBy(items: MentionSuggestion[], query: string): MentionSuggestion[] {
  const q = query.toLowerCase();
  return items.filter(
    (i) =>
      i.label.toLowerCase().startsWith(q) ||
      i.description?.toLowerCase().includes(q),
  );
}

function simulateAsync(items: MentionSuggestion[], query: string): Promise<MentionSuggestion[]> {
  return new Promise((resolve) =>
    setTimeout(() => resolve(filterBy(items, query)), 600),
  );
}

function CardRenderer(suggestion: MentionSuggestion, isActive: boolean) {
  return (
    <span
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        width: "100%",
        padding: "0.1rem 0",
      }}
    >
      <span
        style={{
          width: "2rem",
          height: "2rem",
          borderRadius: "6px",
          background: isActive ? "rgba(99,102,241,0.18)" : "var(--rmen-border, #e4e4e7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.75rem",
          fontWeight: 700,
          flexShrink: 0,
          color: isActive ? "#4338ca" : "var(--rmen-hint-fg, #6b7280)",
          textTransform: "uppercase",
        }}
      >
        {suggestion.label.slice(0, 2)}
      </span>
      <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>{suggestion.label}</span>
        {suggestion.description && (
          <span
            style={{
              fontSize: "0.72rem",
              color: isActive ? "inherit" : "var(--rmen-hint-fg, #6b7280)",
              opacity: isActive ? 0.8 : 1,
            }}
          >
            {suggestion.description}
          </span>
        )}
      </span>
    </span>
  );
}

interface MentionLogEntry {
  triggerChar: string;
  label: string;
  ts: number;
}

export default function MentionDemo() {
  const [value, setValue] = useState("");
  const [customValue, setCustomValue] = useState("");
  const [mentionLog, setMentionLog] = useState<MentionLogEntry[]>([]);

  return (
    <>
      <div style={{ marginBottom: "1.5rem" }}>
        <MentionStyled
          value={value}
          onChange={setValue}
          label="Message"
          placeholder="Type @ to mention a person, # for a tag…"
          rows={4}
          triggers={[
            {
              char: "@",
              loadSuggestions: (q: string) => filterBy(USERS, q),
              maxSuggestions: 5,
            },
            {
              char: "#",
              loadSuggestions: (q: string) => filterBy(TAGS, q),
              maxSuggestions: 5,
            },
          ]}
        />
        {value && (
          <pre
            style={{
              marginTop: "0.75rem",
              padding: "0.75rem 1rem",
              background: "var(--surface-2, #f4f4f5)",
              borderRadius: 8,
              fontSize: "0.8125rem",
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
            }}
          >
            {value}
          </pre>
        )}
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <p style={{ fontSize: "0.875rem", marginBottom: "0.75rem", color: "var(--rmen-hint-fg, #6b7280)" }}>
          Custom <code>renderSuggestion</code> (card style) with <code>onMentionAdd</code> callback and async loading (600 ms delay):
        </p>
        <MentionStyled
          value={customValue}
          onChange={setCustomValue}
          label="Custom renderer"
          placeholder="Type @ — card-style suggestions with async loading…"
          rows={3}
          onMentionAdd={(triggerChar: string, suggestion: MentionSuggestion) => {
            setMentionLog((prev) => [
              { triggerChar, label: suggestion.label, ts: Date.now() },
              ...prev.slice(0, 4),
            ]);
          }}
          triggers={[
            {
              char: "@",
              loadSuggestions: (q: string) => simulateAsync(USERS, q),
              maxSuggestions: 5,
              renderSuggestion: CardRenderer,
            },
          ]}
        />
        {mentionLog.length > 0 && (
          <div
            style={{
              marginTop: "0.75rem",
              padding: "0.625rem 0.875rem",
              background: "var(--surface-2, #f4f4f5)",
              borderRadius: 8,
              fontSize: "0.8rem",
            }}
          >
            <strong style={{ fontSize: "0.75rem", display: "block", marginBottom: "0.35rem" }}>
              onMentionAdd log (most recent first):
            </strong>
            {mentionLog.map((entry, i) => (
              <div key={i} style={{ fontFamily: "monospace" }}>
                {entry.triggerChar}
                {entry.label}
              </div>
            ))}
          </div>
        )}
      </div>

      <PropPlayground
        layout="stacked"
        componentName="MentionStyled"
        importLine={`import { MentionStyled } from "@mshafiqyajid/react-mention/styled";\nimport "@mshafiqyajid/react-mention/styles.css";`}
        props={[
          {
            name: "size",
            group: "Appearance",
            control: { type: "segmented", options: ["sm", "md", "lg"] as const },
            defaultValue: "md",
            omitWhen: "md",
          },
          {
            name: "highlightMentions",
            group: "Appearance",
            control: { type: "toggle" },
            defaultValue: true,
            omitWhen: true,
          },
          {
            name: "rows",
            group: "Layout",
            control: { type: "slider", min: 2, max: 8, step: 1 },
            defaultValue: 3,
            omitWhen: 3,
          },
          {
            name: "disabled",
            group: "State",
            control: { type: "toggle" },
            defaultValue: false,
            omitWhen: false,
          },
          {
            name: "readOnly",
            group: "State",
            control: { type: "toggle" },
            defaultValue: false,
            omitWhen: false,
          },
          {
            name: "hint",
            group: "Messaging",
            control: { type: "select", options: ["", "Use @ for people, # for tags"] as const },
            defaultValue: "",
            omitWhen: "",
          },
          {
            name: "error",
            group: "Messaging",
            control: { type: "select", options: ["", "This field is required"] as const },
            defaultValue: "",
            omitWhen: "",
          },
        ]}
        render={(v) => (
          <MentionStyled
            label="Message"
            placeholder="Type @ to mention a person, # for a tag…"
            size={v.size as "sm" | "md" | "lg"}
            highlightMentions={v.highlightMentions as boolean}
            disabled={v.disabled as boolean}
            readOnly={v.readOnly as boolean}
            rows={v.rows as number}
            hint={v.hint as string || undefined}
            error={v.error as string || undefined}
            triggers={[
              {
                char: "@",
                loadSuggestions: (q: string) => filterBy(USERS, q),
                maxSuggestions: 5,
              },
              {
                char: "#",
                loadSuggestions: (q: string) => filterBy(TAGS, q),
                maxSuggestions: 5,
              },
            ]}
          />
        )}
      />
    </>
  );
}
