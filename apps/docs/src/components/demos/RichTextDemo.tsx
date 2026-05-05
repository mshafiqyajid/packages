import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { RichTextStyled } from "@mshafiqyajid/react-rich-text/styled";
import "@mshafiqyajid/react-rich-text/styles.css";

function RichTextWrapper({ size, tone, showToolbar, disabled, wordCount, sanitizePaste }: { size: string; tone: string; showToolbar: boolean; disabled: boolean; wordCount: boolean; sanitizePaste: boolean }) {
  const [value, setValue] = useState("<p>Start typing here...</p>");
  return (
    <div style={{ width: "100%", maxWidth: 560 }}>
      <RichTextStyled
        value={value}
        onChange={setValue}
        size={size as "sm" | "md" | "lg"}
        tone={tone as "neutral" | "primary"}
        showToolbar={showToolbar}
        wordCount={wordCount}
        sanitizePaste={sanitizePaste}
        placeholder="Write something — try pasting styled HTML"
        minHeight="140px"
        disabled={disabled}
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
        { name: "size",          control: { type: "segmented", options: ["sm","md","lg"] as const },       defaultValue: "md",      omitWhen: "md" },
        { name: "tone",          control: { type: "segmented", options: ["neutral","primary"] as const },  defaultValue: "neutral", omitWhen: "neutral" },
        { name: "showToolbar",   control: { type: "toggle" },                                              defaultValue: true,      omitWhen: true },
        { name: "sanitizePaste", control: { type: "toggle" },                                              defaultValue: true,      omitWhen: true },
        { name: "disabled",      control: { type: "toggle" },                                              defaultValue: false,     omitWhen: false },
        { name: "wordCount",     control: { type: "toggle" },                                              defaultValue: false,     omitWhen: false },
      ]}
      staticProps={{ value: "{value}", onChange: "{setValue}" }}
      render={(v) => (
        <RichTextWrapper
          key={String(v.size)}
          size={v.size as string}
          tone={v.tone as string}
          showToolbar={v.showToolbar as boolean}
          disabled={v.disabled as boolean}
          wordCount={v.wordCount as boolean}
          sanitizePaste={v.sanitizePaste as boolean}
        />
      )}
    />
  );
}
