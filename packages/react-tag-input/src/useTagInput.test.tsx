import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useTagInput } from "./useTagInput";

// Helper: fire a keydown event object for the hook's onKeyDown handler
function makeKeyEvent(key: string, value = ""): React.KeyboardEvent<HTMLInputElement> {
  return {
    key,
    preventDefault: vi.fn(),
  } as unknown as React.KeyboardEvent<HTMLInputElement>;
}

describe("useTagInput", () => {
  it("adds a tag on Enter", () => {
    const { result } = renderHook(() => useTagInput());

    act(() => {
      result.current.inputProps.onChange({
        target: { value: "react" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    act(() => {
      result.current.inputProps.onKeyDown(makeKeyEvent("Enter", "react"));
    });

    expect(result.current.tags).toEqual(["react"]);
    expect(result.current.inputValue).toBe("");
  });

  it("adds a tag on comma delimiter", () => {
    const { result } = renderHook(() => useTagInput());

    act(() => {
      result.current.inputProps.onChange({
        target: { value: "vue" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    act(() => {
      result.current.inputProps.onKeyDown(makeKeyEvent(",", "vue"));
    });

    expect(result.current.tags).toEqual(["vue"]);
  });

  it("prevents duplicate tags by default", () => {
    const { result } = renderHook(() => useTagInput());

    act(() => {
      result.current.addTag("react");
    });

    act(() => {
      result.current.addTag("react");
    });

    expect(result.current.tags).toEqual(["react"]);
    expect(result.current.validationError).toBe("Duplicate tag");
  });

  it("allows duplicates when allowDuplicates is true", () => {
    const { result } = renderHook(() => useTagInput({ allowDuplicates: true }));

    act(() => {
      result.current.addTag("react");
      result.current.addTag("react");
    });

    expect(result.current.tags).toEqual(["react", "react"]);
  });

  it("removes last tag on Backspace when input is empty", () => {
    const { result } = renderHook(() =>
      useTagInput({ defaultValue: ["react", "vue"] }),
    );

    act(() => {
      result.current.inputProps.onKeyDown(makeKeyEvent("Backspace", ""));
    });

    expect(result.current.tags).toEqual(["react"]);
  });

  it("removes a tag by index", () => {
    const { result } = renderHook(() =>
      useTagInput({ defaultValue: ["react", "vue", "svelte"] }),
    );

    act(() => {
      result.current.removeTag(1);
    });

    expect(result.current.tags).toEqual(["react", "svelte"]);
  });

  it("respects maxTags limit", () => {
    const { result } = renderHook(() => useTagInput({ maxTags: 2 }));

    act(() => {
      result.current.addTag("react");
      result.current.addTag("vue");
      result.current.addTag("svelte");
    });

    expect(result.current.tags).toHaveLength(2);
    expect(result.current.tags).not.toContain("svelte");
  });

  it("calls onChange with updated tags", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useTagInput({ onChange }));

    act(() => {
      result.current.addTag("react");
    });

    expect(onChange).toHaveBeenCalledWith(["react"]);
  });

  it("clearTags resets all state", () => {
    const { result } = renderHook(() =>
      useTagInput({ defaultValue: ["react", "vue"] }),
    );

    act(() => {
      result.current.clearTags();
    });

    expect(result.current.tags).toEqual([]);
    expect(result.current.inputValue).toBe("");
    expect(result.current.validationError).toBeNull();
  });

  it("filters suggestions based on input value", () => {
    const { result } = renderHook(() =>
      useTagInput({
        suggestions: ["React", "Vue", "Svelte", "Angular"],
      }),
    );

    act(() => {
      result.current.inputProps.onChange({
        target: { value: "re" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.filteredSuggestions).toEqual(["React"]);
  });

  it("excludes already-added tags from suggestions", () => {
    const { result } = renderHook(() =>
      useTagInput({
        defaultValue: ["React"],
        suggestions: ["React", "Vue", "Svelte"],
      }),
    );

    act(() => {
      result.current.inputProps.onChange({
        target: { value: "r" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.filteredSuggestions).not.toContain("React");
  });

  it("respects custom validate function", () => {
    const validate = (tag: string) => {
      if (tag.length < 3) return "Tag must be at least 3 characters";
      return true;
    };
    const { result } = renderHook(() => useTagInput({ validate }));

    act(() => {
      result.current.addTag("ab");
    });

    expect(result.current.tags).toEqual([]);
    expect(result.current.validationError).toBe("Tag must be at least 3 characters");

    act(() => {
      result.current.addTag("abc");
    });

    expect(result.current.tags).toEqual(["abc"]);
    expect(result.current.validationError).toBeNull();
  });

  it("ArrowDown moves active suggestion index forward", () => {
    const { result } = renderHook(() =>
      useTagInput({
        suggestions: ["React", "Vue", "Svelte"],
      }),
    );

    act(() => {
      result.current.inputProps.onChange({
        target: { value: "e" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    act(() => {
      result.current.inputProps.onKeyDown(makeKeyEvent("ArrowDown"));
    });

    expect(result.current.activeIndex).toBe(0);

    act(() => {
      result.current.inputProps.onKeyDown(makeKeyEvent("ArrowDown"));
    });

    expect(result.current.activeIndex).toBe(1);
  });

  it("ArrowUp moves active suggestion index backward and stops at -1", () => {
    const { result } = renderHook(() =>
      useTagInput({
        suggestions: ["React", "Vue"],
      }),
    );

    act(() => {
      result.current.inputProps.onChange({
        target: { value: "e" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    act(() => {
      result.current.inputProps.onKeyDown(makeKeyEvent("ArrowDown"));
      result.current.inputProps.onKeyDown(makeKeyEvent("ArrowDown"));
    });

    act(() => {
      result.current.inputProps.onKeyDown(makeKeyEvent("ArrowUp"));
    });

    expect(result.current.activeIndex).toBe(0);

    act(() => {
      result.current.inputProps.onKeyDown(makeKeyEvent("ArrowUp"));
    });

    expect(result.current.activeIndex).toBe(-1);
  });

  it("works as controlled component", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useTagInput({ value: ["react"], onChange }),
    );

    expect(result.current.tags).toEqual(["react"]);

    act(() => {
      result.current.addTag("vue");
    });

    expect(onChange).toHaveBeenCalledWith(["react", "vue"]);
    // controlled — internal tags don't change, still reflects controlled value
    expect(result.current.tags).toEqual(["react"]);
  });
});
