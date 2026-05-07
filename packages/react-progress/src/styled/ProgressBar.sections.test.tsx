import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProgressBar } from "./ProgressBar";

describe("<ProgressBar sections />", () => {
  it("renders rprog-segment elements for each section", () => {
    const { container } = render(
      <ProgressBar
        sections={[
          { value: 40, tone: "primary", label: "Primary" },
          { value: 30, tone: "success", label: "Success" },
          { value: 30, tone: "danger",  label: "Danger" },
        ]}
      />,
    );
    const segs = container.querySelectorAll(".rprog-segment");
    expect(segs).toHaveLength(3);
  });

  it("sets data-tone on each segment", () => {
    const { container } = render(
      <ProgressBar
        sections={[
          { value: 50, tone: "warning" },
          { value: 50, tone: "success" },
        ]}
      />,
    );
    const segs = container.querySelectorAll(".rprog-segment");
    expect(segs[0]).toHaveAttribute("data-tone", "warning");
    expect(segs[1]).toHaveAttribute("data-tone", "success");
  });

  it("sets aria-label from section label", () => {
    const { container } = render(
      <ProgressBar
        sections={[{ value: 100, tone: "primary", label: "Upload" }]}
      />,
    );
    const seg = container.querySelector(".rprog-segment");
    expect(seg).toHaveAttribute("aria-label", "Upload");
  });

  it("renders rprog-segment-fill inside each segment", () => {
    const { container } = render(
      <ProgressBar sections={[{ value: 60 }, { value: 40 }]} />,
    );
    const fills = container.querySelectorAll(".rprog-segment-fill");
    expect(fills).toHaveLength(2);
  });

  it("falls back to bar tone when section has no tone", () => {
    const { container } = render(
      <ProgressBar tone="primary" sections={[{ value: 100 }]} />,
    );
    const seg = container.querySelector(".rprog-segment");
    expect(seg).toHaveAttribute("data-tone", "primary");
  });

  it("sets data-sections on the root element", () => {
    const { container } = render(
      <ProgressBar sections={[{ value: 100 }]} />,
    );
    const root = container.querySelector(".rprog-bar-root");
    expect(root).toHaveAttribute("data-sections", "true");
  });
});

describe("<ProgressBar bufferValue />", () => {
  it("renders rprog-buffer when bufferValue is set", () => {
    const { container } = render(<ProgressBar value={40} bufferValue={70} />);
    expect(container.querySelector(".rprog-buffer")).not.toBeNull();
  });

  it("does not render rprog-buffer when bufferValue is absent", () => {
    const { container } = render(<ProgressBar value={40} />);
    expect(container.querySelector(".rprog-buffer")).toBeNull();
  });

  it("sets the buffer width proportionally", () => {
    const { container } = render(<ProgressBar value={40} bufferValue={80} max={100} />);
    const buffer = container.querySelector<HTMLElement>(".rprog-buffer");
    expect(buffer?.style.width).toBe("80%");
  });

  it("clamps bufferValue to max", () => {
    const { container } = render(<ProgressBar value={40} bufferValue={200} max={100} />);
    const buffer = container.querySelector<HTMLElement>(".rprog-buffer");
    expect(buffer?.style.width).toBe("100%");
  });

  it("does not render rprog-buffer when sections prop is set", () => {
    const { container } = render(
      <ProgressBar bufferValue={70} sections={[{ value: 100 }]} />,
    );
    expect(container.querySelector(".rprog-buffer")).toBeNull();
  });
});
