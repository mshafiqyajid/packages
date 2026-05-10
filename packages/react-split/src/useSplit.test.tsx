import { renderHook, act, render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useSplit } from "./useSplit";
import { SplitStyled } from "./styled/SplitStyled";

describe("useSplit — defaults", () => {
  it("returns default sizes [50, 50]", () => {
    const { result } = renderHook(() => useSplit());
    expect(result.current.sizes).toEqual([50, 50]);
  });

  it("returns custom defaultSizes", () => {
    const { result } = renderHook(() => useSplit({ defaultSizes: [30, 70] }));
    expect(result.current.sizes).toEqual([30, 70]);
  });

  it("isDragging starts as false", () => {
    const { result } = renderHook(() => useSplit());
    expect(result.current.isDragging).toBe(false);
  });
});

describe("useSplit — containerProps", () => {
  it("has correct data-orientation for horizontal", () => {
    const { result } = renderHook(() => useSplit({ orientation: "horizontal" }));
    expect(result.current.containerProps["data-orientation"]).toBe("horizontal");
  });

  it("has correct data-orientation for vertical", () => {
    const { result } = renderHook(() => useSplit({ orientation: "vertical" }));
    expect(result.current.containerProps["data-orientation"]).toBe("vertical");
  });

  it("does not have data-dragging when not dragging", () => {
    const { result } = renderHook(() => useSplit());
    expect(result.current.containerProps["data-dragging"]).toBeUndefined();
  });
});

describe("useSplit — getPaneProps", () => {
  it("pane 0 flex-basis reflects size[0]", () => {
    const { result } = renderHook(() => useSplit({ defaultSizes: [40, 60] }));
    const p0 = result.current.getPaneProps(0);
    expect(p0.style.flexBasis).toBe("40%");
  });

  it("pane 1 flex-basis reflects size[1]", () => {
    const { result } = renderHook(() => useSplit({ defaultSizes: [40, 60] }));
    const p1 = result.current.getPaneProps(1);
    expect(p1.style.flexBasis).toBe("60%");
  });

  it("pane has correct data-pane-index", () => {
    const { result } = renderHook(() => useSplit());
    expect(result.current.getPaneProps(0)["data-pane-index"]).toBe(0);
    expect(result.current.getPaneProps(1)["data-pane-index"]).toBe(1);
  });
});

describe("useSplit — getResizerProps", () => {
  it("has role=separator", () => {
    const { result } = renderHook(() => useSplit());
    expect(result.current.getResizerProps().role).toBe("separator");
  });

  it("has correct aria-orientation", () => {
    const { result } = renderHook(() => useSplit({ orientation: "vertical" }));
    expect(result.current.getResizerProps()["aria-orientation"]).toBe("vertical");
  });

  it("aria-valuenow reflects size[0]", () => {
    const { result } = renderHook(() => useSplit({ defaultSizes: [30, 70] }));
    expect(result.current.getResizerProps()["aria-valuenow"]).toBe(30);
  });

  it("aria-label is 'Resize panels'", () => {
    const { result } = renderHook(() => useSplit());
    expect(result.current.getResizerProps()["aria-label"]).toBe("Resize panels");
  });

  it("tabIndex is 0 when not disabled", () => {
    const { result } = renderHook(() => useSplit({ disabled: false }));
    expect(result.current.getResizerProps().tabIndex).toBe(0);
  });

  it("tabIndex is -1 when disabled", () => {
    const { result } = renderHook(() => useSplit({ disabled: true }));
    expect(result.current.getResizerProps().tabIndex).toBe(-1);
  });

  it("aria-disabled is set when disabled", () => {
    const { result } = renderHook(() => useSplit({ disabled: true }));
    expect(result.current.getResizerProps()["aria-disabled"]).toBe(true);
  });

  it("cursor is col-resize for horizontal", () => {
    const { result } = renderHook(() => useSplit({ orientation: "horizontal" }));
    expect(result.current.getResizerProps().style.cursor).toBe("col-resize");
  });

  it("cursor is row-resize for vertical", () => {
    const { result } = renderHook(() => useSplit({ orientation: "vertical" }));
    expect(result.current.getResizerProps().style.cursor).toBe("row-resize");
  });
});

describe("useSplit — keyboard navigation", () => {
  it("ArrowRight increases pane 0 by 1%", () => {
    const { result } = renderHook(() => useSplit({ defaultSizes: [50, 50] }));
    act(() => {
      result.current.getResizerProps().onKeyDown({
        key: "ArrowRight",
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    expect(result.current.sizes[0]).toBe(51);
    expect(result.current.sizes[1]).toBe(49);
  });

  it("ArrowLeft decreases pane 0 by 1%", () => {
    const { result } = renderHook(() => useSplit({ defaultSizes: [50, 50] }));
    act(() => {
      result.current.getResizerProps().onKeyDown({
        key: "ArrowLeft",
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    expect(result.current.sizes[0]).toBe(49);
    expect(result.current.sizes[1]).toBe(51);
  });

  it("Shift+ArrowRight increases by 5%", () => {
    const { result } = renderHook(() => useSplit({ defaultSizes: [50, 50] }));
    act(() => {
      result.current.getResizerProps().onKeyDown({
        key: "ArrowRight",
        shiftKey: true,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    expect(result.current.sizes[0]).toBe(55);
  });

  it("Shift+ArrowLeft decreases by 5%", () => {
    const { result } = renderHook(() => useSplit({ defaultSizes: [50, 50] }));
    act(() => {
      result.current.getResizerProps().onKeyDown({
        key: "ArrowLeft",
        shiftKey: true,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    expect(result.current.sizes[0]).toBe(45);
  });

  it("ArrowDown increases pane 0 in vertical mode", () => {
    const { result } = renderHook(() =>
      useSplit({ orientation: "vertical", defaultSizes: [50, 50] }),
    );
    act(() => {
      result.current.getResizerProps().onKeyDown({
        key: "ArrowDown",
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    expect(result.current.sizes[0]).toBe(51);
  });

  it("ArrowUp decreases pane 0 in vertical mode", () => {
    const { result } = renderHook(() =>
      useSplit({ orientation: "vertical", defaultSizes: [50, 50] }),
    );
    act(() => {
      result.current.getResizerProps().onKeyDown({
        key: "ArrowUp",
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    expect(result.current.sizes[0]).toBe(49);
  });

  it("Home snaps pane 0 to minSize", () => {
    const { result } = renderHook(() =>
      useSplit({ defaultSizes: [50, 50], minSize: 15 }),
    );
    act(() => {
      result.current.getResizerProps().onKeyDown({
        key: "Home",
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    expect(result.current.sizes[0]).toBe(15);
  });

  it("End snaps pane 0 to 100 - minSize[1]", () => {
    const { result } = renderHook(() =>
      useSplit({ defaultSizes: [50, 50], minSize: 15 }),
    );
    act(() => {
      result.current.getResizerProps().onKeyDown({
        key: "End",
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    expect(result.current.sizes[0]).toBe(85);
  });

  it("keyboard does nothing when disabled", () => {
    const { result } = renderHook(() =>
      useSplit({ defaultSizes: [50, 50], disabled: true }),
    );
    act(() => {
      result.current.getResizerProps().onKeyDown({
        key: "ArrowRight",
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    expect(result.current.sizes[0]).toBe(50);
  });
});

describe("useSplit — minSize clamping", () => {
  it("clamps below minSize", () => {
    const { result } = renderHook(() =>
      useSplit({ defaultSizes: [15, 85], minSize: 20 }),
    );
    act(() => {
      result.current.getResizerProps().onKeyDown({
        key: "ArrowLeft",
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    expect(result.current.sizes[0]).toBeGreaterThanOrEqual(20);
  });

  it("clamps above maxSize", () => {
    const { result } = renderHook(() =>
      useSplit({ defaultSizes: [80, 20], maxSize: 80 }),
    );
    act(() => {
      result.current.getResizerProps().onKeyDown({
        key: "ArrowRight",
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    expect(result.current.sizes[0]).toBeLessThanOrEqual(80);
  });
});

describe("useSplit — controlled mode", () => {
  it("uses controlled sizes", () => {
    const { result } = renderHook(() =>
      useSplit({ sizes: [30, 70] }),
    );
    expect(result.current.sizes).toEqual([30, 70]);
  });

  it("calls onResize on keyboard change", () => {
    const onResize = vi.fn();
    const { result } = renderHook(() =>
      useSplit({ sizes: [50, 50], onResize }),
    );
    act(() => {
      result.current.getResizerProps().onKeyDown({
        key: "ArrowRight",
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    expect(onResize).toHaveBeenCalledWith([51, 49]);
  });

  it("calls onResizeEnd on keyboard change", () => {
    const onResizeEnd = vi.fn();
    const { result } = renderHook(() =>
      useSplit({ sizes: [50, 50], onResizeEnd }),
    );
    act(() => {
      result.current.getResizerProps().onKeyDown({
        key: "ArrowRight",
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    expect(onResizeEnd).toHaveBeenCalledWith([51, 49]);
  });
});

describe("useSplit — per-pane minSize/maxSize", () => {
  it("supports [number, number] minSize", () => {
    const { result } = renderHook(() =>
      useSplit({ defaultSizes: [25, 75], minSize: [25, 20] }),
    );
    act(() => {
      result.current.getResizerProps().onKeyDown({
        key: "ArrowLeft",
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    expect(result.current.sizes[0]).toBeGreaterThanOrEqual(25);
  });
});

describe("useSplit — collapsible", () => {
  it("starts not collapsed by default", () => {
    const { result } = renderHook(() => useSplit({ collapsible: true }));
    expect(result.current.collapsed).toEqual([false, false]);
  });

  it("defaultCollapsed initialises collapsed state", () => {
    const { result } = renderHook(() =>
      useSplit({ collapsible: true, defaultCollapsed: [true, false] }),
    );
    expect(result.current.collapsed).toEqual([true, false]);
  });

  it("collapse(0) collapses pane 0", () => {
    const { result } = renderHook(() => useSplit({ collapsible: true }));
    act(() => {
      result.current.collapse(0);
    });
    expect(result.current.collapsed[0]).toBe(true);
    expect(result.current.collapsed[1]).toBe(false);
  });

  it("collapse(1) collapses pane 1", () => {
    const { result } = renderHook(() => useSplit({ collapsible: true }));
    act(() => {
      result.current.collapse(1);
    });
    expect(result.current.collapsed[1]).toBe(true);
    expect(result.current.collapsed[0]).toBe(false);
  });

  it("collapse(0) toggles: second call expands pane 0", () => {
    const { result } = renderHook(() => useSplit({ collapsible: true }));
    act(() => { result.current.collapse(0); });
    act(() => { result.current.collapse(0); });
    expect(result.current.collapsed[0]).toBe(false);
  });

  it("collapse(0, true) forces collapsed, collapse(0, false) forces expanded", () => {
    const { result } = renderHook(() => useSplit({ collapsible: true }));
    act(() => { result.current.collapse(0, true); });
    expect(result.current.collapsed[0]).toBe(true);
    act(() => { result.current.collapse(0, false); });
    expect(result.current.collapsed[0]).toBe(false);
  });

  it("collapses pane 0 sets size to [0, 100]", () => {
    const { result } = renderHook(() => useSplit({ collapsible: true, defaultSizes: [40, 60] }));
    act(() => { result.current.collapse(0); });
    expect(result.current.sizes).toEqual([0, 100]);
  });

  it("collapses pane 1 sets size to [100, 0]", () => {
    const { result } = renderHook(() => useSplit({ collapsible: true, defaultSizes: [40, 60] }));
    act(() => { result.current.collapse(1); });
    expect(result.current.sizes).toEqual([100, 0]);
  });

  it("calls onCollapseChange when collapsing", () => {
    const onCollapseChange = vi.fn();
    const { result } = renderHook(() =>
      useSplit({ collapsible: true, onCollapseChange }),
    );
    act(() => { result.current.collapse(0); });
    expect(onCollapseChange).toHaveBeenCalledWith([true, false]);
  });

  it("expanding restores previous sizes", () => {
    const { result } = renderHook(() => useSplit({ collapsible: true, defaultSizes: [40, 60] }));
    act(() => { result.current.collapse(0); });
    act(() => { result.current.collapse(0); });
    expect(result.current.sizes).toEqual([40, 60]);
  });

  it("containerProps has data-collapsed-0 when pane 0 is collapsed", () => {
    const { result } = renderHook(() => useSplit({ collapsible: true }));
    act(() => { result.current.collapse(0); });
    expect(result.current.containerProps["data-collapsed-0"]).toBe("true");
  });

  it("containerProps has data-collapsed-1 when pane 1 is collapsed", () => {
    const { result } = renderHook(() => useSplit({ collapsible: true }));
    act(() => { result.current.collapse(1); });
    expect(result.current.containerProps["data-collapsed-1"]).toBe("true");
  });

  it("getPaneProps returns data-collapsed for collapsed pane", () => {
    const { result } = renderHook(() => useSplit({ collapsible: true }));
    act(() => { result.current.collapse(0); });
    expect(result.current.getPaneProps(0)["data-collapsed"]).toBe("true");
    expect(result.current.getPaneProps(1)["data-collapsed"]).toBeUndefined();
  });

  it("per-pane collapsible [true, false] only allows collapse of pane 0", () => {
    const { result } = renderHook(() => useSplit({ collapsible: [true, false] }));
    act(() => { result.current.collapse(0); });
    expect(result.current.collapsed[0]).toBe(true);
  });
});

describe("useSplit — snap points", () => {
  it("snaps to 50 when within 3% of it from 52", () => {
    const { result } = renderHook(() =>
      useSplit({ defaultSizes: [52, 48], snapPoints: [25, 50, 75], minSize: 5, maxSize: 95 }),
    );
    act(() => {
      result.current.getResizerProps().onKeyDown({
        key: "ArrowLeft",
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    expect(result.current.sizes[0]).toBe(50);
  });

  it("snaps to 25 when within threshold", () => {
    const { result } = renderHook(() =>
      useSplit({ defaultSizes: [27, 73], snapPoints: [25, 50, 75], minSize: 5, maxSize: 95 }),
    );
    act(() => {
      result.current.getResizerProps().onKeyDown({
        key: "ArrowLeft",
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    expect(result.current.sizes[0]).toBe(25);
  });

  it("does not snap when outside threshold", () => {
    const { result } = renderHook(() =>
      useSplit({ defaultSizes: [40, 60], snapPoints: [25, 50, 75], minSize: 5, maxSize: 95 }),
    );
    act(() => {
      result.current.getResizerProps().onKeyDown({
        key: "ArrowLeft",
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    expect(result.current.sizes[0]).toBe(39);
  });

  it("works without snap points (no snapping behavior)", () => {
    const { result } = renderHook(() =>
      useSplit({ defaultSizes: [50, 50] }),
    );
    act(() => {
      result.current.getResizerProps().onKeyDown({
        key: "ArrowLeft",
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>);
    });
    expect(result.current.sizes[0]).toBe(49);
  });
});

describe("useSplit — persistent sizes", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("loads sizes from localStorage on mount", () => {
    localStorage.setItem("rspl:my-split", JSON.stringify([30, 70]));
    const { result } = renderHook(() => useSplit({ persistent: "my-split" }));
    expect(result.current.sizes).toEqual([30, 70]);
  });

  it("ignores invalid localStorage data and uses defaultSizes", () => {
    localStorage.setItem("rspl:my-split", "not-json");
    const { result } = renderHook(() =>
      useSplit({ persistent: "my-split", defaultSizes: [40, 60] }),
    );
    expect(result.current.sizes).toEqual([40, 60]);
  });

  it("ignores localStorage when sizes don't sum to 100", () => {
    localStorage.setItem("rspl:my-split", JSON.stringify([30, 60]));
    const { result } = renderHook(() =>
      useSplit({ persistent: "my-split", defaultSizes: [50, 50] }),
    );
    expect(result.current.sizes).toEqual([50, 50]);
  });

  it("uses different key prefix (rspl:) for different persistent values", () => {
    localStorage.setItem("rspl:split-a", JSON.stringify([35, 65]));
    localStorage.setItem("rspl:split-b", JSON.stringify([65, 35]));
    const { result: a } = renderHook(() => useSplit({ persistent: "split-a" }));
    const { result: b } = renderHook(() => useSplit({ persistent: "split-b" }));
    expect(a.current.sizes).toEqual([35, 65]);
    expect(b.current.sizes).toEqual([65, 35]);
  });
});

describe("SplitStyled — rendered markup", () => {
  it("renders two panes and a resizer", () => {
    render(
      <SplitStyled>
        <div data-testid="pane-a">Left</div>
        <div data-testid="pane-b">Right</div>
      </SplitStyled>,
    );
    expect(screen.getByTestId("pane-a")).toBeInTheDocument();
    expect(screen.getByTestId("pane-b")).toBeInTheDocument();
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("resizer has aria-label='Resize panels'", () => {
    render(
      <SplitStyled>
        <div>Left</div>
        <div>Right</div>
      </SplitStyled>,
    );
    const sep = screen.getByRole("separator");
    expect(sep).toHaveAttribute("aria-label", "Resize panels");
  });

  it("root has data-orientation attribute", () => {
    const { container } = render(
      <SplitStyled orientation="vertical">
        <div>Top</div>
        <div>Bottom</div>
      </SplitStyled>,
    );
    expect(container.firstChild).toHaveAttribute("data-orientation", "vertical");
  });

  it("applies custom className", () => {
    const { container } = render(
      <SplitStyled className="my-split">
        <div>Left</div>
        <div>Right</div>
      </SplitStyled>,
    );
    expect(container.firstChild).toHaveClass("rspl-root", "my-split");
  });

  it("forwards ref to container div", () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement>;
    render(
      <SplitStyled ref={ref}>
        <div>Left</div>
        <div>Right</div>
      </SplitStyled>,
    );
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe("DIV");
  });

  it("disabled state sets data-disabled attribute", () => {
    const { container } = render(
      <SplitStyled disabled>
        <div>Left</div>
        <div>Right</div>
      </SplitStyled>,
    );
    expect(container.firstChild).toHaveAttribute("data-disabled");
  });
});
