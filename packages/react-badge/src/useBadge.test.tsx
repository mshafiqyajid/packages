import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useBadge } from "./useBadge";

describe("useBadge", () => {
  it("is not dismissed by default", () => {
    const { result } = renderHook(() => useBadge());
    expect(result.current.isDismissed).toBe(false);
  });

  it("dismisses when dismiss() is called", () => {
    const { result } = renderHook(() => useBadge());
    act(() => result.current.dismiss());
    expect(result.current.isDismissed).toBe(true);
  });

  it("calls onDismiss callback when dismissed via dismiss()", () => {
    const onDismiss = vi.fn();
    const { result } = renderHook(() => useBadge({ onDismiss }));
    act(() => result.current.dismiss());
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("dismisses when dismissProps onClick is called", () => {
    const onDismiss = vi.fn();
    const { result } = renderHook(() => useBadge({ onDismiss }));
    act(() => result.current.dismissProps.onClick());
    expect(result.current.isDismissed).toBe(true);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("dismisses when Enter key is pressed via dismissProps onKeyDown", () => {
    const { result } = renderHook(() => useBadge());
    act(() => {
      result.current.dismissProps.onKeyDown({
        key: "Enter",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent);
    });
    expect(result.current.isDismissed).toBe(true);
  });

  it("dismisses when Space key is pressed via dismissProps onKeyDown", () => {
    const { result } = renderHook(() => useBadge());
    act(() => {
      result.current.dismissProps.onKeyDown({
        key: " ",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent);
    });
    expect(result.current.isDismissed).toBe(true);
  });

  it("does not dismiss on unrelated key press", () => {
    const { result } = renderHook(() => useBadge());
    act(() => {
      result.current.dismissProps.onKeyDown({
        key: "Tab",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent);
    });
    expect(result.current.isDismissed).toBe(false);
  });

  it("badgeProps has correct role", () => {
    const { result } = renderHook(() => useBadge());
    expect(result.current.badgeProps.role).toBe("status");
  });

  it("dismissProps has correct accessibility attributes", () => {
    const { result } = renderHook(() => useBadge());
    expect(result.current.dismissProps["aria-label"]).toBe("Dismiss");
    expect(result.current.dismissProps.tabIndex).toBe(0);
    expect(result.current.dismissProps.role).toBe("button");
  });

  it("onDismiss is not called when no callback provided", () => {
    const { result } = renderHook(() => useBadge());
    expect(() => act(() => result.current.dismiss())).not.toThrow();
    expect(result.current.isDismissed).toBe(true);
  });
});
