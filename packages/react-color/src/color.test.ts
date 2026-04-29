import { describe, expect, test } from "vitest";
import {
  clamp,
  hsvaToHex,
  hsvaToHsla,
  hsvaToRgba,
  hsvToRgb,
  parseHex,
  rgbToHex,
  rgbToHsv,
  rgbaToHex,
  round,
  toHsva,
} from "./color";

describe("clamp", () => {
  test("clamps below min", () => expect(clamp(-5, 0, 100)).toBe(0));
  test("clamps above max", () => expect(clamp(200, 0, 100)).toBe(100));
  test("passes through in range", () => expect(clamp(50, 0, 100)).toBe(50));
});

describe("round", () => {
  test("default rounds to integer", () => expect(round(3.7)).toBe(4));
  test("rounds to precision", () => expect(round(3.456, 2)).toBe(3.46));
});

describe("hsvToRgb / rgbToHsv", () => {
  test("red", () => {
    expect(hsvToRgb({ h: 0, s: 100, v: 100 })).toEqual({ r: 255, g: 0, b: 0 });
    expect(rgbToHsv({ r: 255, g: 0, b: 0 })).toMatchObject({ h: 0, s: 100, v: 100 });
  });
  test("green", () => {
    expect(hsvToRgb({ h: 120, s: 100, v: 100 })).toEqual({ r: 0, g: 255, b: 0 });
  });
  test("blue", () => {
    expect(hsvToRgb({ h: 240, s: 100, v: 100 })).toEqual({ r: 0, g: 0, b: 255 });
  });
  test("white", () => {
    expect(hsvToRgb({ h: 0, s: 0, v: 100 })).toEqual({ r: 255, g: 255, b: 255 });
    expect(rgbToHsv({ r: 255, g: 255, b: 255 })).toMatchObject({ s: 0, v: 100 });
  });
  test("black", () => {
    expect(hsvToRgb({ h: 0, s: 0, v: 0 })).toEqual({ r: 0, g: 0, b: 0 });
    expect(rgbToHsv({ r: 0, g: 0, b: 0 })).toMatchObject({ s: 0, v: 0 });
  });
  test("roundtrip rgb→hsv→rgb", () => {
    const rgb = { r: 99, g: 102, b: 241 };
    const back = hsvToRgb(rgbToHsv(rgb));
    expect(back.r).toBeCloseTo(rgb.r, -1);
    expect(back.g).toBeCloseTo(rgb.g, -1);
    expect(back.b).toBeCloseTo(rgb.b, -1);
  });
});

describe("parseHex", () => {
  test("6-char hex", () => expect(parseHex("#6366f1")).toEqual({ r: 99, g: 102, b: 241, a: 1 }));
  test("3-char shorthand", () => expect(parseHex("#fff")).toEqual({ r: 255, g: 255, b: 255, a: 1 }));
  test("8-char with alpha", () => {
    const result = parseHex("#6366f1cc");
    expect(result?.r).toBe(99);
    expect(result?.a).toBeCloseTo(0.8, 1);
  });
  test("without # prefix", () => expect(parseHex("ff0000")).toEqual({ r: 255, g: 0, b: 0, a: 1 }));
  test("invalid returns null", () => expect(parseHex("xyz")).toBeNull());
  test("case insensitive", () => expect(parseHex("#FF0000")).toEqual({ r: 255, g: 0, b: 0, a: 1 }));
});

describe("rgbToHex / rgbaToHex", () => {
  test("red", () => expect(rgbToHex({ r: 255, g: 0, b: 0 })).toBe("#ff0000"));
  test("white", () => expect(rgbToHex({ r: 255, g: 255, b: 255 })).toBe("#ffffff"));
  test("with alpha 1 no suffix", () => expect(rgbaToHex({ r: 255, g: 0, b: 0, a: 1 }, true)).toBe("#ff0000"));
  test("with alpha < 1 includes suffix", () => {
    const hex = rgbaToHex({ r: 255, g: 0, b: 0, a: 0.5 }, true);
    expect(hex).toMatch(/^#ff0000[0-9a-f]{2}$/);
  });
});

describe("toHsva", () => {
  test("from hex string", () => {
    const result = toHsva("#ff0000");
    expect(result.h).toBe(0);
    expect(result.s).toBe(100);
    expect(result.v).toBe(100);
    expect(result.a).toBe(1);
  });
  test("from rgb object", () => {
    const result = toHsva({ r: 0, g: 255, b: 0 });
    expect(result.h).toBe(120);
    expect(result.a).toBe(1);
  });
  test("from rgba object preserves alpha", () => {
    const result = toHsva({ r: 255, g: 255, b: 255, a: 0.5 });
    expect(result.a).toBe(0.5);
  });
  test("from hsl object", () => {
    const result = toHsva({ h: 240, s: 100, l: 50 });
    expect(result.h).toBe(240);
    expect(result.a).toBe(1);
  });
  test("invalid hex returns black", () => {
    const result = toHsva("invalid");
    expect(result).toEqual({ h: 0, s: 0, v: 0, a: 1 });
  });
});

describe("hsvaToHex", () => {
  test("red", () => expect(hsvaToHex({ h: 0, s: 100, v: 100, a: 1 })).toBe("#ff0000"));
  test("white", () => expect(hsvaToHex({ h: 0, s: 0, v: 100, a: 1 })).toBe("#ffffff"));
  test("includes alpha when < 1", () => {
    expect(hsvaToHex({ h: 0, s: 100, v: 100, a: 0.5 })).toMatch(/^#ff0000[0-9a-f]{2}$/);
  });
});

describe("hsvaToRgba", () => {
  test("blue with alpha", () => {
    const r = hsvaToRgba({ h: 240, s: 100, v: 100, a: 0.8 });
    expect(r.r).toBe(0);
    expect(r.b).toBe(255);
    expect(r.a).toBe(0.8);
  });
});

describe("hsvaToHsla", () => {
  test("red", () => {
    const r = hsvaToHsla({ h: 0, s: 100, v: 100, a: 1 });
    expect(r.h).toBe(0);
    expect(r.l).toBe(50);
    expect(r.a).toBe(1);
  });
});
