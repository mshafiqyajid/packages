import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useSelect, isSelectGroup } from "./useSelect";
import type { SelectItem, SelectGroup, SelectItemOrGroup } from "./useSelect";

const flat: SelectItem[] = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
];

const grouped: SelectGroup[] = [
  {
    group: "Fruits",
    items: [
      { value: "apple", label: "Apple" },
      { value: "banana", label: "Banana" },
    ],
  },
  {
    group: "Veggies",
    items: [
      { value: "carrot", label: "Carrot" },
      { value: "pea", label: "Pea", disabled: true },
    ],
  },
];

function flattenGroups(groups: SelectGroup[]): SelectItem[] {
  return groups.flatMap((g) => g.items);
}

describe("isSelectGroup", () => {
  it("returns true for a group object", () => {
    expect(isSelectGroup({ group: "G", items: [] })).toBe(true);
  });

  it("returns false for a flat item", () => {
    expect(isSelectGroup({ value: "a", label: "A" })).toBe(false);
  });
});

describe("useSelect with grouped items (flattened)", () => {
  const allItems = flattenGroups(grouped);

  it("filteredItems contains all items when no search", () => {
    const { result } = renderHook(() =>
      useSelect({ items: allItems, value: "", onChange: () => {} }),
    );
    expect(result.current.filteredItems).toHaveLength(4);
  });

  it("filteredItems filters across groups by label", () => {
    const { result } = renderHook(() =>
      useSelect({ items: allItems, value: "", onChange: () => {}, searchable: true }),
    );
    act(() => result.current.setSearchValue("arr"));
    expect(result.current.filteredItems.map((i) => i.value)).toEqual(["carrot"]);
  });

  it("disabled item in a group cannot be selected", () => {
    let selected = "";
    const { result } = renderHook(() =>
      useSelect({
        items: allItems,
        value: selected,
        onChange: (v) => { selected = v as string; },
      }),
    );
    act(() => result.current.triggerProps.onClick());
    const pea = allItems.find((i) => i.value === "pea")!;
    act(() => result.current.getItemProps(pea).onClick());
    expect(selected).toBe("");
  });

  it("selects an item from within a group", () => {
    let selected = "";
    const { result } = renderHook(() =>
      useSelect({
        items: allItems,
        value: selected,
        onChange: (v) => { selected = v as string; },
      }),
    );
    act(() => result.current.triggerProps.onClick());
    const carrot = allItems.find((i) => i.value === "carrot")!;
    act(() => result.current.getItemProps(carrot).onClick());
    expect(selected).toBe("carrot");
  });

  it("getItemProps marks grouped item selected via aria-selected", () => {
    const carrot = allItems.find((i) => i.value === "carrot")!;
    const { result } = renderHook(() =>
      useSelect({ items: allItems, value: "carrot", onChange: () => {} }),
    );
    expect(result.current.getItemProps(carrot)["aria-selected"]).toBe(true);
  });

  it("focusableItems skips disabled items in groups", () => {
    const { result } = renderHook(() =>
      useSelect({ items: allItems, value: "", onChange: () => {} }),
    );
    act(() => result.current.triggerProps.onClick());
    act(() =>
      result.current.triggerProps.onKeyDown({
        key: "ArrowDown",
        preventDefault: () => {},
      } as React.KeyboardEvent<HTMLButtonElement>),
    );
    const apple = allItems[0]!;
    expect(result.current.getItemProps(apple)["data-focused"]).toBe(true);
    act(() =>
      result.current.triggerProps.onKeyDown({
        key: "ArrowDown",
        preventDefault: () => {},
      } as React.KeyboardEvent<HTMLButtonElement>),
    );
    act(() =>
      result.current.triggerProps.onKeyDown({
        key: "ArrowDown",
        preventDefault: () => {},
      } as React.KeyboardEvent<HTMLButtonElement>),
    );
    const carrot = allItems.find((i) => i.value === "carrot")!;
    expect(result.current.getItemProps(carrot)["data-focused"]).toBe(true);
  });

  it("selectedItems resolves correctly across groups", () => {
    const { result } = renderHook(() =>
      useSelect({ items: allItems, value: ["apple", "carrot"], onChange: () => {}, multiple: true }),
    );
    expect(result.current.selectedItems.map((i) => i.value)).toEqual(["apple", "carrot"]);
  });
});

describe("SelectGroup type shape", () => {
  it("group has group string and items array", () => {
    const g: SelectGroup = { group: "Test", items: [{ value: "a", label: "A" }] };
    expect(g.group).toBe("Test");
    expect(g.items).toHaveLength(1);
  });

  it("SelectItemOrGroup union distinguishes via isSelectGroup", () => {
    const mixed: SelectItemOrGroup[] = [
      { group: "G", items: [] },
      { value: "x", label: "X" },
    ];
    expect(isSelectGroup(mixed[0]!)).toBe(true);
    expect(isSelectGroup(mixed[1]!)).toBe(false);
  });
});
