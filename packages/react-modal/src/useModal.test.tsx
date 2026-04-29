import { act, renderHook } from "@testing-library/react";
import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import { useModal } from "./useModal";

describe("useModal", () => {
  beforeEach(() => {
    document.body.style.overflow = "";
  });

  afterEach(() => {
    document.body.style.overflow = "";
  });

  test("starts closed by default", () => {
    const { result } = renderHook(() => useModal());
    expect(result.current.isOpen).toBe(false);
  });

  test("respects defaultOpen option", () => {
    const { result } = renderHook(() => useModal({ defaultOpen: true }));
    expect(result.current.isOpen).toBe(true);
  });

  test("open() sets isOpen to true", () => {
    const { result } = renderHook(() => useModal());
    act(() => {
      result.current.open();
    });
    expect(result.current.isOpen).toBe(true);
  });

  test("close() sets isOpen to false", () => {
    const { result } = renderHook(() => useModal({ defaultOpen: true }));
    act(() => {
      result.current.close();
    });
    expect(result.current.isOpen).toBe(false);
  });

  test("toggle() flips open state", () => {
    const { result } = renderHook(() => useModal());
    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOpen).toBe(true);
    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOpen).toBe(false);
  });

  test("onOpen callback fires when opened", () => {
    const onOpen = vi.fn();
    const { result } = renderHook(() => useModal({ onOpen }));
    act(() => {
      result.current.open();
    });
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  test("onClose callback fires when closed", () => {
    const onClose = vi.fn();
    const { result } = renderHook(() => useModal({ defaultOpen: true, onClose }));
    act(() => {
      result.current.close();
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("toggle fires onOpen when opening, onClose when closing", () => {
    const onOpen = vi.fn();
    const onClose = vi.fn();
    const { result } = renderHook(() => useModal({ onOpen, onClose }));
    act(() => {
      result.current.toggle();
    });
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(0);
    act(() => {
      result.current.toggle();
    });
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("scroll lock applied on open and removed on close", () => {
    const { result } = renderHook(() => useModal());
    act(() => {
      result.current.open();
    });
    expect(document.body.style.overflow).toBe("hidden");
    act(() => {
      result.current.close();
    });
    expect(document.body.style.overflow).toBe("");
  });

  test("scroll lock restores original overflow value", () => {
    document.body.style.overflow = "auto";
    const { result } = renderHook(() => useModal());
    act(() => {
      result.current.open();
    });
    expect(document.body.style.overflow).toBe("hidden");
    act(() => {
      result.current.close();
    });
    expect(document.body.style.overflow).toBe("auto");
  });

  test("Escape key closes modal when closeOnEsc is true", () => {
    const { result } = renderHook(() => useModal({ closeOnEsc: true }));
    act(() => {
      result.current.open();
    });
    expect(result.current.isOpen).toBe(true);
    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    });
    expect(result.current.isOpen).toBe(false);
  });

  test("Escape key does NOT close modal when closeOnEsc is false", () => {
    const { result } = renderHook(() => useModal({ closeOnEsc: false }));
    act(() => {
      result.current.open();
    });
    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    });
    expect(result.current.isOpen).toBe(true);
  });

  test("modalProps contains correct accessibility attributes", () => {
    const { result } = renderHook(() => useModal());
    expect(result.current.modalProps.role).toBe("dialog");
    expect(result.current.modalProps["aria-modal"]).toBe(true);
    expect(result.current.modalProps.tabIndex).toBe(-1);
  });

  test("overlayProps contains data-rmod-overlay attribute", () => {
    const { result } = renderHook(() => useModal());
    expect(result.current.overlayProps["data-rmod-overlay"]).toBe("true");
  });

  test("unmount cleans up scroll lock", () => {
    const { result, unmount } = renderHook(() => useModal());
    act(() => {
      result.current.open();
    });
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("");
  });
});
