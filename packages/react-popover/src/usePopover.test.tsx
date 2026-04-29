import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { usePopover } from "./usePopover";

describe("usePopover", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("is closed by default", () => {
    const { result } = renderHook(() => usePopover());
    expect(result.current.isOpen).toBe(false);
    expect(result.current.triggerProps["aria-expanded"]).toBe(false);
  });

  it("toggles open on click trigger", () => {
    const { result } = renderHook(() => usePopover({ trigger: "click" }));
    act(() => result.current.triggerProps.onClick?.());
    expect(result.current.isOpen).toBe(true);
    act(() => result.current.triggerProps.onClick?.());
    expect(result.current.isOpen).toBe(false);
  });

  it("open() and close() work independently", () => {
    const { result } = renderHook(() => usePopover());
    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);
    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
  });

  it("toggle() flips state", () => {
    const { result } = renderHook(() => usePopover());
    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(true);
    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(false);
  });

  it("sets aria-expanded true when open", () => {
    const { result } = renderHook(() => usePopover({ trigger: "click" }));
    expect(result.current.triggerProps["aria-expanded"]).toBe(false);
    act(() => result.current.open());
    expect(result.current.triggerProps["aria-expanded"]).toBe(true);
  });

  it("aria-controls matches popoverProps id", () => {
    const { result } = renderHook(() => usePopover());
    expect(result.current.triggerProps["aria-controls"]).toBe(
      result.current.popoverProps.id,
    );
  });

  it("aria-haspopup is always dialog", () => {
    const { result } = renderHook(() => usePopover());
    expect(result.current.triggerProps["aria-haspopup"]).toBe("dialog");
  });

  it("closes on Escape key when closeOnEsc is true", () => {
    const { result } = renderHook(() =>
      usePopover({ trigger: "click", closeOnEsc: true }),
    );
    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);
    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    expect(result.current.isOpen).toBe(false);
  });

  it("does not close on Escape when closeOnEsc is false", () => {
    const { result } = renderHook(() =>
      usePopover({ trigger: "click", closeOnEsc: false }),
    );
    act(() => result.current.open());
    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    expect(result.current.isOpen).toBe(true);
  });

  it("opens on mouseenter for hover trigger", () => {
    const { result } = renderHook(() => usePopover({ trigger: "hover" }));
    act(() => result.current.triggerProps.onMouseEnter?.());
    expect(result.current.isOpen).toBe(true);
  });

  it("closes on mouseleave for hover trigger after delay", () => {
    const { result } = renderHook(() => usePopover({ trigger: "hover" }));
    act(() => result.current.triggerProps.onMouseEnter?.());
    expect(result.current.isOpen).toBe(true);
    act(() => result.current.triggerProps.onMouseLeave?.());
    act(() => vi.advanceTimersByTime(100));
    expect(result.current.isOpen).toBe(false);
  });
});
