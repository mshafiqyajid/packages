import { render, screen, act, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TooltipStyled } from "./styled/TooltipStyled";
import "@testing-library/jest-dom";

describe("TooltipStyled — interactive prop", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("tooltip does not have pointer-events:none when interactive=true", () => {
    render(
      <TooltipStyled content="Hello" interactive delay={0}>
        <button>trigger</button>
      </TooltipStyled>,
    );

    const tooltip = document.querySelector<HTMLElement>('[role="tooltip"]');
    expect(tooltip).toBeTruthy();
    expect(tooltip?.style.pointerEvents).toBe("auto");
  });

  it("tooltip has data-interactive attribute when interactive=true", () => {
    render(
      <TooltipStyled content="Hello" interactive delay={0}>
        <button>trigger</button>
      </TooltipStyled>,
    );

    const tooltip = document.querySelector<HTMLElement>('[role="tooltip"]');
    expect(tooltip?.dataset.interactive).toBeDefined();
  });

  it("tooltip does NOT have data-interactive when interactive=false", () => {
    render(
      <TooltipStyled content="Hello" delay={0}>
        <button>trigger</button>
      </TooltipStyled>,
    );

    const tooltip = document.querySelector<HTMLElement>('[role="tooltip"]');
    expect(tooltip?.dataset.interactive).toBeUndefined();
  });
});

describe("TooltipStyled — followCursor prop", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("tooltip has data-follow-cursor attribute when followCursor=true", () => {
    render(
      <TooltipStyled content="Follow" followCursor delay={0}>
        <button>trigger</button>
      </TooltipStyled>,
    );

    const tooltip = document.querySelector<HTMLElement>('[role="tooltip"]');
    expect(tooltip?.dataset.followCursor).toBeDefined();
  });

  it("tooltip is hidden by default and shown after trigger hover", () => {
    render(
      <TooltipStyled content="Follow" followCursor delay={0}>
        <button>trigger</button>
      </TooltipStyled>,
    );

    const trigger = screen.getByRole("button");
    const tooltip = document.querySelector<HTMLElement>('[role="tooltip"]');

    expect(tooltip?.dataset.visible).toBeUndefined();

    act(() => {
      fireEvent.mouseEnter(trigger);
      vi.advanceTimersByTime(0);
    });

    expect(tooltip?.dataset.visible).toBe("true");
  });
});
