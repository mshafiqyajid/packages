"use client";
import PropPlayground from "../PropPlayground";
import { ToastProvider } from "@mshafiqyajid/react-toast/styled";
import { useToast } from "@mshafiqyajid/react-toast";
import "@mshafiqyajid/react-toast/styles.css";

function ToastTrigger({
  type,
  position,
  duration,
  title,
  showAction,
}: {
  type: string;
  position: string;
  duration: number;
  title: string;
  showAction: boolean;
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
    const opts = {
      ...(title.trim() ? { title } : {}),
      ...(showAction ? { action: { label: "Undo", onClick: () => {} } } : {}),
    };
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

  const btnStyle: React.CSSProperties = {
    padding: "0.5rem 1.25rem",
    borderRadius: "8px",
    border: "1px solid var(--border)",
    background: "var(--bg-elevated)",
    color: "var(--fg)",
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: 500,
  };

  return (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
      <ToastProvider position={position as "bottom-right"} duration={duration} />
      <button onClick={fireSimple} style={btnStyle}>
        Show toast
      </button>
      <button
        onClick={firePromise}
        style={{ ...btnStyle, background: "var(--accent)", color: "#fff", borderColor: "var(--accent)" }}
      >
        toast.promise()
      </button>
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
        { name: "duration",   control: { type: "slider", min: 1000, max: 8000, step: 500 },                                                                          defaultValue: 4000,           omitWhen: 4000 },
        { name: "title",      control: { type: "text", placeholder: "Optional title…" },                                                                              defaultValue: "",             omitWhen: "" },
        { name: "showAction", control: { type: "toggle" },                                                                                                            defaultValue: false,          omitWhen: false },
      ]}
      render={(v) => (
        <ToastTrigger
          type={v.type as string}
          position={v.position as string}
          duration={v.duration as number}
          title={v.title as string}
          showAction={v.showAction as boolean}
        />
      )}
    />
  );
}
