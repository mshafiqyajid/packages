import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useTree } from "./useTree";
import type { TreeNode } from "./useTree";

const items: TreeNode[] = [
  {
    id: "a",
    label: "Folder A",
    children: [
      { id: "a1", label: "Item A1" },
      { id: "a2", label: "Folder A2", children: [{ id: "a2a", label: "Item A2a" }] },
    ],
  },
  { id: "b", label: "Item B" },
];

describe("useTree", () => {
  it("returns flat visible nodes (top-level only when nothing expanded)", () => {
    const { result } = renderHook(() => useTree({ items }));
    expect(result.current.visibleNodes.map((n) => n.node.id)).toEqual(["a", "b"]);
  });

  it("expand reveals children", () => {
    const { result } = renderHook(() => useTree({ items }));
    act(() => result.current.expand("a"));
    expect(result.current.visibleNodes.map((n) => n.node.id)).toEqual(["a", "a1", "a2", "b"]);
  });

  it("collapse hides children", () => {
    const { result } = renderHook(() => useTree({ items, defaultExpandedIds: ["a"] }));
    act(() => result.current.collapse("a"));
    expect(result.current.visibleNodes.map((n) => n.node.id)).toEqual(["a", "b"]);
  });

  it("select fires onSelectedChange with the node", () => {
    const onSelectedChange = vi.fn();
    const { result } = renderHook(() => useTree({ items, onSelectedChange }));
    act(() => result.current.select("b"));
    expect(onSelectedChange).toHaveBeenCalledWith("b", expect.objectContaining({ id: "b" }));
    expect(result.current.selectedId).toBe("b");
  });

  it("toggle flips expanded state", () => {
    const { result } = renderHook(() => useTree({ items }));
    act(() => result.current.toggle("a"));
    expect(result.current.isExpanded("a")).toBe(true);
    act(() => result.current.toggle("a"));
    expect(result.current.isExpanded("a")).toBe(false);
  });

  it("expandAll expands every parent", () => {
    const { result } = renderHook(() => useTree({ items }));
    act(() => result.current.expandAll());
    expect(result.current.expandedIds.sort()).toEqual(["a", "a2"]);
  });

  it("multi-select mode toggles ids in/out", () => {
    const { result } = renderHook(() => useTree({ items, selectionMode: "multiple" }));
    act(() => result.current.select("a"));
    act(() => result.current.select("b"));
    expect(result.current.selectedIds.sort()).toEqual(["a", "b"]);
    act(() => result.current.select("a"));
    expect(result.current.selectedIds).toEqual(["b"]);
  });
});
