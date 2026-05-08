import { act, fireEvent, renderHook } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { useNavbar } from "./useNavbar";

describe("useNavbar — initial state", () => {
  test("isMenuOpen defaults to false", () => {
    const { result } = renderHook(() => useNavbar());
    expect(result.current.isMenuOpen).toBe(false);
  });

  test("navProps has role=navigation", () => {
    const { result } = renderHook(() => useNavbar());
    expect(result.current.navProps.role).toBe("navigation");
  });

  test("navProps has aria-label Main navigation", () => {
    const { result } = renderHook(() => useNavbar());
    expect(result.current.navProps["aria-label"]).toBe("Main navigation");
  });

  test("toggleProps aria-expanded matches isMenuOpen (false initially)", () => {
    const { result } = renderHook(() => useNavbar());
    expect(result.current.toggleProps["aria-expanded"]).toBe(false);
  });

  test("menuProps id is rnav-menu", () => {
    const { result } = renderHook(() => useNavbar());
    expect(result.current.menuProps.id).toBe("rnav-menu");
  });

  test("toggleProps aria-controls matches menuProps id", () => {
    const { result } = renderHook(() => useNavbar());
    expect(result.current.toggleProps["aria-controls"]).toBe(
      result.current.menuProps.id,
    );
  });
});

describe("useNavbar — toggleProps.onClick", () => {
  test("clicking toggle opens the menu", () => {
    const { result } = renderHook(() => useNavbar());
    act(() => {
      result.current.toggleProps.onClick();
    });
    expect(result.current.isMenuOpen).toBe(true);
  });

  test("clicking toggle twice closes the menu", () => {
    const { result } = renderHook(() => useNavbar());
    act(() => {
      result.current.toggleProps.onClick();
    });
    act(() => {
      result.current.toggleProps.onClick();
    });
    expect(result.current.isMenuOpen).toBe(false);
  });

  test("aria-expanded updates when menu is toggled", () => {
    const { result } = renderHook(() => useNavbar());
    act(() => {
      result.current.toggleProps.onClick();
    });
    expect(result.current.toggleProps["aria-expanded"]).toBe(true);
  });
});

describe("useNavbar — onMenuToggle callback", () => {
  test("onMenuToggle is called with true when menu opens", () => {
    const onMenuToggle = vi.fn();
    const { result } = renderHook(() => useNavbar({ onMenuToggle }));
    act(() => {
      result.current.toggleProps.onClick();
    });
    expect(onMenuToggle).toHaveBeenCalledOnce();
    expect(onMenuToggle).toHaveBeenCalledWith(true);
  });

  test("onMenuToggle is called with false when menu closes", () => {
    const onMenuToggle = vi.fn();
    const { result } = renderHook(() => useNavbar({ onMenuToggle }));
    act(() => {
      result.current.toggleProps.onClick();
    });
    act(() => {
      result.current.toggleProps.onClick();
    });
    expect(onMenuToggle).toHaveBeenCalledTimes(2);
    expect(onMenuToggle).toHaveBeenLastCalledWith(false);
  });
});

describe("useNavbar — isScrolled", () => {
  test("isScrolled is false when scrollY is 0", () => {
    Object.defineProperty(window, "scrollY", { value: 0, writable: true, configurable: true });
    const { result } = renderHook(() => useNavbar({ scrollThreshold: 16 }));
    expect(result.current.isScrolled).toBe(false);
  });

  test("isScrolled becomes true when scrollY exceeds threshold", () => {
    Object.defineProperty(window, "scrollY", { value: 0, writable: true, configurable: true });
    const { result } = renderHook(() => useNavbar({ scrollThreshold: 16 }));
    expect(result.current.isScrolled).toBe(false);

    act(() => {
      Object.defineProperty(window, "scrollY", { value: 100, writable: true, configurable: true });
      fireEvent.scroll(window);
    });

    expect(result.current.isScrolled).toBe(true);
  });

  test("isScrolled becomes false when scrollY drops below threshold", () => {
    Object.defineProperty(window, "scrollY", { value: 100, writable: true, configurable: true });
    const { result } = renderHook(() => useNavbar({ scrollThreshold: 16 }));
    expect(result.current.isScrolled).toBe(true);

    act(() => {
      Object.defineProperty(window, "scrollY", { value: 0, writable: true, configurable: true });
      fireEvent.scroll(window);
    });

    expect(result.current.isScrolled).toBe(false);
  });
});

describe("useNavbar — Escape key", () => {
  test("Escape closes the menu when it is open", () => {
    const { result } = renderHook(() => useNavbar());
    act(() => {
      result.current.toggleProps.onClick();
    });
    expect(result.current.isMenuOpen).toBe(true);

    act(() => {
      fireEvent.keyDown(document, { key: "Escape" });
    });

    expect(result.current.isMenuOpen).toBe(false);
  });

  test("Escape does nothing when menu is already closed", () => {
    const onMenuToggle = vi.fn();
    const { result } = renderHook(() => useNavbar({ onMenuToggle }));
    expect(result.current.isMenuOpen).toBe(false);

    act(() => {
      fireEvent.keyDown(document, { key: "Escape" });
    });

    expect(result.current.isMenuOpen).toBe(false);
    expect(onMenuToggle).not.toHaveBeenCalled();
  });

  test("Escape fires onMenuToggle with false when closing", () => {
    const onMenuToggle = vi.fn();
    const { result } = renderHook(() => useNavbar({ onMenuToggle }));
    act(() => {
      result.current.toggleProps.onClick();
    });
    onMenuToggle.mockClear();

    act(() => {
      fireEvent.keyDown(document, { key: "Escape" });
    });

    expect(onMenuToggle).toHaveBeenCalledOnce();
    expect(onMenuToggle).toHaveBeenCalledWith(false);
  });
});
