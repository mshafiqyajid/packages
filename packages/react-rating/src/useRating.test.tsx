import { act, renderHook } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { useRating } from "./useRating";

describe("useRating", () => {
  test("starts at 0 with default count of 5", () => {
    const { result } = renderHook(() => useRating());
    expect(result.current.value).toBe(0);
    expect(result.current.items).toHaveLength(5);
    expect(result.current.items.every((i) => i.fill === 0)).toBe(true);
  });

  test("respects defaultValue and computes per-item fill (half-step)", () => {
    const { result } = renderHook(() => useRating({ defaultValue: 3.5 }));
    expect(result.current.value).toBe(3.5);
    const fills = result.current.items.map((i) => i.fill);
    expect(fills).toEqual([1, 1, 1, 0.5, 0]);
  });

  test("snaps full-step values when allowHalf=false", () => {
    const { result } = renderHook(() =>
      useRating({ defaultValue: 3.5, allowHalf: false }),
    );
    // 3.5 snaps to 4 (round to nearest integer).
    expect(result.current.value).toBe(4);
    const fills = result.current.items.map((i) => i.fill);
    expect(fills).toEqual([1, 1, 1, 1, 0]);
  });

  test("clamps values outside 0..count", () => {
    const { result } = renderHook(() =>
      useRating({ defaultValue: 99, count: 5 }),
    );
    expect(result.current.value).toBe(5);
  });

  test("setValue commits and fires onChange", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useRating({ onChange }));
    act(() => {
      result.current.setValue(2.5);
    });
    expect(result.current.value).toBe(2.5);
    expect(onChange).toHaveBeenCalledWith(2.5);
  });

  test("clear sets to 0", () => {
    const { result } = renderHook(() => useRating({ defaultValue: 4 }));
    act(() => {
      result.current.clear();
    });
    expect(result.current.value).toBe(0);
  });

  test("readOnly blocks setValue", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useRating({ defaultValue: 2, readOnly: true, onChange }),
    );
    act(() => {
      result.current.setValue(4);
    });
    expect(result.current.value).toBe(2);
    expect(onChange).not.toHaveBeenCalled();
  });

  test("disabled blocks setValue", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useRating({ defaultValue: 2, disabled: true, onChange }),
    );
    act(() => {
      result.current.setValue(4);
    });
    expect(result.current.value).toBe(2);
    expect(onChange).not.toHaveBeenCalled();
  });

  test("controlled mode reflects external value", () => {
    const { result, rerender } = renderHook(
      (props: { value: number }) => useRating({ value: props.value }),
      { initialProps: { value: 1 } },
    );
    expect(result.current.value).toBe(1);
    rerender({ value: 4 });
    expect(result.current.value).toBe(4);
  });

  test("rootProps reflects disabled / readOnly", () => {
    const { result: r1 } = renderHook(() => useRating({ disabled: true }));
    expect(r1.current.rootProps["aria-disabled"]).toBe(true);
    const { result: r2 } = renderHook(() => useRating({ readOnly: true }));
    expect(r2.current.rootProps["aria-readonly"]).toBe(true);
  });

  test("items expose --rrt-fill style", () => {
    const { result } = renderHook(() => useRating({ defaultValue: 2.5 }));
    const styles = result.current.items.map(
      (i) => (i.style as Record<string, string>)["--rrt-fill"],
    );
    expect(styles).toEqual(["1", "1", "0.5", "0", "0"]);
  });

  test("async onChange sets isPending while promise is in flight", async () => {
    let resolve!: () => void;
    const onChange = vi.fn(
      () =>
        new Promise<void>((r) => {
          resolve = r;
        }),
    );
    const { result } = renderHook(() => useRating({ onChange }));
    act(() => {
      result.current.setValue(3);
    });
    expect(result.current.isPending).toBe(true);
    expect(result.current.rootProps["aria-busy"]).toBe(true);
    expect(result.current.value).toBe(3);

    await act(async () => {
      resolve();
      await Promise.resolve();
    });
    expect(result.current.isPending).toBe(false);
  });

  test("async onChange rejection reverts optimistic value", async () => {
    let reject!: (e: Error) => void;
    const onChange = vi.fn(
      () =>
        new Promise<void>((_, r) => {
          reject = r;
        }),
    );
    const { result } = renderHook(() =>
      useRating({ onChange, defaultValue: 2 }),
    );
    act(() => {
      result.current.setValue(4);
    });
    expect(result.current.value).toBe(4);

    await act(async () => {
      reject(new Error("nope"));
      await Promise.resolve();
    });
    expect(result.current.value).toBe(2);
    expect(result.current.isPending).toBe(false);
  });
});
