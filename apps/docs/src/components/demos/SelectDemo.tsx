import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { SelectStyled } from "@mshafiqyajid/react-select/styled";
import "@mshafiqyajid/react-select/styles.css";

const items = [
  { value: "react",   label: "React" },
  { value: "vue",     label: "Vue" },
  { value: "svelte",  label: "Svelte" },
  { value: "angular", label: "Angular" },
  { value: "solid",   label: "SolidJS" },
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

export default function SelectDemo() {
  return (
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
  );
}
