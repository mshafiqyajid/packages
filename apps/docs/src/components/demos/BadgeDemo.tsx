import PropPlayground from "../PropPlayground";
import { BadgeStyled } from "@mshafiqyajid/react-badge/styled";
import "@mshafiqyajid/react-badge/styles.css";

export default function BadgeDemo() {
  return (
    <PropPlayground
      componentName="BadgeStyled"
      importLine={`import { BadgeStyled } from "@mshafiqyajid/react-badge/styled";\nimport "@mshafiqyajid/react-badge/styles.css";`}
      props={[
        { name: "variant",     control: { type: "segmented", options: ["solid","subtle","outline"] as const },                              defaultValue: "subtle",   omitWhen: "subtle" },
        { name: "size",        control: { type: "segmented", options: ["sm","md","lg"] as const },                                          defaultValue: "md",       omitWhen: "md" },
        { name: "tone",        control: { type: "segmented", options: ["neutral","primary","success","warning","danger","info"] as const },  defaultValue: "primary",  omitWhen: "neutral" },
        { name: "shape",       control: { type: "segmented", options: ["rounded","square"] as const },                                      defaultValue: "rounded",  omitWhen: "rounded" },
        { name: "dot",         control: { type: "toggle" },                                                                                 defaultValue: false,      omitWhen: false },
        { name: "pulse",       control: { type: "toggle" },                                                                                 defaultValue: false,      omitWhen: false },
        { name: "uppercase",   control: { type: "toggle" },                                                                                 defaultValue: false,      omitWhen: false },
        { name: "dismissible", control: { type: "toggle" },                                                                                 defaultValue: false,      omitWhen: false },
        { name: "count",       control: { type: "slider", min: 0, max: 200, step: 1 },                                                       defaultValue: 0,          omitWhen: 0 },
        { name: "maxCount",    control: { type: "slider", min: 9, max: 99, step: 1 },                                                        defaultValue: 99,         omitWhen: 99 },
        { name: "hideOnZero",  control: { type: "toggle" },                                                                                  defaultValue: false,      omitWhen: false },
      ]}
      render={(v) => (
        <BadgeStyled
          variant={v.variant as "solid"|"subtle"|"outline"}
          size={v.size as "sm"|"md"|"lg"}
          tone={v.tone as "neutral"|"primary"|"success"|"warning"|"danger"|"info"}
          shape={v.shape as "rounded"|"square"}
          dot={v.dot as boolean}
          pulse={v.pulse as boolean}
          uppercase={v.uppercase as boolean}
          dismissible={v.dismissible as boolean}
          count={v.count as number}
          maxCount={v.maxCount as number}
          hideOnZero={v.hideOnZero as boolean}
        >
          New feature
        </BadgeStyled>
      )}
    />
  );
}
