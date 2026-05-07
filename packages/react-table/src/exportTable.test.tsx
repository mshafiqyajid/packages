import { describe, it, expect } from "vitest";
import { exportTableCSV, exportTableJSON } from "./useTable";
import type { ColumnDef } from "./useTable";

type Row = Record<string, unknown> & {
  id: number;
  name: string;
  city: string;
  salary: number;
  user: { handle: string };
};

const rows: Row[] = [
  { id: 1, name: "Alice, Sr.", city: "NY", salary: 100, user: { handle: "alice" } },
  { id: 2, name: 'Bob "B"', city: "LA", salary: 90, user: { handle: "bob" } },
];

const columns: ColumnDef<Row>[] = [
  { key: "name", header: "Name" },
  { key: "city", header: "City" },
  { key: "salary", header: "Salary" },
  { key: "handle", header: "Handle", accessor: (r) => r.user.handle },
];

describe("exportTableCSV", () => {
  it("emits header + comma-separated rows and quotes risky values", () => {
    const csv = exportTableCSV({ rows, columns });
    const lines = csv.split("\n");
    expect(lines[0]).toBe("Name,City,Salary,Handle");
    // The first row's name has a comma -> must be quoted.
    expect(lines[1]).toBe('"Alice, Sr.",NY,100,alice');
    // The second row contains a literal double-quote -> must be escaped (`""`).
    expect(lines[2]).toBe('"Bob ""B""",LA,90,bob');
  });

  it("uses accessor for computed values", () => {
    const csv = exportTableCSV({
      rows,
      columns: [{ key: "handle", header: "Handle", accessor: (r) => r.user.handle }],
    });
    expect(csv).toBe("Handle\nalice\nbob");
  });
});

describe("exportTableJSON", () => {
  it("returns one object per row using accessor when present", () => {
    const json = exportTableJSON({ rows, columns });
    const parsed = JSON.parse(json) as Array<Record<string, unknown>>;
    expect(parsed[0]).toEqual({
      name: "Alice, Sr.",
      city: "NY",
      salary: 100,
      handle: "alice",
    });
    expect(parsed[1]!.handle).toBe("bob");
  });

  it("skips columns flagged as hidden", () => {
    const cols: ColumnDef<Row>[] = [
      { key: "name", header: "Name" },
      { key: "salary", header: "Salary", hidden: true },
    ];
    const json = exportTableJSON({ rows, columns: cols });
    const parsed = JSON.parse(json) as Array<Record<string, unknown>>;
    expect(Object.keys(parsed[0]!)).toEqual(["name"]);
  });
});
