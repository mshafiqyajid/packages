import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { DrawerStyled } from "@mshafiqyajid/react-drawer/styled";
import { ButtonStyled } from "@mshafiqyajid/react-button/styled";
import "@mshafiqyajid/react-drawer/styles.css";
import "@mshafiqyajid/react-button/styles.css";

function DrawerWrapper({
  side,
  size,
  variant,
  closeOnOverlayClick,
  closeOnEsc,
  lockBodyScroll,
  showTitle,
  showDescription,
  showFooter,
  showCloseButton,
  swipeable,
  keepMounted,
}: {
  side: string;
  size: string;
  variant: string;
  closeOnOverlayClick: boolean;
  closeOnEsc: boolean;
  lockBodyScroll: boolean;
  showTitle: boolean;
  showDescription: boolean;
  showFooter: boolean;
  showCloseButton: boolean;
  swipeable: boolean;
  keepMounted: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
      <ButtonStyled variant="outline" tone="neutral" onClick={() => setOpen(true)}>
        Open Drawer
      </ButtonStyled>

      <DrawerStyled
        open={open}
        onOpenChange={setOpen}
        side={side as "left" | "right"}
        size={size as "sm" | "md" | "lg"}
        variant={variant as "overlay" | "push"}
        closeOnOverlayClick={closeOnOverlayClick}
        closeOnEsc={closeOnEsc}
        lockBodyScroll={lockBodyScroll}
        showCloseButton={showCloseButton}
        swipeable={swipeable}
        keepMounted={keepMounted}
        title={showTitle ? "Navigation" : undefined}
        description={showDescription ? "Browse sections of the application." : undefined}
        footer={
          showFooter ? (
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", width: "100%" }}>
              <ButtonStyled variant="outline" tone="neutral" size="sm" onClick={() => setOpen(false)}>
                Close
              </ButtonStyled>
            </div>
          ) : undefined
        }
      >
        <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {["Home", "About", "Products", "Blog", "Contact"].map((label) => (
            <div
              key={label}
              style={{
                padding: "0.625rem 0.875rem",
                borderRadius: "6px",
                fontSize: "0.9375rem",
                color: "var(--fg, #18181b)",
                cursor: "pointer",
                transition: "background 120ms ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = "var(--bg-subtle, rgba(0,0,0,0.05))";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = "transparent";
              }}
            >
              {label}
            </div>
          ))}
        </nav>
      </DrawerStyled>
    </div>
  );
}

export default function DrawerDemo() {
  return (
    <PropPlayground
      componentName="DrawerStyled"
      layout="stacked"
      importLine={`import { DrawerStyled } from "@mshafiqyajid/react-drawer/styled";\nimport "@mshafiqyajid/react-drawer/styles.css";`}
      props={[
        {
          name: "side",
          group: "Appearance",
          control: { type: "segmented", options: ["left", "right"] as const },
          defaultValue: "left",
          omitWhen: "left",
        },
        {
          name: "size",
          group: "Appearance",
          control: { type: "segmented", options: ["sm", "md", "lg"] as const },
          defaultValue: "md",
          omitWhen: "md",
        },
        {
          name: "variant",
          group: "Appearance",
          control: { type: "segmented", options: ["overlay", "push"] as const },
          defaultValue: "overlay",
          omitWhen: "overlay",
        },
        {
          name: "closeOnOverlayClick",
          group: "Behaviour",
          label: "overlay click closes",
          control: { type: "toggle" },
          defaultValue: true,
          omitWhen: true,
        },
        {
          name: "closeOnEsc",
          group: "Behaviour",
          label: "Esc closes",
          control: { type: "toggle" },
          defaultValue: true,
          omitWhen: true,
        },
        {
          name: "lockBodyScroll",
          group: "Behaviour",
          label: "lock body scroll",
          control: { type: "toggle" },
          defaultValue: true,
          omitWhen: true,
        },
        {
          name: "showCloseButton",
          group: "Behaviour",
          label: "show close button",
          control: { type: "toggle" },
          defaultValue: true,
          omitWhen: true,
        },
        {
          name: "swipeable",
          group: "Behaviour",
          label: "swipeable",
          control: { type: "toggle" },
          defaultValue: true,
          omitWhen: true,
        },
        {
          name: "keepMounted",
          group: "Behaviour",
          label: "keep mounted",
          control: { type: "toggle" },
          defaultValue: false,
          omitWhen: false,
        },
        {
          name: "showTitle",
          group: "Content",
          label: "title",
          control: { type: "toggle" },
          defaultValue: true,
          omitWhen: false,
        },
        {
          name: "showDescription",
          group: "Content",
          label: "description",
          control: { type: "toggle" },
          defaultValue: false,
          omitWhen: false,
        },
        {
          name: "showFooter",
          group: "Content",
          label: "footer",
          control: { type: "toggle" },
          defaultValue: false,
          omitWhen: false,
        },
      ]}
      staticProps={{ open: "{open}", onOpenChange: "{setOpen}" }}
      render={(v) => (
        <DrawerWrapper
          side={v.side as string}
          size={v.size as string}
          variant={v.variant as string}
          closeOnOverlayClick={v.closeOnOverlayClick as boolean}
          closeOnEsc={v.closeOnEsc as boolean}
          lockBodyScroll={v.lockBodyScroll as boolean}
          showTitle={v.showTitle as boolean}
          showDescription={v.showDescription as boolean}
          showFooter={v.showFooter as boolean}
          showCloseButton={v.showCloseButton as boolean}
          swipeable={v.swipeable as boolean}
          keepMounted={v.keepMounted as boolean}
        />
      )}
    />
  );
}
