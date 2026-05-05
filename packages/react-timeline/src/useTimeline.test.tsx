import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useTimeline } from "./useTimeline";
import type { TimelineItem } from "./useTimeline";

const mk = (id: string, extras: Partial<TimelineItem> = {}): TimelineItem => ({
  id,
  title: id.toUpperCase(),
  ...extras,
});

const items: TimelineItem[] = [mk("a"), mk("b"), mk("c")];

describe("useTimeline – core", () => {
  it("exposes visibleItems matching input order by default", () => {
    const { result } = renderHook(() => useTimeline({ items }));
    expect(result.current.visibleItems.map((i) => i.id)).toEqual(["a", "b", "c"]);
  });

  it("reverses visible items when reverse=true", () => {
    const { result } = renderHook(() => useTimeline({ items, reverse: true }));
    expect(result.current.visibleItems.map((i) => i.id)).toEqual(["c", "b", "a"]);
  });

  it("returns single group when groupBy is not set", () => {
    const { result } = renderHook(() => useTimeline({ items }));
    expect(result.current.groups).toHaveLength(1);
    expect(result.current.groups[0]?.items.map((i) => i.id)).toEqual(["a", "b", "c"]);
  });

  it("data-first / data-last reflect position in visibleItems", () => {
    const { result } = renderHook(() => useTimeline({ items }));
    expect(result.current.getItemProps("a")["data-first"]).toBe(true);
    expect(result.current.getItemProps("c")["data-last"]).toBe(true);
    expect(result.current.getItemProps("b")["data-first"]).toBe(false);
    expect(result.current.getItemProps("b")["data-last"]).toBe(false);
  });

  it("data-status reflects item.status (or 'default')", () => {
    const list = [mk("a", { status: "completed" }), mk("b")];
    const { result } = renderHook(() => useTimeline({ items: list }));
    expect(result.current.getItemProps("a")["data-status"]).toBe("completed");
    expect(result.current.getItemProps("b")["data-status"]).toBe("default");
  });
});

describe("useTimeline – expansion", () => {
  it("expand/collapse/toggle update expandedIds", () => {
    const list = [mk("a", { details: "x" }), mk("b", { details: "y" })];
    const { result } = renderHook(() => useTimeline({ items: list }));
    expect(result.current.expandedIds).toEqual([]);
    act(() => result.current.expand("a"));
    expect(result.current.expandedIds).toEqual(["a"]);
    act(() => result.current.toggle("b"));
    expect(result.current.expandedIds).toEqual(["a", "b"]);
    act(() => result.current.collapse("a"));
    expect(result.current.expandedIds).toEqual(["b"]);
  });

  it("expansionMode='single' keeps only one item open", () => {
    const list = [mk("a", { details: "x" }), mk("b", { details: "y" })];
    const { result } = renderHook(() =>
      useTimeline({ items: list, expansionMode: "single" }),
    );
    act(() => result.current.expand("a"));
    act(() => result.current.expand("b"));
    expect(result.current.expandedIds).toEqual(["b"]);
  });

  it("controlled mode calls onExpandedChange and ignores internal state", () => {
    const list = [mk("a", { details: "x" })];
    const onChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ ids }: { ids: string[] }) =>
        useTimeline({ items: list, expanded: ids, onExpandedChange: onChange }),
      { initialProps: { ids: [] as string[] } },
    );
    act(() => result.current.expand("a"));
    expect(onChange).toHaveBeenCalledWith(["a"]);
    expect(result.current.expandedIds).toEqual([]); // not controlled-reflected yet
    rerender({ ids: ["a"] });
    expect(result.current.expandedIds).toEqual(["a"]);
  });
});

describe("useTimeline – filter", () => {
  it("string filter matches title/description", () => {
    const list = [
      mk("a", { title: "Order placed", description: "via web" }),
      mk("b", { title: "Shipped", description: "express" }),
      mk("c", { title: "Delivered" }),
    ];
    const { result } = renderHook(() => useTimeline({ items: list, filter: "ship" }));
    expect(result.current.visibleItems.map((i) => i.id)).toEqual(["b"]);
  });

  it("predicate filter wins over string", () => {
    const list = [
      mk("a", { status: "completed" }),
      mk("b", { status: "active" }),
    ];
    const { result } = renderHook(() =>
      useTimeline({ items: list, filter: (it) => it.status === "active" }),
    );
    expect(result.current.visibleItems.map((i) => i.id)).toEqual(["b"]);
  });
});

describe("useTimeline – grouping", () => {
  it("groups by item.groupId when groupBy='groupId'", () => {
    const list = [
      mk("a", { groupId: "today" }),
      mk("b", { groupId: "today" }),
      mk("c", { groupId: "yesterday" }),
    ];
    const { result } = renderHook(() =>
      useTimeline({ items: list, groupBy: "groupId" }),
    );
    expect(result.current.groups.map((g) => g.id)).toEqual(["today", "yesterday"]);
    expect(result.current.groups[0]?.items.map((i) => i.id)).toEqual(["a", "b"]);
  });

  it("uses groupLabels for the rendered label", () => {
    const list = [mk("a", { groupId: "today" })];
    const { result } = renderHook(() =>
      useTimeline({
        items: list,
        groupBy: "groupId",
        groupLabels: { today: "Today" },
      }),
    );
    expect(result.current.groups[0]?.label).toBe("Today");
  });
});

describe("useTimeline – pending", () => {
  it("data-pending lands on the matching item", () => {
    const { result } = renderHook(() =>
      useTimeline({ items, pendingId: "c" }),
    );
    expect(result.current.getItemProps("c")["data-pending"]).toBe(true);
    expect(result.current.getItemProps("a")["data-pending"]).toBeUndefined();
    expect(result.current.pendingItem?.id).toBe("c");
  });
});

describe("useTimeline – props getters", () => {
  it("getRootProps reflects orientation", () => {
    const { result } = renderHook(() =>
      useTimeline({ items, orientation: "horizontal" }),
    );
    const root = result.current.getRootProps();
    expect(root["aria-orientation"]).toBe("horizontal");
    expect(root.role).toBe("list");
  });

  it("getToggleProps is disabled for items without details", () => {
    const list = [mk("a", { details: "x" }), mk("b")];
    const { result } = renderHook(() => useTimeline({ items: list }));
    expect(result.current.getToggleProps("a").disabled).toBe(false);
    expect(result.current.getToggleProps("b").disabled).toBe(true);
  });

  it("aria-current='step' is set on activeId", () => {
    const { result } = renderHook(() =>
      useTimeline({ items, activeId: "b" }),
    );
    expect(result.current.getItemProps("b")["aria-current"]).toBe("step");
    expect(result.current.getItemProps("a")["aria-current"]).toBeUndefined();
  });
});
