import { useState } from "react";
import PropPlayground from "../PropPlayground";
import { PaginationStyled } from "@mshafiqyajid/react-pagination/styled";
import "@mshafiqyajid/react-pagination/styles.css";

function LivePaginationDemo() {
  const [page, setPage] = useState(1);
  const totalItems = 100;
  const pageSize = 10;
  const totalPages = Math.ceil(totalItems / pageSize);
  const rangeStart = (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalItems);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem", marginBottom: "1.5rem" }}>
      <PaginationStyled page={page} onChange={setPage} total={totalItems} pageSize={pageSize} />
      <p style={{ fontSize: "0.8125rem", color: "var(--color-fg, #3f3f46)", opacity: 0.55, margin: 0, lineHeight: 1.5 }}>
        Page <strong style={{ opacity: 1 }}>{page}</strong> of {totalPages} &mdash; showing items {rangeStart}&ndash;{rangeEnd} of {totalItems}
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
          { name: "boundaries",    control: { type: "slider", min: 1, max: 2, step: 1 },                              defaultValue: 1,         omitWhen: 1 },
          { name: "showPageSize",  control: { type: "toggle" },                                                        defaultValue: false,     omitWhen: false },
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
            boundaries={v.boundaries as number}
            showPageSize={v.showPageSize as boolean}
          />
        )}
      />
    </>
  );
}
