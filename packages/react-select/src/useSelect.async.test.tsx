import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useSelect } from "./useSelect";
import type { SelectItem } from "./useSelect";

const POOL: SelectItem[] = [
  { value: "alice", label: "Alice" },
  { value: "bob", label: "Bob" },
  { value: "carol", label: "Carol" },
];

function makeLoader(delay = 0) {
  return vi.fn((query: string) =>
    new Promise<SelectItem[]>((resolve) => {
      setTimeout(() => {
        const q = query.toLowerCase();
        resolve(q ? POOL.filter((i) => i.label.toLowerCase().includes(q)) : POOL);
      }, delay);
    }),
  );
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useSelect async loadOptions", () => {
  it("isLoading is false before open", () => {
    const load = makeLoader();
    const { result } = renderHook(() =>
      useSelect({ items: [], value: "", onChange: () => {}, loadOptions: load, debounceMs: 100 }),
    );
    expect(result.current.isLoading).toBe(false);
  });

  it("isLoading becomes true after open and debounce fires", async () => {
    const load = makeLoader(200);
    const { result } = renderHook(() =>
      useSelect({ items: [], value: "", onChange: () => {}, loadOptions: load, debounceMs: 100 }),
    );
    act(() => result.current.triggerProps.onClick());
    act(() => { vi.advanceTimersByTime(100); });
    expect(result.current.isLoading).toBe(true);
  });

  it("filteredItems populated after promise resolves", async () => {
    const load = makeLoader(200);
    const { result } = renderHook(() =>
      useSelect({ items: [], value: "", onChange: () => {}, loadOptions: load, debounceMs: 0 }),
    );
    act(() => result.current.triggerProps.onClick());
    act(() => { vi.advanceTimersByTime(0); });
    await act(async () => { vi.advanceTimersByTime(200); });
    expect(result.current.filteredItems).toHaveLength(3);
    expect(result.current.isLoading).toBe(false);
  });

  it("loadError is set when promise rejects", async () => {
    const load = vi.fn(() => Promise.reject(new Error("network error")));
    const { result } = renderHook(() =>
      useSelect({ items: [], value: "", onChange: () => {}, loadOptions: load, debounceMs: 0 }),
    );
    act(() => result.current.triggerProps.onClick());
    act(() => { vi.advanceTimersByTime(0); });
    await act(async () => { await Promise.resolve(); });
    expect(result.current.loadError).toBeInstanceOf(Error);
    expect(result.current.loadError?.message).toBe("network error");
    expect(result.current.isLoading).toBe(false);
  });

  it("debounces: loadOptions not called immediately on search change", () => {
    const load = makeLoader(0);
    const { result } = renderHook(() =>
      useSelect({ items: [], value: "", onChange: () => {}, loadOptions: load, debounceMs: 300 }),
    );
    act(() => result.current.triggerProps.onClick());
    act(() => result.current.setSearchValue("a"));
    act(() => result.current.setSearchValue("al"));
    act(() => { vi.advanceTimersByTime(100); });
    expect(load).toHaveBeenCalledTimes(0);
    act(() => { vi.advanceTimersByTime(300); });
    expect(load).toHaveBeenCalledTimes(1);
    expect(load).toHaveBeenCalledWith("al");
  });

  it("items prop is ignored when loadOptions is set", async () => {
    const staticItems: SelectItem[] = [{ value: "x", label: "X" }];
    const load = makeLoader(0);
    const { result } = renderHook(() =>
      useSelect({ items: staticItems, value: "", onChange: () => {}, loadOptions: load, debounceMs: 0 }),
    );
    act(() => result.current.triggerProps.onClick());
    act(() => { vi.advanceTimersByTime(0); });
    await act(async () => { vi.advanceTimersByTime(0); });
    expect(result.current.filteredItems.map((i) => i.value)).not.toContain("x");
  });

  it("loadError resets to null on next successful load", async () => {
    let shouldFail = true;
    const load = vi.fn(() =>
      shouldFail
        ? Promise.reject(new Error("fail"))
        : Promise.resolve([{ value: "a", label: "A" }]),
    );
    const { result } = renderHook(() =>
      useSelect({ items: [], value: "", onChange: () => {}, loadOptions: load, debounceMs: 0 }),
    );
    act(() => result.current.triggerProps.onClick());
    act(() => { vi.advanceTimersByTime(0); });
    await act(async () => { await Promise.resolve(); });
    expect(result.current.loadError).not.toBeNull();

    shouldFail = false;
    act(() => result.current.setSearchValue("a"));
    act(() => { vi.advanceTimersByTime(0); });
    await act(async () => { await Promise.resolve(); });
    expect(result.current.loadError).toBeNull();
    expect(result.current.filteredItems).toHaveLength(1);
  });
});
