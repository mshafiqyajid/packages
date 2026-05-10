import { renderHook, act } from "@testing-library/react";
import { useRef } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useSpotlight } from "./useSpotlight";

// Mock ResizeObserver
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
beforeEach(() => {
  Object.defineProperty(window, "ResizeObserver", {
    writable: true,
    value: MockResizeObserver,
  });
});

describe("useSpotlight — open/close/toggle", () => {
  it("starts closed by default", () => {
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement | null>(null);
      return useSpotlight({ target: ref });
    });
    expect(result.current.isOpen).toBe(false);
  });

  it("opens via open()", () => {
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement | null>(null);
      return useSpotlight({ target: ref });
    });
    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);
  });

  it("closes via close()", () => {
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement | null>(null);
      return useSpotlight({ target: ref, defaultOpen: true });
    });
    expect(result.current.isOpen).toBe(true);
    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
  });

  it("toggles via toggle()", () => {
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement | null>(null);
      return useSpotlight({ target: ref });
    });
    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(true);
    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(false);
  });
});

describe("useSpotlight — controlled mode", () => {
  it("respects controlled open prop", () => {
    const { result, rerender } = renderHook(
      ({ open }: { open: boolean }) => {
        const ref = useRef<HTMLDivElement | null>(null);
        return useSpotlight({ target: ref, open });
      },
      { initialProps: { open: false } },
    );
    expect(result.current.isOpen).toBe(false);
    rerender({ open: true });
    expect(result.current.isOpen).toBe(true);
  });

  it("calls onOpenChange when open() is called in uncontrolled mode", () => {
    const onOpenChange = vi.fn();
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement | null>(null);
      return useSpotlight({ target: ref, onOpenChange });
    });
    act(() => result.current.open());
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });
});

describe("useSpotlight — overlayProps", () => {
  it("overlay has role=dialog and aria-modal=true", () => {
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement | null>(null);
      return useSpotlight({ target: ref });
    });
    expect(result.current.overlayProps.role).toBe("dialog");
    expect(result.current.overlayProps["aria-modal"]).toBe(true);
    expect(result.current.overlayProps["aria-label"]).toBe("Spotlight");
  });

  it("data-open is set when open", () => {
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement | null>(null);
      return useSpotlight({ target: ref });
    });
    expect(result.current.overlayProps["data-open"]).toBeUndefined();
    act(() => result.current.open());
    expect(result.current.overlayProps["data-open"]).toBe("");
  });
});

describe("useSpotlight — keyboard close", () => {
  it("closes on Escape key via onKeyDown", () => {
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement | null>(null);
      return useSpotlight({ target: ref, defaultOpen: true });
    });
    expect(result.current.isOpen).toBe(true);
    act(() => {
      result.current.overlayProps.onKeyDown({
        key: "Escape",
        preventDefault: vi.fn(),
        shiftKey: false,
      } as unknown as React.KeyboardEvent);
    });
    expect(result.current.isOpen).toBe(false);
  });

  it("does not close on Escape when closeOnEscape=false", () => {
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement | null>(null);
      return useSpotlight({ target: ref, defaultOpen: true, closeOnEscape: false });
    });
    act(() => {
      result.current.overlayProps.onKeyDown({
        key: "Escape",
        preventDefault: vi.fn(),
        shiftKey: false,
      } as unknown as React.KeyboardEvent);
    });
    expect(result.current.isOpen).toBe(true);
  });
});

describe("useSpotlight — overlay click close", () => {
  it("closes when overlay is clicked (target === currentTarget)", () => {
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement | null>(null);
      return useSpotlight({ target: ref, defaultOpen: true });
    });
    const mockEl = document.createElement("div");
    act(() => {
      result.current.overlayProps.onClick({
        target: mockEl,
        currentTarget: mockEl,
      } as unknown as React.MouseEvent);
    });
    expect(result.current.isOpen).toBe(false);
  });

  it("does not close when closeOnOverlayClick=false", () => {
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement | null>(null);
      return useSpotlight({ target: ref, defaultOpen: true, closeOnOverlayClick: false });
    });
    const mockEl = document.createElement("div");
    act(() => {
      result.current.overlayProps.onClick({
        target: mockEl,
        currentTarget: mockEl,
      } as unknown as React.MouseEvent);
    });
    expect(result.current.isOpen).toBe(true);
  });

  it("does not close when click target differs from currentTarget (click on children)", () => {
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement | null>(null);
      return useSpotlight({ target: ref, defaultOpen: true });
    });
    const target = document.createElement("button");
    const currentTarget = document.createElement("div");
    act(() => {
      result.current.overlayProps.onClick({
        target,
        currentTarget,
      } as unknown as React.MouseEvent);
    });
    expect(result.current.isOpen).toBe(true);
  });
});

describe("useSpotlight — defaultOpen", () => {
  it("starts open when defaultOpen=true", () => {
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement | null>(null);
      return useSpotlight({ target: ref, defaultOpen: true });
    });
    expect(result.current.isOpen).toBe(true);
  });
});

describe("useSpotlight — CSS selector target", () => {
  it("accepts a CSS selector string as target", () => {
    const { result } = renderHook(() =>
      useSpotlight({ target: "#my-element" }),
    );
    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);
  });
});

describe("useSpotlight — targetRect", () => {
  it("targetRect is null when closed", () => {
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement | null>(null);
      return useSpotlight({ target: ref });
    });
    expect(result.current.targetRect).toBeNull();
  });

  it("targetRect is null when target element is not in DOM", () => {
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement | null>(null);
      return useSpotlight({ target: ref });
    });
    act(() => result.current.open());
    expect(result.current.targetRect).toBeNull();
  });
});

describe("useSpotlight — spotlightProps", () => {
  it("spotlightProps has a style object", () => {
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement | null>(null);
      return useSpotlight({ target: ref });
    });
    expect(result.current.spotlightProps).toHaveProperty("style");
    expect(typeof result.current.spotlightProps.style).toBe("object");
  });
});

describe("useSpotlight — placement variants", () => {
  const placements = [
    "top",
    "bottom",
    "left",
    "right",
    "top-start",
    "top-end",
    "bottom-start",
    "bottom-end",
  ] as const;

  placements.forEach((p) => {
    it(`returns valid overlayProps for placement="${p}"`, () => {
      const { result } = renderHook(() => {
        const ref = useRef<HTMLDivElement | null>(null);
        return useSpotlight({ target: ref, placement: p });
      });
      expect(result.current.overlayProps.role).toBe("dialog");
    });
  });
});

// ============================================================================
// Multi-step tour
// ============================================================================

describe("useSpotlight — multi-step tour", () => {
  function makeSteps() {
    return [
      { target: "#step-1", content: "Step 1 content" },
      { target: "#step-2", content: "Step 2 content" },
      { target: "#step-3", content: "Step 3 content" },
    ];
  }

  it("totalSteps equals steps.length", () => {
    const steps = makeSteps();
    const { result } = renderHook(() =>
      useSpotlight({ target: "#step-1", steps }),
    );
    expect(result.current.totalSteps).toBe(3);
  });

  it("starts at step 0 by default", () => {
    const steps = makeSteps();
    const { result } = renderHook(() =>
      useSpotlight({ target: "#step-1", steps }),
    );
    expect(result.current.step).toBe(0);
  });

  it("nextStep advances to step 1", () => {
    const steps = makeSteps();
    const { result } = renderHook(() =>
      useSpotlight({ target: "#step-1", steps }),
    );
    act(() => result.current.nextStep());
    expect(result.current.step).toBe(1);
  });

  it("prevStep goes back from step 1 to step 0", () => {
    const steps = makeSteps();
    const { result } = renderHook(() =>
      useSpotlight({ target: "#step-1", steps, defaultStep: 1 }),
    );
    act(() => result.current.prevStep());
    expect(result.current.step).toBe(0);
  });

  it("goToStep jumps to an arbitrary step", () => {
    const steps = makeSteps();
    const { result } = renderHook(() =>
      useSpotlight({ target: "#step-1", steps }),
    );
    act(() => result.current.goToStep(2));
    expect(result.current.step).toBe(2);
  });

  it("step is clamped — cannot exceed totalSteps - 1", () => {
    const steps = makeSteps();
    const { result } = renderHook(() =>
      useSpotlight({ target: "#step-1", steps, defaultStep: 2 }),
    );
    // At last step, nextStep should clamp at 2
    act(() => result.current.nextStep());
    expect(result.current.step).toBe(2);
  });

  it("step is clamped — cannot go below 0", () => {
    const steps = makeSteps();
    const { result } = renderHook(() =>
      useSpotlight({ target: "#step-1", steps, defaultStep: 0 }),
    );
    act(() => result.current.prevStep());
    expect(result.current.step).toBe(0);
  });

  it("onStepChange is called with the new step index", () => {
    const steps = makeSteps();
    const onStepChange = vi.fn();
    const { result } = renderHook(() =>
      useSpotlight({ target: "#step-1", steps, onStepChange }),
    );
    act(() => result.current.nextStep());
    expect(onStepChange).toHaveBeenCalledWith(1);
  });

  it("step 0 — prevStep does not decrement (boundary clamping)", () => {
    const steps = makeSteps();
    const { result } = renderHook(() =>
      useSpotlight({ target: "#step-1", steps }),
    );
    expect(result.current.step).toBe(0);
    act(() => result.current.prevStep());
    expect(result.current.step).toBe(0);
  });

  it("last step — nextStep does not increment (boundary clamping)", () => {
    const steps = makeSteps();
    const { result } = renderHook(() =>
      useSpotlight({ target: "#step-1", steps, defaultStep: 2 }),
    );
    expect(result.current.step).toBe(2);
    act(() => result.current.nextStep());
    expect(result.current.step).toBe(2);
  });
});

// ============================================================================
// Pulse animation
// ============================================================================

describe("useSpotlight — pulse", () => {
  it("data-pulse attribute is present when pulse=true", () => {
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement | null>(null);
      return useSpotlight({ target: ref, pulse: true });
    });
    expect(result.current.overlayProps["data-pulse"]).toBe("");
  });

  it("data-pulse attribute is absent when pulse=false (default)", () => {
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement | null>(null);
      return useSpotlight({ target: ref });
    });
    expect(result.current.overlayProps["data-pulse"]).toBeUndefined();
  });
});

// ============================================================================
// Backdrop blur
// ============================================================================

describe("useSpotlight — backdropBlur", () => {
  it("sets --rspot-backdrop-blur CSS variable on overlay style when backdropBlur > 0", () => {
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement | null>(null);
      return useSpotlight({ target: ref, backdropBlur: 8 });
    });
    const style = result.current.overlayProps.style as Record<string, unknown>;
    expect(style["--rspot-backdrop-blur"]).toBe("8px");
  });

  it("does not set --rspot-backdrop-blur when backdropBlur is 0 (default)", () => {
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement | null>(null);
      return useSpotlight({ target: ref });
    });
    const style = result.current.overlayProps.style as Record<string, unknown>;
    expect(style["--rspot-backdrop-blur"]).toBeUndefined();
  });
});
