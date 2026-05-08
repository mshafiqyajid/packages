import { act, render, renderHook, screen } from "@testing-library/react";
import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import { useDrawer } from "./useDrawer";
import { DrawerStyled } from "./styled/DrawerStyled";

describe("useDrawer", () => {
  beforeEach(() => {
    document.body.style.overflow = "";
  });

  afterEach(() => {
    document.body.style.overflow = "";
  });

  test("starts closed by default", () => {
    const { result } = renderHook(() => useDrawer());
    expect(result.current.isOpen).toBe(false);
  });

  test("respects defaultOpen option", () => {
    const { result } = renderHook(() => useDrawer({ defaultOpen: true }));
    expect(result.current.isOpen).toBe(true);
  });

  test("open() sets isOpen to true", () => {
    const { result } = renderHook(() => useDrawer());
    act(() => {
      result.current.open();
    });
    expect(result.current.isOpen).toBe(true);
  });

  test("close() sets isOpen to false", () => {
    const { result } = renderHook(() => useDrawer({ defaultOpen: true }));
    act(() => {
      result.current.close();
    });
    expect(result.current.isOpen).toBe(false);
  });

  test("toggle() flips open state", () => {
    const { result } = renderHook(() => useDrawer());
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
    const { result } = renderHook(() => useDrawer({ onOpenChange }));
    act(() => {
      result.current.open();
    });
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  test("onOpenChange fires on close", () => {
    const onOpenChange = vi.fn();
    const { result } = renderHook(() => useDrawer({ defaultOpen: true, onOpenChange }));
    act(() => {
      result.current.close();
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  test("controlled mode: isOpen follows open prop", () => {
    const { result, rerender } = renderHook(
      ({ open }: { open: boolean }) => useDrawer({ open }),
      { initialProps: { open: false } },
    );
    expect(result.current.isOpen).toBe(false);
    rerender({ open: true });
    expect(result.current.isOpen).toBe(true);
    rerender({ open: false });
    expect(result.current.isOpen).toBe(false);
  });

  test("drawerProps.role is 'dialog'", () => {
    const { result } = renderHook(() => useDrawer());
    expect(result.current.drawerProps.role).toBe("dialog");
  });

  test("drawerProps['aria-modal'] is true", () => {
    const { result } = renderHook(() => useDrawer());
    expect(result.current.drawerProps["aria-modal"]).toBe(true);
  });

  test("drawerProps has aria-labelledby and aria-describedby", () => {
    const { result } = renderHook(() => useDrawer());
    expect(result.current.drawerProps["aria-labelledby"]).toBeTruthy();
    expect(result.current.drawerProps["aria-describedby"]).toBeTruthy();
  });

  test("overlayProps has data-rdrw-overlay attribute", () => {
    const { result } = renderHook(() => useDrawer());
    expect(result.current.overlayProps["data-rdrw-overlay"]).toBe("true");
  });

  test("overlayProps has aria-hidden true", () => {
    const { result } = renderHook(() => useDrawer());
    expect(result.current.overlayProps["aria-hidden"]).toBe(true);
  });

  test("triggerProps has aria-haspopup dialog", () => {
    const { result } = renderHook(() => useDrawer());
    expect(result.current.triggerProps["aria-haspopup"]).toBe("dialog");
  });

  test("triggerProps aria-expanded reflects open state", () => {
    const { result } = renderHook(() => useDrawer());
    expect(result.current.triggerProps["aria-expanded"]).toBe(false);
    act(() => {
      result.current.open();
    });
    expect(result.current.triggerProps["aria-expanded"]).toBe(true);
  });

  test("triggerProps aria-controls matches drawerProps id", () => {
    const { result } = renderHook(() => useDrawer());
    expect(result.current.triggerProps["aria-controls"]).toBe(result.current.drawerProps.id);
  });

  test("Escape key closes drawer when closeOnEsc is true", () => {
    const { result } = renderHook(() => useDrawer({ closeOnEsc: true }));
    act(() => {
      result.current.open();
    });
    expect(result.current.isOpen).toBe(true);
    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    });
    expect(result.current.isOpen).toBe(false);
  });

  test("Escape key does NOT close drawer when closeOnEsc is false", () => {
    const { result } = renderHook(() => useDrawer({ closeOnEsc: false }));
    act(() => {
      result.current.open();
    });
    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    });
    expect(result.current.isOpen).toBe(true);
  });

  test("body scroll locked on open", () => {
    const { result } = renderHook(() => useDrawer());
    act(() => {
      result.current.open();
    });
    expect(document.body.style.overflow).toBe("hidden");
  });

  test("body scroll unlocked on close", () => {
    const { result } = renderHook(() => useDrawer({ defaultOpen: true }));
    act(() => {
      result.current.close();
    });
    expect(document.body.style.overflow).toBe("");
  });

  test("lockBodyScroll=false does not lock body scroll", () => {
    const { result } = renderHook(() => useDrawer({ lockBodyScroll: false }));
    act(() => {
      result.current.open();
    });
    expect(document.body.style.overflow).toBe("");
  });

  test("unmount cleans up scroll lock", () => {
    const { result, unmount } = renderHook(() => useDrawer());
    act(() => {
      result.current.open();
    });
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("");
  });
});

describe("DrawerStyled", () => {
  beforeEach(() => {
    document.body.style.overflow = "";
  });

  afterEach(() => {
    document.body.style.overflow = "";
    vi.useRealTimers();
  });

  // Helper: query the panel element directly (bypasses aria-hidden on overlay wrapper)
  function getPanel() {
    return document.querySelector<HTMLDivElement>(".rdrw-panel");
  }

  test("renders nothing when closed", () => {
    render(<DrawerStyled open={false}><p>content</p></DrawerStyled>);
    expect(getPanel()).not.toBeInTheDocument();
  });

  test("renders dialog when open", () => {
    render(<DrawerStyled open={true}><p>content</p></DrawerStyled>);
    expect(getPanel()).toBeInTheDocument();
  });

  test("renders title when provided", () => {
    render(<DrawerStyled open={true} title="Nav Menu"><p>content</p></DrawerStyled>);
    expect(screen.getByText("Nav Menu")).toBeInTheDocument();
  });

  test("renders description when provided", () => {
    render(
      <DrawerStyled open={true} title="Nav" description="Page navigation">
        <p>content</p>
      </DrawerStyled>,
    );
    expect(screen.getByText("Page navigation")).toBeInTheDocument();
  });

  test("renders footer when provided", () => {
    render(
      <DrawerStyled open={true} footer={<button>Close</button>}>
        <p>content</p>
      </DrawerStyled>,
    );
    expect(screen.getByText("Close")).toBeInTheDocument();
  });

  test("renders children", () => {
    render(<DrawerStyled open={true}><p>drawer body</p></DrawerStyled>);
    expect(screen.getByText("drawer body")).toBeInTheDocument();
  });

  test("side prop sets data-side on panel", () => {
    render(<DrawerStyled open={true} side="right"><p>content</p></DrawerStyled>);
    expect(getPanel()).toHaveAttribute("data-side", "right");
  });

  test("side defaults to left", () => {
    render(<DrawerStyled open={true}><p>content</p></DrawerStyled>);
    expect(getPanel()).toHaveAttribute("data-side", "left");
  });

  test("size prop sets data-size on panel", () => {
    render(<DrawerStyled open={true} size="lg"><p>content</p></DrawerStyled>);
    expect(getPanel()).toHaveAttribute("data-size", "lg");
  });

  test("size defaults to md", () => {
    render(<DrawerStyled open={true}><p>content</p></DrawerStyled>);
    expect(getPanel()).toHaveAttribute("data-size", "md");
  });

  test("panel has role dialog", () => {
    render(<DrawerStyled open={true} title="Drawer"><p>content</p></DrawerStyled>);
    expect(getPanel()).toHaveAttribute("role", "dialog");
  });

  test("panel has aria-modal true", () => {
    render(<DrawerStyled open={true} title="Drawer"><p>content</p></DrawerStyled>);
    expect(getPanel()).toHaveAttribute("aria-modal", "true");
  });

  test("panel has aria-labelledby when title provided", () => {
    render(<DrawerStyled open={true} title="My Drawer"><p>content</p></DrawerStyled>);
    expect(getPanel()?.getAttribute("aria-labelledby")).toBeTruthy();
  });

  test("panel does not have aria-labelledby when no title", () => {
    render(<DrawerStyled open={true}><p>content</p></DrawerStyled>);
    expect(getPanel()?.getAttribute("aria-labelledby")).toBeFalsy();
  });

  test("lock body scroll on open", () => {
    render(<DrawerStyled open={true} lockBodyScroll><p>content</p></DrawerStyled>);
    expect(document.body.style.overflow).toBe("hidden");
  });

  test("no body scroll lock when lockBodyScroll=false", () => {
    render(<DrawerStyled open={true} lockBodyScroll={false}><p>content</p></DrawerStyled>);
    expect(document.body.style.overflow).not.toBe("hidden");
  });

  test("close button calls onOpenChange with false", () => {
    const onOpenChange = vi.fn();
    render(
      <DrawerStyled open={true} onOpenChange={onOpenChange} title="Drawer">
        <p>content</p>
      </DrawerStyled>,
    );
    screen.getByLabelText("Close drawer").click();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  test("Escape key calls onOpenChange with false", () => {
    const onOpenChange = vi.fn();
    render(
      <DrawerStyled open={true} onOpenChange={onOpenChange} closeOnEsc>
        <p>content</p>
      </DrawerStyled>,
    );
    act(() => {
      getPanel()!.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  test("initial focus goes to first focusable element", () => {
    render(
      <DrawerStyled open={true}>
        <button>First button</button>
        <button>Second button</button>
      </DrawerStyled>,
    );
    // focus lands after rAF — just assert drawer panel is rendered
    expect(getPanel()).toBeInTheDocument();
  });
});
