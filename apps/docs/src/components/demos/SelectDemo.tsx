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

function SelectWrapper({ multiple, searchable, size, tone, clearable, disabled }: {
  multiple: boolean; searchable: boolean; size: string; tone: string; clearable: boolean; disabled: boolean;
}) {
  const [value, setValue] = useState<string | string[]>(multiple ? [] : "");
  return (
    <div style={{ width: 240 }}>
      <SelectStyled
        items={items}
        value={value}
        onChange={setValue}
        placeholder="Select a framework…"
        multiple={multiple}
        searchable={searchable}
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
      ]}
      staticProps={{ items: "{items}", value: "{value}", onChange: "{setValue}" }}
      render={(v) => (
        <SelectWrapper
          multiple={v.multiple as boolean}
          searchable={v.searchable as boolean}
          size={v.size as string}
          tone={v.tone as string}
          clearable={v.clearable as boolean}
          disabled={v.disabled as boolean}
        />
      )}
    />
  );
}
