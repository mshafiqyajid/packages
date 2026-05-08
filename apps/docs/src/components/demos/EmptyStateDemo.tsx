import PropPlayground from "../PropPlayground";
import { EmptyStateStyled } from "@mshafiqyajid/react-empty-state/styled";
import "@mshafiqyajid/react-empty-state/styles.css";
import { ButtonStyled } from "@mshafiqyajid/react-button/styled";
import "@mshafiqyajid/react-button/styles.css";

function CustomExample() {
  return (
    <div style={{ padding: "2rem", border: "1px solid #e4e4e7", borderRadius: 12, marginBottom: "1.5rem" }}>
      <EmptyStateStyled
        title="Start your first project"
        description="Create a project to organize your work and collaborate with your team."
        action={<ButtonStyled tone="primary">Create project</ButtonStyled>}
        secondaryAction={<ButtonStyled variant="ghost" tone="neutral">Learn more</ButtonStyled>}
      />
    </div>
  );
}

export default function EmptyStateDemo() {
  return (
    <>
      <CustomExample />
      <PropPlayground
        componentName="EmptyStateStyled"
        importLine={`import { EmptyStateStyled } from "@mshafiqyajid/react-empty-state/styled";\nimport "@mshafiqyajid/react-empty-state/styles.css";`}
        props={[
          { name: "preset",      control: { type: "segmented", options: ["no-data","no-results","error","offline","empty-search"] as const }, defaultValue: "no-data", omitWhen: "no-data" },
          { name: "size",        control: { type: "segmented", options: ["sm","md","lg"] as const },                                          defaultValue: "md",     omitWhen: "md" },
          { name: "orientation", control: { type: "segmented", options: ["vertical","horizontal"] as const },                                 defaultValue: "vertical", omitWhen: "vertical" },
        ]}
        render={(v) => (
          <EmptyStateStyled
            preset={v.preset as "no-data"|"no-results"|"error"|"offline"|"empty-search"}
            size={v.size as "sm"|"md"|"lg"}
            orientation={v.orientation as "vertical"|"horizontal"}
          />
        )}
      />
    </>
  );
}
