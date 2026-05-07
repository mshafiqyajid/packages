import { render, screen, act, cleanup } from "@testing-library/react";
import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import { ModalStyled } from "./ModalStyled";

function mockMatchMedia(narrow: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: query.includes("640") ? narrow : false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

describe("ModalStyled — mobileVariant=sheet", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    // Restore matchMedia stub to default narrow=false
    mockMatchMedia(false);
  });

  test("renders rmod-sheet-handle when narrow viewport", async () => {
    mockMatchMedia(true);
    render(
      <ModalStyled open onClose={vi.fn()} title="Sheet" mobileVariant="sheet">
        content
      </ModalStyled>,
    );
    await act(async () => {
      vi.runAllTimers();
    });
    expect(document.querySelector(".rmod-sheet-handle")).toBeTruthy();
  });

  test("does NOT render sheet-handle on wide viewport", async () => {
    mockMatchMedia(false);
    render(
      <ModalStyled open onClose={vi.fn()} title="Wide" mobileVariant="sheet">
        content
      </ModalStyled>,
    );
    await act(async () => {
      vi.runAllTimers();
    });
    expect(document.querySelector(".rmod-sheet-handle")).toBeFalsy();
  });

  test("panel has data-variant=sheet on narrow viewport", async () => {
    mockMatchMedia(true);
    render(
      <ModalStyled open onClose={vi.fn()} title="Sheet" mobileVariant="sheet">
        content
      </ModalStyled>,
    );
    await act(async () => {
      vi.runAllTimers();
    });
    const panel = document.querySelector(".rmod-panel");
    expect(panel?.getAttribute("data-variant")).toBe("sheet");
  });

  test("panel has data-variant=dialog when mobileVariant is default", async () => {
    mockMatchMedia(true);
    render(
      <ModalStyled open onClose={vi.fn()} title="Dialog">
        content
      </ModalStyled>,
    );
    await act(async () => {
      vi.runAllTimers();
    });
    const panel = document.querySelector(".rmod-panel");
    expect(panel?.getAttribute("data-variant")).toBe("dialog");
  });

  test("drag dismiss calls onClose when > 40% of panel height", async () => {
    mockMatchMedia(true);
    const onClose = vi.fn();
    render(
      <ModalStyled open onClose={onClose} title="Sheet" mobileVariant="sheet">
        content
      </ModalStyled>,
    );
    await act(async () => {
      vi.runAllTimers();
    });
    const panel = document.querySelector(".rmod-panel") as HTMLElement;
    Object.defineProperty(panel, "offsetHeight", { value: 400, configurable: true });

    act(() => {
      panel.dispatchEvent(
        new PointerEvent("pointerdown", { clientY: 100, bubbles: true, pointerId: 1 }),
      );
    });
    act(() => {
      panel.dispatchEvent(
        new PointerEvent("pointermove", { clientY: 280, bubbles: true, pointerId: 1 }),
      );
    });
    act(() => {
      panel.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 1 }));
    });
    await act(async () => {
      await Promise.resolve();
      vi.runAllTimers();
    });
    expect(onClose).toHaveBeenCalled();
  });

  test("does NOT close when drag < 40% of panel height", async () => {
    mockMatchMedia(true);
    const onClose = vi.fn();
    render(
      <ModalStyled open onClose={onClose} title="Sheet" mobileVariant="sheet">
        content
      </ModalStyled>,
    );
    await act(async () => {
      vi.runAllTimers();
    });
    const panel = document.querySelector(".rmod-panel") as HTMLElement;
    Object.defineProperty(panel, "offsetHeight", { value: 400, configurable: true });

    act(() => {
      panel.dispatchEvent(
        new PointerEvent("pointerdown", { clientY: 100, bubbles: true, pointerId: 1 }),
      );
    });
    act(() => {
      panel.dispatchEvent(
        new PointerEvent("pointermove", { clientY: 150, bubbles: true, pointerId: 1 }),
      );
    });
    act(() => {
      panel.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 1 }));
    });
    await act(async () => {
      await Promise.resolve();
      vi.runAllTimers();
    });
    expect(onClose).not.toHaveBeenCalled();
  });
});
