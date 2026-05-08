import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { ChipStyled } from "@mshafiqyajid/react-chip/styled";
import "@mshafiqyajid/react-chip/styles.css";

const tones = ["neutral", "primary", "success", "warning", "danger", "info"] as const;

function ChipGallery() {
  const [selected, setSelected] = useState<string[]>(["primary"]);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.5rem" }}>
      {tones.map((t) => (
        <ChipStyled
          key={t}
          tone={t}
          selectable
          selected={selected.includes(t)}
          onSelect={(s: boolean) => setSelected(prev => s ? [...prev, t] : prev.filter(x => x !== t))}
          variant="subtle"
        >
          {t.charAt(0).toUpperCase() + t.slice(1)}
        </ChipStyled>
      ))}
      <ChipStyled tone="neutral" dismissible>Dismissible</ChipStyled>
    </div>
  );
}

export default function ChipDemo() {
  return (
    <>
      <ChipGallery />
      <PropPlayground
        componentName="ChipStyled"
        importLine={`import { ChipStyled } from "@mshafiqyajid/react-chip/styled";\nimport "@mshafiqyajid/react-chip/styles.css";`}
        props={[
          { name: "variant",     control: { type: "segmented", options: ["solid","subtle","outline","soft"] as const },                           defaultValue: "subtle",  omitWhen: "subtle" },
          { name: "tone",        control: { type: "segmented", options: ["neutral","primary","success","warning","danger","info"] as const },      defaultValue: "neutral", omitWhen: "neutral" },
          { name: "size",        control: { type: "segmented", options: ["sm","md","lg"] as const },                                              defaultValue: "md",      omitWhen: "md" },
          { name: "selectable",  control: { type: "toggle" },                                                                                     defaultValue: false,     omitWhen: false },
          { name: "dismissible", control: { type: "toggle" },                                                                                     defaultValue: false,     omitWhen: false },
          { name: "disabled",    control: { type: "toggle" },                                                                                     defaultValue: false,     omitWhen: false },
        ]}
        render={(v) => (
          <ChipStyled
            variant={v.variant as "solid"|"subtle"|"outline"|"soft"}
            tone={v.tone as "neutral"|"primary"|"success"|"warning"|"danger"|"info"}
            size={v.size as "sm"|"md"|"lg"}
            selectable={v.selectable as boolean}
            dismissible={v.dismissible as boolean}
            disabled={v.disabled as boolean}
          >
            Chip label
          </ChipStyled>
        )}
      />
    </>
  );
}
