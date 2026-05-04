import { describe, it, expect } from "vitest";
import {
  scaleLinear,
  normalize,
  computeLinePoints,
  pointsToPolyline,
  pointsToSmoothPath,
  arcPath,
  donutArcPath,
  computePieSlices,
  midAngle,
  polarToCartesian,
  resolveColor,
  niceDomain,
  resolveDomain,
  getPalette,
  PALETTES,
  DEFAULT_PALETTE,
} from "./chartUtils";

describe("scaleLinear", () => {
  it("maps domain min to range min", () => {
    expect(scaleLinear(0, 0, 100, 0, 500)).toBe(0);
  });

  it("maps domain max to range max", () => {
    expect(scaleLinear(100, 0, 100, 0, 500)).toBe(500);
  });

  it("maps midpoint correctly", () => {
    expect(scaleLinear(50, 0, 100, 0, 200)).toBe(100);
  });

  it("returns midpoint of range when domain is flat", () => {
    expect(scaleLinear(5, 5, 5, 0, 100)).toBe(50);
  });

  it("handles inverted range (y-axis flip)", () => {
    expect(scaleLinear(0, 0, 10, 100, 0)).toBe(100);
    expect(scaleLinear(10, 0, 10, 100, 0)).toBe(0);
  });
});

describe("normalize", () => {
  it("returns 0.5 for a flat series", () => {
    expect(normalize([7, 7, 7])).toEqual([0.5, 0.5, 0.5]);
  });

  it("min maps to 0 and max maps to 1", () => {
    const result = normalize([0, 50, 100]);
    expect(result[0]).toBe(0);
    expect(result[2]).toBe(1);
  });

  it("preserves length", () => {
    const input = [1, 2, 3, 4, 5];
    expect(normalize(input)).toHaveLength(5);
  });
});

describe("computeLinePoints", () => {
  const data = [
    { label: "A", value: 0 },
    { label: "B", value: 50 },
    { label: "C", value: 100 },
  ];

  it("returns one point per data item", () => {
    const pts = computeLinePoints(data, 400, 200);
    expect(pts).toHaveLength(3);
  });

  it("first point is at left padding", () => {
    const pts = computeLinePoints(data, 400, 200, 40);
    expect(pts[0]!.x).toBe(40);
  });

  it("last point is at width - padding", () => {
    const pts = computeLinePoints(data, 400, 200, 40);
    expect(pts[2]!.x).toBe(360);
  });

  it("min value maps to bottom of plot area", () => {
    const pts = computeLinePoints(data, 400, 200, 40);
    expect(pts[0]!.y).toBe(160);
  });

  it("max value maps to top of plot area", () => {
    const pts = computeLinePoints(data, 400, 200, 40);
    expect(pts[2]!.y).toBe(40);
  });

  it("returns empty array for empty data", () => {
    expect(computeLinePoints([], 400, 200)).toEqual([]);
  });

  it("single point is centered horizontally", () => {
    const pts = computeLinePoints([{ label: "A", value: 5 }], 400, 200, 40);
    expect(pts[0]!.x).toBe(40 + (400 - 80) / 2);
  });
});

describe("pointsToPolyline", () => {
  it("formats points as SVG polyline string", () => {
    const result = pointsToPolyline([
      { x: 10, y: 20 },
      { x: 30, y: 40 },
    ]);
    expect(result).toBe("10,20 30,40");
  });

  it("returns empty string for no points", () => {
    expect(pointsToPolyline([])).toBe("");
  });
});

describe("pointsToSmoothPath", () => {
  it("starts with M command", () => {
    const path = pointsToSmoothPath([
      { x: 0, y: 0 },
      { x: 100, y: 50 },
    ]);
    expect(path.startsWith("M")).toBe(true);
  });

  it("contains C (cubic bezier) segments for multi-point input", () => {
    const path = pointsToSmoothPath([
      { x: 0, y: 0 },
      { x: 100, y: 50 },
      { x: 200, y: 20 },
    ]);
    expect(path).toContain("C");
  });

  it("returns empty string for empty input", () => {
    expect(pointsToSmoothPath([])).toBe("");
  });

  it("returns M-only path for single point", () => {
    expect(pointsToSmoothPath([{ x: 5, y: 10 }])).toBe("M 5 10");
  });
});

describe("arcPath", () => {
  it("returns a path string starting with M", () => {
    const p = arcPath(100, 100, 50, -90, 0);
    expect(p.startsWith("M")).toBe(true);
  });

  it("includes Z (close path) command", () => {
    expect(arcPath(100, 100, 50, 0, 90)).toContain("Z");
  });

  it("uses large-arc flag 0 for < 180 deg span", () => {
    const p = arcPath(100, 100, 50, 0, 90);
    expect(p).toContain(" 0 1 ");
  });

  it("uses large-arc flag 1 for > 180 deg span", () => {
    const p = arcPath(100, 100, 50, 0, 270);
    expect(p).toContain(" 1 1 ");
  });
});

describe("donutArcPath", () => {
  it("returns a closed path", () => {
    const p = donutArcPath(100, 100, 80, 50, 0, 90);
    expect(p).toContain("Z");
  });

  it("includes two arc commands for outer and inner rings", () => {
    const p = donutArcPath(100, 100, 80, 50, 0, 180);
    const arcCount = (p.match(/\bA\b/g) ?? []).length;
    expect(arcCount).toBe(2);
  });
});

describe("computePieSlices", () => {
  const data = [
    { label: "A", value: 50 },
    { label: "B", value: 50 },
  ];

  it("returns one slice per data point", () => {
    expect(computePieSlices(data)).toHaveLength(2);
  });

  it("spans a full 360 degrees total", () => {
    const slices = computePieSlices(data);
    const last = slices[slices.length - 1]!;
    expect(last.endAngle - slices[0]!.startAngle).toBeCloseTo(360);
  });

  it("equal values produce equal span", () => {
    const slices = computePieSlices(data);
    const span0 = slices[0]!.endAngle - slices[0]!.startAngle;
    const span1 = slices[1]!.endAngle - slices[1]!.startAngle;
    expect(span0).toBeCloseTo(span1);
  });

  it("returns empty array when total is 0", () => {
    expect(computePieSlices([{ label: "X", value: 0 }])).toEqual([]);
  });

  it("starts at -90 degrees (top of circle)", () => {
    const slices = computePieSlices(data);
    expect(slices[0]!.startAngle).toBe(-90);
  });
});

describe("midAngle", () => {
  it("returns the arithmetic mean of start and end angles", () => {
    expect(midAngle(0, 90)).toBe(45);
    expect(midAngle(-90, 90)).toBe(0);
  });
});

describe("polarToCartesian", () => {
  it("angle 0 maps to (cx + r, cy)", () => {
    const { x, y } = polarToCartesian(0, 0, 10, 0);
    expect(x).toBeCloseTo(10);
    expect(y).toBeCloseTo(0);
  });

  it("angle 90 maps to (cx, cy + r)", () => {
    const { x, y } = polarToCartesian(0, 0, 10, 90);
    expect(x).toBeCloseTo(0);
    expect(y).toBeCloseTo(10);
  });
});

describe("resolveColor", () => {
  it("returns the provided color when given", () => {
    expect(resolveColor("#ff0000", 0)).toBe("#ff0000");
  });

  it("falls back to palette color by index", () => {
    expect(resolveColor(undefined, 0)).toBe(DEFAULT_PALETTE[0]);
    expect(resolveColor(undefined, 1)).toBe(DEFAULT_PALETTE[1]);
  });

  it("wraps around palette when index exceeds length", () => {
    const idx = DEFAULT_PALETTE.length;
    expect(resolveColor(undefined, idx)).toBe(DEFAULT_PALETTE[0]);
  });

  it("uses provided palette when supplied", () => {
    const custom = ["#aaa", "#bbb"];
    expect(resolveColor(undefined, 0, custom)).toBe("#aaa");
    expect(resolveColor(undefined, 1, custom)).toBe("#bbb");
  });
});

describe("niceDomain", () => {
  it("rounds [0, 9] to a tidy domain", () => {
    const [min, max, ticks] = niceDomain(0, 9);
    expect(min).toBe(0);
    expect(max).toBeGreaterThanOrEqual(9);
    expect(ticks.length).toBeGreaterThan(2);
  });

  it("expands flat domains around the value", () => {
    const [min, max] = niceDomain(5, 5);
    expect(min).toBeLessThan(5);
    expect(max).toBeGreaterThan(5);
  });

  it("handles zero domain by returning [0,1]", () => {
    const [min, max] = niceDomain(0, 0);
    expect(min).toBe(0);
    expect(max).toBe(1);
  });

  it("returns evenly stepped ticks", () => {
    const [, , ticks] = niceDomain(0, 100, 5);
    const steps = ticks.slice(1).map((t, i) => t - ticks[i]!);
    const first = steps[0];
    expect(steps.every((s) => Math.abs(s - first!) < 1e-9)).toBe(true);
  });
});

describe("resolveDomain", () => {
  it("returns the data extent when no domain prop given", () => {
    const r = resolveDomain(2, 8, undefined);
    expect(r.min).toBe(2);
    expect(r.max).toBe(8);
    expect(r.ticks).toBeUndefined();
  });

  it("returns nice min/max + ticks when domain='nice'", () => {
    const r = resolveDomain(1, 9, "nice");
    expect(r.ticks).toBeDefined();
    expect(r.min).toBeLessThanOrEqual(1);
    expect(r.max).toBeGreaterThanOrEqual(9);
  });

  it("respects explicit numeric tuple bounds", () => {
    const r = resolveDomain(2, 8, [0, 10]);
    expect(r.min).toBe(0);
    expect(r.max).toBe(10);
  });

  it("uses 'auto' to defer to data extent", () => {
    const r = resolveDomain(2, 8, ["auto", 100]);
    expect(r.min).toBe(2);
    expect(r.max).toBe(100);
  });
});

describe("getPalette", () => {
  it("default returns DEFAULT_PALETTE", () => {
    expect(getPalette("default")).toEqual(DEFAULT_PALETTE);
  });

  it("returns named palettes for each scheme", () => {
    expect(getPalette("warm").length).toBeGreaterThan(0);
    expect(getPalette("cool").length).toBeGreaterThan(0);
    expect(getPalette("muted").length).toBeGreaterThan(0);
    expect(getPalette("vivid").length).toBeGreaterThan(0);
    expect(getPalette("mono").length).toBeGreaterThan(0);
  });

  it("PALETTES exports six schemes", () => {
    expect(Object.keys(PALETTES)).toEqual(
      expect.arrayContaining(["default", "warm", "cool", "muted", "vivid", "mono"]),
    );
  });
});
