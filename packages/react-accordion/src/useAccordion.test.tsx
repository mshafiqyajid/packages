import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useAccordion } from "./useAccordion";

const ITEMS = ["one", "two", "three"];

describe("useAccordion", () => {
  it("starts with all items closed by default", () => {
    const { result } = renderHook(() =>
      useAccordion({ items: ITEMS }),
    );
    expect(result.current.openItems).toHaveLength(0);
    ITEMS.forEach((id) => {
      expect(result.current.getItemProps(id).isOpen).toBe(false);
    });
  });

  it("respects defaultOpen (single string)", () => {
    const { result } = renderHook(() =>
      useAccordion({ items: ITEMS, defaultOpen: "two" }),
    );
    expect(result.current.openItems).toEqual(["two"]);
    expect(result.current.getItemProps("two").isOpen).toBe(true);
    expect(result.current.getItemProps("one").isOpen).toBe(false);
  });

  it("respects defaultOpen array in multiple mode", () => {
    const { result } = renderHook(() =>
      useAccordion({ items: ITEMS, type: "multiple", defaultOpen: ["one", "three"] }),
    );
    expect(result.current.openItems).toEqual(["one", "three"]);
    expect(result.current.getItemProps("one").isOpen).toBe(true);
    expect(result.current.getItemProps("two").isOpen).toBe(false);
    expect(result.current.getItemProps("three").isOpen).toBe(true);
  });

  it("toggle opens and closes an item", () => {
    const { result } = renderHook(() =>
      useAccordion({ items: ITEMS }),
    );
    act(() => result.current.toggle("one"));
    expect(result.current.getItemProps("one").isOpen).toBe(true);
    act(() => result.current.toggle("one"));
    expect(result.current.getItemProps("one").isOpen).toBe(false);
  });

  it("single mode closes the previous item when opening a new one", () => {
    const { result } = renderHook(() =>
      useAccordion({ items: ITEMS, type: "single", defaultOpen: "one" }),
    );
    expect(result.current.getItemProps("one").isOpen).toBe(true);
    act(() => result.current.toggle("two"));
    expect(result.current.getItemProps("one").isOpen).toBe(false);
    expect(result.current.getItemProps("two").isOpen).toBe(true);
  });

  it("multiple mode keeps other items open", () => {
    const { result } = renderHook(() =>
      useAccordion({ items: ITEMS, type: "multiple", defaultOpen: ["one"] }),
    );
    act(() => result.current.toggle("two"));
    expect(result.current.getItemProps("one").isOpen).toBe(true);
    expect(result.current.getItemProps("two").isOpen).toBe(true);
  });

  it("open() is idempotent — calling twice stays open", () => {
    const { result } = renderHook(() =>
      useAccordion({ items: ITEMS }),
    );
    act(() => result.current.open("one"));
    act(() => result.current.open("one"));
    expect(result.current.openItems.filter((i) => i === "one")).toHaveLength(1);
  });

  it("close() removes the item from openItems", () => {
    const { result } = renderHook(() =>
      useAccordion({ items: ITEMS, defaultOpen: "two" }),
    );
    act(() => result.current.close("two"));
    expect(result.current.getItemProps("two").isOpen).toBe(false);
  });

  it("triggerProps exposes correct aria-expanded", () => {
    const { result } = renderHook(() =>
      useAccordion({ items: ITEMS }),
    );
    expect(result.current.getItemProps("one").triggerProps["aria-expanded"]).toBe(false);
    act(() => result.current.toggle("one"));
    expect(result.current.getItemProps("one").triggerProps["aria-expanded"]).toBe(true);
  });

  it("triggerProps aria-controls matches panelProps id", () => {
    const { result } = renderHook(() =>
      useAccordion({ items: ITEMS }),
    );
    const { triggerProps, panelProps } = result.current.getItemProps("one");
    expect(triggerProps["aria-controls"]).toBe(panelProps.id);
  });

  it("panelProps aria-labelledby matches triggerProps id", () => {
    const { result } = renderHook(() =>
      useAccordion({ items: ITEMS }),
    );
    const { triggerProps, panelProps } = result.current.getItemProps("two");
    expect(panelProps["aria-labelledby"]).toBe(triggerProps.id);
  });

  it("panelProps hidden is true when closed and false when open", () => {
    const { result } = renderHook(() =>
      useAccordion({ items: ITEMS }),
    );
    expect(result.current.getItemProps("one").panelProps.hidden).toBe(true);
    act(() => result.current.toggle("one"));
    expect(result.current.getItemProps("one").panelProps.hidden).toBe(false);
  });

  it("panelProps role is region", () => {
    const { result } = renderHook(() =>
      useAccordion({ items: ITEMS }),
    );
    expect(result.current.getItemProps("one").panelProps.role).toBe("region");
  });

  it("triggerProps onClick triggers toggle", () => {
    const { result } = renderHook(() =>
      useAccordion({ items: ITEMS }),
    );
    act(() => result.current.getItemProps("one").triggerProps.onClick());
    expect(result.current.getItemProps("one").isOpen).toBe(true);
    act(() => result.current.getItemProps("one").triggerProps.onClick());
    expect(result.current.getItemProps("one").isOpen).toBe(false);
  });

  it("defaultOpen array in single mode only honours first entry", () => {
    const { result } = renderHook(() =>
      useAccordion({ items: ITEMS, type: "single", defaultOpen: ["one", "two"] }),
    );
    expect(result.current.openItems).toHaveLength(1);
    expect(result.current.openItems[0]).toBe("one");
  });
});
