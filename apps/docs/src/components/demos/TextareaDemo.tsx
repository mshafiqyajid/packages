import PropPlayground from "../PropPlayground";
import { TextareaStyled } from "@mshafiqyajid/react-textarea/styled";
import "@mshafiqyajid/react-textarea/styles.css";

export default function TextareaDemo() {
  return (
    <PropPlayground
      componentName="TextareaStyled"
      importLine={`import { TextareaStyled } from "@mshafiqyajid/react-textarea/styled";\nimport "@mshafiqyajid/react-textarea/styles.css";`}
      props={[
        { name: "size",          group: "Appearance", control: { type: "segmented", options: ["sm", "md", "lg"] as const },                  defaultValue: "md",       omitWhen: "md" },
        { name: "tone",          group: "Appearance", control: { type: "segmented", options: ["neutral", "primary", "success", "danger"] as const }, defaultValue: "neutral", omitWhen: "neutral" },
        { name: "autoResize",    group: "Behaviour",  control: { type: "toggle" },                                                            defaultValue: true,       omitWhen: true },
        { name: "rows",          group: "Layout",     control: { type: "slider", min: 2, max: 8, step: 1 },                                   defaultValue: 3,          omitWhen: 3 },
        { name: "showCount",     group: "Display",    control: { type: "toggle" },                                                            defaultValue: false,      omitWhen: false },
        { name: "countPosition", group: "Display",    control: { type: "segmented", options: ["outside", "inside"] as const },                defaultValue: "outside",  omitWhen: "outside" },
        { name: "disabled",      group: "State",      control: { type: "toggle" },                                                            defaultValue: false,      omitWhen: false },
        { name: "readOnly",      group: "State",      control: { type: "toggle" },                                                            defaultValue: false,      omitWhen: false },
        { name: "invalid",       group: "State",      control: { type: "toggle" },                                                            defaultValue: false,      omitWhen: false },
        { name: "placeholder",   group: "Content",    control: { type: "text" },                                                              defaultValue: "Type something..." },
      ]}
      render={(v) => (
        <TextareaStyled
          size={v.size as "sm" | "md" | "lg"}
          tone={v.tone as "neutral" | "primary" | "success" | "danger"}
          autoResize={v.autoResize as boolean}
          rows={v.rows as number}
          showCount={v.showCount as boolean}
          countPosition={v.countPosition as "inside" | "outside"}
          disabled={v.disabled as boolean}
          readOnly={v.readOnly as boolean}
          invalid={v.invalid as boolean}
          placeholder={v.placeholder as string}
          label="Message"
          hint="Enter your message"
          maxLength={200}
        />
      )}
    />
  );
}
