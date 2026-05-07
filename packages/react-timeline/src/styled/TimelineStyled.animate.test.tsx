import { render, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TimelineStyled } from "./index";
import type { TimelineItem } from "../useTimeline";

const items: TimelineItem[] = [
  { id: "1", title: "Alpha", status: "completed" },
  { id: "2", title: "Beta", status: "active" },
  { id: "3", title: "Gamma" },
];

describe("TimelineStyled — animateOnMount", () => {
  let observerCallback: IntersectionObserverCallback;
  let observeSpy: ReturnType<typeof vi.fn>;
  let disconnectSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    observeSpy = vi.fn();
    disconnectSpy = vi.fn();

    vi.stubGlobal(
      "IntersectionObserver",
      vi.fn((cb: IntersectionObserverCallback) => {
        observerCallback = cb;
        return {
          observe: observeSpy,
          unobserve: vi.fn(),
          disconnect: disconnectSpy,
        };
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("adds data-aom to each item when animateOnMount=true", () => {
    const { container } = render(
      <TimelineStyled items={items} animateOnMount />,
    );
    const liItems = container.querySelectorAll(".rtl-item[data-aom]");
    expect(liItems.length).toBe(items.length);
  });

  it("does not add data-aom when animateOnMount=false (default)", () => {
    const { container } = render(<TimelineStyled items={items} />);
    const liItems = container.querySelectorAll(".rtl-item[data-aom]");
    expect(liItems.length).toBe(0);
  });

  it("sets data-aom-visible when IntersectionObserver fires", () => {
    const { container } = render(
      <TimelineStyled items={items} animateOnMount />,
    );
    const first = container.querySelector<HTMLElement>(".rtl-item[data-aom]");
    expect(first).not.toHaveAttribute("data-aom-visible");

    act(() => {
      observerCallback(
        [{ isIntersecting: true, target: first! } as unknown as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    expect(first).toHaveAttribute("data-aom-visible", "true");
  });

  it("shows items immediately when IntersectionObserver is unavailable", () => {
    vi.unstubAllGlobals();
    Object.defineProperty(window, "IntersectionObserver", {
      value: undefined,
      configurable: true,
      writable: true,
    });

    const { container } = render(
      <TimelineStyled items={items} animateOnMount />,
    );
    const liItems = container.querySelectorAll<HTMLElement>(".rtl-item[data-aom]");
    liItems.forEach((node) => {
      expect(node).toHaveAttribute("data-aom-visible", "true");
    });
  });

  it("sets --rtl-aom-delay CSS variable per item index", () => {
    const { container } = render(
      <TimelineStyled items={items} animateOnMount />,
    );
    const liItems = container.querySelectorAll<HTMLElement>(".rtl-item[data-aom]");
    expect(liItems[0]?.style.getPropertyValue("--rtl-aom-delay")).toBe("0ms");
    expect(liItems[1]?.style.getPropertyValue("--rtl-aom-delay")).toBe("80ms");
    expect(liItems[2]?.style.getPropertyValue("--rtl-aom-delay")).toBe("160ms");
  });

  it("disconnects IntersectionObserver on unmount", () => {
    const { unmount } = render(
      <TimelineStyled items={items} animateOnMount />,
    );
    unmount();
    expect(disconnectSpy).toHaveBeenCalled();
  });
});

describe("TimelineStyled — animate (CSS-only, existing)", () => {
  it("sets data-animate on the root when animate=true", () => {
    const { container } = render(<TimelineStyled items={items} animate />);
    expect(container.querySelector(".rtl-timeline")).toHaveAttribute("data-animate");
  });

  it("does not set data-animate by default", () => {
    const { container } = render(<TimelineStyled items={items} />);
    expect(container.querySelector(".rtl-timeline")).not.toHaveAttribute("data-animate");
  });
});
