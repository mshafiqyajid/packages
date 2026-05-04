import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useChart } from "./useChart";
import type { DataPoint, SeriesDataPoint } from "./chartUtils";

describe("useChart", () => {
  const flatData: DataPoint[] = [
    { label: "A", value: 10 },
    { label: "B", value: 30 },
    { label: "C", value: 20 },
  ];

  const seriesData: SeriesDataPoint[] = [
    {
      label: "Q1",
      series: [
        { name: "Sales", values: [10] },
        { name: "Costs", values: [4] },
      ],
    },
    {
      label: "Q2",
      series: [
        { name: "Sales", values: [20] },
        { name: "Costs", values: [8] },
      ],
    },
  ];

  it("computes line viewBox and points for flat data", () => {
    const { result } = renderHook(() =>
      useChart({ data: flatData, type: "line", width: 400, height: 200 }),
    );
    expect(result.current.viewBox).toBe("0 0 400 200");
    expect(result.current.points).toHaveLength(3);
  });

  it("returns series array for line + series data", () => {
    const { result } = renderHook(() =>
      useChart({ data: seriesData, type: "line", width: 400, height: 200 }),
    );
    expect(result.current.series).toBeDefined();
    expect(result.current.series).toHaveLength(2);
    expect(result.current.series?.[0]?.name).toBe("Sales");
    expect(result.current.series?.[0]?.values).toEqual([10, 20]);
  });

  it("returns series array for grouped bar series", () => {
    const { result } = renderHook(() =>
      useChart({ data: seriesData, type: "bar", width: 400, height: 200 }),
    );
    expect(result.current.series).toHaveLength(2);
    expect(result.current.series?.[1]?.name).toBe("Costs");
    expect(result.current.series?.[1]?.values).toEqual([4, 8]);
  });

  it("respects domain='nice'", () => {
    const { result } = renderHook(() =>
      useChart({ data: flatData, type: "line", width: 400, height: 200, domain: "nice" }),
    );
    expect(result.current.scales.minValue).toBeLessThanOrEqual(10);
    expect(result.current.scales.maxValue).toBeGreaterThanOrEqual(30);
  });

  it("respects explicit domain bounds", () => {
    const { result } = renderHook(() =>
      useChart({ data: flatData, type: "line", width: 400, height: 200, domain: [0, 100] }),
    );
    expect(result.current.scales.minValue).toBe(0);
    expect(result.current.scales.maxValue).toBe(100);
  });

  it("pie returns paths and points per slice", () => {
    const { result } = renderHook(() =>
      useChart({ data: flatData, type: "pie", width: 200, height: 200 }),
    );
    expect(result.current.paths).toHaveLength(3);
    expect(result.current.points).toHaveLength(3);
  });

  it("donut option uses inner radius", () => {
    const { result } = renderHook(() =>
      useChart({ data: flatData, type: "pie", width: 200, height: 200, donut: true }),
    );
    expect(result.current.paths.every((p) => p.includes("A"))).toBe(true);
  });
});
