import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useTable } from "./useTable";

type Row = Record<string, unknown> & { id: number; name: string };

const data: Row[] = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
  { id: 3, name: "Carol" },
  { id: 4, name: "Dave" },
];

const columns = [{ key: "name" as const, header: "Name" }];

describe("useTable selectable variants", () => {
  it("'single' replaces selection on each toggle", () => {
    const { result } = renderHook(() =>
      useTable({ data, columns, selectable: "single", pageSize: 10 }),
    );
    act(() => result.current.toggleRow("1"));
    expect(result.current.selectedRows).toEqual(["1"]);
    act(() => result.current.toggleRow("2"));
    expect(result.current.selectedRows).toEqual(["2"]);
    // Re-toggling the same id deselects.
    act(() => result.current.toggleRow("2"));
    expect(result.current.selectedRows).toEqual([]);
    // toggleAll is a no-op in single mode.
    act(() => result.current.toggleAll());
    expect(result.current.selectedRows).toEqual([]);
  });

  it("'true' is back-compat for 'multi'", () => {
    const onSelectChange = vi.fn();
    const { result } = renderHook(() =>
      useTable({
        data,
        columns,
        selectable: true,
        onSelectChange,
        pageSize: 10,
      }),
    );
    act(() => result.current.toggleRow("1"));
    act(() => result.current.toggleRow("2"));
    expect(result.current.selectedRows).toEqual(["1", "2"]);
    expect(onSelectChange).toHaveBeenLastCalledWith(["1", "2"]);
  });

  it("'range' fills the span between an anchor and a target", () => {
    const { result } = renderHook(() =>
      useTable({ data, columns, selectable: "range", pageSize: 10 }),
    );
    // Click row 1 (sets the anchor).
    act(() => result.current.toggleRow("1"));
    // Shift-click row 4 -> selects 1..4 inclusive.
    act(() => result.current.toggleRow("4", { rangeAnchor: true }));
    expect(result.current.selectedRows).toEqual(["1", "2", "3", "4"]);
  });

  it("supports controlled selectedIds", () => {
    const onSelectChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ ids }: { ids: string[] }) =>
        useTable({
          data,
          columns,
          selectable: "multi",
          selectedIds: ids,
          onSelectChange,
          pageSize: 10,
        }),
      { initialProps: { ids: ["2"] } },
    );
    expect(result.current.selectedRows).toEqual(["2"]);
    act(() => result.current.toggleRow("3"));
    expect(onSelectChange).toHaveBeenCalledWith(["2", "3"]);
    // The controlled value is unchanged until the parent re-passes it.
    expect(result.current.selectedRows).toEqual(["2"]);
    rerender({ ids: ["2", "3"] });
    expect(result.current.selectedRows).toEqual(["2", "3"]);
  });
});
