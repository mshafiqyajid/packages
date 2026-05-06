import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useCommandPalette } from "./useCommandPalette";
import type { CommandItem } from "./useCommandPalette";

const items: CommandItem[] = [
  { id: "new",   label: "New file",     group: "File", shortcut: "⌘N" },
  { id: "open",  label: "Open recent",  group: "File", keywords: ["recent", "history"] },
  { id: "find",  label: "Find in files", group: "Edit" },
  { id: "del",   label: "Delete",       group: "Edit", disabled: true },
];

describe("useCommandPalette", () => {
  it("starts closed by default", () => {
    const { result } = renderHook(() => useCommandPalette({ items }));
    expect(result.current.isOpen).toBe(false);
  });

  it("opens / closes / toggles", () => {
    const { result } = renderHook(() => useCommandPalette({ items }));
    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);
    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(true);
  });

  it("filters by query against label, hint, keywords", () => {
    const { result } = renderHook(() => useCommandPalette({ items }));
    act(() => result.current.setQuery("hist"));
    expect(result.current.filteredItems.map((it) => it.id)).toEqual(["open"]);
  });

  it("groups items by group field", () => {
    const { result } = renderHook(() => useCommandPalette({ items }));
    const groupIds = result.current.groups.map((g) => g.id);
    expect(groupIds).toContain("File");
    expect(groupIds).toContain("Edit");
  });

  it("selectItem fires onSelect and closes the palette", () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() => useCommandPalette({ items, onSelect, defaultOpen: true }));
    act(() => result.current.selectItem(items[0]!));
    expect(onSelect).toHaveBeenCalledWith(items[0]);
    expect(result.current.isOpen).toBe(false);
  });

  it("selectItem on disabled item is a no-op", () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() => useCommandPalette({ items, onSelect, defaultOpen: true }));
    act(() => result.current.selectItem(items[3]!)); // disabled "Delete"
    expect(onSelect).not.toHaveBeenCalled();
    expect(result.current.isOpen).toBe(true);
  });
});
