import { act, renderHook } from "@testing-library/react";
import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import { useSheet } from "./useSheet";

describe("useSheet", () => {
  beforeEach(() => {
    document.body.style.overflow = "";
  });

  afterEach(() => {
    document.body.style.overflow = "";
  });

  test("starts closed by default", () => {
    const { result } = renderHook(() => useSheet());
    expect(result.current.isOpen).toBe(false);
  });

  test("respects defaultOpen option", () => {
    const { result } = renderHook(() => useSheet({ defaultOpen: true }));
    expect(result.current.isOpen).toBe(true);
  });

  test("open() sets isOpen to true", () => {
    const { result } = renderHook(() => useSheet());
    act(() => {
      result.current.open();
    });
    expect(result.current.isOpen).toBe(true);
  });

  test("close() sets isOpen to false", () => {
    const { result } = renderHook(() => useSheet({ defaultOpen: true }));
    act(() => {
      result.current.close();
    });
    expect(result.current.isOpen).toBe(false);
  });

  test("toggle() flips open state", () => {
    const { result } = renderHook(() => useSheet());
    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOpen).toBe(true);
    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOpen).toBe(false);
  });

  test("onOpenChange fires on open", () => {
    const onOpenChange = vi.fn();
    const { result } = renderHook(() => useSheet({ onOpenChange }));
    act(() => {
      result.current.open();
    });
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  test("onOpenChange fires on close", () => {
    const onOpenChange = vi.fn();
    const { result } = renderHook(() => useSheet({ defaultOpen: true, onOpenChange }));
    act(() => {
      result.current.close();
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  test("controlled mode: isOpen follows open prop", () => {
    const { result, rerender } = renderHook(
      ({ open }: { open: boolean }) => useSheet({ open }),
      { initialProps: { open: false } },
    );
    expect(result.current.isOpen).toBe(false);
    rerender({ open: true });
    expect(result.current.isOpen).toBe(true);
    rerender({ open: false });
    expect(result.current.isOpen).toBe(false);
  });

  test("sheetProps.role is 'dialog'", () => {
    const { result } = renderHook(() => useSheet());
    expect(result.current.sheetProps.role).toBe("dialog");
  });

  test("sheetProps['aria-modal'] is true", () => {
    const { result } = renderHook(() => useSheet());
    expect(result.current.sheetProps["aria-modal"]).toBe(true);
  });

  test("sheetProps has aria-labelledby and aria-describedby", () => {
    const { result } = renderHook(() => useSheet());
    expect(result.current.sheetProps["aria-labelledby"]).toBeTruthy();
    expect(result.current.sheetProps["aria-describedby"]).toBeTruthy();
  });

  test("overlayProps has data-rsh-overlay attribute", () => {
    const { result } = renderHook(() => useSheet());
    expect(result.current.overlayProps["data-rsh-overlay"]).toBe("true");
  });

  test("handleProps has data-rsh-handle attribute", () => {
    const { result } = renderHook(() => useSheet());
    expect(result.current.handleProps["data-rsh-handle"]).toBe("true");
  });

  test("Escape key closes sheet when closeOnEsc is true", () => {
    const { result } = renderHook(() => useSheet({ closeOnEsc: true }));
    act(() => {
      result.current.open();
    });
    expect(result.current.isOpen).toBe(true);
    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    });
    expect(result.current.isOpen).toBe(false);
  });

  test("Escape key does NOT close sheet when closeOnEsc is false", () => {
    const { result } = renderHook(() => useSheet({ closeOnEsc: false }));
    act(() => {
      result.current.open();
    });
    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    });
    expect(result.current.isOpen).toBe(true);
  });

  test("body scroll locked on open", () => {
    const { result } = renderHook(() => useSheet());
    act(() => {
      result.current.open();
    });
    expect(document.body.style.overflow).toBe("hidden");
  });

  test("body scroll unlocked on close", () => {
    const { result } = renderHook(() => useSheet({ defaultOpen: true }));
    act(() => {
      result.current.close();
    });
    expect(document.body.style.overflow).toBe("");
  });

  test("lockBodyScroll=false does not lock body scroll", () => {
    const { result } = renderHook(() => useSheet({ lockBodyScroll: false }));
    act(() => {
      result.current.open();
    });
    expect(document.body.style.overflow).toBe("");
  });

  test("swipeToDismiss=false: dragY stays 0 on pointer events", () => {
    const { result } = renderHook(() => useSheet({ swipeToDismiss: false }));
    act(() => {
      result.current.open();
    });
    expect(result.current.dragY).toBe(0);
  });

  test("dragY is initially 0", () => {
    const { result } = renderHook(() => useSheet());
    expect(result.current.dragY).toBe(0);
  });

  test("unmount cleans up scroll lock", () => {
    const { result, unmount } = renderHook(() => useSheet());
    act(() => {
      result.current.open();
    });
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("");
  });
});
