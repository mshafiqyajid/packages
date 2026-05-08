import { render, screen } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { createRef } from "react";
import { useSkeleton } from "./useSkeleton";
import { SkeletonStyled } from "./styled/SkeletonStyled";

describe("useSkeleton", () => {
  it('skeletonProps.role === "status"', () => {
    const { result } = renderHook(() => useSkeleton());
    expect(result.current.skeletonProps.role).toBe("status");
  });

  it('skeletonProps["aria-busy"] === "true"', () => {
    const { result } = renderHook(() => useSkeleton());
    expect(result.current.skeletonProps["aria-busy"]).toBe("true");
  });

  it('skeletonProps["aria-live"] === "polite"', () => {
    const { result } = renderHook(() => useSkeleton());
    expect(result.current.skeletonProps["aria-live"]).toBe("polite");
  });

  it('skeletonProps["aria-label"] === "Loading" by default', () => {
    const { result } = renderHook(() => useSkeleton());
    expect(result.current.skeletonProps["aria-label"]).toBe("Loading");
  });
});

describe("SkeletonStyled", () => {
  it('renders with role="status" and aria-busy="true"', () => {
    render(<SkeletonStyled />);
    const el = screen.getByRole("status");
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute("aria-busy", "true");
  });

  it('variant="circle" applies data-variant="circle"', () => {
    render(<SkeletonStyled variant="circle" />);
    const el = screen.getByRole("status");
    expect(el).toHaveAttribute("data-variant", "circle");
  });

  it('variant="text" renders correct number of lines via lines prop', () => {
    render(<SkeletonStyled variant="text" lines={4} />);
    const container = screen.getByRole("status");
    const lines = container.querySelectorAll(".rsk-line");
    expect(lines).toHaveLength(4);
  });

  it('variant="text" last line has lastLineWidth applied', () => {
    render(<SkeletonStyled variant="text" lines={3} lastLineWidth="40%" />);
    const container = screen.getByRole("status");
    const lines = container.querySelectorAll(".rsk-line");
    const lastLine = lines[lines.length - 1] as HTMLElement;
    expect(lastLine.style.width).toBe("40%");
  });

  it('animation="none" applies data-animation="none"', () => {
    render(<SkeletonStyled animation="none" />);
    const el = screen.getByRole("status");
    expect(el).toHaveAttribute("data-animation", "none");
  });

  it('animation="wave" applies data-animation="wave"', () => {
    render(<SkeletonStyled animation="wave" />);
    const el = screen.getByRole("status");
    expect(el).toHaveAttribute("data-animation", "wave");
  });

  it("className prop is forwarded to root element", () => {
    render(<SkeletonStyled className="my-custom-class" />);
    const el = screen.getByRole("status");
    expect(el).toHaveClass("my-custom-class");
  });

  it("ref forwards to root DOM element (single)", () => {
    const ref = createRef<HTMLDivElement>();
    render(<SkeletonStyled ref={ref} />);
    const el = screen.getByRole("status");
    expect(ref.current).toBe(el);
  });

  // count
  it("count > 1 renders N skeleton elements", () => {
    render(<SkeletonStyled count={3} />);
    const items = screen.getAllByRole("status");
    expect(items).toHaveLength(3);
  });

  it("count > 1 wraps items in .rsk-group", () => {
    const { container } = render(<SkeletonStyled count={3} />);
    const group = container.querySelector(".rsk-group");
    expect(group).toBeInTheDocument();
    expect(group).toHaveAttribute("data-count", "3");
  });

  it("count > 1 ref points to the group wrapper", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<SkeletonStyled count={3} ref={ref} />);
    const group = container.querySelector(".rsk-group");
    expect(ref.current).toBe(group);
  });

  it("spacing sets --rsk-group-gap on the group wrapper", () => {
    const { container } = render(<SkeletonStyled count={2} spacing={16} />);
    const group = container.querySelector<HTMLElement>(".rsk-group");
    expect(group?.style.getPropertyValue("--rsk-group-gap")).toBe("16px");
  });

  // inline
  it('inline=true sets data-inline="true" on root', () => {
    render(<SkeletonStyled inline />);
    const el = screen.getByRole("status");
    expect(el).toHaveAttribute("data-inline", "true");
  });

  it('inline=false does not set data-inline on root', () => {
    render(<SkeletonStyled />);
    const el = screen.getByRole("status");
    expect(el).not.toHaveAttribute("data-inline");
  });

  it('count > 1 and inline=true sets data-inline on group', () => {
    const { container } = render(<SkeletonStyled count={2} inline />);
    const group = container.querySelector(".rsk-group");
    expect(group).toHaveAttribute("data-inline", "true");
  });

  // enableAnimation
  it('enableAnimation=false forces data-animation="none"', () => {
    render(<SkeletonStyled enableAnimation={false} animation="pulse" />);
    const el = screen.getByRole("status");
    expect(el).toHaveAttribute("data-animation", "none");
  });

  it("enableAnimation=true (default) respects animation prop", () => {
    render(<SkeletonStyled enableAnimation animation="wave" />);
    const el = screen.getByRole("status");
    expect(el).toHaveAttribute("data-animation", "wave");
  });

  // baseColor
  it("baseColor applies --rsk-bg inline style", () => {
    render(<SkeletonStyled baseColor="#ff0000" />);
    const el = screen.getByRole("status") as HTMLElement;
    expect(el.style.getPropertyValue("--rsk-bg")).toBe("#ff0000");
  });

  // highlightColor
  it("highlightColor applies --rsk-wave-highlight inline style", () => {
    render(<SkeletonStyled highlightColor="rgba(0,0,0,0.2)" />);
    const el = screen.getByRole("status") as HTMLElement;
    expect(el.style.getPropertyValue("--rsk-wave-highlight")).toBe(
      "rgba(0,0,0,0.2)",
    );
  });

  // borderRadius
  it("borderRadius (string) applies --rsk-custom-radius inline style", () => {
    render(<SkeletonStyled borderRadius="12px" />);
    const el = screen.getByRole("status") as HTMLElement;
    expect(el.style.getPropertyValue("--rsk-custom-radius")).toBe("12px");
  });

  it("borderRadius (number) applies --rsk-custom-radius as px", () => {
    render(<SkeletonStyled borderRadius={16} />);
    const el = screen.getByRole("status") as HTMLElement;
    expect(el.style.getPropertyValue("--rsk-custom-radius")).toBe("16px");
  });
});
