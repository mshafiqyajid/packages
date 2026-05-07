import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProgressCircle } from "./ProgressCircle";

describe("<ProgressCircle />", () => {
  it("renders an svg with progressbar role", () => {
    render(<ProgressCircle value={50} />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("applies tone data-attribute", () => {
    render(<ProgressCircle value={50} tone="primary" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("data-tone", "primary");
  });

  it("renders a text value when showValue is true", () => {
    const { container } = render(<ProgressCircle value={40} showValue />);
    const text = container.querySelector(".rprog-circle-value");
    expect(text).not.toBeNull();
    expect(text?.textContent).toBe("40%");
  });

  it("uses formatValue when provided", () => {
    const { container } = render(
      <ProgressCircle
        value={75}
        showValue
        formatValue={(pct, val) => `${val} of 100 (${pct}%)`}
      />,
    );
    const text = container.querySelector(".rprog-circle-value");
    expect(text?.textContent).toBe("75 of 100 (75%)");
  });

  it("renders a label caption below the circle", () => {
    const { container } = render(<ProgressCircle value={60} label="Upload" />);
    const wrap = container.querySelector(".rprog-circle-wrap");
    expect(wrap).not.toBeNull();
    const label = container.querySelector(".rprog-circle-label");
    expect(label?.textContent).toBe("Upload");
  });

  it("does not wrap in .rprog-circle-wrap when no label is given", () => {
    const { container } = render(<ProgressCircle value={60} />);
    expect(container.querySelector(".rprog-circle-wrap")).toBeNull();
  });

  it("marks indeterminate state", () => {
    render(<ProgressCircle />);
    const svg = screen.getByRole("progressbar");
    expect(svg).toHaveAttribute("data-indeterminate", "true");
  });

  it("accepts a numeric size", () => {
    render(<ProgressCircle value={50} size={80} />);
    const svg = screen.getByRole("progressbar");
    expect(svg).toHaveAttribute("width", "80");
    expect(svg).toHaveAttribute("height", "80");
  });
});
