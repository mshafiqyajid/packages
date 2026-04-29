import { useState } from "react";
import { RatingStyled } from "@mshafiqyajid/react-rating/styled";
import "@mshafiqyajid/react-rating/styles.css";

export default function RatingDemo() {
  const [value, setValue] = useState(3.5);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "1.5rem", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 12 }}>
      <RatingStyled
        count={5}
        value={value}
        onChange={setValue}
        tone="warning"
        showValue
        label="How was it?"
        hint={value === 0 ? "Tap a star to rate" : undefined}
      />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center" }}>
        <RatingStyled count={5} defaultValue={4.5} tone="warning" readOnly showValue label="Read-only" />
        <RatingStyled count={5} defaultValue={3} tone="primary" size="sm" label="Small / Primary" />
        <RatingStyled count={5} defaultValue={4} tone="danger" size="lg"
          label="Hearts"
          icon={
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
              <path d="M12 21s-7-4.35-7-10a4.5 4.5 0 0 1 8-2.83A4.5 4.5 0 0 1 19 11c0 5.65-7 10-7 10z" />
            </svg>
          }
        />
        <RatingStyled count={10} defaultValue={7.5} tone="primary" size="sm" showValue label="10-star" />
      </div>
    </div>
  );
}
