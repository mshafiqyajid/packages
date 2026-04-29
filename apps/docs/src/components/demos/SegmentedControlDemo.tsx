import { useState } from "react";
import { SegmentedControlStyled } from "@mshafiqyajid/react-segmented-control/styled";
import "@mshafiqyajid/react-segmented-control/styles.css";

export default function SegmentedControlDemo() {
  const [view, setView] = useState("Week");
  const [sort, setSort] = useState("Newest");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "1.5rem", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 12 }}>
      <SegmentedControlStyled
        options={["Day", "Week", "Month", "Year"]}
        value={view}
        onChange={setView}
        tone="primary"
        label="Time range"
      />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        <SegmentedControlStyled options={["A", "B", "C"]} variant="solid" tone="primary" defaultValue="A" />
        <SegmentedControlStyled options={["A", "B", "C"]} variant="pill" tone="success" defaultValue="B" />
        <SegmentedControlStyled options={["A", "B", "C"]} variant="underline" tone="neutral" defaultValue="C" />
      </div>
      <SegmentedControlStyled
        options={["Newest", "Top", "Following"]}
        value={sort}
        onChange={setSort}
        tone="primary"
        fullWidth
        label="Sort by"
      />
    </div>
  );
}
