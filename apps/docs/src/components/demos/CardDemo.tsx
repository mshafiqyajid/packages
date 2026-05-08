import PropPlayground from "../PropPlayground";
import { Card, CardStyled } from "@mshafiqyajid/react-card/styled";
import "@mshafiqyajid/react-card/styles.css";

function CardGrid() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
      <CardStyled
        variant="elevated"
        tone="neutral"
        header="Elevated"
        footer="Default variant"
      >
        <p style={{ margin: 0, fontSize: "0.875rem", color: "inherit", opacity: 0.7 }}>
          Surface card with subtle shadow and border.
        </p>
      </CardStyled>

      <CardStyled
        variant="filled"
        tone="primary"
        header="Filled Primary"
        footer="Toned background"
      >
        <p style={{ margin: 0, fontSize: "0.875rem", color: "inherit", opacity: 0.7 }}>
          Filled variant with primary tone background tint.
        </p>
      </CardStyled>

      <CardStyled
        variant="outlined"
        tone="success"
        header="Outlined Success"
        footer="Border accent"
        clickable
      >
        <p style={{ margin: 0, fontSize: "0.875rem", color: "inherit", opacity: 0.7 }}>
          Clickable card — try hovering or pressing.
        </p>
      </CardStyled>
    </div>
  );
}

export default function CardDemo() {
  return (
    <>
      <CardGrid />
      <PropPlayground
        componentName="CardStyled"
        importLine={`import { CardStyled } from "@mshafiqyajid/react-card/styled";\nimport "@mshafiqyajid/react-card/styles.css";`}
        props={[
          {
            name: "variant",
            control: { type: "segmented", options: ["elevated", "outlined", "filled", "ghost"] as const },
            defaultValue: "elevated",
            omitWhen: "elevated",
          },
          {
            name: "size",
            control: { type: "segmented", options: ["sm", "md", "lg"] as const },
            defaultValue: "md",
            omitWhen: "md",
          },
          {
            name: "tone",
            control: { type: "segmented", options: ["neutral", "primary", "success", "warning", "danger", "info"] as const },
            defaultValue: "neutral",
            omitWhen: "neutral",
          },
          {
            name: "radius",
            control: { type: "segmented", options: ["none", "sm", "md", "lg"] as const },
            defaultValue: "md",
            omitWhen: "md",
          },
          {
            name: "shadow",
            control: { type: "segmented", options: ["none", "sm", "md", "lg"] as const },
            defaultValue: "sm",
            omitWhen: "sm",
          },
          {
            name: "clickable",
            control: { type: "toggle" },
            defaultValue: false,
            omitWhen: false,
          },
          {
            name: "selected",
            control: { type: "toggle" },
            defaultValue: false,
            omitWhen: false,
          },
          {
            name: "disabled",
            control: { type: "toggle" },
            defaultValue: false,
            omitWhen: false,
          },
          {
            name: "loading",
            control: { type: "toggle" },
            defaultValue: false,
            omitWhen: false,
          },
          {
            name: "hoverable",
            control: { type: "toggle" },
            defaultValue: false,
            omitWhen: false,
          },
          {
            name: "bordered",
            control: { type: "toggle" },
            defaultValue: false,
            omitWhen: false,
          },
          {
            name: "compact",
            control: { type: "toggle" },
            defaultValue: false,
            omitWhen: false,
          },
        ]}
        render={(v) => (
          <CardStyled
            variant={v.variant as "elevated" | "outlined" | "filled" | "ghost"}
            size={v.size as "sm" | "md" | "lg"}
            tone={v.tone as "neutral" | "primary" | "success" | "warning" | "danger" | "info"}
            radius={v.radius as "none" | "sm" | "md" | "lg"}
            shadow={v.shadow as "none" | "sm" | "md" | "lg"}
            clickable={v.clickable as boolean}
            selected={v.selected as boolean}
            disabled={v.disabled as boolean}
            loading={v.loading as boolean}
            hoverable={v.hoverable as boolean}
            bordered={v.bordered as boolean}
            compact={v.compact as boolean}
            header="Card title"
            footer="Card footer"
          >
            <p style={{ margin: 0, fontSize: "0.875rem" }}>
              This is the card body. It can hold any content — text, images, actions, or
              other components.
            </p>
          </CardStyled>
        )}
      />
    </>
  );
}
