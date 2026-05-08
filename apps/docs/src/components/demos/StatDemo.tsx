import PropPlayground from "../PropPlayground";
import { StatStyled } from "@mshafiqyajid/react-stat/styled";
import "@mshafiqyajid/react-stat/styles.css";

function StatGrid() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
      <StatStyled value={12847} label="Total Users" trend={12.5} trendLabel="vs last month" prefix="" />
      <StatStyled value={98420} label="Revenue" trend={8.2} trendLabel="vs last month" prefix="$" />
      <StatStyled value={3.4} label="Conversion" trend={-1.2} trendLabel="vs last month" suffix="%" />
    </div>
  );
}

export default function StatDemo() {
  return (
    <>
      <StatGrid />
      <PropPlayground
        componentName="StatStyled"
        importLine={`import { StatStyled } from "@mshafiqyajid/react-stat/styled";\nimport "@mshafiqyajid/react-stat/styles.css";`}
        props={[
          { name: "size",        control: { type: "segmented", options: ["sm","md","lg"] as const },           defaultValue: "md",      omitWhen: "md" },
          { name: "tone",        control: { type: "segmented", options: ["neutral","primary"] as const },       defaultValue: "neutral", omitWhen: "neutral" },
          { name: "countUp",     control: { type: "toggle" },                                                   defaultValue: true,      omitWhen: true },
          { name: "loading",     control: { type: "toggle" },                                                   defaultValue: false,     omitWhen: false },
          { name: "trendFormat", control: { type: "segmented", options: ["percent","absolute"] as const },      defaultValue: "percent", omitWhen: "percent" },
        ]}
        render={(v) => (
          <StatStyled
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
    </>
  );
}
