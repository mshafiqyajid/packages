import { renderHook, act } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useToast, useToasts, useToastStore } from "./useToast";
import { toastStore } from "./store";

afterEach(() => {
  act(() => {
    toastStore.dismissAll();
  });
});

describe("useToast — toast()", () => {
  it("adds a neutral toast and returns an id", () => {
    const { result } = renderHook(() => useToast());
    let id: string;
    act(() => {
      id = result.current.toast("Hello world");
    });
    expect(id!).toMatch(/^toast-/);
    expect(toastStore.getSnapshot()).toHaveLength(1);
    expect(toastStore.getSnapshot()[0]?.message).toBe("Hello world");
    expect(toastStore.getSnapshot()[0]?.type).toBe("neutral");
  });

  it("respects custom type and duration options", () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.toast("Custom", { type: "success", duration: 2000 });
    });
    const t = toastStore.getSnapshot()[0];
    expect(t?.type).toBe("success");
    expect(t?.duration).toBe(2000);
  });
});

describe("useToast — convenience methods", () => {
  it("toast.success() creates a toast with type success", () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.toast.success("Saved!");
    });
    expect(toastStore.getSnapshot()[0]?.type).toBe("success");
    expect(toastStore.getSnapshot()[0]?.message).toBe("Saved!");
  });

  it("toast.error() creates a toast with type error", () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.toast.error("Failed!");
    });
    expect(toastStore.getSnapshot()[0]?.type).toBe("error");
  });

  it("toast.warning() creates a toast with type warning", () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.toast.warning("Watch out");
    });
    expect(toastStore.getSnapshot()[0]?.type).toBe("warning");
  });

  it("toast.info() creates a toast with type info", () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.toast.info("FYI");
    });
    expect(toastStore.getSnapshot()[0]?.type).toBe("info");
  });
});

describe("useToast — dismiss()", () => {
  it("removes a specific toast by id", () => {
    const { result } = renderHook(() => useToast());
    let id: string;
    act(() => {
      id = result.current.toast("Remove me");
      result.current.toast("Keep me");
    });
    act(() => {
      result.current.dismiss(id!);
    });
    const toasts = toastStore.getSnapshot();
    expect(toasts).toHaveLength(1);
    expect(toasts[0]?.message).toBe("Keep me");
  });

  it("is a no-op when the id does not exist", () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.toast("Stay");
    });
    act(() => {
      result.current.dismiss("nonexistent-id");
    });
    expect(toastStore.getSnapshot()).toHaveLength(1);
  });
});

describe("useToast — dismissAll()", () => {
  it("clears all toasts at once", () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.toast("A");
      result.current.toast("B");
      result.current.toast("C");
    });
    act(() => {
      result.current.dismissAll();
    });
    expect(toastStore.getSnapshot()).toHaveLength(0);
  });
});

describe("useToasts()", () => {
  it("reflects the current toast list reactively", () => {
    const { result: toastResult } = renderHook(() => useToast());
    const { result: toastsResult } = renderHook(() => useToasts());

    expect(toastsResult.current).toHaveLength(0);

    act(() => {
      toastResult.current.toast("Live update");
    });

    expect(toastsResult.current).toHaveLength(1);
    expect(toastsResult.current[0]?.message).toBe("Live update");
  });

  it("updates when a toast is dismissed", () => {
    const { result: toastResult } = renderHook(() => useToast());
    const { result: toastsResult } = renderHook(() => useToasts());

    let id: string;
    act(() => {
      id = toastResult.current.toast("Gone soon");
    });
    expect(toastsResult.current).toHaveLength(1);

    act(() => {
      toastResult.current.dismiss(id!);
    });
    expect(toastsResult.current).toHaveLength(0);
  });
});

describe("useToastStore()", () => {
  it("exposes toasts array and store reference", () => {
    const { result } = renderHook(() => useToastStore());
    expect(Array.isArray(result.current.toasts)).toBe(true);
    expect(result.current.store).toBeDefined();
  });
});

describe("toastStore — multiple toasts accumulate", () => {
  it("stacks multiple toasts in order", () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.toast("First");
      result.current.toast("Second");
      result.current.toast("Third");
    });
    const messages = toastStore.getSnapshot().map((t) => t.message);
    expect(messages).toEqual(["First", "Second", "Third"]);
  });
});

describe("toast.loading + toast.promise", () => {
  it("toast.loading creates a loading toast with infinite duration", () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.toast.loading("Saving…");
    });
    const t = toastStore.getSnapshot()[0];
    expect(t?.type).toBe("loading");
    expect(t?.loading).toBe(true);
    expect(t?.duration).toBe(Infinity);
  });

  it("toast.promise transitions to success on resolve", async () => {
    const { result } = renderHook(() => useToast());
    let resolve!: (v: { id: string }) => void;
    const p = new Promise<{ id: string }>((r) => {
      resolve = r;
    });

    let id!: string;
    act(() => {
      id = result.current.toast.promise(p, {
        loading: "Saving…",
        success: (v) => `Saved ${v.id}`,
        error: "Failed",
      });
    });
    expect(toastStore.getSnapshot()[0]?.type).toBe("loading");

    await act(async () => {
      resolve({ id: "42" });
      await p;
    });

    const after = toastStore.getSnapshot().find((t) => t.id === id);
    expect(after?.type).toBe("success");
    expect(after?.message).toBe("Saved 42");
  });

  it("toast.promise transitions to error on reject", async () => {
    const { result } = renderHook(() => useToast());
    let reject!: (err: Error) => void;
    const p = new Promise<void>((_, r) => {
      reject = r;
    });

    let id!: string;
    act(() => {
      id = result.current.toast.promise(p, {
        loading: "Saving…",
        success: "ok",
        error: (e) => (e as Error).message,
      });
    });

    await act(async () => {
      reject(new Error("boom"));
      try {
        await p;
      } catch {
        /* swallowed by toast.promise */
      }
    });

    const after = toastStore.getSnapshot().find((t) => t.id === id);
    expect(after?.type).toBe("error");
    expect(after?.message).toBe("boom");
  });
});
