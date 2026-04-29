import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useSelect } from "./useSelect";
import type { SelectItem } from "./useSelect";

const items: SelectItem[] = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
  { value: "date", label: "Date", disabled: true },
];

describe("useSelect", () => {
  it("is closed by default", () => {
    const { result } = renderHook(() =>
      useSelect({ items, value: "", onChange: () => {} }),
    );
    expect(result.current.isOpen).toBe(false);
    expect(result.current.triggerProps["aria-expanded"]).toBe(false);
  });

  it("opens on trigger click", () => {
    const { result } = renderHook(() =>
      useSelect({ items, value: "", onChange: () => {} }),
    );
    act(() => result.current.triggerProps.onClick());
    expect(result.current.isOpen).toBe(true);
    expect(result.current.triggerProps["aria-expanded"]).toBe(true);
  });

  it("closes on second trigger click", () => {
    const { result } = renderHook(() =>
      useSelect({ items, value: "", onChange: () => {} }),
    );
    act(() => result.current.triggerProps.onClick());
    act(() => result.current.triggerProps.onClick());
    expect(result.current.isOpen).toBe(false);
  });

  it("opens with ArrowDown key", () => {
    const { result } = renderHook(() =>
      useSelect({ items, value: "", onChange: () => {} }),
    );
    act(() =>
      result.current.triggerProps.onKeyDown({
        key: "ArrowDown",
        preventDefault: () => {},
      } as React.KeyboardEvent<HTMLButtonElement>),
    );
    expect(result.current.isOpen).toBe(true);
  });

  it("opens with Enter key when closed", () => {
    const { result } = renderHook(() =>
      useSelect({ items, value: "", onChange: () => {} }),
    );
    act(() =>
      result.current.triggerProps.onKeyDown({
        key: "Enter",
        preventDefault: () => {},
      } as React.KeyboardEvent<HTMLButtonElement>),
    );
    expect(result.current.isOpen).toBe(true);
  });

  it("closes on Escape key", () => {
    const { result } = renderHook(() =>
      useSelect({ items, value: "", onChange: () => {} }),
    );
    act(() => result.current.triggerProps.onClick());
    expect(result.current.isOpen).toBe(true);
    act(() =>
      result.current.triggerProps.onKeyDown({
        key: "Escape",
        preventDefault: () => {},
      } as React.KeyboardEvent<HTMLButtonElement>),
    );
    expect(result.current.isOpen).toBe(false);
  });

  it("calls onChange with item value on single select", () => {
    let selected = "";
    const { result } = renderHook(() =>
      useSelect({
        items,
        value: selected,
        onChange: (v) => { selected = v as string; },
      }),
    );
    act(() => result.current.triggerProps.onClick());
    act(() => result.current.getItemProps(items[0]!).onClick());
    expect(selected).toBe("apple");
  });

  it("closes dropdown after single item selection", () => {
    const { result } = renderHook(() =>
      useSelect({ items, value: "", onChange: () => {} }),
    );
    act(() => result.current.triggerProps.onClick());
    act(() => result.current.getItemProps(items[0]!).onClick());
    expect(result.current.isOpen).toBe(false);
  });

  it("does not call onChange for disabled items", () => {
    let selected = "";
    const { result } = renderHook(() =>
      useSelect({
        items,
        value: selected,
        onChange: (v) => { selected = v as string; },
      }),
    );
    act(() => result.current.triggerProps.onClick());
    act(() => result.current.getItemProps(items[3]!).onClick()); // "date" is disabled
    expect(selected).toBe("");
  });

  it("multiple: toggles items in and out of selection", () => {
    const values: string[][] = [];
    const { result } = renderHook(() =>
      useSelect({
        items,
        value: values[values.length - 1] ?? [],
        onChange: (v) => values.push(v as string[]),
        multiple: true,
      }),
    );
    act(() => result.current.triggerProps.onClick());
    act(() => result.current.getItemProps(items[0]!).onClick());
    expect(values[values.length - 1]).toEqual(["apple"]);

    act(() => result.current.getItemProps(items[1]!).onClick());
    // Second call is on a fresh render so we simulate deselect manually
    const { result: result2 } = renderHook(() =>
      useSelect({
        items,
        value: ["apple"],
        onChange: (v) => values.push(v as string[]),
        multiple: true,
      }),
    );
    act(() => result2.current.triggerProps.onClick());
    act(() => result2.current.getItemProps(items[0]!).onClick());
    expect(values[values.length - 1]).toEqual([]);
  });

  it("multiple: stays open after selection", () => {
    const { result } = renderHook(() =>
      useSelect({
        items,
        value: [],
        onChange: () => {},
        multiple: true,
      }),
    );
    act(() => result.current.triggerProps.onClick());
    act(() => result.current.getItemProps(items[0]!).onClick());
    expect(result.current.isOpen).toBe(true);
  });

  it("searchable: filters items by search value", () => {
    const { result } = renderHook(() =>
      useSelect({ items, value: "", onChange: () => {}, searchable: true }),
    );
    act(() => result.current.setSearchValue("an"));
    expect(result.current.filteredItems.map((i) => i.value)).toEqual([
      "banana",
    ]);
  });

  it("searchable: returns all items when search is empty", () => {
    const { result } = renderHook(() =>
      useSelect({ items, value: "", onChange: () => {}, searchable: true }),
    );
    expect(result.current.filteredItems).toHaveLength(items.length);
  });

  it("selectedItems reflects controlled value", () => {
    const { result } = renderHook(() =>
      useSelect({ items, value: "banana", onChange: () => {} }),
    );
    expect(result.current.selectedItems).toHaveLength(1);
    expect(result.current.selectedItems[0]?.value).toBe("banana");
  });

  it("selectedItems is empty when value is empty string", () => {
    const { result } = renderHook(() =>
      useSelect({ items, value: "", onChange: () => {} }),
    );
    expect(result.current.selectedItems).toHaveLength(0);
  });

  it("getItemProps marks selected item with aria-selected", () => {
    const { result } = renderHook(() =>
      useSelect({ items, value: "apple", onChange: () => {} }),
    );
    expect(result.current.getItemProps(items[0]!)["aria-selected"]).toBe(true);
    expect(result.current.getItemProps(items[1]!)["aria-selected"]).toBe(false);
  });

  it("getItemProps marks disabled item with aria-disabled", () => {
    const { result } = renderHook(() =>
      useSelect({ items, value: "", onChange: () => {} }),
    );
    expect(result.current.getItemProps(items[3]!)["aria-disabled"]).toBe(true);
    expect(result.current.getItemProps(items[0]!)["aria-disabled"]).toBe(false);
  });

  it("Arrow keys move focus through focusable items", () => {
    const { result } = renderHook(() =>
      useSelect({ items, value: "", onChange: () => {} }),
    );
    act(() => result.current.triggerProps.onClick());
    act(() =>
      result.current.triggerProps.onKeyDown({
        key: "ArrowDown",
        preventDefault: () => {},
      } as React.KeyboardEvent<HTMLButtonElement>),
    );
    // first focusable item is apple (index 0)
    expect(result.current.getItemProps(items[0]!)["data-focused"]).toBe(true);

    act(() =>
      result.current.triggerProps.onKeyDown({
        key: "ArrowDown",
        preventDefault: () => {},
      } as React.KeyboardEvent<HTMLButtonElement>),
    );
    expect(result.current.getItemProps(items[1]!)["data-focused"]).toBe(true);
  });

  it("listboxProps has correct aria attributes", () => {
    const { result } = renderHook(() =>
      useSelect({ items, value: "", onChange: () => {}, multiple: true }),
    );
    expect(result.current.listboxProps.role).toBe("listbox");
    expect(result.current.listboxProps["aria-multiselectable"]).toBe(true);
  });
});
