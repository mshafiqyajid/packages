import PropPlayground from "../PropPlayground";
import { CopyButtonStyled } from "@mshafiqyajid/react-copy-button/styled";
import "@mshafiqyajid/react-copy-button/styles.css";

export default function CopyButtonDemo() {
  return (
    <PropPlayground
      componentName="CopyButtonStyled"
      importLine={`import { CopyButtonStyled } from "@mshafiqyajid/react-copy-button/styled";\nimport "@mshafiqyajid/react-copy-button/styles.css";`}
      props={[
        { name: "variant", control: { type: "segmented", options: ["solid","outline","ghost","subtle"] as const }, defaultValue: "solid", omitWhen: "solid" },
        { name: "size",    control: { type: "segmented", options: ["sm","md","lg","icon"] as const }, defaultValue: "md", omitWhen: "md" },
        { name: "tone",    control: { type: "segmented", options: ["neutral","primary","success","danger"] as const }, defaultValue: "primary", omitWhen: "neutral" },
        { name: "label",   control: { type: "text", placeholder: "Copy" }, defaultValue: "Copy", omitWhen: "Copy" },
        { name: "copiedLabel", control: { type: "text", placeholder: "Copied" }, defaultValue: "Copied", omitWhen: "Copied" },
        { name: "fullWidth", control: { type: "toggle" }, defaultValue: false, omitWhen: false },
      ]}
      staticProps={{ text: '"Hello world"' }}
      render={(v) => (
        <CopyButtonStyled
          text="Hello world"
          variant={v.variant as "solid"|"outline"|"ghost"|"subtle"}
          size={v.size as "sm"|"md"|"lg"|"icon"}
          tone={v.tone as "neutral"|"primary"|"success"|"danger"}
          label={v.size === "icon" ? "" : (v.label as string)}
          copiedLabel={v.size === "icon" ? "" : (v.copiedLabel as string)}
          fullWidth={v.fullWidth as boolean}
          aria-label={v.size === "icon" ? "Copy" : undefined}
        />
      )}
    />
  );
}
