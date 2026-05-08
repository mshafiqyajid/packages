import { renderHook } from "@testing-library/react";
import { render, screen } from "@testing-library/react";
import { useDivider } from "./useDivider";
import { DividerStyled } from "./styled/DividerStyled";

describe("useDivider", () => {
  it("dividerProps.role === 'separator'", () => {
    const { result } = renderHook(() => useDivider());
    expect(result.current.dividerProps.role).toBe("separator");
  });

  it("aria-orientation is 'horizontal' by default", () => {
    const { result } = renderHook(() => useDivider());
    expect(result.current.dividerProps["aria-orientation"]).toBe("horizontal");
  });

  it("aria-orientation is 'vertical' when orientation='vertical'", () => {
    const { result } = renderHook(() => useDivider({ orientation: "vertical" }));
    expect(result.current.dividerProps["aria-orientation"]).toBe("vertical");
  });
});

describe("DividerStyled", () => {
  it("data-has-label is set when label is provided", () => {
    const { container } = render(<DividerStyled label="Section" />);
    const el = container.querySelector(".rdvd-root");
    expect(el).toHaveAttribute("data-has-label", "true");
  });

  it("renders label text when label is provided", () => {
    render(<DividerStyled label="My Label" />);
    expect(screen.getByText("My Label")).toBeInTheDocument();
  });

  it("data-orientation is 'vertical' when vertical", () => {
    const { container } = render(<DividerStyled orientation="vertical" />);
    const el = container.querySelector(".rdvd-root");
    expect(el).toHaveAttribute("data-orientation", "vertical");
  });

  it("data-line-style matches prop", () => {
    const { container } = render(<DividerStyled lineStyle="dashed" />);
    const el = container.querySelector(".rdvd-root");
    expect(el).toHaveAttribute("data-line-style", "dashed");
  });

  it("data-tone matches prop", () => {
    const { container } = render(<DividerStyled tone="danger" />);
    const el = container.querySelector(".rdvd-root");
    expect(el).toHaveAttribute("data-tone", "danger");
  });
});
