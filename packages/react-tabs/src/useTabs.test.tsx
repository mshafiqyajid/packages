import { act, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { useTabs } from "./useTabs";

const TABS = [
  { value: "a" },
  { value: "b" },
  { value: "c" },
];

const TABS_WITH_DISABLED = [
  { value: "a" },
  { value: "b", disabled: true },
  { value: "c" },
];

describe("useTabs — initial state", () => {
  test("activeValue is undefined when no defaultValue is provided", () => {
    const { result } = renderHook(() => useTabs({ tabs: TABS }));
    expect(result.current.activeValue).toBeUndefined();
  });

  test("respects defaultValue", () => {
    const { result } = renderHook(() =>
      useTabs({ tabs: TABS, defaultValue: "b" }),
    );
    expect(result.current.activeValue).toBe("b");
  });
});

describe("useTabs — uncontrolled", () => {
  test("setActiveValue updates activeValue and fires onChange", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useTabs({ tabs: TABS, defaultValue: "a", onChange }),
    );
    act(() => {
      result.current.setActiveValue("b");
    });
    expect(result.current.activeValue).toBe("b");
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith("b");
  });

  test("setActiveValue does not fire onChange when value is same", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useTabs({ tabs: TABS, defaultValue: "a", onChange }),
    );
    act(() => {
      result.current.setActiveValue("a");
    });
    expect(onChange).not.toHaveBeenCalled();
  });

  test("setActiveValue is a no-op for a disabled tab", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useTabs({ tabs: TABS_WITH_DISABLED, defaultValue: "a", onChange }),
    );
    act(() => {
      result.current.setActiveValue("b");
    });
    expect(result.current.activeValue).toBe("a");
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("useTabs — controlled", () => {
  test("controlled value is reflected in activeValue", () => {
    const { result, rerender } = renderHook(
      (props: { value: string }) => useTabs({ tabs: TABS, ...props }),
      { initialProps: { value: "a" } },
    );
    expect(result.current.activeValue).toBe("a");
    rerender({ value: "c" });
    expect(result.current.activeValue).toBe("c");
  });

  test("onChange fires but internal state is not mutated in controlled mode", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useTabs({ tabs: TABS, value: "a", onChange }),
    );
    act(() => {
      result.current.setActiveValue("b");
    });
    expect(result.current.activeValue).toBe("a");
    expect(onChange).toHaveBeenCalledWith("b");
  });
});

describe("useTabs — getTabProps", () => {
  test("returns correct role and aria-selected for active tab", () => {
    const { result } = renderHook(() =>
      useTabs({ tabs: TABS, defaultValue: "a" }),
    );
    const props = result.current.getTabProps("a");
    expect(props.role).toBe("tab");
    expect(props["aria-selected"]).toBe(true);
    expect(props.tabIndex).toBe(0);
  });

  test("returns aria-selected=false and tabIndex=-1 for inactive tab", () => {
    const { result } = renderHook(() =>
      useTabs({ tabs: TABS, defaultValue: "a" }),
    );
    const props = result.current.getTabProps("b");
    expect(props["aria-selected"]).toBe(false);
    expect(props.tabIndex).toBe(-1);
  });

  test("aria-controls matches the panel id", () => {
    const { result } = renderHook(() =>
      useTabs({ tabs: TABS, defaultValue: "a" }),
    );
    const tabProps = result.current.getTabProps("a");
    const panelProps = result.current.getPanelProps("a");
    expect(tabProps["aria-controls"]).toBe(panelProps.id);
  });

  test("aria-labelledby on panel matches tab id", () => {
    const { result } = renderHook(() =>
      useTabs({ tabs: TABS, defaultValue: "a" }),
    );
    const tabProps = result.current.getTabProps("a");
    const panelProps = result.current.getPanelProps("a");
    expect(panelProps["aria-labelledby"]).toBe(tabProps.id);
  });
});

describe("useTabs — getPanelProps", () => {
  test("active panel is not hidden", () => {
    const { result } = renderHook(() =>
      useTabs({ tabs: TABS, defaultValue: "a" }),
    );
    expect(result.current.getPanelProps("a").hidden).toBe(false);
  });

  test("inactive panel is hidden", () => {
    const { result } = renderHook(() =>
      useTabs({ tabs: TABS, defaultValue: "a" }),
    );
    expect(result.current.getPanelProps("b").hidden).toBe(true);
    expect(result.current.getPanelProps("c").hidden).toBe(true);
  });

  test("returns correct role", () => {
    const { result } = renderHook(() =>
      useTabs({ tabs: TABS, defaultValue: "a" }),
    );
    expect(result.current.getPanelProps("a").role).toBe("tabpanel");
  });
});

describe("useTabs — keyboard navigation", () => {
  function TabsFixture({
    defaultValue,
    onChange,
  }: {
    defaultValue?: string;
    onChange?: (v: string) => void;
  }) {
    const { getTabProps, getPanelProps } = useTabs({
      tabs: TABS,
      defaultValue,
      onChange,
    });
    return (
      <div>
        <div role="tablist">
          <button {...getTabProps("a")}>A</button>
          <button {...getTabProps("b")}>B</button>
          <button {...getTabProps("c")}>C</button>
        </div>
        <div {...getPanelProps("a")}>Panel A</div>
        <div {...getPanelProps("b")}>Panel B</div>
        <div {...getPanelProps("c")}>Panel C</div>
      </div>
    );
  }

  test("ArrowRight moves focus to next tab", () => {
    const onChange = vi.fn();
    render(<TabsFixture defaultValue="a" onChange={onChange} />);
    const tabA = screen.getByRole("tab", { name: "A" });
    tabA.focus();
    fireEvent.keyDown(tabA, { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledWith("b");
  });

  test("ArrowLeft moves focus to previous tab", () => {
    const onChange = vi.fn();
    render(<TabsFixture defaultValue="b" onChange={onChange} />);
    const tabB = screen.getByRole("tab", { name: "B" });
    tabB.focus();
    fireEvent.keyDown(tabB, { key: "ArrowLeft" });
    expect(onChange).toHaveBeenCalledWith("a");
  });

  test("Home moves to first tab", () => {
    const onChange = vi.fn();
    render(<TabsFixture defaultValue="c" onChange={onChange} />);
    const tabC = screen.getByRole("tab", { name: "C" });
    tabC.focus();
    fireEvent.keyDown(tabC, { key: "Home" });
    expect(onChange).toHaveBeenCalledWith("a");
  });

  test("End moves to last tab", () => {
    const onChange = vi.fn();
    render(<TabsFixture defaultValue="a" onChange={onChange} />);
    const tabA = screen.getByRole("tab", { name: "A" });
    tabA.focus();
    fireEvent.keyDown(tabA, { key: "End" });
    expect(onChange).toHaveBeenCalledWith("c");
  });

  test("ArrowRight wraps around from last tab to first", () => {
    const onChange = vi.fn();
    render(<TabsFixture defaultValue="c" onChange={onChange} />);
    const tabC = screen.getByRole("tab", { name: "C" });
    tabC.focus();
    fireEvent.keyDown(tabC, { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledWith("a");
  });

  test("ArrowLeft wraps around from first tab to last", () => {
    const onChange = vi.fn();
    render(<TabsFixture defaultValue="a" onChange={onChange} />);
    const tabA = screen.getByRole("tab", { name: "A" });
    tabA.focus();
    fireEvent.keyDown(tabA, { key: "ArrowLeft" });
    expect(onChange).toHaveBeenCalledWith("c");
  });

  test("disabled tab is skipped during keyboard navigation", () => {
    const onChange = vi.fn();

    function DisabledTabsFixture() {
      const { getTabProps, getPanelProps } = useTabs({
        tabs: TABS_WITH_DISABLED,
        defaultValue: "a",
        onChange,
      });
      return (
        <div>
          <div role="tablist">
            <button {...getTabProps("a")}>A</button>
            <button {...getTabProps("b")}>B</button>
            <button {...getTabProps("c")}>C</button>
          </div>
          <div {...getPanelProps("a")}>Panel A</div>
          <div {...getPanelProps("b")}>Panel B</div>
          <div {...getPanelProps("c")}>Panel C</div>
        </div>
      );
    }

    render(<DisabledTabsFixture />);
    const tabA = screen.getByRole("tab", { name: "A" });
    tabA.focus();
    fireEvent.keyDown(tabA, { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledWith("c");
  });
});

describe("useTabs — accessibility", () => {
  test("panel has tabIndex=0", () => {
    const { result } = renderHook(() =>
      useTabs({ tabs: TABS, defaultValue: "a" }),
    );
    expect(result.current.getPanelProps("a").tabIndex).toBe(0);
  });

  test("disabled tab has aria-disabled set", () => {
    const { result } = renderHook(() =>
      useTabs({ tabs: TABS_WITH_DISABLED, defaultValue: "a" }),
    );
    const props = result.current.getTabProps("b");
    expect(props["aria-disabled"]).toBe(true);
  });

  test("non-disabled tab does not have aria-disabled", () => {
    const { result } = renderHook(() =>
      useTabs({ tabs: TABS, defaultValue: "a" }),
    );
    const props = result.current.getTabProps("a");
    expect(props["aria-disabled"]).toBeUndefined();
  });
});
