import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useProgress } from "./useProgress";

describe("useProgress", () => {
  it("returns correct progressProps role and aria attributes for a determinate value", () => {
    const { result } = renderHook(() => useProgress({ value: 50 }));
    expect(result.current.progressProps.role).toBe("progressbar");
    expect(result.current.progressProps["aria-valuenow"]).toBe(50);
    expect(result.current.progressProps["aria-valuemin"]).toBe(0);
    expect(result.current.progressProps["aria-valuemax"]).toBe(100);
  });

  it("computes percent correctly", () => {
    const { result } = renderHook(() => useProgress({ value: 25 }));
    expect(result.current.percent).toBe(25);
  });

  it("computes percent with custom min and max", () => {
    const { result } = renderHook(() => useProgress({ value: 150, min: 100, max: 200 }));
    expect(result.current.percent).toBe(50);
  });

  it("clamps value below min to 0%", () => {
    const { result } = renderHook(() => useProgress({ value: -10 }));
    expect(result.current.percent).toBe(0);
  });

  it("clamps value above max to 100%", () => {
    const { result } = renderHook(() => useProgress({ value: 150 }));
    expect(result.current.percent).toBe(100);
    expect(result.current.isComplete).toBe(true);
  });

  it("reports isComplete when value equals max", () => {
    const { result } = renderHook(() => useProgress({ value: 100 }));
    expect(result.current.isComplete).toBe(true);
  });

  it("reports isComplete false when value is below max", () => {
    const { result } = renderHook(() => useProgress({ value: 99 }));
    expect(result.current.isComplete).toBe(false);
  });

  it("is indeterminate when value is undefined", () => {
    const { result } = renderHook(() => useProgress({}));
    expect(result.current.isIndeterminate).toBe(true);
    expect(result.current.progressProps["aria-valuenow"]).toBeUndefined();
    expect(result.current.isComplete).toBe(false);
  });

  it("uses default min=0 and max=100", () => {
    const { result } = renderHook(() => useProgress({ value: 40 }));
    expect(result.current.progressProps["aria-valuemin"]).toBe(0);
    expect(result.current.progressProps["aria-valuemax"]).toBe(100);
  });

  it("returns percent 0 when range is zero", () => {
    const { result } = renderHook(() => useProgress({ value: 50, min: 50, max: 50 }));
    expect(result.current.percent).toBe(0);
  });
});
