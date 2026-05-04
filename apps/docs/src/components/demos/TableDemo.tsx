import PropPlayground from "../PropPlayground";
import { TableStyled } from "@mshafiqyajid/react-table/styled";
import type { ColumnDef } from "@mshafiqyajid/react-table";
import "@mshafiqyajid/react-table/styles.css";

type Person = {
  id: number;
  name: string;
  role: string;
  status: string;
  joined: string;
  salary: number;
};

const DATA: Person[] = [
  { id: 1, name: "Alice Johnson",  role: "Engineer",   status: "Active",   joined: "2022-01", salary: 92000  },
  { id: 2, name: "Bob Chen",       role: "Designer",   status: "Active",   joined: "2021-06", salary: 78000  },
  { id: 3, name: "Carol Williams", role: "Manager",    status: "On leave", joined: "2020-03", salary: 115000 },
  { id: 4, name: "David Kim",      role: "Engineer",   status: "Active",   joined: "2023-02", salary: 86000  },
  { id: 5, name: "Emma Davis",     role: "QA",         status: "Active",   joined: "2022-09", salary: 71000  },
  { id: 6, name: "Frank Miller",   role: "DevOps",     status: "Inactive", joined: "2019-11", salary: 99000  },
  { id: 7, name: "Grace Lee",      role: "Engineer",   status: "Active",   joined: "2023-07", salary: 88000  },
  { id: 8, name: "Henry Brown",    role: "Designer",   status: "Active",   joined: "2021-12", salary: 74000  },
];

const COLUMNS: ColumnDef<Person>[] = [
  { key: "name",   header: "Name",   sortable: true,  footer: "Total" },
  { key: "role",   header: "Role",   filterable: true },
  { key: "status", header: "Status", filterable: true },
  { key: "joined", header: "Joined", sortable: true   },
  {
    key: "salary",
    header: "Salary",
    sortable: true,
    align: "right",
    aggregate: "sum",
    render: (row) => `$${(row.salary / 1000).toFixed(0)}k`,
  },
];

export default function TableDemo() {
  return (
    <PropPlayground
      componentName="TableStyled"
      importLine={`import { TableStyled } from "@mshafiqyajid/react-table/styled";\nimport "@mshafiqyajid/react-table/styles.css";`}
      props={[
        { name: "tone",               control: { type: "segmented", options: ["neutral","primary"] as const }, defaultValue: "neutral", omitWhen: "neutral" },
        { name: "striped",            control: { type: "toggle" }, defaultValue: false, omitWhen: false },
        { name: "bordered",           control: { type: "toggle" }, defaultValue: false, omitWhen: false },
        { name: "hoverable",          control: { type: "toggle" }, defaultValue: true,  omitWhen: true },
        { name: "showFooter",         control: { type: "toggle" }, defaultValue: true,  omitWhen: false },
        { name: "showDensityToggle",  control: { type: "toggle" }, defaultValue: true,  omitWhen: false },
        { name: "highlightMatches",   control: { type: "toggle" }, defaultValue: true,  omitWhen: false },
        { name: "loading",            control: { type: "toggle" }, defaultValue: false, omitWhen: false },
      ]}
      staticProps={{ data: "{DATA}", columns: "{COLUMNS}" }}
      render={(v) => (
        <TableStyled
          data={DATA}
          columns={COLUMNS}
          tone={v.tone as "neutral" | "primary"}
          striped={v.striped as boolean}
          bordered={v.bordered as boolean}
          hoverable={v.hoverable as boolean}
          loading={v.loading as boolean}
          showFooter={v.showFooter as boolean}
          showDensityToggle={v.showDensityToggle as boolean}
          highlightMatches={v.highlightMatches as boolean}
          pageSize={4}
          pageSizeOptions={[4, 6, 8]}
          stickyHeader
        />
      )}
    />
  );
}
