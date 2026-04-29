"use client";
import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { ToastProvider } from "@mshafiqyajid/react-toast/styled";
import { useToast } from "@mshafiqyajid/react-toast";
import "@mshafiqyajid/react-toast/styles.css";

function ToastTrigger({ type, position, duration, showTitle, showAction }: {
  type: string; position: string; duration: number; showTitle: boolean; showAction: boolean;
}) {
  const { toast } = useToast();
  const messages: Record<string, { message: string; title: string }> = {
    neutral: { message: "Here is a notification.", title: "Notice" },
    success: { message: "Changes saved successfully!", title: "Saved" },
    error:   { message: "Something went wrong.", title: "Error" },
    warning: { message: "Please review your input.", title: "Warning" },
    info:    { message: "New update available.", title: "Info" },
  };
  return (
    <>
      <ToastProvider position={position as "bottom-right"} duration={duration} />
      <button
        onClick={() => {
          const t = type === "neutral" ? "info" : type;
          const data = messages[type] ?? messages["neutral"]!;
          (toast as Record<string, (m: string, o?: object) => void>)[t]?.(
            data.message,
            {
              ...(showTitle ? { title: data.title } : {}),
              ...(showAction ? { action: { label: "Undo", onClick: () => {} } } : {}),
            }
          );
        }}
        style={{
          padding: "0.5rem 1.25rem",
          borderRadius: "8px",
          border: "1px solid var(--border)",
          background: "var(--bg-elevated)",
          color: "var(--fg)",
          cursor: "pointer",
          fontSize: "0.875rem",
          fontWeight: 500,
        }}
      >
        Show toast
      </button>
    </>
  );
}

export default function ToastDemo() {
  return (
    <PropPlayground
      componentName="ToastProvider"
      importLine={`import { ToastProvider } from "@mshafiqyajid/react-toast/styled";\nimport { useToast } from "@mshafiqyajid/react-toast";\nimport "@mshafiqyajid/react-toast/styles.css";`}
      props={[
        { name: "type",       control: { type: "segmented", options: ["neutral","success","error","warning","info"] as const },                                      defaultValue: "success",      omitWhen: "success" },
        { name: "position",   control: { type: "select",    options: ["top-left","top-center","top-right","bottom-left","bottom-center","bottom-right"] as const },   defaultValue: "bottom-right", omitWhen: "bottom-right" },
        { name: "duration",   control: { type: "slider", min: 1000, max: 8000, step: 500 },                                                                          defaultValue: 4000,           omitWhen: 4000 },
        { name: "showTitle",  control: { type: "toggle" },                                                                                                           defaultValue: false,          omitWhen: false },
        { name: "showAction", control: { type: "toggle" },                                                                                                           defaultValue: false,          omitWhen: false },
      ]}
      render={(v) => (
        <ToastTrigger
          type={v.type as string}
          position={v.position as string}
          duration={v.duration as number}
          showTitle={v.showTitle as boolean}
          showAction={v.showAction as boolean}
        />
      )}
    />
  );
}
