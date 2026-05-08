import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { SheetStyled } from "@mshafiqyajid/react-sheet/styled";
import { ButtonStyled } from "@mshafiqyajid/react-button/styled";
import "@mshafiqyajid/react-sheet/styles.css";
import "@mshafiqyajid/react-button/styles.css";

function SheetWrapper({
  side,
  swipeToDismiss,
  closeOnOverlayClick,
  closeOnEsc,
  showHandle,
  showTitle,
  showDescription,
  showFooter,
}: {
  side: string;
  swipeToDismiss: boolean;
  closeOnOverlayClick: boolean;
  closeOnEsc: boolean;
  showHandle: boolean;
  showTitle: boolean;
  showDescription: boolean;
  showFooter: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
      <ButtonStyled variant="outline" tone="neutral" onClick={() => setOpen(true)}>
        Open sheet
      </ButtonStyled>

      <SheetStyled
        open={open}
        onOpenChange={setOpen}
        side={side as "bottom" | "top" | "left" | "right"}
        swipeToDismiss={swipeToDismiss}
        closeOnOverlayClick={closeOnOverlayClick}
        closeOnEsc={closeOnEsc}
        showHandle={showHandle}
        title={showTitle ? "Sheet title" : undefined}
        description={showDescription ? "This is an accessible description linked via aria-describedby." : undefined}
        footer={
          showFooter ? (
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", width: "100%" }}>
              <ButtonStyled variant="outline" tone="neutral" size="sm" onClick={() => setOpen(false)}>
                Cancel
              </ButtonStyled>
              <ButtonStyled variant="solid" tone="primary" size="sm" onClick={() => setOpen(false)}>
                Confirm
              </ButtonStyled>
            </div>
          ) : undefined
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <p style={{ margin: 0, color: "var(--fg-muted)", fontSize: "0.9rem", lineHeight: 1.65 }}>
            {side === "bottom" || side === "top"
              ? "Drag the handle or swipe to dismiss. Click the overlay or press Escape to close."
              : "Click the overlay or press Escape to close. Swipe toward the edge to dismiss."}
          </p>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                border: "1px solid var(--border, #e4e4e7)",
                fontSize: "0.875rem",
                color: "var(--fg-muted)",
              }}
            >
              List item {i}
            </div>
          ))}
        </div>
      </SheetStyled>
    </div>
  );
}

export default function SheetDemo() {
  return (
    <PropPlayground
      componentName="SheetStyled"
      importLine={`import { SheetStyled } from "@mshafiqyajid/react-sheet/styled";\nimport "@mshafiqyajid/react-sheet/styles.css";`}
      props={[
        {
          name: "side",
          control: { type: "segmented", options: ["bottom", "top", "left", "right"] as const },
          defaultValue: "bottom",
          omitWhen: "bottom",
        },
        {
          name: "swipeToDismiss",
          label: "swipe to dismiss",
          control: { type: "toggle" },
          defaultValue: true,
          omitWhen: true,
        },
        {
          name: "closeOnOverlayClick",
          label: "overlay click closes",
          control: { type: "toggle" },
          defaultValue: true,
          omitWhen: true,
        },
        {
          name: "closeOnEsc",
          label: "Esc closes",
          control: { type: "toggle" },
          defaultValue: true,
          omitWhen: true,
        },
        {
          name: "showHandle",
          label: "show handle",
          control: { type: "toggle" },
          defaultValue: true,
          omitWhen: true,
        },
        {
          name: "showTitle",
          label: "title",
          control: { type: "toggle" },
          defaultValue: true,
          omitWhen: false,
        },
        {
          name: "showDescription",
          label: "description",
          control: { type: "toggle" },
          defaultValue: false,
          omitWhen: false,
        },
        {
          name: "showFooter",
          label: "footer",
          control: { type: "toggle" },
          defaultValue: true,
          omitWhen: false,
        },
      ]}
      staticProps={{ open: "{open}", onOpenChange: "{setOpen}" }}
      render={(v) => (
        <SheetWrapper
          side={v.side as string}
          swipeToDismiss={v.swipeToDismiss as boolean}
          closeOnOverlayClick={v.closeOnOverlayClick as boolean}
          closeOnEsc={v.closeOnEsc as boolean}
          showHandle={v.showHandle as boolean}
          showTitle={v.showTitle as boolean}
          showDescription={v.showDescription as boolean}
          showFooter={v.showFooter as boolean}
        />
      )}
    />
  );
}
