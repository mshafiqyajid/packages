import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { ModalStyled, confirm } from "@mshafiqyajid/react-modal/styled";
import { ButtonStyled } from "@mshafiqyajid/react-button/styled";
import "@mshafiqyajid/react-modal/styles.css";
import "@mshafiqyajid/react-button/styles.css";

function ModalWrapper({ size, variant, blur, padding, scrollable, closeOnOverlayClick, closeOnEsc, showCloseButton, transition, swipeToDismiss, closeOnSubmit }: {
  size: string; variant: string; blur: string; padding: string; scrollable: boolean; closeOnOverlayClick: boolean; closeOnEsc: boolean; showCloseButton: boolean; transition: string; swipeToDismiss: boolean; closeOnSubmit: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [confirmResult, setConfirmResult] = useState<string>("");

  return (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
      <ButtonStyled variant="outline" tone="neutral" onClick={() => setOpen(true)}>Open modal</ButtonStyled>
      <ButtonStyled
        variant="outline"
        tone="neutral"
        onClick={async () => {
          const ok = await confirm({ title: "Delete this item?", body: "This can't be undone.", confirmLabel: "Delete", danger: true });
          setConfirmResult(ok ? "confirmed" : "cancelled");
        }}
      >
        confirm() utility
      </ButtonStyled>
      {confirmResult && <span style={{ fontSize: "0.85rem", color: "var(--fg-muted)" }}>→ {confirmResult}</span>}
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
        transition={transition as "fade" | "zoom" | "slide-up" | "slide-down"}
        swipeToDismiss={swipeToDismiss}
        closeOnSubmit={closeOnSubmit}
        footer={
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
            <ButtonStyled variant="outline" tone="neutral" size="sm" onClick={() => setOpen(false)}>Cancel</ButtonStyled>
            <ButtonStyled variant="solid" tone="primary" size="sm" onClick={() => setOpen2(true)}>Open second modal</ButtonStyled>
          </div>
        }
      >
        <p style={{ margin: 0, color: "var(--fg-muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>
          This is the modal body. Click the overlay or press Escape to close. Open a second modal to see the stacked behind-scale effect.
        </p>
      </ModalStyled>
      <ModalStyled
        isOpen={open2}
        onClose={() => setOpen2(false)}
        title="Stacked modal"
        size="sm"
        transition={transition as "fade" | "zoom" | "slide-up" | "slide-down"}
      >
        <p style={{ margin: 0, color: "var(--fg-muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>
          Notice the first modal scaled and translated back behind this one.
        </p>
      </ModalStyled>
    </div>
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
        { name: "transition",          control: { type: "segmented", options: ["fade","zoom","slide-up","slide-down"] as const },                        defaultValue: "fade",   omitWhen: "fade" },
        { name: "swipeToDismiss",      label: "swipe to dismiss",  control: { type: "toggle" },                                                          defaultValue: false,    omitWhen: false },
        { name: "closeOnSubmit",       control: { type: "toggle" },                                                                                      defaultValue: false,    omitWhen: false },
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
          transition={v.transition as string}
          swipeToDismiss={v.swipeToDismiss as boolean}
          closeOnSubmit={v.closeOnSubmit as boolean}
        />
      )}
    />
  );
}
