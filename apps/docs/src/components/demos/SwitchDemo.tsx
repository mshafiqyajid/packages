import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { SwitchStyled } from "@mshafiqyajid/react-switch/styled";
import "@mshafiqyajid/react-switch/styles.css";

function asyncConfirm(_next: boolean): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(Math.random() > 0.3), 900);
  });
}

export default function SwitchDemo() {
  const [checked, setChecked] = useState(false);
  const [confirmChecked, setConfirmChecked] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <PropPlayground
        componentName="SwitchStyled"
        importLine={`import { SwitchStyled } from "@mshafiqyajid/react-switch/styled";\nimport "@mshafiqyajid/react-switch/styles.css";`}
        props={[
          { name: "size",          group: "Appearance", control: { type: "segmented", options: ["sm","md","lg"] as const },                        defaultValue: "md",      omitWhen: "md" },
          { name: "tone",          group: "Appearance", control: { type: "segmented", options: ["neutral","primary","success","danger"] as const }, defaultValue: "primary",  omitWhen: "primary" },
          { name: "labelPosition", group: "Appearance", control: { type: "segmented", options: ["left","right"] as const },                        defaultValue: "right",   omitWhen: "right" },
          { name: "loading",       group: "State",      control: { type: "toggle" },                                                               defaultValue: false,     omitWhen: false },
          { name: "disabled",      group: "State",      control: { type: "toggle" },                                                               defaultValue: false,     omitWhen: false },
          { name: "onLabel",       group: "Content",    control: { type: "toggle" },                                                               defaultValue: false,     omitWhen: false },
          { name: "offLabel",      group: "Content",    control: { type: "toggle" },                                                               defaultValue: false,     omitWhen: false },
          { name: "thumbIconOn",   group: "Content",    control: { type: "toggle" },                                                               defaultValue: false,     omitWhen: false },
          { name: "thumbIconOff",  group: "Content",    control: { type: "toggle" },                                                               defaultValue: false,     omitWhen: false },
        ]}
        staticProps={{ checked: "{checked}", onChange: "{setChecked}", label: '"Enable notifications"' }}
        render={(v) => (
          <SwitchStyled
            checked={checked}
            onChange={setChecked}
            label="Enable notifications"
            size={v.size as "sm"|"md"|"lg"}
            tone={v.tone as "neutral"|"primary"|"success"|"danger"}
            labelPosition={v.labelPosition as "left"|"right"}
            loading={v.loading as boolean}
            disabled={v.disabled as boolean}
            onLabel={v.onLabel ? "ON" : undefined}
            offLabel={v.offLabel ? "OFF" : undefined}
            thumbIconOn={v.thumbIconOn ? "✓" : undefined}
            thumbIconOff={v.thumbIconOff ? "✗" : undefined}
          />
        )}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <p style={{ fontSize: "0.875rem", fontWeight: 600, margin: 0 }}>
          confirm guard demo — async, rejects ~30% of the time
        </p>
        <p style={{ fontSize: "0.8125rem", opacity: 0.65, margin: 0 }}>
          The switch enters a pending (grey) state for ~900ms. If the guard rejects, it snaps back.
        </p>
        <SwitchStyled
          checked={confirmChecked}
          onChange={setConfirmChecked}
          confirm={asyncConfirm}
          label="Guarded toggle"
          tone="primary"
          onLabel="ON"
          offLabel="OFF"
        />
      </div>
    </div>
  );
}
