import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useHoverCard } from "./useHoverCard";

describe("useHoverCard", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  // ── Initial state ────────────────────────────────────────────────────────────
  it("is closed by default", () => {
    const { result } = renderHook(() => useHoverCard());
    expect(result.current.isOpen).toBe(false);
  });

  it("defaultOpen: true starts open", () => {
    const { result } = renderHook(() => useHoverCard({ defaultOpen: true }));
    expect(result.current.isOpen).toBe(true);
  });

  // ── Imperative open / close ──────────────────────────────────────────────────
  it("open() opens the card", () => {
    const { result } = renderHook(() => useHoverCard());
    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);
  });

  it("close() closes the card", () => {
    const { result } = renderHook(() => useHoverCard({ defaultOpen: true }));
    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
  });

  // ── Open delay ───────────────────────────────────────────────────────────────
  it("mouseenter schedules open after openDelay", () => {
    const { result } = renderHook(() => useHoverCard({ openDelay: 300 }));
    act(() => result.current.triggerProps.onMouseEnter());
    expect(result.current.isOpen).toBe(false);
    act(() => vi.advanceTimersByTime(299));
    expect(result.current.isOpen).toBe(false);
    act(() => vi.advanceTimersByTime(1));
    expect(result.current.isOpen).toBe(true);
  });

  it("mouseleave before openDelay cancels open", () => {
    const { result } = renderHook(() => useHoverCard({ openDelay: 300 }));
    act(() => result.current.triggerProps.onMouseEnter());
    act(() => vi.advanceTimersByTime(200));
    act(() => result.current.triggerProps.onMouseLeave());
    act(() => vi.advanceTimersByTime(200));
    expect(result.current.isOpen).toBe(false);
  });

  // ── Close delay ──────────────────────────────────────────────────────────────
  it("mouseleave schedules close after closeDelay", () => {
    const { result } = renderHook(() =>
      useHoverCard({ openDelay: 0, closeDelay: 100 }),
    );
    act(() => result.current.triggerProps.onMouseEnter());
    act(() => vi.advanceTimersByTime(0));
    expect(result.current.isOpen).toBe(true);
    act(() => result.current.triggerProps.onMouseLeave());
    expect(result.current.isOpen).toBe(true);
    act(() => vi.advanceTimersByTime(100));
    expect(result.current.isOpen).toBe(false);
  });

  // ── Card hover keeps open ────────────────────────────────────────────────────
  it("hovering the card cancels the close timer", () => {
    const { result } = renderHook(() =>
      useHoverCard({ openDelay: 0, closeDelay: 100 }),
    );
    act(() => result.current.triggerProps.onMouseEnter());
    act(() => vi.advanceTimersByTime(0));
    act(() => result.current.triggerProps.onMouseLeave());
    act(() => vi.advanceTimersByTime(50));
    act(() => result.current.cardProps.onMouseEnter());
    act(() => vi.advanceTimersByTime(200));
    expect(result.current.isOpen).toBe(true);
  });

  it("leaving the card schedules close", () => {
    const { result } = renderHook(() =>
      useHoverCard({ openDelay: 0, closeDelay: 100 }),
    );
    act(() => result.current.triggerProps.onMouseEnter());
    act(() => vi.advanceTimersByTime(0));
    act(() => result.current.cardProps.onMouseLeave());
    act(() => vi.advanceTimersByTime(100));
    expect(result.current.isOpen).toBe(false);
  });

  // ── Focus / blur ─────────────────────────────────────────────────────────────
  it("focus on trigger schedules open", () => {
    const { result } = renderHook(() => useHoverCard({ openDelay: 300 }));
    act(() => result.current.triggerProps.onFocus());
    act(() => vi.advanceTimersByTime(300));
    expect(result.current.isOpen).toBe(true);
  });

  it("blur schedules close", () => {
    const { result } = renderHook(() =>
      useHoverCard({ openDelay: 0, closeDelay: 100 }),
    );
    act(() => result.current.triggerProps.onFocus());
    act(() => vi.advanceTimersByTime(0));
    act(() => result.current.triggerProps.onBlur());
    act(() => vi.advanceTimersByTime(100));
    expect(result.current.isOpen).toBe(false);
  });

  // ── ARIA ─────────────────────────────────────────────────────────────────────
  it("aria-describedby matches cardProps.id when open", () => {
    const { result } = renderHook(() => useHoverCard({ defaultOpen: true }));
    expect(result.current.triggerProps["aria-describedby"]).toBe(
      result.current.cardProps.id,
    );
  });

  it("aria-describedby is undefined when closed", () => {
    const { result } = renderHook(() => useHoverCard());
    expect(result.current.triggerProps["aria-describedby"]).toBeUndefined();
  });

  // ── Escape key ───────────────────────────────────────────────────────────────
  it("Escape key closes the card", () => {
    const { result } = renderHook(() => useHoverCard({ defaultOpen: true }));
    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    expect(result.current.isOpen).toBe(false);
  });

  it("Escape is ignored when card is closed", () => {
    const { result } = renderHook(() => useHoverCard());
    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    expect(result.current.isOpen).toBe(false);
  });

  // ── Controlled mode ──────────────────────────────────────────────────────────
  it("controlled: respects open prop", () => {
    const { result, rerender } = renderHook(
      ({ open }: { open: boolean }) => useHoverCard({ open }),
      { initialProps: { open: false } },
    );
    expect(result.current.isOpen).toBe(false);
    rerender({ open: true });
    expect(result.current.isOpen).toBe(true);
  });

  it("controlled: calls onOpenChange with true on open", () => {
    const onOpenChange = vi.fn();
    const { result } = renderHook(() =>
      useHoverCard({ open: false, onOpenChange }),
    );
    act(() => result.current.open());
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("controlled: calls onOpenChange with false on close", () => {
    const onOpenChange = vi.fn();
    const { result } = renderHook(() =>
      useHoverCard({ open: true, onOpenChange }),
    );
    act(() => result.current.close());
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  // ── onOpenChange in uncontrolled mode ────────────────────────────────────────
  it("uncontrolled: onOpenChange fires on open", () => {
    const onOpenChange = vi.fn();
    const { result } = renderHook(() =>
      useHoverCard({ openDelay: 0, onOpenChange }),
    );
    act(() => result.current.triggerProps.onMouseEnter());
    act(() => vi.advanceTimersByTime(0));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("uncontrolled: onOpenChange fires on close", () => {
    const onOpenChange = vi.fn();
    const { result } = renderHook(() =>
      useHoverCard({ openDelay: 0, closeDelay: 0, defaultOpen: true, onOpenChange }),
    );
    act(() => result.current.close());
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
