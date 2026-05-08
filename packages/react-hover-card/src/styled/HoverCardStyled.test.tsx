import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { HoverCardStyled } from "./HoverCardStyled";

// Portal target
beforeEach(() => {
  document.body.innerHTML = "";
});

function setup(props?: Partial<React.ComponentProps<typeof HoverCardStyled>>) {
  return render(
    <HoverCardStyled
      content={<p>Card content</p>}
      openDelay={0}
      closeDelay={0}
      {...props}
    >
      <button>Hover me</button>
    </HoverCardStyled>,
  );
}

describe("HoverCardStyled", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("renders the trigger", () => {
    setup();
    expect(screen.getByText("Hover me")).toBeInTheDocument();
  });

  it("card is not visible initially", () => {
    setup();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens after mouseenter + openDelay elapses", () => {
    setup({ openDelay: 0, closeDelay: 0 });
    act(() => {
      fireEvent.mouseEnter(screen.getByText("Hover me"));
      vi.advanceTimersByTime(0);
    });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("has data-state=open when visible", () => {
    setup({ openDelay: 0 });
    act(() => {
      fireEvent.mouseEnter(screen.getByText("Hover me"));
      vi.advanceTimersByTime(0);
    });
    expect(screen.getByRole("dialog")).toHaveAttribute("data-state", "open");
  });

  it("renders content inside the card", () => {
    setup({ openDelay: 0 });
    act(() => {
      fireEvent.mouseEnter(screen.getByText("Hover me"));
      vi.advanceTimersByTime(0);
    });
    expect(screen.getByText("Card content")).toBeInTheDocument();
  });

  it("trigger gets aria-describedby matching card id when open", () => {
    setup({ openDelay: 0 });
    act(() => {
      fireEvent.mouseEnter(screen.getByText("Hover me"));
      vi.advanceTimersByTime(0);
    });
    const trigger = screen.getByText("Hover me");
    const card = screen.getByRole("dialog");
    expect(trigger).toHaveAttribute("aria-describedby", card.id);
  });

  it("closes after mouseleave + closeDelay elapses", () => {
    setup({ openDelay: 0, closeDelay: 0 });
    const trigger = screen.getByText("Hover me");
    act(() => { fireEvent.mouseEnter(trigger); vi.advanceTimersByTime(0); });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    act(() => { fireEvent.mouseLeave(trigger); vi.advanceTimersByTime(0); });
    // card has data-state="closed"; exit timer (200ms) fires after
    act(() => { vi.advanceTimersByTime(250); });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("Escape closes the card", () => {
    setup({ openDelay: 0, closeDelay: 0 });
    act(() => {
      fireEvent.mouseEnter(screen.getByText("Hover me"));
      vi.advanceTimersByTime(0);
    });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    act(() => {
      fireEvent.keyDown(document, { key: "Escape" });
    });
    act(() => { vi.advanceTimersByTime(250); });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("defaultOpen: true shows the card on mount", () => {
    setup({ defaultOpen: true, openDelay: 0 });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("controlled open=true shows the card", () => {
    setup({ open: true });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("controlled open=false hides the card after exit transition", () => {
    const { rerender } = render(
      <HoverCardStyled content="content" open={true} openDelay={0}>
        <button>trigger</button>
      </HoverCardStyled>,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    act(() => {
      rerender(
        <HoverCardStyled content="content" open={false} openDelay={0}>
          <button>trigger</button>
        </HoverCardStyled>,
      );
    });
    // card has data-state="closed" immediately, then unmounts after exit timer (200ms)
    expect(screen.getByRole("dialog")).toHaveAttribute("data-state", "closed");
    act(() => { vi.advanceTimersByTime(250); });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("onOpenChange is called when opening", () => {
    const onOpenChange = vi.fn();
    setup({ openDelay: 0, onOpenChange });
    act(() => {
      fireEvent.mouseEnter(screen.getByText("Hover me"));
      vi.advanceTimersByTime(0);
    });
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("onOpenChange is called when closing", () => {
    const onOpenChange = vi.fn();
    setup({ openDelay: 0, closeDelay: 0, onOpenChange });
    const trigger = screen.getByText("Hover me");
    act(() => { fireEvent.mouseEnter(trigger); vi.advanceTimersByTime(0); });
    act(() => { fireEvent.mouseLeave(trigger); vi.advanceTimersByTime(0); });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("hovering the card keeps it open", () => {
    setup({ openDelay: 0, closeDelay: 100 });
    const trigger = screen.getByText("Hover me");
    act(() => { fireEvent.mouseEnter(trigger); vi.advanceTimersByTime(0); });
    act(() => { fireEvent.mouseLeave(trigger); vi.advanceTimersByTime(50); });
    const card = screen.getByRole("dialog");
    act(() => { fireEvent.mouseEnter(card); vi.advanceTimersByTime(200); });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("leaving the card closes it", () => {
    setup({ openDelay: 0, closeDelay: 0 });
    act(() => {
      fireEvent.mouseEnter(screen.getByText("Hover me"));
      vi.advanceTimersByTime(0);
    });
    const card = screen.getByRole("dialog");
    act(() => { fireEvent.mouseLeave(card); vi.advanceTimersByTime(0); });
    act(() => { vi.advanceTimersByTime(250); });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("focus on trigger opens the card", () => {
    setup({ openDelay: 0 });
    act(() => {
      fireEvent.focus(screen.getByText("Hover me"));
      vi.advanceTimersByTime(0);
    });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("blur on trigger closes the card", () => {
    setup({ openDelay: 0, closeDelay: 0 });
    const trigger = screen.getByText("Hover me");
    act(() => { fireEvent.focus(trigger); vi.advanceTimersByTime(0); });
    act(() => { fireEvent.blur(trigger); vi.advanceTimersByTime(0); });
    act(() => { vi.advanceTimersByTime(250); });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("data-arrow=true when arrow=true", () => {
    setup({ openDelay: 0, arrow: true });
    act(() => { fireEvent.mouseEnter(screen.getByText("Hover me")); vi.advanceTimersByTime(0); });
    expect(screen.getByRole("dialog")).toHaveAttribute("data-arrow", "true");
  });

  it("data-arrow omitted when arrow=false", () => {
    setup({ openDelay: 0, arrow: false });
    act(() => { fireEvent.mouseEnter(screen.getByText("Hover me")); vi.advanceTimersByTime(0); });
    expect(screen.getByRole("dialog")).not.toHaveAttribute("data-arrow");
  });
});
