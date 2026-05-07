import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AvatarStyled } from "./AvatarStyled";

describe("<AvatarStyled />", () => {
  it("renders without crashing", () => {
    const { container } = render(<AvatarStyled name="Jane Doe" />);
    expect(container.querySelector(".rav-avatar")).not.toBeNull();
  });

  it("applies shape data-attribute", () => {
    const { container } = render(<AvatarStyled name="Jane Doe" shape="square" />);
    const avatar = container.querySelector(".rav-avatar");
    expect(avatar).toHaveAttribute("data-shape", "square");
  });

  it("applies size data-attribute", () => {
    const { container } = render(<AvatarStyled name="Jane Doe" size="lg" />);
    const avatar = container.querySelector(".rav-avatar");
    expect(avatar).toHaveAttribute("data-size", "lg");
  });

  it("sets autoColor via CSS variable when name is provided", () => {
    const { container } = render(<AvatarStyled name="Alice" autoColor />);
    const avatar = container.querySelector(".rav-avatar") as HTMLElement;
    expect(avatar.style.getPropertyValue("--rav-bg")).not.toBe("");
  });

  it("renders status dot when status is provided", () => {
    const { container } = render(<AvatarStyled name="Bob" status="online" />);
    const dot = container.querySelector(".rav-status");
    expect(dot).not.toBeNull();
    expect(dot).toHaveAttribute("data-presence", "online");
  });

  it("applies imagePosition as object-position on the img", () => {
    const { container } = render(
      <AvatarStyled src="https://example.com/a.jpg" name="Jane" imagePosition="top" />,
    );
    const img = container.querySelector(".rav-img") as HTMLImageElement;
    expect(img).not.toBeNull();
    expect(img.style.objectPosition).toBe("top");
  });

  it("does not set objectPosition style when imagePosition is not given", () => {
    const { container } = render(
      <AvatarStyled src="https://example.com/a.jpg" name="Jane" />,
    );
    const img = container.querySelector(".rav-img") as HTMLImageElement;
    expect(img.style.objectPosition).toBeFalsy();
  });

  it("renders custom fallback node", () => {
    const { getByText } = render(
      <AvatarStyled fallback={<span>X</span>} />,
    );
    expect(getByText("X")).toBeInTheDocument();
  });

  it("renders initials when no src and no custom fallback", () => {
    const { getByText } = render(<AvatarStyled name="Charlie Delta" />);
    expect(getByText("CD")).toBeInTheDocument();
  });
});
