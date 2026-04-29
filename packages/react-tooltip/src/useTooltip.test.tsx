import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useTooltip } from "./useTooltip";

describe("useTooltip", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("is hidden by default", () => {
    const { result } = renderHook(() => useTooltip());
    expect(result.current.isVisible).toBe(false);
    expect(result.current.tooltipProps.hidden).toBe(true);
  });

  it("shows after delay on mouseenter", () => {
    const { result } = renderHook(() => useTooltip({ delay: 400 }));
    act(() => result.current.triggerProps.onMouseEnter());
    expect(result.current.isVisible).toBe(false);
    act(() => vi.advanceTimersByTime(400));
    expect(result.current.isVisible).toBe(true);
  });

  it("hides on mouseleave", () => {
    const { result } = renderHook(() => useTooltip({ delay: 0 }));
    act(() => { result.current.triggerProps.onMouseEnter(); vi.advanceTimersByTime(0); });
    expect(result.current.isVisible).toBe(true);
    act(() => result.current.triggerProps.onMouseLeave());
    expect(result.current.isVisible).toBe(false);
  });

  it("does not show when disabled", () => {
    const { result } = renderHook(() => useTooltip({ disabled: true, delay: 0 }));
    act(() => { result.current.triggerProps.onMouseEnter(); vi.advanceTimersByTime(0); });
    expect(result.current.isVisible).toBe(false);
  });

  it("sets aria-describedby only when visible", () => {
    const { result } = renderHook(() => useTooltip({ delay: 0 }));
    expect(result.current.triggerProps["aria-describedby"]).toBeUndefined();
    act(() => { result.current.triggerProps.onMouseEnter(); vi.advanceTimersByTime(0); });
    expect(result.current.triggerProps["aria-describedby"]).toBe(result.current.tooltipProps.id);
  });

  it("cancels pending show on mouseleave before delay", () => {
    const { result } = renderHook(() => useTooltip({ delay: 400 }));
    act(() => result.current.triggerProps.onMouseEnter());
    act(() => { result.current.triggerProps.onMouseLeave(); vi.advanceTimersByTime(400); });
    expect(result.current.isVisible).toBe(false);
  });
});
