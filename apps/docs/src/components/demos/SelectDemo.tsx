import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { SelectStyled } from "@mshafiqyajid/react-select/styled";
import "@mshafiqyajid/react-select/styles.css";
import type { SelectGroup, SelectItem } from "@mshafiqyajid/react-select";

const items = [
  { value: "react",   label: "React" },
  { value: "vue",     label: "Vue" },
  { value: "svelte",  label: "Svelte" },
  { value: "angular", label: "Angular" },
  { value: "solid",   label: "SolidJS" },
];

const groupedItems: SelectGroup[] = [
  {
    group: "Frontend",
    items: [
      { value: "react",   label: "React" },
      { value: "vue",     label: "Vue" },
      { value: "svelte",  label: "Svelte" },
    ],
  },
  {
    group: "Backend",
    items: [
      { value: "express",  label: "Express" },
      { value: "fastify",  label: "Fastify" },
      { value: "nestjs",   label: "NestJS" },
    ],
  },
  {
    group: "Full-stack",
    items: [
      { value: "nextjs",   label: "Next.js" },
      { value: "nuxt",     label: "Nuxt" },
      { value: "remix",    label: "Remix", disabled: true },
    ],
  },
];

const ASYNC_POOL = [
  { value: "alice",   label: "Alice Anderson" },
  { value: "bob",     label: "Bob Brown" },
  { value: "carol",   label: "Carol Chen" },
  { value: "dave",    label: "Dave Davis" },
  { value: "eve",     label: "Eve Evans" },
  { value: "frank",   label: "Frank Foster" },
  { value: "grace",   label: "Grace Garcia" },
  { value: "heidi",   label: "Heidi Hayes" },
  { value: "ivan",    label: "Ivan Iglesias" },
  { value: "julia",   label: "Julia Jones" },
];

function mockLoadOptions(query: string): Promise<typeof items> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const q = query.trim().toLowerCase();
      resolve(
        q === ""
          ? ASYNC_POOL
          : ASYNC_POOL.filter((i) => i.label.toLowerCase().includes(q)),
      );
    }, 600);
  });
}

function SelectWrapper({ multiple, searchable, size, tone, clearable, disabled, async: useAsync }: {
  multiple: boolean; searchable: boolean; size: string; tone: string; clearable: boolean; disabled: boolean; async: boolean;
}) {
  const [value, setValue] = useState<string | string[]>(multiple ? [] : "");
  return (
    <div style={{ width: 260 }}>
      <SelectStyled
        items={useAsync ? [] : items}
        value={value}
        onChange={setValue}
        placeholder={useAsync ? "Type to search people…" : "Select a framework…"}
        multiple={multiple}
        searchable={!useAsync && searchable}
        loadOptions={useAsync ? mockLoadOptions : undefined}
        loadingText="Searching…"
        emptyText="No matches"
        size={size as "sm" | "md" | "lg"}
        tone={tone as "neutral" | "primary" | "success" | "danger"}
        clearable={clearable}
        disabled={disabled}
      />
    </div>
  );
}

function GroupedDemo() {
  const [value, setValue] = useState<string | string[]>([]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div>
        <p style={{ marginBottom: "0.5rem", fontSize: "0.875rem", color: "#71717a" }}>
          Grouped single select
        </p>
        <SelectStyled
          items={groupedItems}
          value={value as string}
          onChange={(v) => setValue(v as string)}
          placeholder="Select a framework…"
          searchable
          style={{ width: 260 } as React.CSSProperties}
        />
      </div>
      <div>
        <p style={{ marginBottom: "0.5rem", fontSize: "0.875rem", color: "#71717a" }}>
          Grouped multi-select with renderItem
        </p>
        <SelectStyled
          items={groupedItems}
          value={value as string[]}
          onChange={(v) => setValue(v as string[])}
          placeholder="Pick frameworks…"
          multiple
          searchable
          clearable
          style={{ width: 260 } as React.CSSProperties}
          renderItem={(item: SelectItem, { selected }: { selected: boolean; active: boolean }) => (
            <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", width: "100%" }}>
              <span style={{ width: "1em", textAlign: "center", color: "#6366f1" }}>
                {selected ? "✓" : "○"}
              </span>
              <span style={{ fontWeight: selected ? 600 : undefined }}>{item.label}</span>
            </span>
          )}
        />
      </div>
    </div>
  );
}

function RenderTriggerDemo() {
  const [value, setValue] = useState<string>("");
  const selectedItem = items.find((i) => i.value === value) ?? null;
  return (
    <div>
      <p style={{ marginBottom: "0.5rem", fontSize: "0.875rem", color: "#71717a" }}>
        Custom renderTrigger
      </p>
      <SelectStyled
        items={items}
        value={value}
        onChange={(v) => setValue(v as string)}
        placeholder="Choose…"
        style={{ width: 260 } as React.CSSProperties}
        renderTrigger={(sel: SelectItem | SelectItem[] | null, open: boolean) => (
          <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.1em" }}>
              {selectedItem ? "✅" : "🔽"}
            </span>
            <span style={{ fontStyle: sel ? undefined : "italic", color: sel ? undefined : "#a1a1aa" }}>
              {selectedItem ? selectedItem.label : "Pick a framework"}
            </span>
            <span style={{ marginLeft: "auto", fontSize: "0.75em", color: "#71717a" }}>
              {open ? "▲" : "▼"}
            </span>
          </span>
        )}
        renderEmpty={() => (
          <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem", padding: "0.5rem" }}>
            <span style={{ fontSize: "1.5em" }}>🔍</span>
            <span style={{ fontSize: "0.8em", color: "#71717a" }}>Nothing here</span>
          </span>
        )}
      />
    </div>
  );
}

function AsyncDemo() {
  const [value, setValue] = useState<string>("");
  return (
    <div>
      <p style={{ marginBottom: "0.5rem", fontSize: "0.875rem", color: "#71717a" }}>
        Async loadOptions (mock 600ms delay)
      </p>
      <SelectStyled
        items={[]}
        value={value}
        onChange={(v) => setValue(v as string)}
        placeholder="Type to search people…"
        loadOptions={mockLoadOptions}
        loadingText="Searching…"
        emptyText="No matches"
        clearable
        style={{ width: 260 } as React.CSSProperties}
      />
    </div>
  );
}

export default function SelectDemo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
      <PropPlayground
        componentName="SelectStyled"
        importLine={`import { SelectStyled } from "@mshafiqyajid/react-select/styled";\nimport "@mshafiqyajid/react-select/styles.css";`}
        props={[
          { name: "size",       control: { type: "segmented", options: ["sm","md","lg"] as const },                        defaultValue: "md",      omitWhen: "md" },
          { name: "tone",       control: { type: "segmented", options: ["neutral","primary","success","danger"] as const }, defaultValue: "neutral", omitWhen: "neutral" },
          { name: "multiple",   control: { type: "toggle" },                                                               defaultValue: false,     omitWhen: false },
          { name: "searchable", control: { type: "toggle" },                                                               defaultValue: false,     omitWhen: false },
          { name: "clearable",  control: { type: "toggle" },                                                               defaultValue: false,     omitWhen: false },
          { name: "disabled",   control: { type: "toggle" },                                                               defaultValue: false,     omitWhen: false },
          { name: "async",      label: "loadOptions (mock)", control: { type: "toggle" },                                  defaultValue: false,     omitWhen: false },
        ]}
        staticProps={{ items: "{items}", value: "{value}", onChange: "{setValue}" }}
        render={(v) => (
          <SelectWrapper
            key={String(v.async)}
            multiple={v.multiple as boolean}
            searchable={v.searchable as boolean}
            size={v.size as string}
            tone={v.tone as string}
            clearable={v.clearable as boolean}
            disabled={v.disabled as boolean}
            async={v.async as boolean}
          />
        )}
      />

      <section>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>Grouped items</h3>
        <GroupedDemo />
      </section>

      <section>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>Render props</h3>
        <RenderTriggerDemo />
      </section>

      <section>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>Async loadOptions</h3>
        <AsyncDemo />
      </section>
    </div>
  );
}
