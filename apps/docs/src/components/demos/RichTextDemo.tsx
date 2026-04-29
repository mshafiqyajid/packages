import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { RichTextStyled } from "@mshafiqyajid/react-rich-text/styled";
import "@mshafiqyajid/react-rich-text/styles.css";

function RichTextWrapper({ size, tone, showToolbar, disabled }: { size: string; tone: string; showToolbar: boolean; disabled: boolean }) {
  const [value, setValue] = useState("<p>Start typing here...</p>");
  return (
    <RichTextStyled
      value={value}
      onChange={setValue}
      size={size as "sm" | "md" | "lg"}
      tone={tone as "neutral" | "primary"}
      showToolbar={showToolbar}
      placeholder="Write something..."
      minHeight="140px"
      disabled={disabled}
      style={{ width: "100%", maxWidth: 560 } as React.CSSProperties}
    />
  );
}

export default function RichTextDemo() {
  return (
    <PropPlayground
      componentName="RichTextStyled"
      importLine={`import { RichTextStyled } from "@mshafiqyajid/react-rich-text/styled";\nimport "@mshafiqyajid/react-rich-text/styles.css";`}
      props={[
        { name: "size",        control: { type: "segmented", options: ["sm","md","lg"] as const },       defaultValue: "md",      omitWhen: "md" },
        { name: "tone",        control: { type: "segmented", options: ["neutral","primary"] as const },  defaultValue: "neutral", omitWhen: "neutral" },
        { name: "showToolbar", control: { type: "toggle" },                                              defaultValue: true,      omitWhen: true },
        { name: "disabled",    control: { type: "toggle" },                                              defaultValue: false,     omitWhen: false },
      ]}
      staticProps={{ value: "{value}", onChange: "{setValue}" }}
      render={(v) => (
        <RichTextWrapper
          key={String(v.size)}
          size={v.size as string}
          tone={v.tone as string}
          showToolbar={v.showToolbar as boolean}
          disabled={v.disabled as boolean}
        />
      )}
    />
  );
}
