import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useTimeline } from "./useTimeline";

const ids = ["a", "b", "c"];

describe("useTimeline", () => {
  it("returns getItemProps for each id", () => {
    const { result } = renderHook(() =>
      useTimeline({ items: ids, orientation: "vertical" }),
    );
    const props = result.current.getItemProps("b");
    expect(props["data-timeline-item"]).toBe("b");
  });

  it("sets data-orientation on every item", () => {
    const { result } = renderHook(() =>
      useTimeline({ items: ids, orientation: "horizontal" }),
    );
    ids.forEach((id) => {
      expect(result.current.getItemProps(id)["data-orientation"]).toBe(
        "horizontal",
      );
    });
  });

  it("marks the first item with data-first=true", () => {
    const { result } = renderHook(() => useTimeline({ items: ids }));
    expect(result.current.getItemProps("a")["data-first"]).toBe(true);
    expect(result.current.getItemProps("b")["data-first"]).toBe(false);
  });

  it("marks the last item with data-last=true", () => {
    const { result } = renderHook(() => useTimeline({ items: ids }));
    expect(result.current.getItemProps("c")["data-last"]).toBe(true);
    expect(result.current.getItemProps("b")["data-last"]).toBe(false);
  });

  it("provides correct data-index for each item", () => {
    const { result } = renderHook(() => useTimeline({ items: ids }));
    expect(result.current.getItemProps("a")["data-index"]).toBe(0);
    expect(result.current.getItemProps("b")["data-index"]).toBe(1);
    expect(result.current.getItemProps("c")["data-index"]).toBe(2);
  });

  it("defaults orientation to vertical", () => {
    const { result } = renderHook(() => useTimeline({ items: ids }));
    expect(result.current.orientation).toBe("vertical");
  });

  it("exposes items on the result", () => {
    const { result } = renderHook(() => useTimeline({ items: ids }));
    expect(result.current.items).toEqual(ids);
  });

  it("returns data-index -1 for an unknown id", () => {
    const { result } = renderHook(() => useTimeline({ items: ids }));
    expect(result.current.getItemProps("unknown")["data-index"]).toBe(-1);
  });
});
