import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useColorInput } from "./useColorInput";
import { isValidHex, normalizeHex, hexToRgb, rgbToHex, hexToHsl, hslToHex } from "./colorUtils";

describe("isValidHex", () => {
  it("accepts 6-digit hex with hash", () => {
    expect(isValidHex("#aabbcc")).toBe(true);
  });

  it("accepts 3-digit hex with hash", () => {
    expect(isValidHex("#abc")).toBe(true);
  });

  it("rejects hex without hash", () => {
    expect(isValidHex("aabbcc")).toBe(false);
  });

  it("rejects invalid characters", () => {
    expect(isValidHex("#gggggg")).toBe(false);
  });

  it("rejects partial hex", () => {
    expect(isValidHex("#12345")).toBe(false);
  });
});

describe("normalizeHex", () => {
  it("expands 3-digit to 6-digit", () => {
    expect(normalizeHex("#abc")).toBe("#aabbcc");
  });

  it("lowercases 6-digit hex", () => {
    expect(normalizeHex("#AABBCC")).toBe("#aabbcc");
  });
});

describe("hexToRgb / rgbToHex", () => {
  it("converts white correctly", () => {
    expect(hexToRgb("#ffffff")).toEqual({ r: 255, g: 255, b: 255 });
  });

  it("converts black correctly", () => {
    expect(hexToRgb("#000000")).toEqual({ r: 0, g: 0, b: 0 });
  });

  it("round-trips hex -> rgb -> hex", () => {
    expect(rgbToHex(hexToRgb("#6366f1"))).toBe("#6366f1");
  });
});

describe("hexToHsl / hslToHex", () => {
  it("red has hue 0", () => {
    const hsl = hexToHsl("#ff0000");
    expect(hsl.h).toBe(0);
    expect(hsl.s).toBe(100);
    expect(hsl.l).toBe(50);
  });
});

describe("useColorInput", () => {
  it("defaults to #000000 when no defaultValue given", () => {
    const { result } = renderHook(() => useColorInput());
    expect(result.current.currentHex).toBe("#000000");
    expect(result.current.isValid).toBe(true);
  });

  it("uses provided defaultValue", () => {
    const { result } = renderHook(() =>
      useColorInput({ defaultValue: "#ff0000" }),
    );
    expect(result.current.currentHex).toBe("#ff0000");
  });

  it("picker is closed by default", () => {
    const { result } = renderHook(() => useColorInput());
    expect(result.current.isOpen).toBe(false);
  });

  it("open() opens the picker", () => {
    const { result } = renderHook(() => useColorInput());
    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);
  });

  it("close() closes the picker", () => {
    const { result } = renderHook(() => useColorInput());
    act(() => result.current.open());
    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
  });

  it("toggle() toggles the picker", () => {
    const { result } = renderHook(() => useColorInput());
    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(true);
    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(false);
  });

  it("disabled prevents open()", () => {
    const { result } = renderHook(() =>
      useColorInput({ disabled: true }),
    );
    act(() => result.current.open());
    expect(result.current.isOpen).toBe(false);
  });

  it("disabled prevents toggle()", () => {
    const { result } = renderHook(() =>
      useColorInput({ disabled: true }),
    );
    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(false);
  });

  it("setHex updates currentHex and calls onChange", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useColorInput({ defaultValue: "#000000", onChange }),
    );
    act(() => result.current.setHex("#ff0000"));
    expect(result.current.currentHex).toBe("#ff0000");
    expect(onChange).toHaveBeenCalledWith("#ff0000");
  });

  it("setHex ignores invalid hex", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useColorInput({ defaultValue: "#000000", onChange }),
    );
    act(() => result.current.setHex("invalid"));
    expect(result.current.currentHex).toBe("#000000");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("isValid is false when inputText is invalid", () => {
    const { result } = renderHook(() => useColorInput());
    const syntheticEvent = {
      target: { value: "#xyz" },
    } as React.ChangeEvent<HTMLInputElement>;
    act(() => result.current.inputProps.onChange(syntheticEvent));
    expect(result.current.isValid).toBe(false);
  });

  it("inputProps.disabled mirrors disabled option", () => {
    const { result } = renderHook(() =>
      useColorInput({ disabled: true }),
    );
    expect(result.current.inputProps.disabled).toBe(true);
    expect(result.current.swatchProps.disabled).toBe(true);
  });

  it("swatchProps has correct aria attributes", () => {
    const { result } = renderHook(() => useColorInput());
    expect(result.current.swatchProps["aria-haspopup"]).toBe("dialog");
    expect(result.current.swatchProps["aria-expanded"]).toBe(false);
    act(() => result.current.open());
    expect(result.current.swatchProps["aria-expanded"]).toBe(true);
  });
});
