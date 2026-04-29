import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useSlider } from "./useSlider";

describe("useSlider", () => {
  it("returns initial value from defaultValue", () => {
    const { result } = renderHook(() => useSlider({ defaultValue: 30 }));
    expect(result.current.value).toBe(30);
  });

  it("returns 0 when no defaultValue provided", () => {
    const { result } = renderHook(() => useSlider({ min: 0, max: 100 }));
    expect(result.current.value).toBe(0);
  });

  it("thumb props have correct aria attributes", () => {
    const { result } = renderHook(() =>
      useSlider({ defaultValue: 50, min: 0, max: 100 }),
    );
    const thumb = result.current.thumbProps[0]!;
    expect(thumb.role).toBe("slider");
    expect(thumb["aria-valuenow"]).toBe(50);
    expect(thumb["aria-valuemin"]).toBe(0);
    expect(thumb["aria-valuemax"]).toBe(100);
    expect(thumb["aria-disabled"]).toBe(false);
  });

  it("aria-disabled is true when disabled", () => {
    const { result } = renderHook(() =>
      useSlider({ defaultValue: 50, disabled: true }),
    );
    expect(result.current.thumbProps[0]!["aria-disabled"]).toBe(true);
    expect(result.current.thumbProps[0]!.tabIndex).toBe(-1);
  });

  it("ArrowRight key increments value by step", () => {
    const { result } = renderHook(() =>
      useSlider({ defaultValue: 40, step: 5 }),
    );
    act(() => {
      result.current.thumbProps[0]!.onKeyDown({
        key: "ArrowRight",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    expect(result.current.value).toBe(45);
  });

  it("ArrowLeft key decrements value by step", () => {
    const { result } = renderHook(() =>
      useSlider({ defaultValue: 40, step: 5 }),
    );
    act(() => {
      result.current.thumbProps[0]!.onKeyDown({
        key: "ArrowLeft",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    expect(result.current.value).toBe(35);
  });

  it("Home key sets value to min", () => {
    const { result } = renderHook(() =>
      useSlider({ defaultValue: 60, min: 10, max: 100 }),
    );
    act(() => {
      result.current.thumbProps[0]!.onKeyDown({
        key: "Home",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    expect(result.current.value).toBe(10);
  });

  it("End key sets value to max", () => {
    const { result } = renderHook(() =>
      useSlider({ defaultValue: 40, min: 0, max: 80 }),
    );
    act(() => {
      result.current.thumbProps[0]!.onKeyDown({
        key: "End",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    expect(result.current.value).toBe(80);
  });

  it("value is clamped to max on ArrowRight at boundary", () => {
    const { result } = renderHook(() =>
      useSlider({ defaultValue: 100, min: 0, max: 100, step: 10 }),
    );
    act(() => {
      result.current.thumbProps[0]!.onKeyDown({
        key: "ArrowRight",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    expect(result.current.value).toBe(100);
  });

  it("value is clamped to min on ArrowLeft at boundary", () => {
    const { result } = renderHook(() =>
      useSlider({ defaultValue: 0, min: 0, max: 100, step: 10 }),
    );
    act(() => {
      result.current.thumbProps[0]!.onKeyDown({
        key: "ArrowLeft",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    expect(result.current.value).toBe(0);
  });

  it("calls onChange when value changes via keyboard", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useSlider({ defaultValue: 50, step: 10, onChange }),
    );
    act(() => {
      result.current.thumbProps[0]!.onKeyDown({
        key: "ArrowRight",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    expect(onChange).toHaveBeenCalledWith(60);
  });

  it("keyboard does not update value when disabled", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useSlider({ defaultValue: 50, disabled: true, onChange }),
    );
    act(() => {
      result.current.thumbProps[0]!.onKeyDown({
        key: "ArrowRight",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    expect(onChange).not.toHaveBeenCalled();
    expect(result.current.value).toBe(50);
  });

  it("range mode returns two thumbs", () => {
    const { result } = renderHook(() =>
      useSlider({ defaultValue: [20, 70] }),
    );
    expect(result.current.thumbProps).toHaveLength(2);
    expect(result.current.thumbProps[0]!["aria-valuenow"]).toBe(20);
    expect(result.current.thumbProps[1]!["aria-valuenow"]).toBe(70);
  });

  it("range mode thumb labels are correct", () => {
    const { result } = renderHook(() =>
      useSlider({ defaultValue: [20, 70] }),
    );
    expect(result.current.thumbProps[0]!["aria-label"]).toBe("Minimum value");
    expect(result.current.thumbProps[1]!["aria-label"]).toBe("Maximum value");
  });

  it("controlled value overrides internal state", () => {
    const { result } = renderHook(() =>
      useSlider({ value: 75, min: 0, max: 100 }),
    );
    expect(result.current.value).toBe(75);
  });

  it("range fill left and width are correct", () => {
    const { result } = renderHook(() =>
      useSlider({ defaultValue: [25, 75], min: 0, max: 100 }),
    );
    const { style } = result.current.rangeProps;
    expect(style.left).toBe("25%");
    expect(style.width).toBe("50%");
  });

  it("single-thumb range fill starts at 0", () => {
    const { result } = renderHook(() =>
      useSlider({ defaultValue: 40, min: 0, max: 100 }),
    );
    const { style } = result.current.rangeProps;
    expect(style.left).toBe("0%");
    expect(style.width).toBe("40%");
  });
});
