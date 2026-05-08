import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useMultiSelect } from "./useMultiSelect";
import type { MultiSelectOption } from "./useMultiSelect";

const options: MultiSelectOption[] = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "svelte", label: "Svelte" },
  { value: "angular", label: "Angular", disabled: true },
];

describe("useMultiSelect", () => {
  it("starts with empty selection by default", () => {
    const { result } = renderHook(() =>
      useMultiSelect({ options }),
    );
    expect(result.current.selectedValues).toEqual([]);
    expect(result.current.selectedOptions).toEqual([]);
  });

  it("respects defaultValue", () => {
    const { result } = renderHook(() =>
      useMultiSelect({ options, defaultValue: ["react"] }),
    );
    expect(result.current.selectedValues).toEqual(["react"]);
    expect(result.current.selectedOptions[0]?.value).toBe("react");
  });

  it("is closed by default", () => {
    const { result } = renderHook(() => useMultiSelect({ options }));
    expect(result.current.isOpen).toBe(false);
    expect(result.current.triggerProps["aria-expanded"]).toBe(false);
  });

  it("opens on trigger click", () => {
    const { result } = renderHook(() => useMultiSelect({ options }));
    act(() => result.current.triggerProps.onClick());
    expect(result.current.isOpen).toBe(true);
  });

  it("closes on second trigger click", () => {
    const { result } = renderHook(() => useMultiSelect({ options }));
    act(() => result.current.triggerProps.onClick());
    act(() => result.current.triggerProps.onClick());
    expect(result.current.isOpen).toBe(false);
  });

  it("toggleOption adds an option to selection", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useMultiSelect({ options, onChange }),
    );
    act(() => result.current.toggleOption("react"));
    expect(onChange).toHaveBeenCalledWith(["react"]);
  });

  it("toggleOption removes an already-selected option", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useMultiSelect({ options, defaultValue: ["react", "vue"], onChange }),
    );
    act(() => result.current.toggleOption("react"));
    expect(onChange).toHaveBeenCalledWith(["vue"]);
  });

  it("toggleOption does not affect disabled options", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useMultiSelect({ options, onChange }),
    );
    act(() => result.current.toggleOption("angular"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("selectAll selects all enabled options", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useMultiSelect({ options, onChange }),
    );
    act(() => result.current.selectAll());
    expect(onChange).toHaveBeenCalledWith(
      expect.arrayContaining(["react", "vue", "svelte"]),
    );
    const called = onChange.mock.calls[0]![0] as string[];
    expect(called).not.toContain("angular");
  });

  it("clearAll empties the selection", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useMultiSelect({ options, defaultValue: ["react", "vue"], onChange }),
    );
    act(() => result.current.clearAll());
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("isAllSelected is true when all enabled options are selected", () => {
    const { result } = renderHook(() =>
      useMultiSelect({
        options,
        defaultValue: ["react", "vue", "svelte"],
      }),
    );
    expect(result.current.isAllSelected).toBe(true);
  });

  it("isAllSelected is false when some options are unselected", () => {
    const { result } = renderHook(() =>
      useMultiSelect({ options, defaultValue: ["react"] }),
    );
    expect(result.current.isAllSelected).toBe(false);
  });

  it("isIndeterminate is true when some but not all enabled options selected", () => {
    const { result } = renderHook(() =>
      useMultiSelect({ options, defaultValue: ["react"] }),
    );
    expect(result.current.isIndeterminate).toBe(true);
    expect(result.current.isAllSelected).toBe(false);
  });

  it("isIndeterminate is false when nothing is selected", () => {
    const { result } = renderHook(() => useMultiSelect({ options }));
    expect(result.current.isIndeterminate).toBe(false);
  });

  it("isIndeterminate is false when all are selected", () => {
    const { result } = renderHook(() =>
      useMultiSelect({
        options,
        defaultValue: ["react", "vue", "svelte"],
      }),
    );
    expect(result.current.isIndeterminate).toBe(false);
  });

  it("onChange called with correct array on toggle", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useMultiSelect({ options, defaultValue: ["react"], onChange }),
    );
    act(() => result.current.toggleOption("vue"));
    expect(onChange).toHaveBeenCalledWith(["react", "vue"]);
  });

  it("controlled mode: uses controlled value", () => {
    const { result } = renderHook(() =>
      useMultiSelect({ options, value: ["vue"], onChange: vi.fn() }),
    );
    expect(result.current.selectedValues).toEqual(["vue"]);
    expect(result.current.selectedOptions[0]?.value).toBe("vue");
  });

  it("maxSelected prevents adding more than the limit", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useMultiSelect({
        options,
        defaultValue: ["react", "vue"],
        onChange,
        maxSelected: 2,
      }),
    );
    act(() => result.current.toggleOption("svelte"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("maxSelected allows toggling off when at limit", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useMultiSelect({
        options,
        defaultValue: ["react", "vue"],
        onChange,
        maxSelected: 2,
      }),
    );
    act(() => result.current.toggleOption("react"));
    expect(onChange).toHaveBeenCalledWith(["vue"]);
  });

  it("search filters options", () => {
    const { result } = renderHook(() =>
      useMultiSelect({ options, searchable: true }),
    );
    act(() => result.current.setSearchValue("vue"));
    expect(result.current.filteredOptions).toHaveLength(1);
    expect(result.current.filteredOptions[0]?.value).toBe("vue");
  });

  it("search returns all options when query is empty", () => {
    const { result } = renderHook(() =>
      useMultiSelect({ options, searchable: true }),
    );
    expect(result.current.filteredOptions).toHaveLength(options.length);
  });

  it("Escape closes the dropdown", () => {
    const { result } = renderHook(() => useMultiSelect({ options }));
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

  it("ArrowDown opens and navigates the dropdown", () => {
    const { result } = renderHook(() => useMultiSelect({ options }));
    act(() =>
      result.current.triggerProps.onKeyDown({
        key: "ArrowDown",
        preventDefault: () => {},
      } as React.KeyboardEvent<HTMLButtonElement>),
    );
    expect(result.current.isOpen).toBe(true);

    act(() =>
      result.current.triggerProps.onKeyDown({
        key: "ArrowDown",
        preventDefault: () => {},
      } as React.KeyboardEvent<HTMLButtonElement>),
    );
    expect(result.current.focusedIndex).toBe(0);
  });

  it("ArrowUp opens and navigates to the last option", () => {
    const { result } = renderHook(() => useMultiSelect({ options }));
    act(() =>
      result.current.triggerProps.onKeyDown({
        key: "ArrowUp",
        preventDefault: () => {},
      } as React.KeyboardEvent<HTMLButtonElement>),
    );
    expect(result.current.isOpen).toBe(true);
  });

  it("Space toggles focused option", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useMultiSelect({ options, onChange }),
    );
    act(() => result.current.triggerProps.onClick());
    act(() =>
      result.current.triggerProps.onKeyDown({
        key: "ArrowDown",
        preventDefault: () => {},
      } as React.KeyboardEvent<HTMLButtonElement>),
    );
    act(() =>
      result.current.triggerProps.onKeyDown({
        key: " ",
        preventDefault: () => {},
      } as React.KeyboardEvent<HTMLButtonElement>),
    );
    expect(onChange).toHaveBeenCalled();
  });

  it("getOptionProps returns correct aria attributes for selected option", () => {
    const { result } = renderHook(() =>
      useMultiSelect({ options, defaultValue: ["react"] }),
    );
    const props = result.current.getOptionProps(options[0]!);
    expect(props["aria-selected"]).toBe(true);
    expect(props["data-selected"]).toBe(true);
    expect(props.role).toBe("option");
  });

  it("getOptionProps returns correct aria attributes for disabled option", () => {
    const { result } = renderHook(() => useMultiSelect({ options }));
    const props = result.current.getOptionProps(options[3]!);
    expect(props["aria-disabled"]).toBe(true);
    expect(props["data-disabled"]).toBe(true);
  });

  it("listboxProps has correct aria attributes", () => {
    const { result } = renderHook(() => useMultiSelect({ options }));
    expect(result.current.listboxProps.role).toBe("listbox");
    expect(result.current.listboxProps["aria-multiselectable"]).toBe(true);
  });

  it("triggerProps has correct aria attributes", () => {
    const { result } = renderHook(() => useMultiSelect({ options }));
    expect(result.current.triggerProps.role).toBe("combobox");
    expect(result.current.triggerProps["aria-haspopup"]).toBe("listbox");
    expect(result.current.triggerProps["aria-multiselectable"]).toBe(true);
  });
});
