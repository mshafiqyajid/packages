import PropPlayground from "../PropPlayground";
import { MasonryStyled } from "@mshafiqyajid/react-masonry/styled";
import "@mshafiqyajid/react-masonry/styles.css";

const DEMO_CARDS = [
  { id: 1, color: "#6366f1", title: "Design Systems", height: 120, text: "Scalable, consistent UI foundations that teams build on." },
  { id: 2, color: "#0ea5e9", title: "Accessibility", height: 180, text: "Every user deserves a great experience. Semantic HTML, keyboard navigation, and ARIA roles form the foundation. Don't skip them." },
  { id: 3, color: "#16a34a", title: "Performance", height: 100, text: "Fast load, smooth interaction." },
  { id: 4, color: "#d97706", title: "Typography", height: 200, text: "Type is the voice of your product. Choosing the right scale, weight, and spacing transforms a wall of text into a clear, readable hierarchy that guides the reader." },
  { id: 5, color: "#dc2626", title: "Color Theory", height: 140, text: "Hue, saturation, and luminance work together to create meaning, hierarchy, and emotion in your design." },
  { id: 6, color: "#7c3aed", title: "Spacing", height: 90, text: "Rhythm through whitespace." },
  { id: 7, color: "#0891b2", title: "Motion", height: 160, text: "Animation communicates state changes and guides attention. Use it purposefully — smooth, not distracting. Respect reduced-motion preferences." },
  { id: 8, color: "#be185d", title: "Iconography", height: 110, text: "Clear icons support text, they don't replace it." },
  { id: 9, color: "#059669", title: "Grid Systems", height: 190, text: "A solid grid keeps layouts consistent across breakpoints. Columns, gutters, and margins define the visual rhythm that unifies every page in your product." },
  { id: 10, color: "#b45309", title: "Dark Mode", height: 130, text: "Theme tokens and data attributes make dark mode maintainable without duplicating every style rule." },
];

function DemoGrid({ columns, spacing }: { columns: number; spacing: number }) {
  return (
    <MasonryStyled
      columns={columns}
      spacing={spacing}
      style={{ marginBottom: "1.5rem" }}
    >
      {DEMO_CARDS.map((card) => (
        <div
          key={card.id}
          style={{
            background: card.color,
            borderRadius: "10px",
            padding: "18px",
            height: card.height,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            gap: "8px",
            color: "#fff",
            overflow: "hidden",
          }}
        >
          <strong style={{ fontSize: "0.9rem", fontWeight: 700 }}>{card.title}</strong>
          <p style={{ margin: 0, fontSize: "0.8125rem", opacity: 0.88, lineHeight: 1.5 }}>
            {card.text}
          </p>
        </div>
      ))}
    </MasonryStyled>
  );
}

export default function MasonryDemo() {
  return (
    <PropPlayground
      componentName="MasonryStyled"
      layout="stacked"
      importLine={`import { MasonryStyled } from "@mshafiqyajid/react-masonry/styled";\nimport "@mshafiqyajid/react-masonry/styles.css";`}
      props={[
        {
          name: "columns",
          group: "Layout",
          control: { type: "select", options: ["1", "2", "3", "4"] as const },
          defaultValue: "3",
          omitWhen: "3",
        },
        {
          name: "spacing",
          group: "Layout",
          control: { type: "select", options: ["8", "16", "24", "32"] as const },
          defaultValue: "16",
          omitWhen: "16",
        },
      ]}
      render={(v) => (
        <DemoGrid
          columns={Number(v.columns ?? 3)}
          spacing={Number(v.spacing ?? 16)}
        />
      )}
    />
  );
}
