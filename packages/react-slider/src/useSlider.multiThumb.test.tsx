import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useSlider } from "./useSlider";

describe("useSlider — multi-thumb (3+ values)", () => {
  it("renders three thumbs for a 3-element array", () => {
    const { result } = renderHook(() =>
      useSlider({ defaultValue: [20, 50, 80] }),
    );
    expect(result.current.thumbProps).toHaveLength(3);
    expect(result.current.thumbProps[0]!["aria-valuenow"]).toBe(20);
    expect(result.current.thumbProps[1]!["aria-valuenow"]).toBe(50);
    expect(result.current.thumbProps[2]!["aria-valuenow"]).toBe(80);
  });

  it("thumb labels use numbered scheme for 3+ thumbs", () => {
    const { result } = renderHook(() =>
      useSlider({ defaultValue: [10, 50, 90] }),
    );
    expect(result.current.thumbProps[0]!["aria-label"]).toBe("Thumb 1 of 3");
    expect(result.current.thumbProps[1]!["aria-label"]).toBe("Thumb 2 of 3");
    expect(result.current.thumbProps[2]!["aria-label"]).toBe("Thumb 3 of 3");
  });

  it("ArrowRight on middle thumb increments but stays below upper neighbor", () => {
    const { result } = renderHook(() =>
      useSlider({ defaultValue: [10, 49, 50], min: 0, max: 100, step: 1 }),
    );
    act(() => {
      result.current.thumbProps[1]!.onKeyDown({
        key: "ArrowRight",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    const vals = result.current.value as number[];
    expect(vals[1]).toBe(49);
  });

  it("ArrowLeft on middle thumb decrements but stays above lower neighbor", () => {
    const { result } = renderHook(() =>
      useSlider({ defaultValue: [50, 51, 90], min: 0, max: 100, step: 1 }),
    );
    act(() => {
      result.current.thumbProps[1]!.onKeyDown({
        key: "ArrowLeft",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    const vals = result.current.value as number[];
    expect(vals[1]).toBe(51);
  });

  it("ArrowRight on first thumb respects upper neighbor constraint", () => {
    const { result } = renderHook(() =>
      useSlider({ defaultValue: [20, 50, 80], min: 0, max: 100, step: 10 }),
    );
    act(() => {
      result.current.thumbProps[0]!.onKeyDown({
        key: "ArrowRight",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    const vals = result.current.value as number[];
    expect(vals[0]).toBe(30);
  });

  it("ArrowLeft on last thumb respects lower neighbor constraint", () => {
    const { result } = renderHook(() =>
      useSlider({ defaultValue: [20, 50, 80], min: 0, max: 100, step: 10 }),
    );
    act(() => {
      result.current.thumbProps[2]!.onKeyDown({
        key: "ArrowLeft",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    const vals = result.current.value as number[];
    expect(vals[2]).toBe(70);
  });

  it("onChange fires with full array value", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useSlider({ defaultValue: [20, 50, 80], step: 10, onChange }),
    );
    act(() => {
      result.current.thumbProps[0]!.onKeyDown({
        key: "ArrowRight",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    expect(onChange).toHaveBeenCalledWith([30, 50, 80]);
  });

  it("range fill spans from min-thumb to max-thumb", () => {
    const { result } = renderHook(() =>
      useSlider({ defaultValue: [20, 50, 80], min: 0, max: 100 }),
    );
    const { style } = result.current.rangeProps;
    expect(style.left).toBe("20%");
    expect(style.width).toBe("60%");
  });

  it("single thumb mode still works correctly", () => {
    const { result } = renderHook(() =>
      useSlider({ defaultValue: 40 }),
    );
    expect(result.current.thumbProps).toHaveLength(1);
    expect(result.current.value).toBe(40);
  });

  it("two-thumb mode still works correctly", () => {
    const { result } = renderHook(() =>
      useSlider({ defaultValue: [25, 75] }),
    );
    expect(result.current.thumbProps).toHaveLength(2);
    expect(result.current.thumbProps[0]!["aria-label"]).toBe("Minimum value");
    expect(result.current.thumbProps[1]!["aria-label"]).toBe("Maximum value");
  });

  it("controlled multi-thumb value reflects prop", () => {
    const { result } = renderHook(() =>
      useSlider({ value: [10, 40, 70] }),
    );
    const vals = result.current.value as number[];
    expect(vals).toEqual([10, 40, 70]);
  });
});
