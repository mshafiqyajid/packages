import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { useState, type Ref } from "react";
import { useSortable } from "./useSortable";
import type { SortableItem } from "./useSortable";

interface TestItem extends SortableItem {
  id: string;
  label: string;
}

const ITEMS: TestItem[] = [
  { id: "a", label: "Alpha" },
  { id: "b", label: "Beta" },
  { id: "c", label: "Gamma" },
];

function TestSortable({
  initialItems = ITEMS,
  onReorder,
  orientation = "vertical",
  disabled = false,
}: {
  initialItems?: TestItem[];
  onReorder?: (items: TestItem[]) => void;
  orientation?: "vertical" | "horizontal";
  disabled?: boolean;
}) {
  const [items, setItems] = useState(initialItems);

  const { containerProps, getItemProps, getItemState, liveRegionText } =
    useSortable({
      items,
      onReorder: (next) => {
        setItems(next);
        onReorder?.(next);
      },
      orientation,
      disabled,
    });

  const { ref, ...restContainerProps } = containerProps;

  return (
    <div
      ref={ref as unknown as Ref<HTMLDivElement>}
      {...restContainerProps}
      data-testid="container"
    >
      {items.map((item) => {
        const props = getItemProps(item);
        const state = getItemState(item);
        return (
          <div
            key={item.id}
            {...props}
            data-testid={`item-${item.id}`}
            data-label={item.label}
          >
            <span data-testid={`handle-${item.id}`} {...state.handleProps}>
              grip
            </span>
            {item.label}
          </div>
        );
      })}
      <div data-testid="live-region" role="status" aria-live="assertive">
        {liveRegionText}
      </div>
    </div>
  );
}

describe("useSortable", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  it("renders all items", () => {
    render(<TestSortable />);
    expect(screen.getByTestId("item-a")).toBeInTheDocument();
    expect(screen.getByTestId("item-b")).toBeInTheDocument();
    expect(screen.getByTestId("item-c")).toBeInTheDocument();
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
    expect(screen.getByText("Gamma")).toBeInTheDocument();
  });

  it("containerProps has role=listbox", () => {
    render(<TestSortable />);
    const container = screen.getByTestId("container");
    expect(container).toHaveAttribute("role", "listbox");
  });

  it("items have aria-roledescription='sortable item'", () => {
    render(<TestSortable />);
    const item = screen.getByTestId("item-a");
    expect(item).toHaveAttribute("aria-roledescription", "sortable item");
  });

  it("items have role=option", () => {
    render(<TestSortable />);
    const item = screen.getByTestId("item-b");
    expect(item).toHaveAttribute("role", "option");
  });

  it("Space key picks up item — announces position and sets keyboard active", () => {
    render(<TestSortable />);
    const item = screen.getByTestId("item-a");
    act(() => {
      item.focus();
      fireEvent.keyDown(item, { key: " " });
    });
    const liveRegion = screen.getByTestId("live-region");
    expect(liveRegion.textContent).toMatch(/Picked up/i);
    expect(liveRegion.textContent).toMatch(/position 1/i);
  });

  it("ArrowDown moves item down — onReorder called with swapped items", () => {
    const onReorder = vi.fn();
    render(<TestSortable onReorder={onReorder} />);
    const item = screen.getByTestId("item-a");
    act(() => {
      item.focus();
      fireEvent.keyDown(item, { key: " " });
      fireEvent.keyDown(item, { key: "ArrowDown" });
    });
    expect(onReorder).toHaveBeenCalledTimes(1);
    const result = onReorder.mock.calls[0]?.[0] as TestItem[];
    expect(result[0]?.id).toBe("b");
    expect(result[1]?.id).toBe("a");
    expect(result[2]?.id).toBe("c");
  });

  it("ArrowUp moves item up", () => {
    const onReorder = vi.fn();
    render(<TestSortable onReorder={onReorder} />);
    const itemC = screen.getByTestId("item-c");
    act(() => {
      itemC.focus();
      fireEvent.keyDown(itemC, { key: " " });
      fireEvent.keyDown(itemC, { key: "ArrowUp" });
    });
    expect(onReorder).toHaveBeenCalledTimes(1);
    const result = onReorder.mock.calls[0]?.[0] as TestItem[];
    expect(result[1]?.id).toBe("c");
    expect(result[2]?.id).toBe("b");
  });

  it("Enter key drops item and announces", () => {
    const onReorder = vi.fn();
    render(<TestSortable onReorder={onReorder} />);
    const item = screen.getByTestId("item-b");
    act(() => {
      item.focus();
      fireEvent.keyDown(item, { key: " " });
      fireEvent.keyDown(item, { key: "ArrowDown" });
      fireEvent.keyDown(item, { key: "Enter" });
    });
    const liveRegion = screen.getByTestId("live-region");
    expect(liveRegion.textContent).toMatch(/Dropped/i);
  });

  it("Space key drops item after picking up", () => {
    render(<TestSortable />);
    const item = screen.getByTestId("item-a");
    act(() => {
      item.focus();
      fireEvent.keyDown(item, { key: " " });
    });
    const liveRegionAfterPickup = screen.getByTestId("live-region");
    expect(liveRegionAfterPickup.textContent).toMatch(/Picked up/i);
    act(() => {
      fireEvent.keyDown(item, { key: " " });
    });
    const liveRegionAfterDrop = screen.getByTestId("live-region");
    expect(liveRegionAfterDrop.textContent).toMatch(/Dropped/i);
  });

  it("Escape cancels reorder and restores original order", () => {
    const onReorder = vi.fn();
    render(<TestSortable onReorder={onReorder} />);
    const item = screen.getByTestId("item-a");
    act(() => {
      item.focus();
      fireEvent.keyDown(item, { key: " " });
      fireEvent.keyDown(item, { key: "ArrowDown" });
    });
    expect(onReorder).toHaveBeenCalledTimes(1);

    act(() => {
      const currentItem = screen.getByTestId("item-a");
      fireEvent.keyDown(currentItem, { key: "Escape" });
    });

    const callCount = onReorder.mock.calls.length;
    const lastCall = onReorder.mock.calls[callCount - 1]?.[0] as TestItem[];
    expect(lastCall[0]?.id).toBe("a");
    expect(lastCall[1]?.id).toBe("b");
    expect(lastCall[2]?.id).toBe("c");

    const liveRegion = screen.getByTestId("live-region");
    expect(liveRegion.textContent).toMatch(/cancel/i);
  });

  it("disabled=true prevents keyboard interaction", () => {
    const onReorder = vi.fn();
    render(<TestSortable onReorder={onReorder} disabled />);
    const item = screen.getByTestId("item-a");
    act(() => {
      item.focus();
      fireEvent.keyDown(item, { key: " " });
      fireEvent.keyDown(item, { key: "ArrowDown" });
    });
    expect(onReorder).not.toHaveBeenCalled();
  });

  it("disabled=true prevents pointer drag (onReorder not called)", () => {
    const onReorder = vi.fn();
    render(<TestSortable onReorder={onReorder} disabled />);
    const item = screen.getByTestId("item-a");
    act(() => {
      fireEvent.pointerDown(item, { clientX: 0, clientY: 0 });
      fireEvent.pointerUp(item, { clientX: 0, clientY: 100 });
    });
    expect(onReorder).not.toHaveBeenCalled();
  });

  it("ArrowLeft/Right work for horizontal orientation", () => {
    const onReorder = vi.fn();
    render(<TestSortable onReorder={onReorder} orientation="horizontal" />);
    const item = screen.getByTestId("item-a");
    act(() => {
      item.focus();
      fireEvent.keyDown(item, { key: " " });
      fireEvent.keyDown(item, { key: "ArrowRight" });
    });
    expect(onReorder).toHaveBeenCalledTimes(1);
    const result = onReorder.mock.calls[0]?.[0] as TestItem[];
    expect(result[0]?.id).toBe("b");
    expect(result[1]?.id).toBe("a");
  });

  it("ArrowDown does not reorder beyond last item", () => {
    const onReorder = vi.fn();
    render(<TestSortable onReorder={onReorder} />);
    const item = screen.getByTestId("item-c");
    act(() => {
      item.focus();
      fireEvent.keyDown(item, { key: " " });
      fireEvent.keyDown(item, { key: "ArrowDown" });
    });
    expect(onReorder).not.toHaveBeenCalled();
  });

  it("items have tabIndex=0 for keyboard focus", () => {
    render(<TestSortable />);
    const item = screen.getByTestId("item-a");
    expect(item).toHaveAttribute("tabindex", "0");
  });

  it("container has aria-orientation attribute", () => {
    render(<TestSortable orientation="horizontal" />);
    const container = screen.getByTestId("container");
    expect(container).toHaveAttribute("aria-orientation", "horizontal");
  });
});
