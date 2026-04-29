import PropPlayground from "../PropPlayground";
import { FileUploadStyled } from "@mshafiqyajid/react-file-upload/styled";
import "@mshafiqyajid/react-file-upload/styles.css";

export default function FileUploadDemo() {
  return (
    <PropPlayground
      componentName="FileUploadStyled"
      importLine={`import { FileUploadStyled } from "@mshafiqyajid/react-file-upload/styled";\nimport "@mshafiqyajid/react-file-upload/styles.css";`}
      props={[
        { name: "variant",     control: { type: "segmented", options: ["dropzone","button"] as const }, defaultValue: "dropzone", omitWhen: "dropzone" },
        { name: "size",        control: { type: "segmented", options: ["sm","md","lg"] as const },       defaultValue: "md",       omitWhen: "md" },
        { name: "multiple",    control: { type: "toggle" },                                              defaultValue: false,      omitWhen: false },
        { name: "showPreview", control: { type: "toggle" },                                              defaultValue: true,       omitWhen: true },
        { name: "disabled",    control: { type: "toggle" },                                              defaultValue: false,      omitWhen: false },
      ]}
      render={(v) => (
        <FileUploadStyled
          variant={v.variant as "dropzone" | "button"}
          size={v.size as "sm" | "md" | "lg"}
          multiple={v.multiple as boolean}
          showPreview={v.showPreview as boolean}
          disabled={v.disabled as boolean}
          style={{ width: "100%", maxWidth: 420 } as React.CSSProperties}
        />
      )}
    />
  );
}
