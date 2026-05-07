import { render, screen, act, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TooltipProvider } from "./TooltipProvider";
import { TooltipStyled } from "./styled/TooltipStyled";
import "@testing-library/jest-dom";

describe("TooltipProvider", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("renders children inside rtt-provider wrapper", () => {
    const { container } = render(
      <TooltipProvider>
        <button>trigger</button>
      </TooltipProvider>,
    );
    expect(container.querySelector(".rtt-provider")).toBeTruthy();
  });

  it("accepts className prop", () => {
    const { container } = render(
      <TooltipProvider className="my-wrap">
        <span>child</span>
      </TooltipProvider>,
    );
    expect(container.querySelector(".rtt-provider.my-wrap")).toBeTruthy();
  });

  it("first tooltip uses delayIn before becoming visible", () => {
    render(
      <TooltipProvider delayIn={700} skipDelay={50} delayOut={200}>
        <TooltipStyled content="A">
          <button>A</button>
        </TooltipStyled>
      </TooltipProvider>,
    );

    const btnA = screen.getByRole("button", { name: "A" });
    const tooltip = document.querySelector<HTMLElement>('[role="tooltip"]');

    act(() => { fireEvent.mouseEnter(btnA); });
    // Not yet visible before delayIn
    expect(tooltip?.dataset.visible).toBeUndefined();

    act(() => { vi.advanceTimersByTime(700); });
    expect(tooltip?.dataset.visible).toBe("true");
  });

  it("tooltip is not visible before delayIn elapses", () => {
    render(
      <TooltipProvider delayIn={700} skipDelay={50} delayOut={200}>
        <TooltipStyled content="A">
          <button>A</button>
        </TooltipStyled>
      </TooltipProvider>,
    );

    const btnA = screen.getByRole("button", { name: "A" });
    const tooltip = document.querySelector<HTMLElement>('[role="tooltip"]');

    act(() => { fireEvent.mouseEnter(btnA); });
    act(() => { vi.advanceTimersByTime(300); });
    expect(tooltip?.dataset.visible).toBeUndefined();
  });
});
