import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { TagInputStyled } from "@mshafiqyajid/react-tag-input/styled";
import { ButtonStyled } from "@mshafiqyajid/react-button/styled";
import "@mshafiqyajid/react-tag-input/styles.css";
import "@mshafiqyajid/react-button/styles.css";

const SUGGESTIONS = ["React", "TypeScript", "CSS", "Node.js", "GraphQL", "Tailwind", "Next.js", "Astro"];

const ASYNC_POOL = [
  "alice", "bob", "carol", "dave", "eve", "frank",
  "grace", "heidi", "ivan", "julia", "kevin", "linda",
];

function mockLoadSuggestions(query: string): Promise<string[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const q = query.trim().toLowerCase();
      resolve(q === "" ? ASYNC_POOL : ASYNC_POOL.filter((s) => s.includes(q)));
    }, 500);
  });
}

function colorFromTag(tag: string): string {
  let h = 0;
  for (let i = 0; i < tag.length; i++) h = (h * 31 + tag.charCodeAt(i)) | 0;
  const hue = Math.abs(h) % 360;
  return `hsl(${hue} 70% 88%)`;
}

function TagInputWrapper({
  size, tone, tagVariant, disabled, reorderable, lowercase, backspaceEditsLastTag,
  asyncOptions, colorize, withActions,
}: {
  size: string; tone: string; tagVariant: string;
  disabled: boolean; reorderable: boolean; lowercase: boolean; backspaceEditsLastTag: boolean;
  asyncOptions: boolean; colorize: boolean; withActions: boolean;
}) {
  const [tags, setTags] = useState<string[]>(["React", "TypeScript"]);
  return (
    <TagInputStyled
      value={tags}
      onChange={setTags}
      suggestions={asyncOptions ? [] : SUGGESTIONS}
      loadSuggestions={asyncOptions ? mockLoadSuggestions : undefined}
      colorize={colorize ? colorFromTag : undefined}
      tagActions={
        withActions
          ? () => (
              <ButtonStyled
                variant="ghost"
                tone="neutral"
                size="sm"
                aria-label="More"
                style={{ height: 18, padding: "0 4px", marginLeft: 4, fontSize: "0.7rem", minWidth: 0 }}
              >
                ⋯
              </ButtonStyled>
            )
          : undefined
      }
      size={size as "sm" | "md" | "lg"}
      tone={tone as "neutral" | "primary" | "success" | "danger"}
      tagVariant={tagVariant as "solid" | "subtle" | "outline"}
      reorderable={reorderable}
      transform={lowercase ? (t: string) => t.toLowerCase() : undefined}
      backspaceEditsLastTag={backspaceEditsLastTag}
      label="Tags"
      placeholder={asyncOptions ? "Type to search…" : "Add a tag — try pasting `a, b, c`"}
      hint={
        asyncOptions
          ? "Async loadSuggestions: 500ms latency, 12-name pool."
          : reorderable
          ? "Drag tags to reorder. Double-click any tag to edit in-place."
          : "Paste multiple tags split by comma / newline / tab / semicolon."
      }
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
        { name: "reorderable",           control: { type: "toggle" }, defaultValue: false, omitWhen: false },
        { name: "lowercase",             control: { type: "toggle" }, defaultValue: false, omitWhen: false },
        { name: "backspaceEditsLastTag", control: { type: "toggle" }, defaultValue: false, omitWhen: false },
        { name: "asyncOptions",          label: "loadSuggestions (mock async)", control: { type: "toggle" }, defaultValue: false, omitWhen: false },
        { name: "colorize",              label: "colorize per tag",   control: { type: "toggle" }, defaultValue: false, omitWhen: false },
        { name: "withActions",           label: "tagActions slot",    control: { type: "toggle" }, defaultValue: false, omitWhen: false },
      ]}
      staticProps={{ value: "{tags}", onChange: "{setTags}" }}
      render={(v) => (
        <TagInputWrapper
          key={String(v.asyncOptions)}
          size={v.size as string}
          tone={v.tone as string}
          tagVariant={v.tagVariant as string}
          disabled={v.disabled as boolean}
          reorderable={v.reorderable as boolean}
          lowercase={v.lowercase as boolean}
          backspaceEditsLastTag={v.backspaceEditsLastTag as boolean}
          asyncOptions={v.asyncOptions as boolean}
          colorize={v.colorize as boolean}
          withActions={v.withActions as boolean}
        />
      )}
    />
  );
}
