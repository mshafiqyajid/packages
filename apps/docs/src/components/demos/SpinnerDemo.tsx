import PropPlayground from "../PropPlayground";
import { SpinnerStyled } from "@mshafiqyajid/react-spinner/styled";
import "@mshafiqyajid/react-spinner/styles.css";

function SpinnerRow() {
  const variants = ["spin","dots","bars","pulse","ring"] as const;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
      {variants.map((v) => (
        <div key={v} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
          <SpinnerStyled variant={v} />
          <span style={{ fontSize: "0.75rem", opacity: 0.6 }}>{v}</span>
        </div>
      ))}
    </div>
  );
}

export default function SpinnerDemo() {
  return (
    <>
      <SpinnerRow />
      <PropPlayground
        componentName="SpinnerStyled"
        importLine={`import { SpinnerStyled } from "@mshafiqyajid/react-spinner/styled";\nimport "@mshafiqyajid/react-spinner/styles.css";`}
        props={[
          { name: "variant", group: "Appearance", control: { type: "segmented", options: ["spin","dots","bars","pulse","ring"] as const }, defaultValue: "spin", omitWhen: "spin" },
          { name: "size",    group: "Appearance", control: { type: "segmented", options: ["xs","sm","md","lg","xl"] as const },            defaultValue: "md",   omitWhen: "md" },
          { name: "tone",    group: "Appearance", control: { type: "segmented", options: ["neutral","primary","success","warning","danger","info","current"] as const }, defaultValue: "primary", omitWhen: "primary" },
          { name: "speed",   group: "Appearance", control: { type: "segmented", options: ["slow","normal","fast"] as const },              defaultValue: "normal", omitWhen: "normal" },
          { name: "label",   group: "Content",    control: { type: "text" },                                                              defaultValue: "Loading" },
          { name: "overlay", group: "Display",    control: { type: "toggle" },                                                             defaultValue: false,  omitWhen: false },
        ]}
        render={(v) => (
          <div style={{ position: "relative", width: 80, height: 80, border: "1px dashed #ccc", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <SpinnerStyled
              variant={v.variant as "spin"|"dots"|"bars"|"pulse"|"ring"}
              size={v.size as "xs"|"sm"|"md"|"lg"|"xl"}
              tone={v.tone as "neutral"|"primary"|"success"|"warning"|"danger"|"info"|"current"}
              speed={v.speed as "slow"|"normal"|"fast"}
              label={v.label as string}
              overlay={v.overlay as boolean}
            />
          </div>
        )}
      />
    </>
  );
}
