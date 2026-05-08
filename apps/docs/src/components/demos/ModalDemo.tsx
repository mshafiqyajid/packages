import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { ModalStyled, confirm } from "@mshafiqyajid/react-modal/styled";
import { ButtonStyled } from "@mshafiqyajid/react-button/styled";
import "@mshafiqyajid/react-modal/styles.css";
import "@mshafiqyajid/react-button/styles.css";

function ModalWrapper({ size, variant, blur, padding, scrollable, closeOnOverlayClick, closeOnEsc, showCloseButton, transition, swipeToDismiss, closeOnSubmit, mobileVariant, confirmDemo }: {
  size: string; variant: string; blur: string; padding: string; scrollable: boolean; closeOnOverlayClick: boolean; closeOnEsc: boolean; showCloseButton: boolean; transition: string; swipeToDismiss: boolean; closeOnSubmit: boolean; mobileVariant: string; confirmDemo: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [confirmResult, setConfirmResult] = useState<string>("");

  if (confirmDemo) {
    return (
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
        <ButtonStyled variant="solid" tone="danger" onClick={() => setOpen(true)}>
          Delete item
        </ButtonStyled>
        {confirmResult && <span style={{ fontSize: "0.85rem", color: "var(--fg-muted)" }}>→ {confirmResult}</span>}
        <ModalStyled
          isOpen={open}
          onClose={() => { setOpen(false); setConfirmResult("cancelled"); }}
          title="Delete this item?"
          description="This action cannot be undone."
          size="sm"
          {...({ confirmVariant: "confirm", confirmLabel: "Delete", cancelLabel: "Keep it", confirmTone: "danger", onConfirm: () => { setOpen(false); setConfirmResult("confirmed"); }, onCancel: () => setConfirmResult("cancelled") } as object)}
        >
          <p style={{ margin: 0, color: "var(--fg-muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>
            Are you sure you want to permanently delete this item?
          </p>
        </ModalStyled>
        <ButtonStyled
          variant="outline"
          tone="neutral"
          onClick={async () => {
            const ok = await confirm({ title: "Delete this item?", body: "This can't be undone.", confirmLabel: "Delete", danger: true });
            setConfirmResult(ok ? "confirmed (confirm())" : "cancelled (confirm())");
          }}
        >
          confirm() utility
        </ButtonStyled>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
      <ButtonStyled variant="outline" tone="neutral" onClick={() => setOpen(true)}>Open modal</ButtonStyled>
      {confirmResult && <span style={{ fontSize: "0.85rem", color: "var(--fg-muted)" }}>→ {confirmResult}</span>}
      <ModalStyled
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Example modal"
        size={size as "sm" | "md" | "lg" | "full"}
        variant={variant as "dialog" | "drawer-left" | "drawer-right" | "drawer-bottom"}
        {...({ mobileVariant: mobileVariant as "default" | "sheet" } as object)}
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
          {mobileVariant === "sheet" && <><br /><br /><strong>Resize to ≤ 640 px</strong> to see the bottom-sheet presentation with drag-to-dismiss.</>}
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
        { name: "size",                group: "Appearance", control: { type: "segmented", options: ["sm","md","lg","full"] as const },                                        defaultValue: "md",       omitWhen: "md" },
        { name: "variant",             group: "Appearance", control: { type: "segmented", options: ["dialog","drawer-left","drawer-right","drawer-bottom"] as const },         defaultValue: "dialog",   omitWhen: "dialog" },
        { name: "mobileVariant",       group: "Appearance", label: "mobile variant",    control: { type: "segmented", options: ["default","sheet"] as const },                 defaultValue: "default",  omitWhen: "default" },
        { name: "blur",                group: "Appearance", control: { type: "segmented", options: ["none","sm","md","lg"] as const },                                         defaultValue: "md",       omitWhen: "md" },
        { name: "padding",             group: "Appearance", control: { type: "segmented", options: ["none","sm","md","lg"] as const },                                         defaultValue: "md",       omitWhen: "md" },
        { name: "transition",          group: "Appearance", control: { type: "segmented", options: ["fade","zoom","slide-up","slide-down"] as const },                        defaultValue: "fade",     omitWhen: "fade" },
        { name: "scrollable",          group: "Behaviour",  control: { type: "toggle" },                                                                                      defaultValue: true,       omitWhen: true },
        { name: "closeOnOverlayClick", group: "Behaviour",  control: { type: "toggle" },                                                                                      defaultValue: true,       omitWhen: true },
        { name: "closeOnEsc",          group: "Behaviour",  control: { type: "toggle" },                                                                                      defaultValue: true,       omitWhen: true },
        { name: "showCloseButton",     group: "Display",    control: { type: "toggle" },                                                                                      defaultValue: true,       omitWhen: true },
        { name: "swipeToDismiss",      group: "Behaviour",  label: "swipe to dismiss",  control: { type: "toggle" },                                                          defaultValue: false,      omitWhen: false },
        { name: "closeOnSubmit",       group: "Behaviour",  control: { type: "toggle" },                                                                                      defaultValue: false,      omitWhen: false },
        { name: "confirmDemo",         group: "Behaviour",  label: "confirm variant",   control: { type: "toggle" },                                                          defaultValue: false,      omitWhen: false },
      ]}
      staticProps={{ isOpen: "{open}", onClose: "{() => setOpen(false)}", title: '"Example modal"' }}
      render={(v) => (
        <ModalWrapper
          size={v.size as string}
          variant={v.variant as string}
          mobileVariant={v.mobileVariant as string}
          blur={v.blur as string}
          padding={v.padding as string}
          scrollable={v.scrollable as boolean}
          closeOnOverlayClick={v.closeOnOverlayClick as boolean}
          closeOnEsc={v.closeOnEsc as boolean}
          showCloseButton={v.showCloseButton as boolean}
          transition={v.transition as string}
          swipeToDismiss={v.swipeToDismiss as boolean}
          closeOnSubmit={v.closeOnSubmit as boolean}
          confirmDemo={v.confirmDemo as boolean}
        />
      )}
    />
  );
}
