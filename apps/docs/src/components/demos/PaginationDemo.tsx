import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { PaginationStyled } from "@mshafiqyajid/react-pagination/styled";
import "@mshafiqyajid/react-pagination/styles.css";

function LivePaginationDemo() {
  const [page, setPage] = useState(1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
      <PaginationStyled page={page} onChange={setPage} total={100} pageSize={10} />
      <p style={{ fontSize: "0.875rem", opacity: 0.6 }}>
        Page {page} of 10 — showing items {(page - 1) * 10 + 1}–{Math.min(page * 10, 100)} of 100
      </p>
    </div>
  );
}

export default function PaginationDemo() {
  return (
    <>
      <LivePaginationDemo />
      <PropPlayground
        componentName="PaginationStyled"
        importLine={`import { PaginationStyled } from "@mshafiqyajid/react-pagination/styled";\nimport "@mshafiqyajid/react-pagination/styles.css";`}
        props={[
          { name: "size",          control: { type: "segmented", options: ["sm", "md", "lg"] as const },              defaultValue: "md",      omitWhen: "md" },
          { name: "variant",       control: { type: "segmented", options: ["default", "outline", "ghost"] as const },  defaultValue: "default", omitWhen: "default" },
          { name: "tone",          control: { type: "segmented", options: ["neutral", "primary"] as const },           defaultValue: "neutral", omitWhen: "neutral" },
          { name: "showFirstLast", control: { type: "toggle" },                                                        defaultValue: true,      omitWhen: true },
          { name: "showPrevNext",  control: { type: "toggle" },                                                        defaultValue: true,      omitWhen: true },
          { name: "siblings",      control: { type: "slider", min: 0, max: 3, step: 1 },                              defaultValue: 1,         omitWhen: 1 },
        ]}
        render={(v) => (
          <PaginationStyled
            defaultPage={5}
            total={100}
            pageSize={10}
            size={v.size as "sm" | "md" | "lg"}
            variant={v.variant as "default" | "outline" | "ghost"}
            tone={v.tone as "neutral" | "primary"}
            showFirstLast={v.showFirstLast as boolean}
            showPrevNext={v.showPrevNext as boolean}
            siblings={v.siblings as number}
          />
        )}
      />
    </>
  );
}
