import PropPlayground from "../PropPlayground";
import { HoverCardStyled } from "@mshafiqyajid/react-hover-card/styled";
import { ButtonStyled } from "@mshafiqyajid/react-button/styled";
import "@mshafiqyajid/react-hover-card/styles.css";
import "@mshafiqyajid/react-button/styles.css";

export default function HoverCardDemo() {
  return (
    <PropPlayground
      componentName="HoverCardStyled"
      importLine={`import { HoverCardStyled } from "@mshafiqyajid/react-hover-card/styled";\nimport "@mshafiqyajid/react-hover-card/styles.css";`}
      props={[
        { name: "placement",   control: { type: "segmented", options: ["auto", "top", "bottom", "left", "right"] as const }, defaultValue: "auto",  omitWhen: "auto" },
        { name: "openDelay",   control: { type: "number", min: 0, max: 1000, step: 50 },                                    defaultValue: 300,    omitWhen: 300 },
        { name: "closeDelay",  control: { type: "number", min: 0, max: 500, step: 25 },                                     defaultValue: 100,    omitWhen: 100 },
        { name: "offset",      control: { type: "number", min: 0, max: 32, step: 2 },                                       defaultValue: 8,      omitWhen: 8 },
        { name: "arrow",       control: { type: "toggle" },                                                                  defaultValue: true,   omitWhen: true },
        { name: "flip",        control: { type: "toggle" },                                                                  defaultValue: true,   omitWhen: true },
      ]}
      staticProps={{ content: '"Hover card content"' }}
      render={(v) => (
        <HoverCardStyled
          placement={v.placement as "auto" | "top" | "bottom" | "left" | "right"}
          openDelay={v.openDelay as number}
          closeDelay={v.closeDelay as number}
          offset={v.offset as number}
          arrow={v.arrow as boolean}
          flip={v.flip as boolean}
          content={
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--rhc-border, #e4e4e7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>👤</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>Shafiq Yajid</div>
                  <div style={{ fontSize: "0.8rem", opacity: 0.6 }}>@mshafiqyajid</div>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: "0.85rem", lineHeight: 1.5, opacity: 0.8 }}>
                Building open-source React UI primitives. 35 packages and growing.
              </p>
              <div style={{ display: "flex", gap: "1rem", fontSize: "0.8rem", opacity: 0.7 }}>
                <span><strong>120</strong> followers</span>
                <span><strong>84</strong> following</span>
              </div>
            </div>
          }
        >
          <ButtonStyled variant="outline" tone="neutral">Hover over me</ButtonStyled>
        </HoverCardStyled>
      )}
    />
  );
}
