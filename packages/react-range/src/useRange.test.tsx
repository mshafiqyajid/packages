import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useRange } from "./useRange";

describe("useRange — single mode", () => {
  it("returns initial value from defaultValue", () => {
    const { result } = renderHook(() =>
      useRange({ defaultValue: 30, mode: "single" }),
    );
    expect(result.current.value).toBe(30);
  });

  it("defaults to min when no defaultValue provided", () => {
    const { result } = renderHook(() =>
      useRange({ min: 0, max: 100, mode: "single" }),
    );
    expect(result.current.value).toBe(0);
  });

  it("controlled value overrides internal state", () => {
    const { result } = renderHook(() =>
      useRange({ value: 75, min: 0, max: 100, mode: "single" }),
    );
    expect(result.current.value).toBe(75);
  });

  it("ArrowRight increments by step", () => {
    const { result } = renderHook(() =>
      useRange({ defaultValue: 40, step: 5, mode: "single" }),
    );
    act(() => {
      result.current.getThumbProps(0).onKeyDown({
        key: "ArrowRight",
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    expect(result.current.value).toBe(45);
  });

  it("ArrowLeft decrements by step", () => {
    const { result } = renderHook(() =>
      useRange({ defaultValue: 40, step: 5, mode: "single" }),
    );
    act(() => {
      result.current.getThumbProps(0).onKeyDown({
        key: "ArrowLeft",
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    expect(result.current.value).toBe(35);
  });

  it("Home sets value to min", () => {
    const { result } = renderHook(() =>
      useRange({ defaultValue: 60, min: 10, max: 100, mode: "single" }),
    );
    act(() => {
      result.current.getThumbProps(0).onKeyDown({
        key: "Home",
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    expect(result.current.value).toBe(10);
  });

  it("End sets value to max", () => {
    const { result } = renderHook(() =>
      useRange({ defaultValue: 40, min: 0, max: 80, mode: "single" }),
    );
    act(() => {
      result.current.getThumbProps(0).onKeyDown({
        key: "End",
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    expect(result.current.value).toBe(80);
  });

  it("Shift+ArrowRight jumps 10% of range", () => {
    const { result } = renderHook(() =>
      useRange({ defaultValue: 0, min: 0, max: 100, step: 1, mode: "single" }),
    );
    act(() => {
      result.current.getThumbProps(0).onKeyDown({
        key: "ArrowRight",
        shiftKey: true,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    expect(result.current.value).toBe(10);
  });

  it("value is clamped to max at boundary", () => {
    const { result } = renderHook(() =>
      useRange({ defaultValue: 100, min: 0, max: 100, step: 10, mode: "single" }),
    );
    act(() => {
      result.current.getThumbProps(0).onKeyDown({
        key: "ArrowRight",
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    expect(result.current.value).toBe(100);
  });

  it("value is clamped to min at boundary", () => {
    const { result } = renderHook(() =>
      useRange({ defaultValue: 0, min: 0, max: 100, step: 10, mode: "single" }),
    );
    act(() => {
      result.current.getThumbProps(0).onKeyDown({
        key: "ArrowLeft",
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    expect(result.current.value).toBe(0);
  });

  it("calls onChange when value changes via keyboard", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useRange({ defaultValue: 50, step: 10, mode: "single", onChange }),
    );
    act(() => {
      result.current.getThumbProps(0).onKeyDown({
        key: "ArrowRight",
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    expect(onChange).toHaveBeenCalledWith(60);
  });

  it("disabled prevents keyboard interaction", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useRange({ defaultValue: 50, disabled: true, mode: "single", onChange }),
    );
    act(() => {
      result.current.getThumbProps(0).onKeyDown({
        key: "ArrowRight",
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    expect(onChange).not.toHaveBeenCalled();
    expect(result.current.value).toBe(50);
  });

  it("thumb has correct aria attributes", () => {
    const { result } = renderHook(() =>
      useRange({ defaultValue: 50, min: 0, max: 100, mode: "single" }),
    );
    const thumb = result.current.getThumbProps(0);
    expect(thumb.role).toBe("slider");
    expect(thumb["aria-valuenow"]).toBe(50);
    expect(thumb["aria-valuemin"]).toBe(0);
    expect(thumb["aria-valuemax"]).toBe(100);
    expect(thumb["aria-orientation"]).toBe("horizontal");
    expect(thumb["aria-disabled"]).toBe(false);
    expect(thumb["aria-label"]).toBe("Value");
  });

  it("track fill left=0 and width matches value", () => {
    const { result } = renderHook(() =>
      useRange({ defaultValue: 40, min: 0, max: 100, mode: "single" }),
    );
    const fill = result.current.getTrackFillProps();
    expect(fill.style.left).toBe("0%");
    expect(fill.style.width).toBe("40%");
  });

  it("step snapping: arrow key moves in step increments", () => {
    const { result } = renderHook(() =>
      useRange({ defaultValue: 0, min: 0, max: 100, step: 10, mode: "single" }),
    );
    act(() => {
      result.current.getThumbProps(0).onKeyDown({
        key: "ArrowRight",
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    expect(result.current.value).toBe(10);
  });
});

describe("useRange — range mode", () => {
  it("defaults to [min, max] when no defaultValue", () => {
    const { result } = renderHook(() =>
      useRange({ min: 0, max: 100, mode: "range" }),
    );
    expect(result.current.value).toEqual([0, 100]);
  });

  it("returns two thumbs with correct aria", () => {
    const { result } = renderHook(() =>
      useRange({ defaultValue: [20, 70], mode: "range" }),
    );
    const t0 = result.current.getThumbProps(0);
    const t1 = result.current.getThumbProps(1);
    expect(t0["aria-valuenow"]).toBe(20);
    expect(t1["aria-valuenow"]).toBe(70);
    expect(t0["aria-label"]).toBe("Minimum value");
    expect(t1["aria-label"]).toBe("Maximum value");
  });

  it("track fill left and width are correct", () => {
    const { result } = renderHook(() =>
      useRange({ defaultValue: [25, 75], min: 0, max: 100, mode: "range" }),
    );
    const fill = result.current.getTrackFillProps();
    expect(fill.style.left).toBe("25%");
    expect(fill.style.width).toBe("50%");
  });

  it("lower thumb ArrowRight increments by step", () => {
    const { result } = renderHook(() =>
      useRange({ defaultValue: [20, 70], step: 5, mode: "range" }),
    );
    act(() => {
      result.current.getThumbProps(0).onKeyDown({
        key: "ArrowRight",
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    expect((result.current.value as [number, number])[0]).toBe(25);
  });

  it("upper thumb ArrowLeft decrements by step", () => {
    const { result } = renderHook(() =>
      useRange({ defaultValue: [20, 70], step: 5, mode: "range" }),
    );
    act(() => {
      result.current.getThumbProps(1).onKeyDown({
        key: "ArrowLeft",
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    expect((result.current.value as [number, number])[1]).toBe(65);
  });

  it("thumbs do not cross: lower thumb clamped below upper", () => {
    const { result } = renderHook(() =>
      useRange({ defaultValue: [69, 70], step: 1, mode: "range" }),
    );
    act(() => {
      result.current.getThumbProps(0).onKeyDown({
        key: "ArrowRight",
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    const val = result.current.value as [number, number];
    expect(val[0]).toBeLessThan(val[1]);
  });

  it("thumbs do not cross: upper thumb clamped above lower", () => {
    const { result } = renderHook(() =>
      useRange({ defaultValue: [30, 31], step: 1, mode: "range" }),
    );
    act(() => {
      result.current.getThumbProps(1).onKeyDown({
        key: "ArrowLeft",
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    const val = result.current.value as [number, number];
    expect(val[1]).toBeGreaterThan(val[0]);
  });

  it("Home sets lower thumb to min", () => {
    const { result } = renderHook(() =>
      useRange({ defaultValue: [30, 70], min: 0, max: 100, mode: "range" }),
    );
    act(() => {
      result.current.getThumbProps(0).onKeyDown({
        key: "Home",
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    expect((result.current.value as [number, number])[0]).toBe(0);
  });

  it("End sets upper thumb to max", () => {
    const { result } = renderHook(() =>
      useRange({ defaultValue: [30, 70], min: 0, max: 100, mode: "range" }),
    );
    act(() => {
      result.current.getThumbProps(1).onKeyDown({
        key: "End",
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    expect((result.current.value as [number, number])[1]).toBe(100);
  });

  it("Shift+Arrow jumps 10% of range", () => {
    const { result } = renderHook(() =>
      useRange({ defaultValue: [0, 100], min: 0, max: 100, step: 1, mode: "range" }),
    );
    act(() => {
      result.current.getThumbProps(0).onKeyDown({
        key: "ArrowRight",
        shiftKey: true,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    expect((result.current.value as [number, number])[0]).toBe(10);
  });

  it("onChange fires on value change", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useRange({ defaultValue: [20, 80], mode: "range", onChange }),
    );
    act(() => {
      result.current.getThumbProps(0).onKeyDown({
        key: "ArrowRight",
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    expect(onChange).toHaveBeenCalled();
  });

  it("disabled prevents interaction", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useRange({ defaultValue: [20, 80], mode: "range", disabled: true, onChange }),
    );
    act(() => {
      result.current.getThumbProps(0).onKeyDown({
        key: "ArrowRight",
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("onChangeEnd fires on keyboard commit", () => {
    const onChangeEnd = vi.fn();
    const { result } = renderHook(() =>
      useRange({ defaultValue: [20, 80], mode: "range", onChangeEnd }),
    );
    act(() => {
      result.current.getThumbProps(0).onKeyDown({
        key: "ArrowRight",
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    expect(onChangeEnd).toHaveBeenCalled();
  });

  it("min/max clamping: value cannot exceed max", () => {
    const { result } = renderHook(() =>
      useRange({ defaultValue: [50, 100], min: 0, max: 100, step: 1, mode: "range" }),
    );
    act(() => {
      result.current.getThumbProps(1).onKeyDown({
        key: "ArrowRight",
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    expect((result.current.value as [number, number])[1]).toBe(100);
  });

  it("min/max clamping: value cannot go below min", () => {
    const { result } = renderHook(() =>
      useRange({ defaultValue: [0, 50], min: 0, max: 100, step: 1, mode: "range" }),
    );
    act(() => {
      result.current.getThumbProps(0).onKeyDown({
        key: "ArrowLeft",
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    expect((result.current.value as [number, number])[0]).toBe(0);
  });
});
