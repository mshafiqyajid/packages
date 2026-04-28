import { act, renderHook } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { useSegmentedControl } from "./useSegmentedControl";

describe("useSegmentedControl", () => {
  test("defaults to the first option when uncontrolled", () => {
    const { result } = renderHook(() =>
      useSegmentedControl({ options: ["a", "b", "c"] }),
    );
    expect(result.current.value).toBe("a");
    expect(result.current.options[0]!.isSelected).toBe(true);
  });

  test("respects defaultValue", () => {
    const { result } = renderHook(() =>
      useSegmentedControl({ options: ["a", "b", "c"], defaultValue: "b" }),
    );
    expect(result.current.value).toBe("b");
  });

  test("setValue updates uncontrolled state and fires onChange", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useSegmentedControl({ options: ["a", "b"], onChange }),
    );
    act(() => {
      result.current.setValue("b");
    });
    expect(result.current.value).toBe("b");
    expect(onChange).toHaveBeenCalledWith("b");
  });

  test("setValue ignores values not in options", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useSegmentedControl({ options: ["a", "b"], onChange }),
    );
    act(() => {
      result.current.setValue("z" as "a" | "b");
    });
    expect(result.current.value).toBe("a");
    expect(onChange).not.toHaveBeenCalled();
  });

  test("setValue ignores disabled options", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useSegmentedControl({
        options: ["a", { value: "b", disabled: true }, "c"],
        onChange,
      }),
    );
    act(() => {
      result.current.setValue("b");
    });
    expect(result.current.value).toBe("a");
    expect(onChange).not.toHaveBeenCalled();
  });

  test("controlled mode reflects external value", () => {
    const { result, rerender } = renderHook(
      (props: { value: "a" | "b" }) =>
        useSegmentedControl({ options: ["a", "b"], ...props }),
      { initialProps: { value: "a" } },
    );
    expect(result.current.value).toBe("a");
    rerender({ value: "b" });
    expect(result.current.value).toBe("b");
  });

  test("disabled prop disables every option", () => {
    const { result } = renderHook(() =>
      useSegmentedControl({ options: ["a", "b"], disabled: true }),
    );
    expect(result.current.options[0]!.isDisabled).toBe(true);
    expect(result.current.options[1]!.isDisabled).toBe(true);
    expect(result.current.rootProps["aria-disabled"]).toBe(true);
  });

  test("indicatorStyle exposes CSS vars", () => {
    const { result } = renderHook(() =>
      useSegmentedControl({ options: ["a", "b"] }),
    );
    const style = result.current.indicatorStyle as Record<string, string>;
    expect(style["--rsc-indicator-x"]).toMatch(/^\d+px$/);
    expect(style["--rsc-indicator-width"]).toMatch(/^\d+px$/);
    expect(style["--rsc-indicator-ready"]).toMatch(/^[01]$/);
  });

  test("supports object options with custom labels", () => {
    const { result } = renderHook(() =>
      useSegmentedControl({
        options: [
          { value: "a", label: "Alpha" },
          { value: "b", label: "Beta" },
        ],
      }),
    );
    expect(result.current.options[0]!.label).toBe("Alpha");
    expect(result.current.options[1]!.label).toBe("Beta");
  });

  test("respects custom equals", () => {
    type Item = { id: number };
    const items: Item[] = [{ id: 1 }, { id: 2 }];
    const { result } = renderHook(() =>
      useSegmentedControl<Item>({
        options: items,
        defaultValue: { id: 2 },
        equals: (a, b) => a.id === b.id,
      }),
    );
    expect(result.current.value.id).toBe(2);
    expect(result.current.options[1]!.isSelected).toBe(true);
  });
});
