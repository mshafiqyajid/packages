import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProgressBar } from "./ProgressBar";

describe("<ProgressBar />", () => {
  it("renders a progressbar", () => {
    render(<ProgressBar value={50} />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("shows a label", () => {
    render(<ProgressBar value={50} label="Uploading" />);
    expect(screen.getByText("Uploading")).toBeInTheDocument();
  });

  it("shows the default percentage value when showValue is true", () => {
    render(<ProgressBar value={42} showValue />);
    expect(screen.getByText("42%")).toBeInTheDocument();
  });

  it("uses formatValue when provided", () => {
    render(
      <ProgressBar
        value={42}
        showValue
        formatValue={(_pct, val) => `${val} / 100`}
      />,
    );
    expect(screen.getByText("42 / 100")).toBeInTheDocument();
  });

  it("renders segments when segments prop is given", () => {
    const { container } = render(<ProgressBar value={60} segments={5} />);
    const segs = container.querySelectorAll(".rprog-bar-segment");
    expect(segs).toHaveLength(5);
  });

  it("animateValue=false shows exact percent without rAF delay", () => {
    render(<ProgressBar value={77} showValue animateValue={false} />);
    expect(screen.getByText("77%")).toBeInTheDocument();
  });

  it("applies tone", () => {
    const { container } = render(<ProgressBar value={50} tone="success" />);
    const root = container.querySelector(".rprog-bar-root");
    expect(root).toHaveAttribute("data-tone", "success");
  });

  it("applies size", () => {
    const { container } = render(<ProgressBar value={50} size="lg" />);
    const root = container.querySelector(".rprog-bar-root");
    expect(root).toHaveAttribute("data-size", "lg");
  });
});
