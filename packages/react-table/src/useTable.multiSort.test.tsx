import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useTable } from "./useTable";

type Row = Record<string, unknown> & {
  id: number;
  dept: string;
  salary: number;
};

const data: Row[] = [
  { id: 1, dept: "Eng", salary: 120 },
  { id: 2, dept: "Eng", salary: 80 },
  { id: 3, dept: "Sales", salary: 100 },
  { id: 4, dept: "Sales", salary: 70 },
  { id: 5, dept: "Sales", salary: 130 },
];

const columns = [
  { key: "dept" as const, header: "Dept", sortable: true },
  { key: "salary" as const, header: "Salary", sortable: true },
];

describe("useTable multi-sort", () => {
  it("appends a second sort entry when multiSort + append are both set", () => {
    const onSortChange = vi.fn();
    const { result } = renderHook(() =>
      useTable({ data, columns, multiSort: true, onSortChange, pageSize: 10 }),
    );
    act(() => result.current.toggleSort("dept"));
    act(() => result.current.toggleSort("salary", { append: true }));

    expect(result.current.sorts).toEqual([
      { key: "dept", dir: "asc" },
      { key: "salary", dir: "asc" },
    ]);

    // dept asc, then within Eng salary asc, within Sales salary asc.
    const ordered = result.current.rows.map((r) => `${r.dept}-${r.salary}`);
    expect(ordered).toEqual([
      "Eng-80",
      "Eng-120",
      "Sales-70",
      "Sales-100",
      "Sales-130",
    ]);

    // onSortChange fired with the latest sorts.
    expect(onSortChange).toHaveBeenLastCalledWith([
      { key: "dept", dir: "asc" },
      { key: "salary", dir: "asc" },
    ]);
  });

  it("cycles asc -> desc -> removed when re-appending the same key", () => {
    const { result } = renderHook(() =>
      useTable({ data, columns, multiSort: true, pageSize: 10 }),
    );
    act(() => result.current.toggleSort("dept"));
    act(() => result.current.toggleSort("salary", { append: true }));
    // salary asc -> desc
    act(() => result.current.toggleSort("salary", { append: true }));
    expect(result.current.sorts).toEqual([
      { key: "dept", dir: "asc" },
      { key: "salary", dir: "desc" },
    ]);
    // salary desc -> removed
    act(() => result.current.toggleSort("salary", { append: true }));
    expect(result.current.sorts).toEqual([{ key: "dept", dir: "asc" }]);
  });

  it("ignores append when multiSort is false (single-sort behavior preserved)", () => {
    const { result } = renderHook(() =>
      useTable({ data, columns, multiSort: false, pageSize: 10 }),
    );
    act(() => result.current.toggleSort("dept"));
    act(() => result.current.toggleSort("salary", { append: true }));
    expect(result.current.sorts).toEqual([{ key: "salary", dir: "asc" }]);
    expect(result.current.sortKey).toBe("salary");
    expect(result.current.sortDir).toBe("asc");
  });

  it("accepts SortBy[] as defaultSort", () => {
    const { result } = renderHook(() =>
      useTable({
        data,
        columns,
        multiSort: true,
        pageSize: 10,
        defaultSort: [
          { key: "dept", dir: "asc" },
          { key: "salary", dir: "desc" },
        ],
      }),
    );
    expect(result.current.sorts.length).toBe(2);
    const ordered = result.current.rows.map((r) => `${r.dept}-${r.salary}`);
    expect(ordered).toEqual([
      "Eng-120",
      "Eng-80",
      "Sales-130",
      "Sales-100",
      "Sales-70",
    ]);
  });
});
