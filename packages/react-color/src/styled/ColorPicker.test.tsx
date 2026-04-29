import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { HexColorPicker, HslaColorPicker, RgbaColorPicker } from "./ColorPicker";

describe("<HexColorPicker />", () => {
  test("renders saturation field, hue slider, and hex input by default", () => {
    const { container } = render(<HexColorPicker />);
    expect(container.querySelector(".rcp-saturation")).not.toBeNull();
    expect(container.querySelector(".rcp-hue")).not.toBeNull();
    expect(container.querySelector(".rcp-hex-input")).not.toBeNull();
  });

  test("does not render alpha slider by default", () => {
    const { container } = render(<HexColorPicker />);
    expect(container.querySelector(".rcp-alpha")).toBeNull();
  });

  test("renders alpha slider when showAlpha=true", () => {
    const { container } = render(<HexColorPicker showAlpha />);
    expect(container.querySelector(".rcp-alpha")).not.toBeNull();
  });

  test("hides hex input when showHexInput=false", () => {
    const { container } = render(<HexColorPicker showHexInput={false} />);
    expect(container.querySelector(".rcp-hex-input")).toBeNull();
  });

  test("hex input shows current value (defaultValue)", () => {
    // Use primary colors which roundtrip perfectly through HSV.
    render(<HexColorPicker defaultValue="#ff0000" />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value.toUpperCase()).toBe("FF0000");
  });

  test("color preview has a background style set", () => {
    // jsdom normalizes hex background to rgb(), so just verify the style is set.
    const { container } = render(<HexColorPicker defaultValue="#ff0000" />);
    const preview = container.querySelector(".rcp-preview") as HTMLElement;
    expect(preview.style.background).not.toBe("");
  });

  test("applies custom className", () => {
    const { container } = render(<HexColorPicker className="my-picker" />);
    expect(container.querySelector(".rcp-picker")).toHaveClass("my-picker");
  });

  test("renders controlled value", () => {
    const onChange = vi.fn();
    render(<HexColorPicker value="#00ff00" onChange={onChange} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value.toUpperCase()).toBe("00FF00");
  });
});

describe("<RgbaColorPicker />", () => {
  test("renders without errors", () => {
    const { container } = render(<RgbaColorPicker />);
    expect(container.querySelector(".rcp-picker")).not.toBeNull();
  });

  test("reflects defaultValue in hex input", () => {
    render(
      <RgbaColorPicker defaultValue={{ r: 255, g: 0, b: 0, a: 1 }} />,
    );
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value.toUpperCase()).toBe("FF0000");
  });
});

describe("<HslaColorPicker />", () => {
  test("renders without errors", () => {
    const { container } = render(<HslaColorPicker />);
    expect(container.querySelector(".rcp-picker")).not.toBeNull();
  });

  test("reflects defaultValue (hsl blue = #0000ff)", () => {
    render(
      <HslaColorPicker defaultValue={{ h: 240, s: 100, l: 50, a: 1 }} />,
    );
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value.toUpperCase()).toBe("0000FF");
  });
});
