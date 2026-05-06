import PropPlayground from "../PropPlayground";
import { PopoverStyled } from "@mshafiqyajid/react-popover/styled";
import { ButtonStyled } from "@mshafiqyajid/react-button/styled";
import { TextInputStyled } from "@mshafiqyajid/react-text-input/styled";
import "@mshafiqyajid/react-popover/styles.css";
import "@mshafiqyajid/react-button/styles.css";
import "@mshafiqyajid/react-text-input/styles.css";

export default function PopoverDemo() {
  return (
    <PropPlayground
      componentName="PopoverStyled"
      importLine={`import { PopoverStyled } from "@mshafiqyajid/react-popover/styled";\nimport "@mshafiqyajid/react-popover/styles.css";`}
      props={[
        { name: "placement",         control: { type: "segmented", options: ["top","bottom","left","right"] as const }, defaultValue: "bottom",  omitWhen: "bottom" },
        { name: "trigger",           control: { type: "segmented", options: ["click","hover"] as const },               defaultValue: "click",   omitWhen: "click" },
        { name: "size",              control: { type: "segmented", options: ["sm","md","lg"] as const },                defaultValue: "md",      omitWhen: "md" },
        { name: "showArrow",           control: { type: "toggle" },                                                     defaultValue: true,  omitWhen: true },
        { name: "closeOnOutsideClick", control: { type: "toggle" },                                                     defaultValue: true,  omitWhen: true },
        { name: "closeOnEsc",          control: { type: "toggle" },                                                     defaultValue: true,  omitWhen: true },
        { name: "modal",               label: "modal-popover (focus trap)", control: { type: "toggle" },                defaultValue: false, omitWhen: false },
        { name: "closeWhenAnchorHidden", label: "close when scrolled off", control: { type: "toggle" },                  defaultValue: false, omitWhen: false },
        { name: "returnFocus",         control: { type: "toggle" },                                                     defaultValue: true,  omitWhen: true },
      ]}
      staticProps={{ title: '"More info"', content: '"This is the popover content."' }}
      render={(v) => (
        <PopoverStyled
          placement={v.placement as "top"|"bottom"|"left"|"right"}
          trigger={v.trigger as "click"|"hover"}
          size={v.size as "sm"|"md"|"lg"}
          showArrow={v.showArrow as boolean}
          closeOnOutsideClick={v.closeOnOutsideClick as boolean}
          closeOnEsc={v.closeOnEsc as boolean}
          modal={v.modal as boolean}
          closeWhenAnchorHidden={v.closeWhenAnchorHidden as boolean}
          returnFocus={v.returnFocus as boolean}
          title="More info"
          content={
            <div>
              <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--fg-muted)" }}>This is the popover content. Add any rich content here.</p>
              {v.modal && (
                <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.4rem", alignItems: "center" }}>
                  <TextInputStyled placeholder="Try Tab cycling" size="sm" block />
                  <ButtonStyled variant="solid" tone="primary" size="sm">OK</ButtonStyled>
                </div>
              )}
            </div>
          }
        >
          <ButtonStyled variant="outline" tone="neutral">Open popover</ButtonStyled>
        </PopoverStyled>
      )}
    />
  );
}
