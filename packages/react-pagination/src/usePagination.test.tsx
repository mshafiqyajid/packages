import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { usePagination } from "./usePagination";

describe("usePagination", () => {
  it("computes totalPages from total and pageSize", () => {
    const { result } = renderHook(() =>
      usePagination({ total: 100, pageSize: 10 }),
    );
    expect(result.current.totalPages).toBe(10);
  });

  it("hasPrev is false on page 1", () => {
    const { result } = renderHook(() =>
      usePagination({ total: 100, pageSize: 10, defaultPage: 1 }),
    );
    expect(result.current.hasPrev).toBe(false);
  });

  it("hasPrev is true on page 2", () => {
    const { result } = renderHook(() =>
      usePagination({ total: 100, pageSize: 10, defaultPage: 2 }),
    );
    expect(result.current.hasPrev).toBe(true);
  });

  it("hasNext is true when not on last page", () => {
    const { result } = renderHook(() =>
      usePagination({ total: 100, pageSize: 10, defaultPage: 5 }),
    );
    expect(result.current.hasNext).toBe(true);
  });

  it("hasNext is false on last page", () => {
    const { result } = renderHook(() =>
      usePagination({ total: 100, pageSize: 10, defaultPage: 10 }),
    );
    expect(result.current.hasNext).toBe(false);
  });

  it("prev() decrements page (min 1)", () => {
    const { result } = renderHook(() =>
      usePagination({ total: 100, pageSize: 10, defaultPage: 3 }),
    );
    act(() => result.current.prev());
    expect(result.current.page).toBe(2);
    act(() => result.current.prev());
    expect(result.current.page).toBe(1);
    act(() => result.current.prev());
    expect(result.current.page).toBe(1);
  });

  it("next() increments page (max totalPages)", () => {
    const { result } = renderHook(() =>
      usePagination({ total: 100, pageSize: 10, defaultPage: 9 }),
    );
    act(() => result.current.next());
    expect(result.current.page).toBe(10);
    act(() => result.current.next());
    expect(result.current.page).toBe(10);
  });

  it("onChange is called with the new page on setPage", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      usePagination({ total: 100, pageSize: 10, onChange }),
    );
    act(() => result.current.setPage(4));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it("controlled: page prop controls state", () => {
    const { result, rerender } = renderHook(
      ({ page }: { page: number }) =>
        usePagination({ total: 100, pageSize: 10, page }),
      { initialProps: { page: 3 } },
    );
    expect(result.current.page).toBe(3);
    rerender({ page: 7 });
    expect(result.current.page).toBe(7);
  });

  it("pages array includes ellipsis when needed (page=5, total=100, pageSize=10)", () => {
    const { result } = renderHook(() =>
      usePagination({ total: 100, pageSize: 10, defaultPage: 5 }),
    );
    expect(result.current.pages).toContain("...");
  });

  it("getPageProps for current page: aria-current='page' and data-active='true'", () => {
    const { result } = renderHook(() =>
      usePagination({ total: 100, pageSize: 10, defaultPage: 3 }),
    );
    const props = result.current.getPageProps(3);
    expect(props["aria-current"]).toBe("page");
    expect(props["data-active"]).toBe("true");
  });

  it("getPageProps for non-current page: aria-current=undefined", () => {
    const { result } = renderHook(() =>
      usePagination({ total: 100, pageSize: 10, defaultPage: 3 }),
    );
    const props = result.current.getPageProps(5);
    expect(props["aria-current"]).toBeUndefined();
    expect(props["data-active"]).toBeUndefined();
  });
});
