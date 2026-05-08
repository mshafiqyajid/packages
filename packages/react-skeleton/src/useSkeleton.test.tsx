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

  it("ref forwards to root DOM element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<SkeletonStyled ref={ref} />);
    const el = screen.getByRole("status");
    expect(ref.current).toBe(el);
  });
});
