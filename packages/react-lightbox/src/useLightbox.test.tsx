import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useLightbox } from "./useLightbox";

describe("useLightbox", () => {
  beforeEach(() => {
    // Reset body overflow before each test
    document.body.style.overflow = "";
  });

  afterEach(() => {
    document.body.style.overflow = "";
  });

  it("is closed by default", () => {
    const { result } = renderHook(() => useLightbox({ total: 3 }));
    expect(result.current.isOpen).toBe(false);
  });

  it("opens with defaultOpen=true", () => {
    const { result } = renderHook(() => useLightbox({ defaultOpen: true, total: 3 }));
    expect(result.current.isOpen).toBe(true);
  });

  it("open() opens the lightbox", () => {
    const { result } = renderHook(() => useLightbox({ total: 3 }));
    act(() => { result.current.open(); });
    expect(result.current.isOpen).toBe(true);
  });

  it("close() closes the lightbox", () => {
    const { result } = renderHook(() => useLightbox({ defaultOpen: true, total: 3 }));
    act(() => { result.current.close(); });
    expect(result.current.isOpen).toBe(false);
  });

  it("next() increments the index", () => {
    const { result } = renderHook(() => useLightbox({ defaultOpen: true, defaultIndex: 0, total: 3 }));
    act(() => { result.current.next(); });
    expect(result.current.index).toBe(1);
  });

  it("prev() decrements the index", () => {
    const { result } = renderHook(() => useLightbox({ defaultOpen: true, defaultIndex: 2, total: 3 }));
    act(() => { result.current.prev(); });
    expect(result.current.index).toBe(1);
  });

  it("next() wraps to 0 at the end when loop=true", () => {
    const { result } = renderHook(() => useLightbox({ defaultOpen: true, defaultIndex: 2, total: 3, loop: true }));
    act(() => { result.current.next(); });
    expect(result.current.index).toBe(0);
  });

  it("prev() wraps to last at start when loop=true", () => {
    const { result } = renderHook(() => useLightbox({ defaultOpen: true, defaultIndex: 0, total: 3, loop: true }));
    act(() => { result.current.prev(); });
    expect(result.current.index).toBe(2);
  });

  it("next() clamps at last index when loop=false", () => {
    const { result } = renderHook(() => useLightbox({ defaultOpen: true, defaultIndex: 2, total: 3, loop: false }));
    act(() => { result.current.next(); });
    expect(result.current.index).toBe(2);
  });

  it("prev() clamps at 0 when loop=false", () => {
    const { result } = renderHook(() => useLightbox({ defaultOpen: true, defaultIndex: 0, total: 3, loop: false }));
    act(() => { result.current.prev(); });
    expect(result.current.index).toBe(0);
  });

  it("onOpenChange fires when opening and closing", () => {
    const onOpenChange = vi.fn();
    const { result } = renderHook(() => useLightbox({ total: 3, onOpenChange }));
    act(() => { result.current.open(); });
    expect(onOpenChange).toHaveBeenCalledWith(true);
    act(() => { result.current.close(); });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("onIndexChange fires when navigating", () => {
    const onIndexChange = vi.fn();
    const { result } = renderHook(() => useLightbox({ defaultOpen: true, defaultIndex: 0, total: 3, onIndexChange }));
    act(() => { result.current.next(); });
    expect(onIndexChange).toHaveBeenCalledWith(1);
  });

  it("controlled index is honoured", () => {
    const { result } = renderHook(() => useLightbox({ defaultOpen: true, index: 2, total: 3 }));
    expect(result.current.index).toBe(2);
    // Calling next should not change internal index when controlled
    act(() => { result.current.next(); });
    expect(result.current.index).toBe(2);
  });

  it("Escape key closes when closeOnEsc=true", () => {
    const { result } = renderHook(() => useLightbox({ defaultOpen: true, total: 3, closeOnEsc: true }));
    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    });
    expect(result.current.isOpen).toBe(false);
  });

  it("Escape key does NOT close when closeOnEsc=false", () => {
    const { result } = renderHook(() => useLightbox({ defaultOpen: true, total: 3, closeOnEsc: false }));
    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    });
    expect(result.current.isOpen).toBe(true);
  });

  it("body scroll is locked when open", () => {
    const { result } = renderHook(() => useLightbox({ total: 3 }));
    act(() => { result.current.open(); });
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("body scroll is restored when closed", () => {
    document.body.style.overflow = "auto";
    const { result } = renderHook(() => useLightbox({ defaultOpen: true, total: 3 }));
    act(() => { result.current.close(); });
    expect(document.body.style.overflow).toBe("auto");
  });

  it("lightboxProps has role=dialog and aria-modal", () => {
    const { result } = renderHook(() => useLightbox({ total: 3 }));
    expect(result.current.lightboxProps.role).toBe("dialog");
    expect(result.current.lightboxProps["aria-modal"]).toBe(true);
  });

  it("ArrowRight keyboard event navigates to next", () => {
    const { result } = renderHook(() => useLightbox({ defaultOpen: true, defaultIndex: 0, total: 3 }));
    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    });
    expect(result.current.index).toBe(1);
  });

  it("open() accepts a start index", () => {
    const { result } = renderHook(() => useLightbox({ total: 5 }));
    act(() => { result.current.open(3); });
    expect(result.current.isOpen).toBe(true);
    expect(result.current.index).toBe(3);
  });
});
