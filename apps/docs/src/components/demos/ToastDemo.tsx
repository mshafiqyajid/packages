"use client";
import PropPlayground from "../PropPlayground";
import { ToastProvider } from "@mshafiqyajid/react-toast/styled";
import { useToast } from "@mshafiqyajid/react-toast";
import { ButtonStyled } from "@mshafiqyajid/react-button/styled";
import "@mshafiqyajid/react-toast/styles.css";
import "@mshafiqyajid/react-button/styles.css";

function ToastTrigger({
  type,
  position,
  duration,
  title,
  showAction,
  actionVariant,
  withUndo,
  pauseOnHover,
  draggable,
  showProgress,
}: {
  type: string;
  position: string;
  duration: number;
  title: string;
  showAction: boolean;
  actionVariant: string;
  withUndo: boolean;
  pauseOnHover: boolean;
  draggable: boolean;
  showProgress: boolean;
}) {
  const { toast } = useToast();
  const messages: Record<string, string> = {
    neutral: "Here is a notification.",
    success: "Changes saved successfully!",
    error: "Something went wrong.",
    warning: "Please review your input.",
    info: "New update available.",
    loading: "Saving…",
  };
  const message = messages[type] ?? messages["neutral"]!;

  const fireSimple = () => {
    const opts: Record<string, unknown> = {};
    if (title.trim()) opts.title = title;
    if (showAction) opts.action = { label: "Open", onClick: () => {}, variant: actionVariant };
    if (withUndo) opts.undo = () => {};
    if (showProgress) opts.showProgress = true;
    (toast as unknown as Record<string, (m: string, o?: object) => string>)[
      type === "neutral" ? "info" : type
    ]?.(message, opts);
  };

  const firePromise = () => {
    const p = new Promise<{ id: string }>((resolve) =>
      setTimeout(() => resolve({ id: "42" }), 1500),
    );
    toast.promise(p, {
      loading: "Saving profile…",
      success: (v) => `Saved ${v.id}`,
      error: "Failed to save",
    });
  };

  const fireUpdate = () => {
    const id = toast.loading("Uploading file…");
    setTimeout(() => {
      toast.update(id, { message: "Upload complete!", type: "success" });
    }, 1800);
  };

  const fireChannel = () => {
    toast.channel("notifications").info("Routed to notifications channel");
  };

  const firePersistent = () => {
    toast("This toast stays until dismissed", { duration: 0 });
  };

  return (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
      <ToastProvider
        position={position as "bottom-right"}
        duration={duration}
        pauseOnHover={pauseOnHover}
        draggable={draggable}
      />
      <ToastProvider
        position="top-right"
        channel="notifications"
      />
      <ButtonStyled variant="outline" tone="neutral" onClick={fireSimple}>
        Show toast
      </ButtonStyled>
      <ButtonStyled variant="solid" tone="primary" onClick={firePromise}>
        toast.promise()
      </ButtonStyled>
      <ButtonStyled variant="outline" tone="primary" onClick={fireUpdate}>
        toast.update()
      </ButtonStyled>
      <ButtonStyled variant="outline" tone="neutral" onClick={firePersistent}>
        Persistent (duration: 0)
      </ButtonStyled>
      <ButtonStyled variant="ghost" tone="neutral" onClick={fireChannel}>
        Channel → top-right
      </ButtonStyled>
    </div>
  );
}

export default function ToastDemo() {
  return (
    <PropPlayground
      componentName="ToastProvider"
      importLine={`import { ToastProvider } from "@mshafiqyajid/react-toast/styled";\nimport { useToast } from "@mshafiqyajid/react-toast";\nimport "@mshafiqyajid/react-toast/styles.css";`}
      props={[
        { name: "type",       control: { type: "segmented", options: ["neutral","success","error","warning","info","loading"] as const },                              defaultValue: "success",      omitWhen: "success" },
        { name: "position",   control: { type: "select",    options: ["top-left","top-center","top-right","bottom-left","bottom-center","bottom-right"] as const },   defaultValue: "bottom-right", omitWhen: "bottom-right" },
        { name: "duration",   control: { type: "slider", min: 0, max: 8000, step: 500 },                                                                             defaultValue: 4000,           omitWhen: 4000 },
        { name: "title",         control: { type: "text", placeholder: "Optional title…" },                                                              defaultValue: "",             omitWhen: "" },
        { name: "showAction",    control: { type: "toggle" },                                                                                              defaultValue: false,          omitWhen: false },
        { name: "actionVariant", control: { type: "segmented", options: ["primary","outline","ghost"] as const },                                          defaultValue: "primary",      omitWhen: "primary" },
        { name: "withUndo",      label: "undo + countdown",       control: { type: "toggle" },                                                              defaultValue: false,          omitWhen: false },
        { name: "showProgress",  label: "progress ring",          control: { type: "toggle" },                                                              defaultValue: false,          omitWhen: false },
        { name: "pauseOnHover",  control: { type: "toggle" },                                                                                               defaultValue: true,           omitWhen: true },
        { name: "draggable",     label: "draggable region",       control: { type: "toggle" },                                                              defaultValue: false,          omitWhen: false },
      ]}
      render={(v) => (
        <ToastTrigger
          type={v.type as string}
          position={v.position as string}
          duration={v.duration as number}
          title={v.title as string}
          showAction={v.showAction as boolean}
          actionVariant={v.actionVariant as string}
          withUndo={v.withUndo as boolean}
          showProgress={v.showProgress as boolean}
          pauseOnHover={v.pauseOnHover as boolean}
          draggable={v.draggable as boolean}
        />
      )}
    />
  );
}
