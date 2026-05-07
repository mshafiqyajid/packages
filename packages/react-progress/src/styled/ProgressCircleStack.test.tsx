import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProgressCircleStack } from "./ProgressCircleStack";

describe("<ProgressCircleStack />", () => {
  it("renders rprog-stack wrapper", () => {
    const { container } = render(
      <ProgressCircleStack rings={[{ value: 80, tone: "primary" }]} />,
    );
    expect(container.querySelector(".rprog-stack")).not.toBeNull();
  });

  it("renders one circle per ring", () => {
    const { container } = render(
      <ProgressCircleStack
        rings={[
          { value: 80, tone: "primary" },
          { value: 55, tone: "success" },
          { value: 30, tone: "warning" },
        ]}
      />,
    );
    const circles = container.querySelectorAll(".rprog-circle");
    expect(circles).toHaveLength(3);
  });

  it("caps at 4 rings", () => {
    const { container } = render(
      <ProgressCircleStack
        rings={[
          { value: 90 },
          { value: 70 },
          { value: 50 },
          { value: 30 },
          { value: 10 },
        ]}
      />,
    );
    const circles = container.querySelectorAll(".rprog-circle");
    expect(circles).toHaveLength(4);
  });

  it("renders legend when any ring has a label", () => {
    const { container } = render(
      <ProgressCircleStack rings={[{ value: 60, label: "Move" }]} />,
    );
    expect(container.querySelector(".rprog-stack-legend")).not.toBeNull();
  });

  it("shows ring label text in legend", () => {
    const { getByText } = render(
      <ProgressCircleStack rings={[{ value: 60, label: "Move" }]} />,
    );
    expect(getByText("Move")).not.toBeNull();
  });

  it("applies tone to each ring", () => {
    const { container } = render(
      <ProgressCircleStack
        rings={[
          { value: 80, tone: "danger" },
          { value: 40, tone: "success" },
        ]}
      />,
    );
    const circles = container.querySelectorAll(".rprog-circle");
    expect(circles[0]).toHaveAttribute("data-tone", "danger");
    expect(circles[1]).toHaveAttribute("data-tone", "success");
  });

  it("uses default size of 120", () => {
    const { container } = render(
      <ProgressCircleStack rings={[{ value: 50 }]} />,
    );
    const stack = container.querySelector<HTMLElement>(".rprog-stack");
    expect(stack?.style.width).toBe("120px");
    expect(stack?.style.height).toBe("120px");
  });

  it("respects custom size prop", () => {
    const { container } = render(
      <ProgressCircleStack rings={[{ value: 50 }]} size={80} />,
    );
    const stack = container.querySelector<HTMLElement>(".rprog-stack");
    expect(stack?.style.width).toBe("80px");
  });
});
