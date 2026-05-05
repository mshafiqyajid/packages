import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { RatingStyled } from "./RatingStyled";

describe("<RatingStyled />", () => {
  test("renders with default size and tone data-attrs", () => {
    const { container } = render(<RatingStyled count={5} />);
    const root = container.querySelector(".rrt-root") as HTMLElement;
    expect(root).toHaveAttribute("data-size", "md");
    expect(root).toHaveAttribute("data-tone", "warning");
  });

  test("forwards size and tone", () => {
    const { container } = render(
      <RatingStyled count={5} size="lg" tone="primary" />,
    );
    const root = container.querySelector(".rrt-root") as HTMLElement;
    expect(root).toHaveAttribute("data-size", "lg");
    expect(root).toHaveAttribute("data-tone", "primary");
  });

  test("renders label and hint when provided", () => {
    render(
      <RatingStyled count={5} label="How was it?" hint="Tap a star" />,
    );
    expect(screen.getByText("How was it?")).toBeInTheDocument();
    expect(screen.getByText("Tap a star")).toBeInTheDocument();
  });

  test("showValue renders the current numeric value", () => {
    render(<RatingStyled count={5} defaultValue={3.5} showValue />);
    expect(screen.getByText("3.5")).toBeInTheDocument();
  });

  test("formatValue overrides display formatter", () => {
    render(
      <RatingStyled
        count={5}
        defaultValue={3}
        showValue
        formatValue={(v, c) => `${v} / ${c}`}
      />,
    );
    expect(screen.getByText("3 / 5")).toBeInTheDocument();
  });

  test("error sets data-invalid + role=alert", () => {
    const { container } = render(
      <RatingStyled defaultValue={2} error="Required" />,
    );
    expect(container.querySelector("[data-invalid='true']")).not.toBeNull();
    expect(screen.getByRole("alert")).toHaveTextContent("Required");
  });

  test("invalid prop sets data-invalid without inline error", () => {
    const { container } = render(<RatingStyled defaultValue={2} invalid />);
    expect(container.querySelector("[data-invalid='true']")).not.toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  test("name renders hidden input with the current value", () => {
    const { container } = render(
      <RatingStyled name="stars" defaultValue={4} />,
    );
    const hidden = container.querySelector(
      "input[type='hidden'][name='stars']",
    ) as HTMLInputElement;
    expect(hidden).not.toBeNull();
    expect(hidden.value).toBe("4");
  });

  test("required surfaces aria-required", () => {
    const { container } = render(
      <RatingStyled defaultValue={1} name="r" required />,
    );
    expect(container.querySelector("[aria-required='true']")).not.toBeNull();
  });
});
