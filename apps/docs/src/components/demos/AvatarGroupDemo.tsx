import PropPlayground from "../PropPlayground";
import { AvatarGroupStyled } from "@mshafiqyajid/react-avatar-group/styled";
import "@mshafiqyajid/react-avatar-group/styles.css";

const sampleAvatars = [
  { name: "Alice", src: "https://i.pravatar.cc/150?u=alice" },
  { name: "Bob" },
  { name: "Carol", src: "https://i.pravatar.cc/150?u=carol" },
  { name: "Dave" },
  { name: "Eve", src: "https://i.pravatar.cc/150?u=eve" },
  { name: "Frank" },
];

export default function AvatarGroupDemo() {
  return (
    <>
      <div style={{ marginBottom: "1.5rem" }}>
        <AvatarGroupStyled avatars={sampleAvatars} />
      </div>
      <PropPlayground
        componentName="AvatarGroupStyled"
        importLine={`import { AvatarGroupStyled } from "@mshafiqyajid/react-avatar-group/styled";\nimport "@mshafiqyajid/react-avatar-group/styles.css";`}
        props={[
          { name: "size",        control: { type: "segmented", options: ["xs","sm","md","lg","xl"] as const }, defaultValue: "md",     omitWhen: "md" },
          { name: "shape",       control: { type: "segmented", options: ["circle","square"] as const },        defaultValue: "circle", omitWhen: "circle" },
          { name: "spacing",     control: { type: "segmented", options: ["tight","normal","loose"] as const }, defaultValue: "normal", omitWhen: "normal" },
          { name: "gap",         control: { type: "slider", min: -16, max: 8, step: 1 },                      defaultValue: -8,       omitWhen: -8 },
          { name: "max",         control: { type: "slider", min: 1, max: 8, step: 1 },                        defaultValue: 4,        omitWhen: 4 },
          { name: "overflow",    control: { type: "segmented", options: ["count","avatars"] as const },        defaultValue: "count",  omitWhen: "count" },
          { name: "showTooltip", control: { type: "toggle" },                                                  defaultValue: true,     omitWhen: true },
        ]}
        render={(v) => (
          <AvatarGroupStyled
            avatars={sampleAvatars}
            size={v.size as "xs"|"sm"|"md"|"lg"|"xl"}
            shape={v.shape as "circle"|"square"}
            spacing={v.spacing as "tight"|"normal"|"loose"}
            gap={v.gap as number}
            max={v.max as number}
            overflow={v.overflow as "count"|"avatars"}
            showTooltip={v.showTooltip as boolean}
          />
        )}
      />
    </>
  );
}
