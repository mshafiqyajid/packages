import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useTable } from "./useTable";

type Row = { id: number; name: string; age: number; city: string };

const data: Row[] = [
  { id: 1, name: "Alice", age: 30, city: "New York" },
  { id: 2, name: "Bob", age: 25, city: "London" },
  { id: 3, name: "Carol", age: 35, city: "Tokyo" },
  { id: 4, name: "Dave", age: 28, city: "Paris" },
  { id: 5, name: "Eve", age: 22, city: "Berlin" },
  { id: 6, name: "Frank", age: 40, city: "Sydney" },
  { id: 7, name: "Grace", age: 31, city: "Toronto" },
  { id: 8, name: "Hank", age: 27, city: "Seoul" },
  { id: 9, name: "Iris", age: 33, city: "Mumbai" },
  { id: 10, name: "Jack", age: 29, city: "Cairo" },
  { id: 11, name: "Kate", age: 26, city: "Oslo" },
  { id: 12, name: "Leo", age: 38, city: "Rome" },
];

const columns = [
  { key: "name" as const, header: "Name", sortable: true },
  { key: "age" as const, header: "Age", sortable: true },
  { key: "city" as const, header: "City", sortable: true },
];

describe("useTable", () => {
  it("returns the first page of rows by default", () => {
    const { result } = renderHook(() =>
      useTable({ data, columns, pageSize: 5 }),
    );
    expect(result.current.rows).toHaveLength(5);
    expect(result.current.rows[0]!.name).toBe("Alice");
    expect(result.current.page).toBe(1);
    expect(result.current.pageCount).toBe(3);
  });

  it("paginates correctly when setPage is called", () => {
    const { result } = renderHook(() =>
      useTable({ data, columns, pageSize: 5 }),
    );
    act(() => result.current.setPage(2));
    expect(result.current.page).toBe(2);
    expect(result.current.rows).toHaveLength(5);
    expect(result.current.rows[0]!.name).toBe("Frank");
  });

  it("sorts ascending then descending on toggleSort", () => {
    const { result } = renderHook(() =>
      useTable({ data, columns, pageSize: 12 }),
    );
    act(() => result.current.toggleSort("name"));
    expect(result.current.sortKey).toBe("name");
    expect(result.current.sortDir).toBe("asc");
    const firstAsc = result.current.rows[0]!.name;
    expect(firstAsc).toBe("Alice");

    act(() => result.current.toggleSort("name"));
    expect(result.current.sortDir).toBe("desc");
    const firstDesc = result.current.rows[0]!.name;
    expect(firstDesc).toBe("Leo");
  });

  it("filters rows by string match across string columns", () => {
    const { result } = renderHook(() =>
      useTable({ data, columns, pageSize: 20 }),
    );
    act(() => result.current.setFilterValue("on"));
    // "London" matches city of Bob; "Toronto" matches city of Grace
    const names = result.current.rows.map((r) => r.name);
    expect(names).toContain("Bob");
    expect(names).toContain("Grace");
    expect(names).not.toContain("Alice");
  });

  it("filtering resets page to 1", () => {
    const { result } = renderHook(() =>
      useTable({ data, columns, pageSize: 5 }),
    );
    act(() => result.current.setPage(2));
    expect(result.current.page).toBe(2);
    act(() => result.current.setFilterValue("Alice"));
    expect(result.current.page).toBe(1);
  });

  it("selects and deselects individual rows", () => {
    const { result } = renderHook(() =>
      useTable({ data, columns, selectable: true, pageSize: 12 }),
    );
    act(() => result.current.toggleRow("1"));
    expect(result.current.selectedRows).toContain("1");
    act(() => result.current.toggleRow("1"));
    expect(result.current.selectedRows).not.toContain("1");
  });

  it("toggleAll selects all rows on current page then deselects them", () => {
    const { result } = renderHook(() =>
      useTable({ data, columns, selectable: true, pageSize: 5 }),
    );
    expect(result.current.allSelected).toBe(false);
    act(() => result.current.toggleAll());
    expect(result.current.allSelected).toBe(true);
    expect(result.current.selectedRows).toHaveLength(5);
    act(() => result.current.toggleAll());
    expect(result.current.allSelected).toBe(false);
    expect(result.current.selectedRows).toHaveLength(0);
  });

  it("calls onSort callback with key and direction", () => {
    const onSort = vi.fn();
    const { result } = renderHook(() =>
      useTable({ data, columns, onSort }),
    );
    act(() => result.current.toggleSort("age"));
    expect(onSort).toHaveBeenCalledWith("age", "asc");
    act(() => result.current.toggleSort("age"));
    expect(onSort).toHaveBeenCalledWith("age", "desc");
  });

  it("calls onFilter callback when filter value changes", () => {
    const onFilter = vi.fn();
    const { result } = renderHook(() =>
      useTable({ data, columns, onFilter }),
    );
    act(() => result.current.setFilterValue("Alice"));
    expect(onFilter).toHaveBeenCalledWith("Alice");
  });

  it("calls onSelect callback when rows are toggled", () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() =>
      useTable({ data, columns, selectable: true, onSelect }),
    );
    act(() => result.current.toggleRow("3"));
    expect(onSelect).toHaveBeenCalledWith(["3"]);
  });

  it("uses defaultSort to sort on mount", () => {
    const { result } = renderHook(() =>
      useTable({
        data,
        columns,
        pageSize: 12,
        defaultSort: { key: "age", dir: "asc" },
      }),
    );
    const ages = result.current.rows.map((r) => r.age);
    expect(ages[0]!).toBeLessThan(ages[ages.length - 1]!);
  });

  it("clamps page to pageCount if data shrinks after filtering", () => {
    const { result } = renderHook(() =>
      useTable({ data, columns, pageSize: 5 }),
    );
    act(() => result.current.setPage(3));
    expect(result.current.page).toBe(3);
    act(() => result.current.setFilterValue("Alice"));
    expect(result.current.page).toBe(1);
    expect(result.current.pageCount).toBe(1);
  });
});
