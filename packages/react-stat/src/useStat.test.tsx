import { describe, it, expect } from "vitest";
import { useStat } from "./useStat";

describe("useStat", () => {
  it("rootProps.role is 'figure'", () => {
    const { rootProps } = useStat({ value: 100, label: "Total" });
    expect(rootProps.role).toBe("figure");
  });

  it("aria-label includes label and value", () => {
    const { rootProps } = useStat({ value: 500, label: "Users" });
    expect(rootProps["aria-label"]).toContain("Users");
    expect(rootProps["aria-label"]).toContain("500");
  });

  it("trendDirection is 'up' when trend > 0", () => {
    const { trendDirection } = useStat({ value: 100, label: "Sales", trend: 12.5 });
    expect(trendDirection).toBe("up");
  });

  it("trendDirection is 'down' when trend < 0", () => {
    const { trendDirection } = useStat({ value: 100, label: "Sales", trend: -5.2 });
    expect(trendDirection).toBe("down");
  });

  it("trendDirection is 'neutral' when trend === 0", () => {
    const { trendDirection } = useStat({ value: 100, label: "Sales", trend: 0 });
    expect(trendDirection).toBe("neutral");
  });

  it("trendDirection is undefined when no trend or previousValue", () => {
    const { trendDirection } = useStat({ value: 100, label: "Sales" });
    expect(trendDirection).toBeUndefined();
  });

  it("animatedValue equals value immediately when countUp=false", () => {
    const { animatedValue } = useStat({ value: 999, label: "Count", countUp: false });
    expect(animatedValue).toBe(999);
  });

  it("derives trend from previousValue correctly", () => {
    const prev = 200;
    const current = 250;
    const { trendDirection, rootProps } = useStat({
      value: current,
      label: "Revenue",
      previousValue: prev,
    });
    const derivedTrend = ((current - prev) / Math.abs(prev)) * 100;
    expect(derivedTrend).toBeCloseTo(25);
    expect(trendDirection).toBe("up");
    expect(rootProps["aria-label"]).toContain("25.0%");
  });
});
