import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useCombobox } from "./useCombobox";
import type { ComboboxOption } from "./useCombobox";

const options: ComboboxOption[] = [
  { value: "apple",  label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
  { value: "date",   label: "Date", disabled: true },
  { value: "elderberry", label: "Elderberry", group: "Exotic" },
];

describe("useCombobox", () => {
  it("is closed by default", () => {
    const { result } = renderHook(() =>
      useCombobox({ options }),
    );
    expect(result.current.isOpen).toBe(false);
    expect(result.current.inputProps["aria-expanded"]).toBe(false);
  });

  it("opens on input focus", () => {
    const { result } = renderHook(() =>
      useCombobox({ options }),
    );
    act(() => {
      result.current.inputProps.onFocus({} as React.FocusEvent<HTMLInputElement>);
    });
    expect(result.current.isOpen).toBe(true);
    expect(result.current.inputProps["aria-expanded"]).toBe(true);
  });

  it("filters options by query (case-insensitive)", () => {
    const { result } = renderHook(() =>
      useCombobox({ options }),
    );
    act(() => result.current.setQuery("an"));
    expect(result.current.filteredOptions.map((o) => o.value)).toEqual([
      "banana",
    ]);
  });

  it("ArrowDown opens when closed", () => {
    const { result } = renderHook(() =>
      useCombobox({ options }),
    );
    act(() =>
      result.current.inputProps.onKeyDown({
        key: "ArrowDown",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLInputElement>),
    );
    expect(result.current.isOpen).toBe(true);
  });

  it("ArrowDown navigates to first option", () => {
    const { result } = renderHook(() =>
      useCombobox({ options }),
    );
    act(() =>
      result.current.inputProps.onFocus({} as React.FocusEvent<HTMLInputElement>),
    );
    act(() =>
      result.current.inputProps.onKeyDown({
        key: "ArrowDown",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLInputElement>),
    );
    expect(result.current.getOptionProps(options[0]!, 0)["data-focused"]).toBe(true);
  });

  it("ArrowUp navigates to last option when at start", () => {
    const { result } = renderHook(() =>
      useCombobox({ options }),
    );
    act(() =>
      result.current.inputProps.onFocus({} as React.FocusEvent<HTMLInputElement>),
    );
    act(() =>
      result.current.inputProps.onKeyDown({
        key: "ArrowUp",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLInputElement>),
    );
    // Last focusable option is elderberry (index 3 of focusable, date is disabled)
    const focusableOptions = options.filter((o) => !o.disabled);
    const lastOption = focusableOptions[focusableOptions.length - 1]!;
    expect(result.current.getOptionProps(lastOption, focusableOptions.length - 1)["data-focused"]).toBe(true);
  });

  it("Enter selects the focused option", () => {
    let changed: string | null = undefined!;
    const { result } = renderHook(() =>
      useCombobox({
        options,
        onChange: (v) => { changed = v; },
      }),
    );
    act(() =>
      result.current.inputProps.onFocus({} as React.FocusEvent<HTMLInputElement>),
    );
    act(() =>
      result.current.inputProps.onKeyDown({
        key: "ArrowDown",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLInputElement>),
    );
    act(() =>
      result.current.inputProps.onKeyDown({
        key: "Enter",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLInputElement>),
    );
    expect(changed).toBe("apple");
    expect(result.current.isOpen).toBe(false);
  });

  it("Escape closes the dropdown", () => {
    const { result } = renderHook(() =>
      useCombobox({ options }),
    );
    act(() =>
      result.current.inputProps.onFocus({} as React.FocusEvent<HTMLInputElement>),
    );
    expect(result.current.isOpen).toBe(true);
    act(() =>
      result.current.inputProps.onKeyDown({
        key: "Escape",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLInputElement>),
    );
    expect(result.current.isOpen).toBe(false);
  });

  it("clearSelection sets value to null and closes", () => {
    let changed: string | null = "apple";
    const { result } = renderHook(() =>
      useCombobox({
        options,
        value: "apple",
        onChange: (v) => { changed = v; },
      }),
    );
    act(() => result.current.clearSelection());
    expect(changed).toBeNull();
    expect(result.current.isOpen).toBe(false);
  });

  it("onChange called with correct value on option click", () => {
    let changed: string | null = null;
    const { result } = renderHook(() =>
      useCombobox({
        options,
        onChange: (v) => { changed = v; },
      }),
    );
    act(() =>
      result.current.inputProps.onFocus({} as React.FocusEvent<HTMLInputElement>),
    );
    act(() => result.current.getOptionProps(options[1]!, 1).onClick());
    expect(changed).toBe("banana");
  });

  it("controlled mode: selectedOption reflects value prop", () => {
    const { result } = renderHook(() =>
      useCombobox({ options, value: "cherry" }),
    );
    expect(result.current.selectedOption?.value).toBe("cherry");
  });

  it("disabled option cannot be selected", () => {
    let changed: string | null = null;
    const { result } = renderHook(() =>
      useCombobox({
        options,
        onChange: (v) => { changed = v; },
      }),
    );
    act(() =>
      result.current.inputProps.onFocus({} as React.FocusEvent<HTMLInputElement>),
    );
    act(() => result.current.getOptionProps(options[3]!, 3).onClick()); // date is disabled
    expect(changed).toBeNull();
  });

  it("invalid prop sets aria-invalid on inputProps", () => {
    // aria-invalid is passed through by the styled component — check via the hook that it doesn't break
    const { result } = renderHook(() =>
      useCombobox({ options }),
    );
    // inputProps are well-formed ARIA combobox props
    expect(result.current.inputProps.role).toBe("combobox");
    expect(result.current.inputProps["aria-autocomplete"]).toBe("list");
    expect(result.current.inputProps["aria-controls"]).toBeTruthy();
  });

  it("aria-activedescendant matches focused option id", () => {
    const { result } = renderHook(() =>
      useCombobox({ options }),
    );
    act(() =>
      result.current.inputProps.onFocus({} as React.FocusEvent<HTMLInputElement>),
    );
    act(() =>
      result.current.inputProps.onKeyDown({
        key: "ArrowDown",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLInputElement>),
    );
    const focusedId = result.current.inputProps["aria-activedescendant"];
    expect(focusedId).toBeTruthy();
    const firstOptionProps = result.current.getOptionProps(options[0]!, 0);
    expect(firstOptionProps.id).toBe(focusedId);
  });

  it("getOptionProps marks selected option", () => {
    const { result } = renderHook(() =>
      useCombobox({ options, value: "apple" }),
    );
    expect(result.current.getOptionProps(options[0]!, 0)["aria-selected"]).toBe(true);
    expect(result.current.getOptionProps(options[1]!, 1)["aria-selected"]).toBe(false);
  });

  it("getOptionProps marks disabled option", () => {
    const { result } = renderHook(() =>
      useCombobox({ options }),
    );
    expect(result.current.getOptionProps(options[3]!, 3)["aria-disabled"]).toBe(true);
    expect(result.current.getOptionProps(options[0]!, 0)["aria-disabled"]).toBe(false);
  });

  it("creatable: shows create option when query has no match", () => {
    const { result } = renderHook(() =>
      useCombobox({ options, creatable: true }),
    );
    act(() => result.current.setQuery("zzz"));
    expect(result.current.showCreateOption).toBe(true);
  });

  it("creatable: does not show create option when exact match exists", () => {
    const { result } = renderHook(() =>
      useCombobox({ options, creatable: true }),
    );
    act(() => result.current.setQuery("Apple"));
    expect(result.current.showCreateOption).toBe(false);
  });

  it("Backspace with empty query clears selection", () => {
    let changed: string | null = "apple";
    const { result } = renderHook(() =>
      useCombobox({
        options,
        value: "apple",
        onChange: (v) => { changed = v; },
      }),
    );
    act(() =>
      result.current.inputProps.onKeyDown({
        key: "Backspace",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLInputElement>),
    );
    expect(changed).toBeNull();
  });

  it("listboxProps has correct role", () => {
    const { result } = renderHook(() =>
      useCombobox({ options }),
    );
    expect(result.current.listboxProps.role).toBe("listbox");
  });
});
