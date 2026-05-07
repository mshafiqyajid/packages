import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { RichTextStyled } from "@mshafiqyajid/react-rich-text/styled";
import "@mshafiqyajid/react-rich-text/styles.css";

interface DemoProps {
  size: string;
  tone: string;
  showToolbar: boolean;
  disabled: boolean;
  wordCount: boolean;
  sanitizePaste: boolean;
  shortcuts: boolean;
  defaultLinkPrompt: string;
  bubbleMenu: boolean;
  autoLink: boolean;
  invalid: boolean;
  required: boolean;
  label: string;
  hint: string;
  error: string;
  name: string;
  maxChars: number;
  maxWords: number;
  placeholderEachLine: string;
  showUndoRedo: boolean;
  showCodeItem: boolean;
}

function RichTextWrapper(p: DemoProps) {
  const [value, setValue] = useState("<p>Start typing here...</p>");
  // 0.3.0 adds shortcuts/defaultLinkPrompt/bubbleMenu/autoLink/form-input parity.
  // Spread-cast keeps the demo compiling against the published 0.2.1 dist and
  // continues to work once the new types ship.
  const extraItems: string[] = [];
  if (p.showUndoRedo) { extraItems.push("undo", "redo"); }
  if (p.showCodeItem) { extraItems.push("code"); }

  const newProps = {
    shortcuts: p.shortcuts,
    defaultLinkPrompt: p.defaultLinkPrompt as "popover" | "prompt",
    bubbleMenu: p.bubbleMenu,
    autoLink: p.autoLink,
    invalid: p.invalid,
    required: p.required,
    label: p.label || undefined,
    hint: p.hint || undefined,
    error: p.error || undefined,
    name: p.name || undefined,
    maxChars: p.maxChars > 0 ? p.maxChars : undefined,
    maxWords: p.maxWords > 0 ? p.maxWords : undefined,
    placeholderEachLine: p.placeholderEachLine || undefined,
    toolbarItems: extraItems.length > 0
      ? [...extraItems, "bold", "italic", "underline", "strikethrough", "h1", "h2", "ul", "ol", "blockquote", "link", "clear"] as ("bold" | "italic" | "underline" | "strikethrough" | "h1" | "h2" | "ul" | "ol" | "blockquote" | "link" | "clear" | "code" | "undo" | "redo")[]
      : undefined,
  };
  return (
    <div style={{ width: "100%", maxWidth: 560 }}>
      <RichTextStyled
        value={value}
        onChange={setValue}
        size={p.size as "sm" | "md" | "lg"}
        tone={p.tone as "neutral" | "primary"}
        showToolbar={p.showToolbar}
        wordCount={p.wordCount}
        sanitizePaste={p.sanitizePaste}
        placeholder="Write something — try pasting styled HTML"
        minHeight="140px"
        disabled={p.disabled}
        {...(newProps as object)}
      />
    </div>
  );
}

export default function RichTextDemo() {
  return (
    <PropPlayground
      componentName="RichTextStyled"
      importLine={`import { RichTextStyled } from "@mshafiqyajid/react-rich-text/styled";\nimport "@mshafiqyajid/react-rich-text/styles.css";`}
      props={[
        { name: "size",              control: { type: "segmented", options: ["sm","md","lg"] as const },             defaultValue: "md",      omitWhen: "md" },
        { name: "tone",              control: { type: "segmented", options: ["neutral","primary"] as const },        defaultValue: "neutral", omitWhen: "neutral" },
        { name: "showToolbar",       control: { type: "toggle" },                                                    defaultValue: true,      omitWhen: true },
        { name: "sanitizePaste",     control: { type: "toggle" },                                                    defaultValue: true,      omitWhen: true },
        { name: "shortcuts",         control: { type: "toggle" },                                                    defaultValue: true,      omitWhen: true },
        { name: "defaultLinkPrompt", control: { type: "segmented", options: ["popover","prompt"] as const },         defaultValue: "popover", omitWhen: "popover" },
        { name: "bubbleMenu",        control: { type: "toggle" },                                                    defaultValue: false,     omitWhen: false },
        { name: "autoLink",          control: { type: "toggle" },                                                    defaultValue: false,     omitWhen: false },
        { name: "disabled",          control: { type: "toggle" },                                                    defaultValue: false,     omitWhen: false },
        { name: "wordCount",         control: { type: "toggle" },                                                    defaultValue: false,     omitWhen: false },
        { name: "required",          control: { type: "toggle" },                                                    defaultValue: false,     omitWhen: false },
        { name: "invalid",           control: { type: "toggle" },                                                    defaultValue: false,     omitWhen: false },
        { name: "label",             control: { type: "text", placeholder: "e.g. Bio" },                             defaultValue: "",        omitWhen: "" },
        { name: "hint",              control: { type: "text", placeholder: "Markdown supported" },                   defaultValue: "",        omitWhen: "" },
        { name: "error",             control: { type: "text", placeholder: "Required" },                             defaultValue: "",        omitWhen: "" },
        { name: "name",              control: { type: "text", placeholder: "form field name" },                      defaultValue: "",        omitWhen: "" },
        { name: "maxChars",           control: { type: "number", min: 0, max: 1000, step: 50 },                       defaultValue: 0,         omitWhen: 0 },
        { name: "maxWords",           control: { type: "number", min: 0, max: 500, step: 10 },                        defaultValue: 0,         omitWhen: 0 },
        { name: "placeholderEachLine", control: { type: "text", placeholder: "Type here…" },                          defaultValue: "",        omitWhen: "" },
        { name: "showUndoRedo",       label: "undo/redo items",  control: { type: "toggle" },                         defaultValue: false,     omitWhen: false },
        { name: "showCodeItem",       label: "code toolbar item", control: { type: "toggle" },                        defaultValue: false,     omitWhen: false },
      ]}
      staticProps={{ value: "{value}", onChange: "{setValue}" }}
      render={(v) => (
        <RichTextWrapper
          key={`${String(v.size)}-${String(v.bubbleMenu)}`}
          size={v.size as string}
          tone={v.tone as string}
          showToolbar={v.showToolbar as boolean}
          disabled={v.disabled as boolean}
          wordCount={v.wordCount as boolean}
          sanitizePaste={v.sanitizePaste as boolean}
          shortcuts={v.shortcuts as boolean}
          defaultLinkPrompt={v.defaultLinkPrompt as string}
          bubbleMenu={v.bubbleMenu as boolean}
          autoLink={v.autoLink as boolean}
          invalid={v.invalid as boolean}
          required={v.required as boolean}
          label={v.label as string}
          hint={v.hint as string}
          error={v.error as string}
          name={v.name as string}
          maxChars={v.maxChars as number}
          maxWords={v.maxWords as number}
          placeholderEachLine={v.placeholderEachLine as string}
          showUndoRedo={v.showUndoRedo as boolean}
          showCodeItem={v.showCodeItem as boolean}
        />
      )}
    />
  );
}
