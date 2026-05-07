import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { BadgeStyled, BadgeAnchor } from "@mshafiqyajid/react-badge/styled";
import "@mshafiqyajid/react-badge/styles.css";

function AnimatedCountDemo() {
  const [count, setCount] = useState(3);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "flex-start" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <BadgeStyled count={count} tone="danger" variant="solid" />
        <button
          onClick={() => setCount((c) => c + 1)}
          style={{ padding: "0.25rem 0.75rem", borderRadius: 6, border: "1px solid #d4d4d8", cursor: "pointer", fontSize: "0.85rem" }}
        >
          +1
        </button>
        <button
          onClick={() => setCount((c) => Math.max(0, c - 1))}
          style={{ padding: "0.25rem 0.75rem", borderRadius: 6, border: "1px solid #d4d4d8", cursor: "pointer", fontSize: "0.85rem" }}
        >
          -1
        </button>
        <button
          onClick={() => setCount(0)}
          style={{ padding: "0.25rem 0.75rem", borderRadius: 6, border: "1px solid #d4d4d8", cursor: "pointer", fontSize: "0.85rem" }}
        >
          Reset
        </button>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        <BadgeAnchor badge={<BadgeStyled count={count} tone="danger" variant="solid" size="sm" />}>
          <button style={{ padding: "0.5rem 1rem", borderRadius: 8, border: "1px solid #d4d4d8", cursor: "pointer", fontSize: "0.9rem" }}>
            Inbox
          </button>
        </BadgeAnchor>
      </div>
    </div>
  );
}

export default function BadgeDemo() {
  return (
    <>
      <div style={{ marginBottom: "2rem" }}>
        <p style={{ marginBottom: "0.75rem", fontWeight: 500 }}>Animated count + BadgeAnchor</p>
        <AnimatedCountDemo />
      </div>
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
    </>
  );
}
