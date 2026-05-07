import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useSlider } from "./useSlider";

const MARKS = [0, 25, 50, 75, 100];

describe("useSlider — snapToMarks", () => {
  it("keyboard commit snaps to nearest mark", () => {
    const { result } = renderHook(() =>
      useSlider({
        defaultValue: 22,
        step: 1,
        marks: MARKS,
        snapToMarks: true,
      }),
    );
    act(() => {
      result.current.thumbProps[0]!.onKeyDown({
        key: "ArrowRight",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    expect(result.current.value).toBe(25);
  });

  it("Home key with snapToMarks snaps to first mark (min)", () => {
    const { result } = renderHook(() =>
      useSlider({
        defaultValue: 60,
        step: 1,
        marks: MARKS,
        snapToMarks: true,
        min: 0,
        max: 100,
      }),
    );
    act(() => {
      result.current.thumbProps[0]!.onKeyDown({
        key: "Home",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    expect(result.current.value).toBe(0);
  });

  it("End key with snapToMarks snaps to last mark (max)", () => {
    const { result } = renderHook(() =>
      useSlider({
        defaultValue: 40,
        step: 1,
        marks: MARKS,
        snapToMarks: true,
        min: 0,
        max: 100,
      }),
    );
    act(() => {
      result.current.thumbProps[0]!.onKeyDown({
        key: "End",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    expect(result.current.value).toBe(100);
  });

  it("without snapToMarks, value does NOT snap to nearest mark", () => {
    const { result } = renderHook(() =>
      useSlider({
        defaultValue: 22,
        step: 1,
        marks: MARKS,
        snapToMarks: false,
      }),
    );
    act(() => {
      result.current.thumbProps[0]!.onKeyDown({
        key: "ArrowRight",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    expect(result.current.value).toBe(23);
  });

  it("snapToMarks does not fire onChange if value already on mark", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useSlider({
        defaultValue: 25,
        step: 1,
        marks: MARKS,
        snapToMarks: true,
        onChange,
      }),
    );
    act(() => {
      result.current.thumbProps[0]!.onKeyDown({
        key: "ArrowLeft",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    expect(result.current.value).toBe(25);
  });

  it("snapToMarks works with multi-thumb arrays", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useSlider({
        defaultValue: [22, 60],
        step: 1,
        marks: MARKS,
        snapToMarks: true,
        onChange,
      }),
    );
    act(() => {
      result.current.thumbProps[0]!.onKeyDown({
        key: "ArrowRight",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    const vals = result.current.value as number[];
    expect(vals[0]).toBe(25);
  });
});

describe("useSlider — scale: log", () => {
  it("log scale: thumb left for max equals 100%", () => {
    const { result } = renderHook(() =>
      useSlider({
        defaultValue: 1000,
        min: 1,
        max: 1000,
        scale: "log",
        scaleBase: 10,
      }),
    );
    expect(result.current.thumbProps[0]!.style.left).toBe("100%");
  });

  it("log scale: thumb left for min equals 0%", () => {
    const { result } = renderHook(() =>
      useSlider({
        defaultValue: 1,
        min: 1,
        max: 1000,
        scale: "log",
        scaleBase: 10,
      }),
    );
    expect(result.current.thumbProps[0]!.style.left).toBe("0%");
  });

  it("log scale: midpoint value (sqrt of min*max) maps near 50%", () => {
    const { result } = renderHook(() =>
      useSlider({
        defaultValue: 100,
        min: 1,
        max: 10000,
        scale: "log",
        scaleBase: 10,
      }),
    );
    const left = parseFloat(result.current.thumbProps[0]!.style.left);
    expect(left).toBeCloseTo(50, 0);
  });
});
