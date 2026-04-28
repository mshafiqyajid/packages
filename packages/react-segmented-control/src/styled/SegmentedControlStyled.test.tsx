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
});
