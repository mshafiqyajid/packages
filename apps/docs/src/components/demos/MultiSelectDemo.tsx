import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { MultiSelectStyled } from "@mshafiqyajid/react-multi-select/styled";
import "@mshafiqyajid/react-multi-select/styles.css";
import type { MultiSelectOption } from "@mshafiqyajid/react-multi-select";

const frameworkOptions: MultiSelectOption[] = [
  { value: "react",   label: "React",   group: "Frontend" },
  { value: "vue",     label: "Vue",     group: "Frontend" },
  { value: "svelte",  label: "Svelte",  group: "Frontend" },
  { value: "solid",   label: "SolidJS", group: "Frontend" },
  { value: "nextjs",  label: "Next.js", group: "Full-stack" },
  { value: "nuxt",    label: "Nuxt",    group: "Full-stack" },
  { value: "remix",   label: "Remix",   group: "Full-stack" },
  { value: "astro",   label: "Astro",   group: "Full-stack" },
  { value: "express", label: "Express", group: "Backend" },
  { value: "fastify", label: "Fastify", group: "Backend" },
  { value: "nestjs",  label: "NestJS",  group: "Backend", disabled: true },
];

const flatOptions: MultiSelectOption[] = [
  { value: "react",   label: "React" },
  { value: "vue",     label: "Vue" },
  { value: "svelte",  label: "Svelte" },
  { value: "solid",   label: "SolidJS" },
  { value: "angular", label: "Angular" },
];

function PlaygroundWrapper({
  size,
  tone,
  searchable,
  clearable,
  showSelectAll,
  triggerMode,
  disabled,
}: {
  size: string;
  tone: string;
  searchable: boolean;
  clearable: boolean;
  showSelectAll: boolean;
  triggerMode: string;
  disabled: boolean;
}) {
  const [value, setValue] = useState<string[]>([]);
  return (
    <div style={{ width: 300 }}>
      <MultiSelectStyled
        options={flatOptions}
        value={value}
        onChange={setValue}
        placeholder="Select frameworks…"
        size={size as "sm" | "md" | "lg"}
        tone={tone as "neutral" | "primary" | "success" | "danger"}
        searchable={searchable}
        clearable={clearable}
        showSelectAll={showSelectAll}
        triggerMode={triggerMode as "chips" | "count" | "auto"}
        disabled={disabled}
      />
    </div>
  );
}

function GroupedDemo() {
  const [value, setValue] = useState<string[]>(["react", "nextjs"]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <p style={{ margin: 0, fontSize: "0.875rem", color: "#71717a" }}>
        Options with groups and a pre-selected state
      </p>
      <MultiSelectStyled
        options={frameworkOptions}
        value={value}
        onChange={setValue}
        placeholder="Select frameworks…"
        tone="primary"
        style={{ width: 300 }}
      />
    </div>
  );
}

function FormControlDemo() {
  const [value, setValue] = useState<string[]>([]);
  const hasError = value.length === 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <MultiSelectStyled
        options={flatOptions}
        value={value}
        onChange={setValue}
        label="Frameworks"
        hint="Select all that apply to your project."
        placeholder="Pick frameworks…"
        style={{ width: 300 }}
      />
      <MultiSelectStyled
        options={flatOptions}
        value={value}
        onChange={setValue}
        label="Required field"
        required
        invalid={hasError}
        error={hasError ? "Please select at least one framework." : undefined}
        placeholder="Pick frameworks…"
        style={{ width: 300 }}
      />
    </div>
  );
}

function MaxSelectedDemo() {
  const [value, setValue] = useState<string[]>(["react"]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <p style={{ margin: 0, fontSize: "0.875rem", color: "#71717a" }}>
        maxSelected=2 — try selecting a third option
      </p>
      <MultiSelectStyled
        options={flatOptions}
        value={value}
        onChange={setValue}
        placeholder="Pick up to 2…"
        maxSelected={2}
        tone="success"
        style={{ width: 300 }}
      />
    </div>
  );
}

function TriggerModesDemo() {
  const [chipsValue, setChipsValue] = useState<string[]>(["react", "vue", "svelte", "solid"]);
  const [countValue, setCountValue] = useState<string[]>(["react", "vue", "svelte"]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div>
        <p style={{ margin: "0 0 0.5rem", fontSize: "0.875rem", color: "#71717a" }}>
          triggerMode="chips" — always shows chips
        </p>
        <MultiSelectStyled
          options={flatOptions}
          value={chipsValue}
          onChange={setChipsValue}
          triggerMode="chips"
          style={{ width: 300 }}
        />
      </div>
      <div>
        <p style={{ margin: "0 0 0.5rem", fontSize: "0.875rem", color: "#71717a" }}>
          triggerMode="count" — always shows count badge
        </p>
        <MultiSelectStyled
          options={flatOptions}
          value={countValue}
          onChange={setCountValue}
          triggerMode="count"
          style={{ width: 300 }}
        />
      </div>
      <div>
        <p style={{ margin: "0 0 0.5rem", fontSize: "0.875rem", color: "#71717a" }}>
          triggerMode="auto" maxChips=2 — chips up to 2, then count
        </p>
        <MultiSelectStyled
          options={flatOptions}
          value={chipsValue}
          onChange={setChipsValue}
          triggerMode="auto"
          maxChips={2}
          style={{ width: 300 }}
        />
      </div>
    </div>
  );
}

export default function MultiSelectDemo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
      <PropPlayground
        componentName="MultiSelectStyled"
        importLine={`import { MultiSelectStyled } from "@mshafiqyajid/react-multi-select/styled";\nimport "@mshafiqyajid/react-multi-select/styles.css";`}
        props={[
          { name: "size",          control: { type: "segmented", options: ["sm", "md", "lg"] as const },                              defaultValue: "md",      omitWhen: "md" },
          { name: "tone",          control: { type: "segmented", options: ["neutral", "primary", "success", "danger"] as const },      defaultValue: "neutral", omitWhen: "neutral" },
          { name: "triggerMode",   control: { type: "segmented", options: ["auto", "chips", "count"] as const },                      defaultValue: "auto",    omitWhen: "auto" },
          { name: "searchable",    control: { type: "toggle" },                                                                        defaultValue: true,      omitWhen: true },
          { name: "clearable",     control: { type: "toggle" },                                                                        defaultValue: true,      omitWhen: true },
          { name: "showSelectAll", control: { type: "toggle" },                                                                        defaultValue: true,      omitWhen: true },
          { name: "disabled",      control: { type: "toggle" },                                                                        defaultValue: false,     omitWhen: false },
        ]}
        staticProps={{ options: "{options}", value: "{value}", onChange: "{setValue}" }}
        render={(v) => (
          <PlaygroundWrapper
            size={v.size as string}
            tone={v.tone as string}
            searchable={v.searchable as boolean}
            clearable={v.clearable as boolean}
            showSelectAll={v.showSelectAll as boolean}
            triggerMode={v.triggerMode as string}
            disabled={v.disabled as boolean}
          />
        )}
      />

      <section>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>Grouped options</h3>
        <GroupedDemo />
      </section>

      <section>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>Form control</h3>
        <FormControlDemo />
      </section>

      <section>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>Max selection</h3>
        <MaxSelectedDemo />
      </section>

      <section>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>Trigger modes</h3>
        <TriggerModesDemo />
      </section>
    </div>
  );
}
