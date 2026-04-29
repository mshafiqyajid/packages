import { useMemo } from "react";
import PropPlayground from "../PropPlayground";
import { TableStyled } from "@mshafiqyajid/react-table/styled";
import type { ColumnDef } from "@mshafiqyajid/react-table";
import "@mshafiqyajid/react-table/styles.css";

type Person = { id: number; name: string; role: string; status: string; joined: string };

const DATA: Person[] = [
  { id: 1, name: "Alice Johnson",  role: "Engineer",   status: "Active",   joined: "2022-01" },
  { id: 2, name: "Bob Chen",       role: "Designer",   status: "Active",   joined: "2021-06" },
  { id: 3, name: "Carol Williams", role: "Manager",    status: "On leave", joined: "2020-03" },
  { id: 4, name: "David Kim",      role: "Engineer",   status: "Active",   joined: "2023-02" },
  { id: 5, name: "Emma Davis",     role: "QA",         status: "Active",   joined: "2022-09" },
  { id: 6, name: "Frank Miller",   role: "DevOps",     status: "Inactive", joined: "2019-11" },
  { id: 7, name: "Grace Lee",      role: "Engineer",   status: "Active",   joined: "2023-07" },
  { id: 8, name: "Henry Brown",    role: "Designer",   status: "Active",   joined: "2021-12" },
];

const COLUMNS: ColumnDef<Person>[] = [
  { key: "name",   header: "Name",     sortable: true  },
  { key: "role",   header: "Role",     filterable: true },
  { key: "status", header: "Status",   filterable: true },
  { key: "joined", header: "Joined"                     },
];

export default function TableDemo() {
  return (
    <PropPlayground
      componentName="TableStyled"
      importLine={`import { TableStyled } from "@mshafiqyajid/react-table/styled";\nimport "@mshafiqyajid/react-table/styles.css";`}
      props={[
        { name: "size",        control: { type: "segmented", options: ["sm","md","lg"] as const },      defaultValue: "md",      omitWhen: "md" },
        { name: "tone",        control: { type: "segmented", options: ["neutral","primary"] as const }, defaultValue: "neutral", omitWhen: "neutral" },
        { name: "striped",     control: { type: "toggle" },                                             defaultValue: false,     omitWhen: false },
        { name: "bordered",    control: { type: "toggle" },                                             defaultValue: false,     omitWhen: false },
        { name: "hoverable",   control: { type: "toggle" },                                             defaultValue: true,      omitWhen: true },
        { name: "loading",     control: { type: "toggle" },                                             defaultValue: false,     omitWhen: false },
      ]}
      staticProps={{ data: "{DATA}", columns: "{COLUMNS}" }}
      render={(v) => (
        <TableStyled
          data={DATA}
          columns={COLUMNS}
          size={v.size as "sm" | "md" | "lg"}
          tone={v.tone as "neutral" | "primary"}
          striped={v.striped as boolean}
          bordered={v.bordered as boolean}
          hoverable={v.hoverable as boolean}
          loading={v.loading as boolean}
          sortable
          filterable
          paginate
          pageSize={4}
          style={{ width: "100%" } as React.CSSProperties}
        />
      )}
    />
  );
}
