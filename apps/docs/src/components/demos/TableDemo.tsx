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
  { key: "name",   header: "Name",   sortable: true, resizable: true, footer: "Total" },
  { key: "role",   header: "Role",   sortable: true, filterable: true, resizable: true },
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
    <PropPlayground layout="stacked"
      componentName="TableStyled"
      importLine={`import { TableStyled } from "@mshafiqyajid/react-table/styled";\nimport "@mshafiqyajid/react-table/styles.css";`}
      props={[
        { name: "tone",               control: { type: "segmented", options: ["neutral","primary"] as const }, defaultValue: "neutral", omitWhen: "neutral" },
        { name: "selectable",         control: { type: "segmented", options: ["off","single","multi","range"] as const }, defaultValue: "off", omitWhen: "off" },
        { name: "striped",            control: { type: "toggle" }, defaultValue: false, omitWhen: false },
        { name: "bordered",           control: { type: "toggle" }, defaultValue: false, omitWhen: false },
        { name: "hoverable",          control: { type: "toggle" }, defaultValue: true,  omitWhen: true },
        { name: "showFooter",         control: { type: "toggle" }, defaultValue: true,  omitWhen: false },
        { name: "showDensityToggle",  control: { type: "toggle" }, defaultValue: true,  omitWhen: false },
        { name: "showColumnMenu",     control: { type: "toggle" }, defaultValue: true,  omitWhen: false },
        { name: "exportable",         control: { type: "toggle" }, defaultValue: true,  omitWhen: false },
        { name: "multiSort",          control: { type: "toggle" }, defaultValue: false, omitWhen: false },
        { name: "ariaGrid",           control: { type: "toggle" }, defaultValue: false, omitWhen: false },
        { name: "highlightMatches",   control: { type: "toggle" }, defaultValue: true,  omitWhen: false },
        { name: "loading",            control: { type: "toggle" }, defaultValue: false, omitWhen: false },
        { name: "expandableRows",     label: "expandable rows",    control: { type: "toggle" }, defaultValue: false, omitWhen: false },
        { name: "groupByRole",        label: "groupBy role",        control: { type: "toggle" }, defaultValue: false, omitWhen: false },
        { name: "bulkActions",        label: "bulk actions bar",    control: { type: "toggle" }, defaultValue: false, omitWhen: false },
        { name: "editableName",       label: "editable name col",   control: { type: "toggle" }, defaultValue: false, omitWhen: false },
      ]}
      staticProps={{ data: "{DATA}", columns: "{COLUMNS}" }}
      render={(v) => {
        const selectableValue = v.selectable as string;
        // 0.4.0 widens this to `boolean | "single" | "multi" | "range"`.
        // The cast keeps the demo compiling against the published 0.3.0 dist
        // and continues to work once the new types ship.
        const selectable =
          (selectableValue === "off" ? false :
          selectableValue === "single" ? "single" :
          selectableValue === "range" ? "range" :
          "multi") as unknown as boolean;

        const editableNameCols: ColumnDef<Person>[] = v.editableName
          ? COLUMNS.map((c) =>
              c.key === "name" ? { ...c, editable: true } as ColumnDef<Person> : c,
            )
          : COLUMNS;

        const wave5Props = {
          groupBy: v.groupByRole ? "role" : undefined,
          bulkActions: v.bulkActions
            ? [
                { label: "Export selected", onClick: () => {} },
                { label: "Remove", onClick: () => {}, tone: "danger" as const },
              ]
            : undefined,
          onCellEdit: v.editableName
            ? (_rowId: string, _colKey: string, _value: unknown) => {}
            : undefined,
        };

        return (
          <TableStyled
            key={`${String(v.expandableRows)}-${String(v.ariaGrid)}-${selectableValue}-${String(v.groupByRole)}-${String(v.editableName)}`}
            data={DATA}
            columns={editableNameCols}
            tone={v.tone as "neutral" | "primary"}
            striped={v.striped as boolean}
            bordered={v.bordered as boolean}
            hoverable={v.hoverable as boolean}
            loading={v.loading as boolean}
            showFooter={v.showFooter as boolean}
            showDensityToggle={v.showDensityToggle as boolean}
            {...({ showColumnMenu: v.showColumnMenu as boolean } as object)}
            {...({ exportable: v.exportable as boolean } as object)}
            {...({ multiSort: v.multiSort as boolean } as object)}
            {...({ ariaGrid: v.ariaGrid as boolean, ariaLabel: "Employees" } as object)}
            {...(wave5Props as object)}
            highlightMatches={v.highlightMatches as boolean}
            selectable={selectable}
            expandable={
              v.expandableRows
                ? {
                    renderExpanded: (row) => (
                      <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.85rem" }}>
                        <span><strong>Joined:</strong> {row.joined}</span>
                        <span><strong>Role:</strong> {row.role}</span>
                        <span><strong>Status:</strong> {row.status}</span>
                        <span><strong>Salary:</strong> ${row.salary.toLocaleString()}</span>
                      </div>
                    ),
                  }
                : undefined
            }
            pageSize={4}
            pageSizeOptions={[4, 6, 8]}
            stickyHeader
          />
        );
      }}
    />
  );
}
