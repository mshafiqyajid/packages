import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { SegmentedControlStyled } from "./SegmentedControlStyled";

describe("<SegmentedControlStyled />", () => {
  test("renders with default variant/size/tone data-attrs", () => {
    const { container } = render(
      <SegmentedControlStyled options={["a", "b"]} />,
    );
    const track = container.querySelector(".rsc-track") as HTMLElement;
    expect(track).toHaveAttribute("data-variant", "solid");
    expect(track).toHaveAttribute("data-size", "md");
    expect(track).toHaveAttribute("data-tone", "primary");
  });

  test("forwards variant/size/tone", () => {
    const { container } = render(
      <SegmentedControlStyled
        options={["a", "b"]}
        variant="pill"
        size="lg"
        tone="success"
      />,
    );
    const track = container.querySelector(".rsc-track") as HTMLElement;
    expect(track).toHaveAttribute("data-variant", "pill");
    expect(track).toHaveAttribute("data-size", "lg");
    expect(track).toHaveAttribute("data-tone", "success");
  });

  test("fullWidth sets data-full-width", () => {
    const { container } = render(
      <SegmentedControlStyled options={["a", "b"]} fullWidth />,
    );
    expect(container.querySelector(".rsc-track")).toHaveAttribute(
      "data-full-width",
      "true",
    );
  });

  test("renders label above when provided", () => {
    render(
      <SegmentedControlStyled options={["a", "b"]} label="Time range" />,
    );
    expect(screen.getByText("Time range")).toBeInTheDocument();
  });

  test("renders hint below when provided", () => {
    render(
      <SegmentedControlStyled options={["a", "b"]} hint="Pick one" />,
    );
    expect(screen.getByText("Pick one")).toBeInTheDocument();
  });

  test("error sets data-invalid + aria-invalid + role=alert text", () => {
    const { container } = render(
      <SegmentedControlStyled options={["a", "b"]} error="Required" />,
    );
    expect(container.querySelector("[data-invalid='true']")).not.toBeNull();
    expect(screen.getByRole("alert")).toHaveTextContent("Required");
  });

  test("invalid prop sets data-invalid without inline error", () => {
    const { container } = render(
      <SegmentedControlStyled options={["a", "b"]} invalid />,
    );
    expect(container.querySelector("[data-invalid='true']")).not.toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  test("name renders hidden input carrying String(value)", () => {
    const { container } = render(
      <SegmentedControlStyled options={["a", "b"]} name="choice" defaultValue="b" />,
    );
    const hidden = container.querySelector(
      "input[type='hidden'][name='choice']",
    ) as HTMLInputElement;
    expect(hidden).not.toBeNull();
    expect(hidden.value).toBe("b");
  });

  test("required surfaces aria-required", () => {
    const { container } = render(
      <SegmentedControlStyled options={["a", "b"]} required name="x" />,
    );
    expect(container.querySelector("[aria-required='true']")).not.toBeNull();
  });
});
