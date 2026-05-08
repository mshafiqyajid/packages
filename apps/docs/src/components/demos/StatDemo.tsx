import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { StatStyled } from "@mshafiqyajid/react-stat/styled";
import "@mshafiqyajid/react-stat/styles.css";
import { ButtonStyled } from "@mshafiqyajid/react-button/styled";
import "@mshafiqyajid/react-button/styles.css";

function StatGrid({ playKey }: { playKey: number }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "0.75rem" }}>
      <StatStyled key={`users-${playKey}`} value={12847} label="Total Users" trend={12.5} trendLabel="vs last month" />
      <StatStyled key={`rev-${playKey}`} value={98420} label="Revenue" trend={8.2} trendLabel="vs last month" prefix="$" />
      <StatStyled key={`conv-${playKey}`} value={3.4} label="Conversion" trend={-1.2} trendLabel="vs last month" suffix="%" />
    </div>
  );
}

export default function StatDemo() {
  const [playKey, setPlayKey] = useState(0);
  const [renderKey, setRenderKey] = useState(0);

  return (
    <>
      <StatGrid playKey={playKey} />
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.5rem" }}>
        <ButtonStyled
          size="sm"
          variant="outline"
          tone="neutral"
          onClick={() => setPlayKey((k) => k + 1)}
          iconLeft={
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2 6.5A4.5 4.5 0 1 0 6.5 2M2 2v4h4" />
            </svg>
          }
        >
          Replay
        </ButtonStyled>
      </div>
      <PropPlayground
        componentName="StatStyled"
        importLine={`import { StatStyled } from "@mshafiqyajid/react-stat/styled";\nimport "@mshafiqyajid/react-stat/styles.css";`}
        props={[
          { name: "size",        group: "Appearance", control: { type: "segmented", options: ["sm","md","lg"] as const },           defaultValue: "md",      omitWhen: "md" },
          { name: "tone",        group: "Appearance", control: { type: "segmented", options: ["neutral","primary"] as const },       defaultValue: "neutral", omitWhen: "neutral" },
          { name: "trendFormat", group: "Appearance", control: { type: "segmented", options: ["percent","absolute"] as const },      defaultValue: "percent", omitWhen: "percent" },
          { name: "countUp",     group: "Behaviour",  control: { type: "toggle" },                                                   defaultValue: true,      omitWhen: true },
          { name: "loading",     group: "State",      control: { type: "toggle" },                                                   defaultValue: false,     omitWhen: false },
        ]}
        render={(v) => (
          <StatStyled
            key={renderKey}
            value={12847}
            label="Total Users"
            trend={12.5}
            trendLabel="vs last month"
            size={v.size as "sm"|"md"|"lg"}
            tone={v.tone as "neutral"|"primary"}
            countUp={v.countUp as boolean}
            loading={v.loading as boolean}
            trendFormat={v.trendFormat as "percent"|"absolute"}
          />
        )}
      />
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.5rem" }}>
        <ButtonStyled
          size="sm"
          variant="ghost"
          tone="neutral"
          onClick={() => setRenderKey((k) => k + 1)}
          iconLeft={
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2 6.5A4.5 4.5 0 1 0 6.5 2M2 2v4h4" />
            </svg>
          }
        >
          Replay count-up
        </ButtonStyled>
      </div>
    </>
  );
}
