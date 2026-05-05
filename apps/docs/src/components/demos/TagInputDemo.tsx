import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { TagInputStyled } from "@mshafiqyajid/react-tag-input/styled";
import "@mshafiqyajid/react-tag-input/styles.css";

const SUGGESTIONS = ["React", "TypeScript", "CSS", "Node.js", "GraphQL", "Tailwind", "Next.js", "Astro"];

function TagInputWrapper({
  size,
  tone,
  tagVariant,
  disabled,
  sortable,
  lowercase,
  backspaceEditsLastTag,
}: {
  size: string;
  tone: string;
  tagVariant: string;
  disabled: boolean;
  sortable: boolean;
  lowercase: boolean;
  backspaceEditsLastTag: boolean;
}) {
  const [tags, setTags] = useState<string[]>(["React", "TypeScript"]);
  return (
    <TagInputStyled
      value={tags}
      onChange={setTags}
      suggestions={SUGGESTIONS}
      size={size as "sm" | "md" | "lg"}
      tone={tone as "neutral" | "primary" | "success" | "danger"}
      tagVariant={tagVariant as "solid" | "subtle" | "outline"}
      sortable={sortable}
      transform={lowercase ? (t: string) => t.toLowerCase() : undefined}
      backspaceEditsLastTag={backspaceEditsLastTag}
      label="Tags"
      placeholder="Add a tag — try pasting `a, b, c`"
      hint="Paste multiple tags split by comma / newline / tab / semicolon."
      disabled={disabled}
      style={{ width: "100%", maxWidth: 420 } as React.CSSProperties}
    />
  );
}

export default function TagInputDemo() {
  return (
    <PropPlayground
      componentName="TagInputStyled"
      importLine={`import { TagInputStyled } from "@mshafiqyajid/react-tag-input/styled";\nimport "@mshafiqyajid/react-tag-input/styles.css";`}
      props={[
        { name: "size",                  control: { type: "segmented", options: ["sm","md","lg"] as const },                         defaultValue: "md",      omitWhen: "md" },
        { name: "tone",                  control: { type: "segmented", options: ["neutral","primary","success","danger"] as const }, defaultValue: "neutral", omitWhen: "neutral" },
        { name: "tagVariant",            control: { type: "segmented", options: ["solid","subtle","outline"] as const },             defaultValue: "solid",   omitWhen: "solid" },
        { name: "disabled",              control: { type: "toggle" }, defaultValue: false, omitWhen: false },
        { name: "sortable",              control: { type: "toggle" }, defaultValue: false, omitWhen: false },
        { name: "lowercase",             control: { type: "toggle" }, defaultValue: false, omitWhen: false },
        { name: "backspaceEditsLastTag", control: { type: "toggle" }, defaultValue: false, omitWhen: false },
      ]}
      staticProps={{ value: "{tags}", onChange: "{setTags}" }}
      render={(v) => (
        <TagInputWrapper
          size={v.size as string}
          tone={v.tone as string}
          tagVariant={v.tagVariant as string}
          disabled={v.disabled as boolean}
          sortable={v.sortable as boolean}
          lowercase={v.lowercase as boolean}
          backspaceEditsLastTag={v.backspaceEditsLastTag as boolean}
        />
      )}
    />
  );
}
