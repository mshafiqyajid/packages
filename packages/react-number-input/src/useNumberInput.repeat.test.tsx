import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useNumberInput } from "./useNumberInput";

describe("hold-to-repeat", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not fire repeat before initialDelay elapses", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useNumberInput({
        defaultValue: 0,
        step: 1,
        onChange,
        repeat: { initialDelay: 500, interval: 80 },
      }),
    );

    act(() => {
      result.current.incrementProps.onPointerDown();
    });

    act(() => {
      vi.advanceTimersByTime(499);
    });

    expect(onChange).not.toHaveBeenCalled();
  });

  it("fires repeat after initialDelay elapses", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useNumberInput({
        defaultValue: 0,
        step: 1,
        onChange,
        repeat: { initialDelay: 500, interval: 80, accel: 1 },
      }),
    );

    act(() => {
      result.current.incrementProps.onPointerDown();
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(onChange).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(80);
    });

    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("stops repeating on pointerUp", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useNumberInput({
        defaultValue: 0,
        step: 1,
        onChange,
        repeat: { initialDelay: 200, interval: 50, accel: 1 },
      }),
    );

    act(() => {
      result.current.incrementProps.onPointerDown();
    });

    act(() => {
      vi.advanceTimersByTime(250);
    });

    const callsAfterDelay = onChange.mock.calls.length;

    act(() => {
      result.current.incrementProps.onPointerUp();
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(onChange.mock.calls.length).toBe(callsAfterDelay);
  });

  it("stops repeating on pointerLeave", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useNumberInput({
        defaultValue: 0,
        step: 1,
        onChange,
        repeat: { initialDelay: 200, interval: 50, accel: 1 },
      }),
    );

    act(() => {
      result.current.decrementProps.onPointerDown();
    });

    act(() => {
      vi.advanceTimersByTime(250);
    });

    const callsAfterDelay = onChange.mock.calls.length;

    act(() => {
      result.current.decrementProps.onPointerLeave();
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(onChange.mock.calls.length).toBe(callsAfterDelay);
  });

  it("uses default repeat timing when repeat prop is omitted", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useNumberInput({ defaultValue: 0, step: 1, onChange }),
    );

    act(() => {
      result.current.incrementProps.onPointerDown();
    });

    act(() => {
      vi.advanceTimersByTime(499);
    });

    expect(onChange).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("repeat accelerates when accel < 1", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useNumberInput({
        defaultValue: 0,
        step: 1,
        onChange,
        repeat: { initialDelay: 100, interval: 100, accel: 0.5 },
      }),
    );

    act(() => {
      result.current.incrementProps.onPointerDown();
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(onChange).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(onChange).toHaveBeenCalledTimes(2);

    act(() => {
      vi.advanceTimersByTime(25);
    });
    expect(onChange).toHaveBeenCalledTimes(3);
  });

  it("stepDir is 'up' when increment holds", () => {
    const { result } = renderHook(() =>
      useNumberInput({
        defaultValue: 0,
        step: 1,
        repeat: { initialDelay: 100, interval: 50, accel: 1 },
      }),
    );

    act(() => {
      result.current.incrementProps.onPointerDown();
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.stepDir).toBe("up");
  });

  it("stepDir is 'down' when decrement holds", () => {
    const { result } = renderHook(() =>
      useNumberInput({
        defaultValue: 10,
        step: 1,
        repeat: { initialDelay: 100, interval: 50, accel: 1 },
      }),
    );

    act(() => {
      result.current.decrementProps.onPointerDown();
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.stepDir).toBe("down");
  });
});
