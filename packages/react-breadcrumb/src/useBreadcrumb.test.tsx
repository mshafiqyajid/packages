import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useBreadcrumb } from "./useBreadcrumb";
import type { BreadcrumbItem } from "./useBreadcrumb";

const items: BreadcrumbItem[] = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Electronics", href: "/products/electronics" },
  { label: "Smartphones" },
];

describe("useBreadcrumb", () => {
  it("navProps.role is 'navigation' and aria-label is 'Breadcrumb'", () => {
    const { result } = renderHook(() => useBreadcrumb({ items }));
    expect(result.current.navProps.role).toBe("navigation");
    expect(result.current.navProps["aria-label"]).toBe("Breadcrumb");
  });

  it("all items visible when no maxItems", () => {
    const { result } = renderHook(() => useBreadcrumb({ items }));
    expect(result.current.visibleItems).toHaveLength(items.length);
    expect(result.current.isCollapsed).toBe(false);
  });

  it("collapsed when items.length > maxItems (shows first + ellipsis + last = 3)", () => {
    const { result } = renderHook(() => useBreadcrumb({ items, maxItems: 2 }));
    expect(result.current.isCollapsed).toBe(true);
    expect(result.current.visibleItems).toHaveLength(3);
    expect(result.current.visibleItems[1]?.isEllipsis).toBe(true);
  });

  it("expand() sets isCollapsed to false and shows all items", () => {
    const { result } = renderHook(() => useBreadcrumb({ items, maxItems: 2 }));
    expect(result.current.isCollapsed).toBe(true);
    act(() => result.current.expand());
    expect(result.current.isCollapsed).toBe(false);
    expect(result.current.visibleItems).toHaveLength(items.length);
  });

  it("last item has isLast=true", () => {
    const { result } = renderHook(() => useBreadcrumb({ items }));
    const lastIndex = items.length - 1;
    const props = result.current.getItemProps(lastIndex);
    expect(props.isLast).toBe(true);
  });

  it("first N-1 items have isLast=false", () => {
    const { result } = renderHook(() => useBreadcrumb({ items }));
    for (let i = 0; i < items.length - 1; i++) {
      const props = result.current.getItemProps(i);
      expect(props.isLast).toBe(false);
    }
  });

  it("getItemProps for last item returns aria-current='page'", () => {
    const { result } = renderHook(() => useBreadcrumb({ items }));
    const lastIndex = items.length - 1;
    const props = result.current.getItemProps(lastIndex);
    expect(props["aria-current"]).toBe("page");
  });

  it("getItemProps for non-last item returns aria-current=undefined", () => {
    const { result } = renderHook(() => useBreadcrumb({ items }));
    const props = result.current.getItemProps(0);
    expect(props["aria-current"]).toBeUndefined();
  });
});
