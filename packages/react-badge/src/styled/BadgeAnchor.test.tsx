import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BadgeAnchor } from "./BadgeAnchor";
import { BadgeStyled } from "./BadgeStyled";

describe("<BadgeAnchor />", () => {
  it("renders children", () => {
    const { getByText } = render(
      <BadgeAnchor badge={<BadgeStyled count={3} tone="danger" />}>
        <button>Icon</button>
      </BadgeAnchor>,
    );
    expect(getByText("Icon")).toBeInTheDocument();
  });

  it("renders the badge", () => {
    const { container } = render(
      <BadgeAnchor badge={<BadgeStyled count={3} tone="danger" />}>
        <button>Icon</button>
      </BadgeAnchor>,
    );
    expect(container.querySelector(".rbadge-anchor")).toBeInTheDocument();
    expect(container.querySelector(".rbadge-anchor__badge")).toBeInTheDocument();
    expect(container.querySelector(".rbadge-badge")).toBeInTheDocument();
  });

  it("applies rbadge-anchor class", () => {
    const { container } = render(
      <BadgeAnchor badge={<BadgeStyled count={1} />}>
        <span>child</span>
      </BadgeAnchor>,
    );
    const anchor = container.querySelector(".rbadge-anchor");
    expect(anchor).toBeInTheDocument();
  });

  it("applies custom className to wrapper", () => {
    const { container } = render(
      <BadgeAnchor badge={<BadgeStyled count={1} />} className="my-anchor">
        <span>child</span>
      </BadgeAnchor>,
    );
    const anchor = container.querySelector(".rbadge-anchor.my-anchor");
    expect(anchor).toBeInTheDocument();
  });

  it("positions badge span absolutely via inline style", () => {
    const { container } = render(
      <BadgeAnchor badge={<BadgeStyled count={5} />}>
        <span>child</span>
      </BadgeAnchor>,
    );
    const badgeSlot = container.querySelector<HTMLElement>(".rbadge-anchor__badge");
    expect(badgeSlot).toBeInTheDocument();
    expect(badgeSlot!.style.position).toBe("absolute");
  });

  it("uses custom offset values", () => {
    const { container } = render(
      <BadgeAnchor
        badge={<BadgeStyled count={2} />}
        offset={{ x: 4, y: 8 }}
      >
        <span>child</span>
      </BadgeAnchor>,
    );
    const badgeSlot = container.querySelector<HTMLElement>(".rbadge-anchor__badge");
    expect(badgeSlot!.style.top).toBe("8px");
    expect(badgeSlot!.style.right).toBe("4px");
  });
});
