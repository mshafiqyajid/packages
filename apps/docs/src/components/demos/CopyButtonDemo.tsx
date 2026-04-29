import { CopyButtonStyled } from "@mshafiqyajid/react-copy-button/styled";
import "@mshafiqyajid/react-copy-button/styles.css";

export default function CopyButtonDemo() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, padding: "1.5rem", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 12 }}>
      <CopyButtonStyled text="solid-primary" variant="solid" tone="primary" label="Solid / Primary" />
      <CopyButtonStyled text="outline-primary" variant="outline" tone="primary" label="Outline" />
      <CopyButtonStyled text="ghost-danger" variant="ghost" tone="danger" label="Ghost / Danger" />
      <CopyButtonStyled text="success" variant="solid" tone="success" label="Success" />
      <CopyButtonStyled text="small" size="sm" tone="primary" label="Small" />
      <CopyButtonStyled text="large" size="lg" tone="primary" label="Large" />
      <CopyButtonStyled text="icon-only" size="icon" tone="primary" aria-label="Copy" />
      <CopyButtonStyled
        text={async () => {
          await new Promise((r) => setTimeout(r, 600));
          return "async-value";
        }}
        tone="primary"
        label="Async"
      />
      <CopyButtonStyled text="tooltip" tone="neutral" tooltip="Copy to clipboard" label="With tooltip" />
    </div>
  );
}
