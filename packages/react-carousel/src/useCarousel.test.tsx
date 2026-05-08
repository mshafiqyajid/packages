import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useCarousel } from "./useCarousel";

const items = ["Slide 1", "Slide 2", "Slide 3"];

describe("useCarousel", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("default uncontrolled index starts at 0", () => {
    const { result } = renderHook(() => useCarousel({ items }));
    expect(result.current.index).toBe(0);
  });

  it("next() increments index", () => {
    const { result } = renderHook(() => useCarousel({ items }));
    act(() => result.current.next());
    expect(result.current.index).toBe(1);
  });

  it("prev() decrements index", () => {
    const { result } = renderHook(() =>
      useCarousel({ items, defaultIndex: 2 }),
    );
    act(() => result.current.prev());
    expect(result.current.index).toBe(1);
  });

  it("loop wraps at end", () => {
    const { result } = renderHook(() =>
      useCarousel({ items, defaultIndex: 2, loop: true }),
    );
    act(() => result.current.next());
    expect(result.current.index).toBe(0);
  });

  it("loop wraps at start", () => {
    const { result } = renderHook(() =>
      useCarousel({ items, defaultIndex: 0, loop: true }),
    );
    act(() => result.current.prev());
    expect(result.current.index).toBe(2);
  });

  it("when loop=false, next() stops at last slide", () => {
    const { result } = renderHook(() =>
      useCarousel({ items, defaultIndex: 2, loop: false }),
    );
    act(() => result.current.next());
    expect(result.current.index).toBe(2);
  });

  it("when loop=false, prev() stops at 0", () => {
    const { result } = renderHook(() =>
      useCarousel({ items, defaultIndex: 0, loop: false }),
    );
    act(() => result.current.prev());
    expect(result.current.index).toBe(0);
  });

  it("controlled index prop is respected", () => {
    const { result } = renderHook(() =>
      useCarousel({ items, index: 2 }),
    );
    expect(result.current.index).toBe(2);
  });

  it("onIndexChange called with correct value on next()", () => {
    const onIndexChange = vi.fn();
    const { result } = renderHook(() =>
      useCarousel({ items, onIndexChange }),
    );
    act(() => result.current.next());
    expect(onIndexChange).toHaveBeenCalledWith(1);
  });

  it("onIndexChange called with correct value on prev()", () => {
    const onIndexChange = vi.fn();
    const { result } = renderHook(() =>
      useCarousel({ items, defaultIndex: 2, onIndexChange }),
    );
    act(() => result.current.prev());
    expect(onIndexChange).toHaveBeenCalledWith(1);
  });

  it("isPaused starts as false", () => {
    const { result } = renderHook(() => useCarousel({ items }));
    expect(result.current.isPaused).toBe(false);
  });

  it("pause() sets isPaused to true", () => {
    const { result } = renderHook(() => useCarousel({ items }));
    act(() => result.current.pause());
    expect(result.current.isPaused).toBe(true);
  });

  it("resume() sets isPaused back to false", () => {
    const { result } = renderHook(() => useCarousel({ items }));
    act(() => result.current.pause());
    act(() => result.current.resume());
    expect(result.current.isPaused).toBe(false);
  });

  it("autoPlay advances index after interval", () => {
    const { result } = renderHook(() =>
      useCarousel({ items, autoPlay: true, autoPlayInterval: 1000 }),
    );
    expect(result.current.index).toBe(0);
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.index).toBe(1);
  });

  it("autoPlay does not advance when paused via pause()", () => {
    const { result } = renderHook(() =>
      useCarousel({ items, autoPlay: true, autoPlayInterval: 1000 }),
    );
    act(() => result.current.pause());
    act(() => vi.advanceTimersByTime(2000));
    expect(result.current.index).toBe(0);
  });

  it("pauseOnHover pauses via onPointerEnter", () => {
    const { result } = renderHook(() =>
      useCarousel({ items, autoPlay: true, autoPlayInterval: 1000, pauseOnHover: true }),
    );
    act(() => result.current.containerProps.onPointerEnter());
    act(() => vi.advanceTimersByTime(2000));
    expect(result.current.index).toBe(0);
  });

  it("resumes after onPointerLeave", () => {
    const { result } = renderHook(() =>
      useCarousel({ items, autoPlay: true, autoPlayInterval: 1000, pauseOnHover: true }),
    );
    act(() => result.current.containerProps.onPointerEnter());
    act(() => result.current.containerProps.onPointerLeave());
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.index).toBe(1);
  });

  it("pauseOnFocus pauses via onFocus", () => {
    const { result } = renderHook(() =>
      useCarousel({ items, autoPlay: true, autoPlayInterval: 1000, pauseOnFocus: true }),
    );
    act(() => result.current.containerProps.onFocus());
    act(() => vi.advanceTimersByTime(2000));
    expect(result.current.index).toBe(0);
  });

  it("keyboard ArrowRight navigates to next (horizontal)", () => {
    const { result } = renderHook(() =>
      useCarousel({ items, orientation: "horizontal" }),
    );
    act(() => {
      result.current.containerProps.onKeyDown({
        key: "ArrowRight",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent);
    });
    expect(result.current.index).toBe(1);
  });

  it("keyboard ArrowLeft navigates to prev (horizontal)", () => {
    const { result } = renderHook(() =>
      useCarousel({ items, defaultIndex: 2, orientation: "horizontal" }),
    );
    act(() => {
      result.current.containerProps.onKeyDown({
        key: "ArrowLeft",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent);
    });
    expect(result.current.index).toBe(1);
  });

  it("keyboard ArrowDown navigates to next (vertical)", () => {
    const { result } = renderHook(() =>
      useCarousel({ items, orientation: "vertical" }),
    );
    act(() => {
      result.current.containerProps.onKeyDown({
        key: "ArrowDown",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent);
    });
    expect(result.current.index).toBe(1);
  });

  it("keyboard ArrowUp navigates to prev (vertical)", () => {
    const { result } = renderHook(() =>
      useCarousel({ items, defaultIndex: 2, orientation: "vertical" }),
    );
    act(() => {
      result.current.containerProps.onKeyDown({
        key: "ArrowUp",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent);
    });
    expect(result.current.index).toBe(1);
  });

  it("keyboard Home navigates to first slide", () => {
    const { result } = renderHook(() =>
      useCarousel({ items, defaultIndex: 2 }),
    );
    act(() => {
      result.current.containerProps.onKeyDown({
        key: "Home",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent);
    });
    expect(result.current.index).toBe(0);
  });

  it("keyboard End navigates to last slide", () => {
    const { result } = renderHook(() => useCarousel({ items }));
    act(() => {
      result.current.containerProps.onKeyDown({
        key: "End",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent);
    });
    expect(result.current.index).toBe(2);
  });

  it("isDragging starts as false", () => {
    const { result } = renderHook(() => useCarousel({ items }));
    expect(result.current.isDragging).toBe(false);
  });

  it("isDragging becomes true on pointerdown", () => {
    const { result } = renderHook(() => useCarousel({ items }));
    const mockElement = { setPointerCapture: vi.fn() };
    act(() => {
      result.current.trackProps.onPointerDown({
        clientX: 0,
        clientY: 0,
        pointerId: 1,
        pointerType: "mouse",
        currentTarget: mockElement,
      } as unknown as React.PointerEvent);
    });
    expect(result.current.isDragging).toBe(true);
  });

  it("isDragging becomes false on pointerup", () => {
    const { result } = renderHook(() => useCarousel({ items }));
    const mockElement = { setPointerCapture: vi.fn() };
    act(() => {
      result.current.trackProps.onPointerDown({
        clientX: 0,
        clientY: 0,
        pointerId: 1,
        pointerType: "mouse",
        currentTarget: mockElement,
      } as unknown as React.PointerEvent);
    });
    act(() => {
      result.current.trackProps.onPointerUp({} as React.PointerEvent);
    });
    expect(result.current.isDragging).toBe(false);
  });

  it("drag beyond threshold commits navigation", () => {
    const { result } = renderHook(() =>
      useCarousel({ items, dragThreshold: 50, drag: true }),
    );
    const mockElement = { setPointerCapture: vi.fn() };
    act(() => {
      result.current.trackProps.onPointerDown({
        clientX: 100,
        clientY: 0,
        pointerId: 1,
        pointerType: "mouse",
        currentTarget: mockElement,
      } as unknown as React.PointerEvent);
    });
    act(() => {
      result.current.trackProps.onPointerMove({
        clientX: 40,
        clientY: 0,
        pointerId: 1,
        pointerType: "mouse",
        currentTarget: mockElement,
      } as unknown as React.PointerEvent);
    });
    act(() => {
      result.current.trackProps.onPointerUp({} as React.PointerEvent);
    });
    expect(result.current.index).toBe(1);
  });

  it("drag below threshold does not commit navigation", () => {
    const { result } = renderHook(() =>
      useCarousel({ items, dragThreshold: 50, drag: true }),
    );
    const mockElement = { setPointerCapture: vi.fn() };
    act(() => {
      result.current.trackProps.onPointerDown({
        clientX: 100,
        clientY: 0,
        pointerId: 1,
        pointerType: "mouse",
        currentTarget: mockElement,
      } as unknown as React.PointerEvent);
    });
    act(() => {
      result.current.trackProps.onPointerMove({
        clientX: 75,
        clientY: 0,
        pointerId: 1,
        pointerType: "mouse",
        currentTarget: mockElement,
      } as unknown as React.PointerEvent);
    });
    act(() => {
      result.current.trackProps.onPointerUp({} as React.PointerEvent);
    });
    expect(result.current.index).toBe(0);
  });

  it("setIndex navigates to arbitrary index", () => {
    const { result } = renderHook(() => useCarousel({ items }));
    act(() => result.current.setIndex(2));
    expect(result.current.index).toBe(2);
  });

  it("getDotProps returns aria-current=true for active dot", () => {
    const { result } = renderHook(() =>
      useCarousel({ items, defaultIndex: 1 }),
    );
    expect(result.current.getDotProps(1)["aria-current"]).toBe(true);
    expect(result.current.getDotProps(0)["aria-current"]).toBe(false);
  });

  it("prevProps.disabled is true at start when loop=false", () => {
    const { result } = renderHook(() =>
      useCarousel({ items, defaultIndex: 0, loop: false }),
    );
    expect(result.current.prevProps.disabled).toBe(true);
  });

  it("nextProps.disabled is true at end when loop=false", () => {
    const { result } = renderHook(() =>
      useCarousel({ items, defaultIndex: 2, loop: false }),
    );
    expect(result.current.nextProps.disabled).toBe(true);
  });

  it("prevProps.disabled is false when loop=true at start", () => {
    const { result } = renderHook(() =>
      useCarousel({ items, defaultIndex: 0, loop: true }),
    );
    expect(result.current.prevProps.disabled).toBe(false);
  });

  it("total equals items.length", () => {
    const { result } = renderHook(() => useCarousel({ items }));
    expect(result.current.total).toBe(3);
  });

  it("getSlideProps returns correct aria-label", () => {
    const { result } = renderHook(() => useCarousel({ items }));
    expect(result.current.getSlideProps(0)["aria-label"]).toBe("1 of 3");
    expect(result.current.getSlideProps(2)["aria-label"]).toBe("3 of 3");
  });

  it("trackProps aria-live is off during dragging, polite otherwise", () => {
    const { result } = renderHook(() => useCarousel({ items }));
    expect(result.current.trackProps["aria-live"]).toBe("polite");
    const mockElement = { setPointerCapture: vi.fn() };
    act(() => {
      result.current.trackProps.onPointerDown({
        clientX: 0,
        clientY: 0,
        pointerId: 1,
        pointerType: "mouse",
        currentTarget: mockElement,
      } as unknown as React.PointerEvent);
    });
    expect(result.current.trackProps["aria-live"]).toBe("off");
  });

  it("onSwipeStart is called on pointerdown", () => {
    const onSwipeStart = vi.fn();
    const { result } = renderHook(() =>
      useCarousel({ items, onSwipeStart }),
    );
    const mockElement = { setPointerCapture: vi.fn() };
    act(() => {
      result.current.trackProps.onPointerDown({
        clientX: 0,
        clientY: 0,
        pointerId: 1,
        pointerType: "mouse",
        currentTarget: mockElement,
      } as unknown as React.PointerEvent);
    });
    expect(onSwipeStart).toHaveBeenCalledOnce();
  });

  it("onSwipeEnd is called on pointerup with committed=true when threshold exceeded", () => {
    const onSwipeEnd = vi.fn();
    const { result } = renderHook(() =>
      useCarousel({ items, onSwipeEnd, dragThreshold: 50 }),
    );
    const mockElement = { setPointerCapture: vi.fn() };
    act(() => {
      result.current.trackProps.onPointerDown({
        clientX: 100,
        clientY: 0,
        pointerId: 1,
        pointerType: "mouse",
        currentTarget: mockElement,
      } as unknown as React.PointerEvent);
    });
    act(() => {
      result.current.trackProps.onPointerMove({
        clientX: 40,
        clientY: 0,
        pointerId: 1,
        pointerType: "mouse",
        currentTarget: mockElement,
      } as unknown as React.PointerEvent);
    });
    act(() => {
      result.current.trackProps.onPointerUp({} as React.PointerEvent);
    });
    expect(onSwipeEnd).toHaveBeenCalledWith(true);
  });
});
