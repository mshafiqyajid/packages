import { render, screen, fireEvent, renderHook } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useChip } from "./useChip";
import { ChipStyled } from "./styled/ChipStyled";

function HookHarness(props: Parameters<typeof useChip>[0]) {
  const result = useChip(props);
  return (
    <div>
      <span data-testid="selected">{String(result.isSelected)}</span>
      <span data-testid="dismissed">{String(result.isDismissed)}</span>
      <button data-testid="select" onClick={() => result.select()}>select</button>
      <button data-testid="dismiss" onClick={() => result.dismiss()}>dismiss</button>
    </div>
  );
}

describe("useChip", () => {
  it("isSelected starts false when no defaultSelected", () => {
    const { result } = renderHook(() => useChip({}));
    expect(result.current.isSelected).toBe(false);
  });

  it("isSelected is true when defaultSelected=true", () => {
    const { result } = renderHook(() => useChip({ defaultSelected: true }));
    expect(result.current.isSelected).toBe(true);
  });

  it("select() toggles isSelected when selectable", () => {
    render(<HookHarness selectable />);
    expect(screen.getByTestId("selected").textContent).toBe("false");
    fireEvent.click(screen.getByTestId("select"));
    expect(screen.getByTestId("selected").textContent).toBe("true");
    fireEvent.click(screen.getByTestId("select"));
    expect(screen.getByTestId("selected").textContent).toBe("false");
  });

  it("onSelect is called with new value", () => {
    const onSelect = vi.fn();
    render(<HookHarness selectable onSelect={onSelect} />);
    fireEvent.click(screen.getByTestId("select"));
    expect(onSelect).toHaveBeenCalledWith(true);
  });

  it("controlled: selected prop controls isSelected", () => {
    const { result } = renderHook(() => useChip({ selected: true }));
    expect(result.current.isSelected).toBe(true);
    const { result: result2 } = renderHook(() => useChip({ selected: false }));
    expect(result2.current.isSelected).toBe(false);
  });

  it("isDismissed starts false", () => {
    const { result } = renderHook(() => useChip({}));
    expect(result.current.isDismissed).toBe(false);
  });

  it("dismiss() sets isDismissed to true", () => {
    render(<HookHarness dismissible />);
    expect(screen.getByTestId("dismissed").textContent).toBe("false");
    fireEvent.click(screen.getByTestId("dismiss"));
    expect(screen.getByTestId("dismissed").textContent).toBe("true");
  });

  it("onDismiss is called on dismiss", () => {
    const onDismiss = vi.fn();
    render(<HookHarness dismissible onDismiss={onDismiss} />);
    fireEvent.click(screen.getByTestId("dismiss"));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("dismissProps['aria-label'] === 'Remove'", () => {
    const { result } = renderHook(() => useChip({ dismissible: true }));
    expect(result.current.dismissProps["aria-label"]).toBe("Remove");
  });

  it("chipProps.role === 'option' when selectable", () => {
    const { result } = renderHook(() => useChip({ selectable: true }));
    expect(result.current.chipProps.role).toBe("option");
  });

  it("chipProps['aria-selected'] matches isSelected when selectable", () => {
    const { result } = renderHook(() => useChip({ selectable: true, defaultSelected: false }));
    expect(result.current.chipProps["aria-selected"]).toBe(false);
    const { result: result2 } = renderHook(() => useChip({ selectable: true, defaultSelected: true }));
    expect(result2.current.chipProps["aria-selected"]).toBe(true);
  });

  it("disabled: onClick does not toggle selection", () => {
    const onSelect = vi.fn();
    render(<HookHarness selectable disabled onSelect={onSelect} />);
    fireEvent.click(screen.getByTestId("select"));
    expect(onSelect).not.toHaveBeenCalled();
  });
});

describe("ChipStyled", () => {
  it("renders children", () => {
    render(<ChipStyled>Hello chip</ChipStyled>);
    expect(screen.getByText("Hello chip")).toBeInTheDocument();
  });

  it("renders dismiss button when dismissible", () => {
    render(<ChipStyled dismissible>Label</ChipStyled>);
    expect(screen.getByRole("button", { name: "Remove" })).toBeInTheDocument();
  });

  it("does not render dismiss button when not dismissible", () => {
    render(<ChipStyled>Label</ChipStyled>);
    expect(screen.queryByRole("button", { name: "Remove" })).not.toBeInTheDocument();
  });

  it("applies data-variant attribute", () => {
    const { container } = render(<ChipStyled variant="solid">Label</ChipStyled>);
    expect(container.firstChild).toHaveAttribute("data-variant", "solid");
  });

  it("applies data-tone attribute", () => {
    const { container } = render(<ChipStyled tone="primary">Label</ChipStyled>);
    expect(container.firstChild).toHaveAttribute("data-tone", "primary");
  });

  it("applies data-size attribute", () => {
    const { container } = render(<ChipStyled size="lg">Label</ChipStyled>);
    expect(container.firstChild).toHaveAttribute("data-size", "lg");
  });

  it("disappears from DOM after dismissal", () => {
    render(<ChipStyled dismissible>Bye</ChipStyled>);
    expect(screen.getByText("Bye")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Remove" }));
    expect(screen.queryByText("Bye")).not.toBeInTheDocument();
  });

  it("applies data-selected='true' when selected", () => {
    const { container } = render(
      <ChipStyled selectable selected>Label</ChipStyled>,
    );
    expect(container.firstChild).toHaveAttribute("data-selected", "true");
  });

  it("renders icon slot", () => {
    render(<ChipStyled icon={<span data-testid="icon" />}>Label</ChipStyled>);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });
});
