import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useTable } from "./useTable";

type Row = Record<string, unknown> & { id: number; a: string; b: string; c: string };

const data: Row[] = [
  { id: 1, a: "1a", b: "1b", c: "1c" },
  { id: 2, a: "2a", b: "2b", c: "2c" },
];

const columns = [
  { key: "a" as const, header: "A" },
  { key: "b" as const, header: "B", defaultHidden: true },
  { key: "c" as const, header: "C", hidden: true },
];

describe("useTable column visibility", () => {
  it("respects hidden + defaultHidden on first render", () => {
    const { result } = renderHook(() => useTable({ data, columns }));
    const keys = result.current.visibleColumns.map((c) => c.key);
    expect(keys).toEqual(["a"]);
  });

  it("toggleColumnVisibility flips the map and updates visibleColumns", () => {
    const { result } = renderHook(() => useTable({ data, columns }));
    act(() => result.current.toggleColumnVisibility("b"));
    const keys = result.current.visibleColumns.map((c) => c.key);
    expect(keys).toContain("b");
    // hidden:true is *not* toggleable through this API.
    expect(keys).not.toContain("c");
  });

  it("respects controlled columnVisibility + onColumnVisibilityChange", () => {
    const onChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ vis }: { vis: Record<string, boolean> }) =>
        useTable({
          data,
          columns,
          columnVisibility: vis,
          onColumnVisibilityChange: onChange,
        }),
      { initialProps: { vis: { a: false, b: true } } },
    );
    expect(result.current.visibleColumns.map((c) => c.key)).toEqual(["b"]);
    act(() => result.current.toggleColumnVisibility("a"));
    expect(onChange).toHaveBeenCalledWith({ a: true, b: true });
    // Controlled — internal state didn't change until we re-pass new prop.
    expect(result.current.visibleColumns.map((c) => c.key)).toEqual(["b"]);
    rerender({ vis: { a: true, b: true } });
    expect(result.current.visibleColumns.map((c) => c.key)).toEqual(["a", "b"]);
  });
});
