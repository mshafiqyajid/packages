import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BadgeStyled } from "./BadgeStyled";

describe("<BadgeStyled /> count & animation", () => {
  it("renders count value", () => {
    const { getByText } = render(<BadgeStyled count={7} />);
    expect(getByText("7")).toBeInTheDocument();
  });

  it("renders capped count with maxCount+", () => {
    const { getByText } = render(<BadgeStyled count={150} maxCount={99} />);
    expect(getByText("99+")).toBeInTheDocument();
  });

  it("renders 0 count when showZero is true", () => {
    const { getByText } = render(<BadgeStyled count={0} showZero />);
    expect(getByText("0")).toBeInTheDocument();
  });

  it("hides when hideOnZero and count=0 and no content", () => {
    const { container } = render(<BadgeStyled count={0} hideOnZero />);
    expect(container.firstChild).toBeNull();
  });

  it("count span has no data-dir on first render", () => {
    const { container } = render(<BadgeStyled count={3} />);
    const countEl = container.querySelector(".rbadge-count");
    expect(countEl).toBeInTheDocument();
    expect(countEl).not.toHaveAttribute("data-dir");
  });

  it("updates count display when count prop changes", () => {
    const { rerender, getByText } = render(<BadgeStyled count={3} />);
    expect(getByText("3")).toBeInTheDocument();
    rerender(<BadgeStyled count={5} />);
    expect(getByText("5")).toBeInTheDocument();
  });

  it("sets data-dir=up when count increases", () => {
    const { container, rerender } = render(<BadgeStyled count={3} />);
    rerender(<BadgeStyled count={5} />);
    const countEl = container.querySelector(".rbadge-count");
    expect(countEl).toHaveAttribute("data-dir", "up");
  });

  it("sets data-dir=down when count decreases", () => {
    const { container, rerender } = render(<BadgeStyled count={5} />);
    rerender(<BadgeStyled count={2} />);
    const countEl = container.querySelector(".rbadge-count");
    expect(countEl).toHaveAttribute("data-dir", "down");
  });

  it("sets data-mounted=true after mount", async () => {
    const { container } = render(<BadgeStyled count={1} />);
    await new Promise((r) => setTimeout(r, 0));
    const badge = container.querySelector(".rbadge-badge");
    expect(badge).toHaveAttribute("data-mounted", "true");
  });

  it("renders count aria-label", () => {
    const { container } = render(<BadgeStyled count={5} />);
    const countEl = container.querySelector(".rbadge-count");
    expect(countEl).toHaveAttribute("aria-label", "5 items");
  });

  it("renders capped aria-label", () => {
    const { container } = render(<BadgeStyled count={200} maxCount={99} />);
    const countEl = container.querySelector(".rbadge-count");
    expect(countEl).toHaveAttribute("aria-label", "99+ items");
  });
});
