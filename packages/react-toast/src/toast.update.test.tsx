import { act } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { toast } from "./useToast";
import { toastStore } from "./store";

afterEach(() => {
  act(() => {
    toastStore.dismissAll();
  });
});

describe("toast.update()", () => {
  it("updates the message of an existing toast", () => {
    let id: string;
    act(() => {
      id = toast("Uploading…", { type: "loading" });
    });

    act(() => {
      toast.update(id!, { message: "Upload complete!", type: "success" });
    });

    const t = toastStore.getSnapshot().find((x) => x.id === id!);
    expect(t?.message).toBe("Upload complete!");
    expect(t?.type).toBe("success");
    expect(t?.loading).toBe(false);
  });

  it("updates only the supplied fields, leaving others intact", () => {
    let id: string;
    act(() => {
      id = toast("Hello", { title: "Greeting", type: "info", duration: 8000 });
    });

    act(() => {
      toast.update(id!, { message: "Updated message" });
    });

    const t = toastStore.getSnapshot().find((x) => x.id === id!);
    expect(t?.message).toBe("Updated message");
    expect(t?.title).toBe("Greeting");
    expect(t?.type).toBe("info");
    expect(t?.duration).toBe(8000);
  });

  it("is a no-op when the id does not exist", () => {
    act(() => {
      toast("Stay");
    });
    act(() => {
      toast.update("nonexistent", { message: "Changed" });
    });
    const toasts = toastStore.getSnapshot();
    expect(toasts).toHaveLength(1);
    expect(toasts[0]?.message).toBe("Stay");
  });

  it("updates duration and resets createdAt", () => {
    let id: string;
    const before = Date.now();
    act(() => {
      id = toast("Hey", { duration: 10000 });
    });

    act(() => {
      toast.update(id!, { duration: 3000 });
    });

    const t = toastStore.getSnapshot().find((x) => x.id === id!);
    expect(t?.duration).toBe(3000);
    expect(t?.createdAt).toBeGreaterThanOrEqual(before);
  });

  it("updates an action", () => {
    let id: string;
    act(() => {
      id = toast("Has action", { action: { label: "Undo", onClick: () => {} } });
    });

    const newAction = { label: "Retry", onClick: () => {} };
    act(() => {
      toast.update(id!, { action: newAction });
    });

    const t = toastStore.getSnapshot().find((x) => x.id === id!);
    expect(t?.action?.label).toBe("Retry");
  });

  it("can set showProgress via update", () => {
    let id: string;
    act(() => {
      id = toast("Progress", { duration: 5000 });
    });
    act(() => {
      toast.update(id!, { showProgress: true });
    });
    const t = toastStore.getSnapshot().find((x) => x.id === id!);
    expect(t?.showProgress).toBe(true);
  });
});

describe("toast with duration: 0 (persistent)", () => {
  it("does not auto-dismiss when duration is 0", () => {
    let id: string;
    act(() => {
      id = toast("Persistent", { duration: 0 });
    });
    const t = toastStore.getSnapshot().find((x) => x.id === id!);
    expect(t).toBeDefined();
    expect(t?.duration).toBe(0);
  });

  it("does not auto-dismiss when duration is Infinity", () => {
    let id: string;
    act(() => {
      id = toast.loading("Loading forever");
    });
    const t = toastStore.getSnapshot().find((x) => x.id === id!);
    expect(t?.duration).toBe(Infinity);
  });
});
