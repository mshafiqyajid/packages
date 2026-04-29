import PropPlayground from "../PropPlayground";
import { AvatarStyled } from "@mshafiqyajid/react-avatar/styled";
import "@mshafiqyajid/react-avatar/styles.css";

export default function AvatarDemo() {
  return (
    <PropPlayground
      componentName="AvatarStyled"
      importLine={`import { AvatarStyled } from "@mshafiqyajid/react-avatar/styled";\nimport "@mshafiqyajid/react-avatar/styles.css";`}
      props={[
        { name: "size",   control: { type: "segmented", options: ["xs","sm","md","lg","xl"] as const },                        defaultValue: "md",      omitWhen: "md" },
        { name: "shape",  control: { type: "segmented", options: ["circle","square"] as const },                               defaultValue: "circle",  omitWhen: "circle" },
        { name: "status", control: { type: "segmented", options: ["none","online","offline","busy","away"] as const },         defaultValue: "none",    omitWhen: "none" },
        { name: "border", control: { type: "toggle" },                                                                        defaultValue: false,     omitWhen: false },
      ]}
      staticProps={{ name: '"Shafiq Yajid"' }}
      render={(v) => (
        <AvatarStyled
          name="Shafiq Yajid"
          size={v.size as "xs"|"sm"|"md"|"lg"|"xl"}
          shape={v.shape as "circle"|"square"}
          status={v.status === "none" ? undefined : v.status as "online"|"offline"|"busy"|"away"}
          border={v.border as boolean}
        />
      )}
    />
  );
}
