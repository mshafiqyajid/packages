import PropPlayground from "../PropPlayground";
import { AvatarStyled } from "@mshafiqyajid/react-avatar/styled";
import "@mshafiqyajid/react-avatar/styles.css";

export default function AvatarDemo() {
  return (
    <PropPlayground
      componentName="AvatarStyled"
      importLine={`import { AvatarStyled } from "@mshafiqyajid/react-avatar/styled";\nimport "@mshafiqyajid/react-avatar/styles.css";`}
      props={[
        { name: "size",          group: "Appearance", control: { type: "segmented", options: ["xs","sm","md","lg","xl"] as const },                  defaultValue: "md",      omitWhen: "md" },
        { name: "shape",         group: "Appearance", control: { type: "segmented", options: ["circle","square"] as const },                         defaultValue: "circle",  omitWhen: "circle" },
        { name: "border",        group: "Appearance", control: { type: "toggle" },                                                                    defaultValue: false,     omitWhen: false },
        { name: "autoColor",     group: "Appearance", control: { type: "toggle" },                                                                    defaultValue: false,     omitWhen: false },
        { name: "status",        group: "State",      control: { type: "segmented", options: ["none","online","offline","busy","away"] as const },   defaultValue: "none",    omitWhen: "none" },
        { name: "showLoading",   group: "State",      control: { type: "toggle" },                                                                    defaultValue: false,     omitWhen: false },
        { name: "imagePosition", group: "Display",    control: { type: "text", placeholder: "center" },                                               defaultValue: "",        omitWhen: "" },
      ]}
      staticProps={{ name: '"Shafiq Yajid"' }}
      render={(v) => (
        <AvatarStyled
          name="Shafiq Yajid"
          size={v.size as "xs"|"sm"|"md"|"lg"|"xl"}
          shape={v.shape as "circle"|"square"}
          status={v.status === "none" ? undefined : v.status as "online"|"offline"|"busy"|"away"}
          border={v.border as boolean}
          {...({ autoColor: v.autoColor as boolean, showLoading: v.showLoading as boolean, imagePosition: (v.imagePosition as string) || undefined } as object)}
        />
      )}
    />
  );
}
