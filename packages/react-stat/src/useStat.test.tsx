import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useStat } from "./useStat";

describe("useStat", () => {
  it("rootProps.role is 'figure'", () => {
    const { result } = renderHook(() => useStat({ value: 100, label: "Total" }));
    expect(result.current.rootProps.role).toBe("figure");
  });

  it("aria-label includes label and value", () => {
    const { result } = renderHook(() => useStat({ value: 500, label: "Users" }));
    expect(result.current.rootProps["aria-label"]).toContain("Users");
    expect(result.current.rootProps["aria-label"]).toContain("500");
  });

  it("trendDirection is 'up' when trend > 0", () => {
    const { result } = renderHook(() => useStat({ value: 100, label: "Sales", trend: 12.5 }));
    expect(result.current.trendDirection).toBe("up");
  });

  it("trendDirection is 'down' when trend < 0", () => {
    const { result } = renderHook(() => useStat({ value: 100, label: "Sales", trend: -5.2 }));
    expect(result.current.trendDirection).toBe("down");
  });

  it("trendDirection is 'neutral' when trend === 0", () => {
    const { result } = renderHook(() => useStat({ value: 100, label: "Sales", trend: 0 }));
    expect(result.current.trendDirection).toBe("neutral");
  });

  it("trendDirection is undefined when no trend or previousValue", () => {
    const { result } = renderHook(() => useStat({ value: 100, label: "Sales" }));
    expect(result.current.trendDirection).toBeUndefined();
  });

  it("animatedValue equals value immediately when countUp=false", () => {
    const { result } = renderHook(() => useStat({ value: 999, label: "Count", countUp: false }));
    expect(result.current.animatedValue).toBe(999);
  });

  it("derives trend from previousValue correctly", () => {
    const prev = 200;
    const current = 250;
    const { result } = renderHook(() =>
      useStat({ value: current, label: "Revenue", previousValue: prev }),
    );
    const derivedTrend = ((current - prev) / Math.abs(prev)) * 100;
    expect(derivedTrend).toBeCloseTo(25);
    expect(result.current.trendDirection).toBe("up");
    expect(result.current.rootProps["aria-label"]).toContain("25.0%");
  });
});
