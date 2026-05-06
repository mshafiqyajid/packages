import { useState, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { ModalStyled } from "./ModalStyled";

export interface ConfirmOptions {
  title?: ReactNode;
  body?: ReactNode;
  confirmLabel?: ReactNode;
  cancelLabel?: ReactNode;
  /** Style the confirm button as the danger CTA (red). */
  danger?: boolean;
}

/**
 * Programmatic confirm dialog. Resolves `true` if confirmed, `false` if cancelled
 * or dismissed via overlay/Esc/close button.
 *
 * Self-mounts a `<ModalStyled>` into a temporary div appended to `document.body`
 * and unmounts on close — no provider required.
 */
export function confirm(opts: ConfirmOptions = {}): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      resolve(false);
      return;
    }
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);

    const cleanup = () => {
      // Defer unmount so the close transition can run.
      setTimeout(() => {
        try { root.unmount(); } catch { /* ignore */ }
        if (host.parentNode) host.parentNode.removeChild(host);
      }, 320);
    };

    function ConfirmShell() {
      const [open, setOpen] = useState(true);
      const finish = (value: boolean) => {
        setOpen(false);
        cleanup();
        resolve(value);
      };
      return (
        <ModalStyled
          open={open}
          onClose={() => finish(false)}
          title={opts.title ?? "Are you sure?"}
          size="sm"
          footer={
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                type="button"
                className="rmod-btn rmod-btn--cancel"
                onClick={() => finish(false)}
              >
                {opts.cancelLabel ?? "Cancel"}
              </button>
              <button
                type="button"
                className={`rmod-btn rmod-btn--confirm${opts.danger ? " rmod-btn--danger" : ""}`}
                onClick={() => finish(true)}
                autoFocus
              >
                {opts.confirmLabel ?? "Confirm"}
              </button>
            </div>
          }
        >
          {opts.body ?? null}
        </ModalStyled>
      );
    }

    root.render(<ConfirmShell />);
  });
}

/** Module-style export so consumers can do `modal.confirm(...)`. */
export const modal = { confirm };
