import PropPlayground from "../PropPlayground";
import { SkeletonStyled } from "@mshafiqyajid/react-skeleton/styled";
import "@mshafiqyajid/react-skeleton/styles.css";

function CardSkeletonPreview() {
  return (
    <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", padding: "1rem", border: "1px solid #e4e4e7", borderRadius: 8, maxWidth: 320 }}>
      <SkeletonStyled variant="circle" width="2.5rem" height="2.5rem" style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <SkeletonStyled variant="line" height="0.875rem" width="60%" />
        <SkeletonStyled variant="line" height="0.75rem" width="40%" />
        <SkeletonStyled variant="rect" height={60} width="100%" radius="md" style={{ marginTop: "0.5rem" }} />
        <SkeletonStyled variant="text" lines={2} lastLineWidth="70%" />
      </div>
    </div>
  );
}

export default function SkeletonDemo() {
  return (
    <>
      <div style={{ marginBottom: "1.5rem" }}>
        <CardSkeletonPreview />
      </div>
      <PropPlayground
        layout="stacked"
        componentName="SkeletonStyled"
        importLine={`import { SkeletonStyled } from "@mshafiqyajid/react-skeleton/styled";\nimport "@mshafiqyajid/react-skeleton/styles.css";`}
        props={[
          { name: "variant",         group: "Appearance", control: { type: "segmented", options: ["rect", "line", "circle", "text"] as const },  defaultValue: "rect",  omitWhen: "rect" },
          { name: "animation",       group: "Appearance", control: { type: "segmented", options: ["pulse", "wave", "none"] as const },            defaultValue: "pulse", omitWhen: "pulse" },
          { name: "radius",          group: "Appearance", control: { type: "segmented", options: ["none", "sm", "md", "lg", "full"] as const },   defaultValue: "sm",    omitWhen: "sm" },
          { name: "inline",          group: "Appearance", control: { type: "toggle" },                                                            defaultValue: false,   omitWhen: false },
          { name: "enableAnimation", group: "Appearance", control: { type: "toggle" },                                                            defaultValue: true,    omitWhen: true },
          { name: "lines",           group: "Content",    control: { type: "slider", min: 1, max: 5, step: 1 },                                   defaultValue: 3,       omitWhen: 3 },
          { name: "count",           group: "Layout",   control: { type: "slider", min: 1, max: 5, step: 1 },                                              defaultValue: 1,     omitWhen: 1 },
          { name: "spacing",         group: "Layout",   control: { type: "slider", min: 0, max: 32, step: 4 },                                             defaultValue: 8,     omitWhen: 8 },
          { name: "fitContent",      group: "Layout",   control: { type: "toggle" },                                                                       defaultValue: false, omitWhen: false },
          { name: "lastLineWidth",   group: "Content",  control: { type: "select", options: ["40%", "60%", "80%", "100%"] as const },                      defaultValue: "60%", omitWhen: "60%" },
          { name: "baseColor",       group: "Theme",    control: { type: "select", options: ["", "#e4e4e7", "#bfdbfe", "#fde68a"] as const },               defaultValue: "",    omitWhen: "" },
          { name: "highlightColor",  group: "Theme",    control: { type: "select", options: ["", "#f4f4f5", "#dbeafe", "#fef3c7"] as const },               defaultValue: "",    omitWhen: "" },
          { name: "borderRadius",    group: "Theme",    control: { type: "select", options: ["", "0px", "4px", "8px", "16px"] as const },                  defaultValue: "",    omitWhen: "" },
        ]}
        render={(v) => (
          <div style={{ width: 240 }}>
            <SkeletonStyled
              variant={v.variant as "rect" | "line" | "circle" | "text"}
              animation={v.animation as "pulse" | "wave" | "none"}
              radius={v.radius as "none" | "sm" | "md" | "lg" | "full"}
              lines={v.lines as number}
              count={v.count as number}
              spacing={v.spacing as number}
              inline={v.inline as boolean}
              enableAnimation={v.enableAnimation as boolean}
              fitContent={v.fitContent as boolean}
              lastLineWidth={v.lastLineWidth as string}
              baseColor={v.baseColor ? String(v.baseColor) : undefined}
              highlightColor={v.highlightColor ? String(v.highlightColor) : undefined}
              borderRadius={v.borderRadius ? String(v.borderRadius) : undefined}
              width={v.variant === "rect" ? "100%" : undefined}
              height={v.variant === "rect" ? 60 : undefined}
            />
          </div>
        )}
      />
    </>
  );
}
