import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useRadioGroup } from "./useRadioGroup";

describe("useRadioGroup", () => {
  it("defaultValue sets initial value", () => {
    const { result } = renderHook(() =>
      useRadioGroup({ defaultValue: "b" }),
    );
    expect(result.current.value).toBe("b");
  });

  it("setValue updates value in uncontrolled mode", () => {
    const { result } = renderHook(() => useRadioGroup({ defaultValue: "a" }));
    act(() => {
      result.current.setValue("c");
    });
    expect(result.current.value).toBe("c");
  });

  it("controlled: value prop controls selection", () => {
    const { result } = renderHook(() =>
      useRadioGroup({ value: "b", onChange: vi.fn() }),
    );
    expect(result.current.value).toBe("b");
    act(() => {
      result.current.getItemProps("a").onClick();
    });
    expect(result.current.value).toBe("b");
  });

  it("onChange is called with new value on selection", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useRadioGroup({ defaultValue: "a", onChange }),
    );
    act(() => {
      result.current.getItemProps("b").onClick();
    });
    expect(onChange).toHaveBeenCalledWith("b");
  });

  it("groupProps.role === 'radiogroup'", () => {
    const { result } = renderHook(() => useRadioGroup());
    expect(result.current.groupProps.role).toBe("radiogroup");
  });

  it("groupProps['aria-required'] is true when required=true", () => {
    const { result } = renderHook(() => useRadioGroup({ required: true }));
    expect(result.current.groupProps["aria-required"]).toBe(true);
  });

  it("groupProps['aria-required'] is undefined when required=false", () => {
    const { result } = renderHook(() => useRadioGroup({ required: false }));
    expect(result.current.groupProps["aria-required"]).toBeUndefined();
  });

  it("groupProps['aria-invalid'] is true when invalid=true", () => {
    const { result } = renderHook(() => useRadioGroup({ invalid: true }));
    expect(result.current.groupProps["aria-invalid"]).toBe(true);
  });

  it("getItemProps for checked item has aria-checked=true", () => {
    const { result } = renderHook(() => useRadioGroup({ defaultValue: "a" }));
    const props = result.current.getItemProps("a");
    expect(props["aria-checked"]).toBe(true);
  });

  it("getItemProps for unchecked item has aria-checked=false", () => {
    const { result } = renderHook(() => useRadioGroup({ defaultValue: "a" }));
    const props = result.current.getItemProps("b");
    expect(props["aria-checked"]).toBe(false);
  });

  it("getItemProps for disabled item has aria-disabled=true", () => {
    const { result } = renderHook(() => useRadioGroup());
    const props = result.current.getItemProps("a", true);
    expect(props["aria-disabled"]).toBe(true);
  });

  it("disabled group: getItemProps for any item has aria-disabled=true", () => {
    const { result } = renderHook(() => useRadioGroup({ disabled: true }));
    const props = result.current.getItemProps("a");
    expect(props["aria-disabled"]).toBe(true);
  });

  it("disabled item does not call onChange when clicked", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useRadioGroup({ onChange }));
    act(() => {
      result.current.getItemProps("a", true).onClick();
    });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("disabled group does not call onChange when clicked", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useRadioGroup({ disabled: true, onChange }));
    act(() => {
      result.current.getItemProps("a").onClick();
    });
    expect(onChange).not.toHaveBeenCalled();
  });
});
