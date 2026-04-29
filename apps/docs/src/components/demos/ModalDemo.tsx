import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { ModalStyled } from "@mshafiqyajid/react-modal/styled";
import "@mshafiqyajid/react-modal/styles.css";

function ModalWrapper({ size, variant, blur, padding, scrollable, closeOnOverlayClick, closeOnEsc, showCloseButton }: {
  size: string; variant: string; blur: string; padding: string; scrollable: boolean; closeOnOverlayClick: boolean; closeOnEsc: boolean; showCloseButton: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{ padding: "0.5rem 1.25rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-elevated)", color: "var(--fg)", cursor: "pointer", fontSize: "0.875rem", fontWeight: 500 }}
      >
        Open modal
      </button>
      <ModalStyled
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Example modal"
        size={size as "sm" | "md" | "lg" | "full"}
        variant={variant as "dialog" | "drawer-left" | "drawer-right" | "drawer-bottom"}
        blur={blur as "none" | "sm" | "md" | "lg"}
        padding={padding as "none" | "sm" | "md" | "lg"}
        scrollable={scrollable}
        closeOnOverlayClick={closeOnOverlayClick}
        closeOnEsc={closeOnEsc}
        showCloseButton={showCloseButton}
        footer={
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
            <button onClick={() => setOpen(false)} style={{ padding: "0.4rem 1rem", borderRadius: "6px", border: "1px solid var(--border)", background: "transparent", color: "var(--fg)", cursor: "pointer" }}>Cancel</button>
            <button onClick={() => setOpen(false)} style={{ padding: "0.4rem 1rem", borderRadius: "6px", border: "none", background: "var(--accent)", color: "white", cursor: "pointer" }}>Confirm</button>
          </div>
        }
      >
        <p style={{ margin: 0, color: "var(--fg-muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>
          This is the modal body. Click the overlay or press Escape to close.
        </p>
      </ModalStyled>
    </>
  );
}

export default function ModalDemo() {
  return (
    <PropPlayground
      componentName="ModalStyled"
      importLine={`import { ModalStyled } from "@mshafiqyajid/react-modal/styled";\nimport "@mshafiqyajid/react-modal/styles.css";`}
      props={[
        { name: "size",                control: { type: "segmented", options: ["sm","md","lg","full"] as const },                                        defaultValue: "md",     omitWhen: "md" },
        { name: "variant",             control: { type: "segmented", options: ["dialog","drawer-left","drawer-right","drawer-bottom"] as const },         defaultValue: "dialog", omitWhen: "dialog" },
        { name: "blur",                control: { type: "segmented", options: ["none","sm","md","lg"] as const },                                         defaultValue: "md",     omitWhen: "md" },
        { name: "padding",             control: { type: "segmented", options: ["none","sm","md","lg"] as const },                                         defaultValue: "md",     omitWhen: "md" },
        { name: "scrollable",          control: { type: "toggle" },                                                                                      defaultValue: true,     omitWhen: true },
        { name: "closeOnOverlayClick", control: { type: "toggle" },                                                                                      defaultValue: true,     omitWhen: true },
        { name: "closeOnEsc",          control: { type: "toggle" },                                                                                      defaultValue: true,     omitWhen: true },
        { name: "showCloseButton",     control: { type: "toggle" },                                                                                      defaultValue: true,     omitWhen: true },
      ]}
      staticProps={{ isOpen: "{open}", onClose: "{() => setOpen(false)}", title: '"Example modal"' }}
      render={(v) => (
        <ModalWrapper
          size={v.size as string}
          variant={v.variant as string}
          blur={v.blur as string}
          padding={v.padding as string}
          scrollable={v.scrollable as boolean}
          closeOnOverlayClick={v.closeOnOverlayClick as boolean}
          closeOnEsc={v.closeOnEsc as boolean}
          showCloseButton={v.showCloseButton as boolean}
        />
      )}
    />
  );
}
