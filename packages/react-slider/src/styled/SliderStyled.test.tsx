import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SliderStyled } from "./SliderStyled";

describe("SliderStyled — form-input parity", () => {
  it("renders label and hint", () => {
    render(<SliderStyled label="Volume" hint="0–100" defaultValue={50} />);
    expect(screen.getByText("Volume")).toBeInTheDocument();
    expect(screen.getByText("0–100")).toBeInTheDocument();
  });

  it("error sets data-invalid + aria-invalid + role=alert", () => {
    const { container } = render(
      <SliderStyled defaultValue={50} error="Out of bounds" />,
    );
    expect(container.querySelector("[data-invalid='true']")).not.toBeNull();
    expect(screen.getByRole("alert")).toHaveTextContent("Out of bounds");
  });

  it("invalid prop sets data-invalid without inline error", () => {
    const { container } = render(<SliderStyled defaultValue={50} invalid />);
    expect(container.querySelector("[data-invalid='true']")).not.toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("name posts a hidden input for single value", () => {
    const { container } = render(
      <SliderStyled name="volume" defaultValue={42} />,
    );
    const hidden = container.querySelector(
      "input[type='hidden'][name='volume']",
    ) as HTMLInputElement;
    expect(hidden).not.toBeNull();
    expect(hidden.value).toBe("42");
  });

  it("range mode posts two hidden inputs (name + name-end)", () => {
    const { container } = render(
      <SliderStyled name="price" range defaultValue={[10, 90]} />,
    );
    const lo = container.querySelector(
      "input[type='hidden'][name='price']",
    ) as HTMLInputElement;
    const hi = container.querySelector(
      "input[type='hidden'][name='price-end']",
    ) as HTMLInputElement;
    expect(lo.value).toBe("10");
    expect(hi.value).toBe("90");
  });

  it("required surfaces aria-required", () => {
    const { container } = render(<SliderStyled name="v" required defaultValue={5} />);
    expect(container.querySelector("[aria-required='true']")).not.toBeNull();
  });
});
