import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useCheckboxTree, type CheckboxTreeNode } from "./useCheckboxTree";

const flatNodes: CheckboxTreeNode[] = [
  { id: "a", label: "A" },
  { id: "b", label: "B" },
  { id: "c", label: "C" },
];

const treeNodes: CheckboxTreeNode[] = [
  {
    id: "parent",
    label: "Parent",
    children: [
      { id: "child1", label: "Child 1" },
      { id: "child2", label: "Child 2" },
    ],
  },
];

describe("useCheckboxTree", () => {
  it("initialises with all unchecked", () => {
    const { result } = renderHook(() => useCheckboxTree(flatNodes));
    expect(result.current.checked["a"]).toBe(false);
    expect(result.current.checked["b"]).toBe(false);
    expect(result.current.checked["c"]).toBe(false);
  });

  it("toggle checks a single leaf", () => {
    const { result } = renderHook(() => useCheckboxTree(flatNodes));
    act(() => result.current.toggle("a"));
    expect(result.current.checked["a"]).toBe(true);
    expect(result.current.checked["b"]).toBe(false);
  });

  it("toggleAll checks all then unchecks all", () => {
    const { result } = renderHook(() => useCheckboxTree(flatNodes));
    act(() => result.current.toggleAll());
    expect(result.current.checked["a"]).toBe(true);
    expect(result.current.checked["b"]).toBe(true);
    expect(result.current.checked["c"]).toBe(true);
    act(() => result.current.toggleAll());
    expect(result.current.checked["a"]).toBe(false);
  });

  it("parent becomes checked when all children are checked", () => {
    const { result } = renderHook(() => useCheckboxTree(treeNodes));
    act(() => result.current.toggle("child1"));
    expect(result.current.indeterminate["parent"]).toBe(true);
    expect(result.current.checked["parent"]).toBe(false);
    act(() => result.current.toggle("child2"));
    expect(result.current.checked["parent"]).toBe(true);
    expect(result.current.indeterminate["parent"]).toBe(false);
  });

  it("parent is indeterminate when some children are checked", () => {
    const { result } = renderHook(() => useCheckboxTree(treeNodes));
    act(() => result.current.toggle("child1"));
    expect(result.current.indeterminate["parent"]).toBe(true);
  });

  it("toggling parent checks all children", () => {
    const { result } = renderHook(() => useCheckboxTree(treeNodes));
    act(() => result.current.toggle("parent"));
    expect(result.current.checked["child1"]).toBe(true);
    expect(result.current.checked["child2"]).toBe(true);
  });

  it("toggling parent when all checked unchecks all children", () => {
    const { result } = renderHook(() => useCheckboxTree(treeNodes));
    act(() => result.current.toggle("parent"));
    act(() => result.current.toggle("parent"));
    expect(result.current.checked["child1"]).toBe(false);
    expect(result.current.checked["child2"]).toBe(false);
  });

  it("getCheckboxProps returns indeterminate state for parent", () => {
    const { result } = renderHook(() => useCheckboxTree(treeNodes));
    act(() => result.current.toggle("child1"));
    const props = result.current.getCheckboxProps("parent");
    expect(props.checked).toBe("indeterminate");
  });

  it("getCheckboxProps onChange delegates to toggle", () => {
    const { result } = renderHook(() => useCheckboxTree(flatNodes));
    act(() => result.current.getCheckboxProps("a").onChange(true));
    expect(result.current.checked["a"]).toBe(true);
  });
});
