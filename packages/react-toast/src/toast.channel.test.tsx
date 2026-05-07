import { act } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { toast } from "./useToast";
import { toastStore, getToastStore } from "./store";

afterEach(() => {
  act(() => {
    toastStore.dismissAll();
    getToastStore("notifications").dismissAll();
    getToastStore("alerts").dismissAll();
  });
});

describe("toast.channel()", () => {
  it("dispatches to the named channel, not the default channel", () => {
    act(() => {
      toast.channel("notifications").success("New message");
    });

    const defaultToasts = toastStore.getSnapshot();
    const notifToasts = getToastStore("notifications").getSnapshot();

    expect(defaultToasts).toHaveLength(0);
    expect(notifToasts).toHaveLength(1);
    expect(notifToasts[0]?.message).toBe("New message");
    expect(notifToasts[0]?.type).toBe("success");
    expect(notifToasts[0]?.channel).toBe("notifications");
  });

  it("default channel (no channel call) remains isolated", () => {
    act(() => {
      toast("Default toast");
      toast.channel("alerts").error("Alert toast");
    });

    const defaultToasts = toastStore.getSnapshot();
    const alertToasts = getToastStore("alerts").getSnapshot();

    expect(defaultToasts).toHaveLength(1);
    expect(defaultToasts[0]?.message).toBe("Default toast");
    expect(alertToasts).toHaveLength(1);
    expect(alertToasts[0]?.message).toBe("Alert toast");
  });

  it("supports all convenience methods on a channel", () => {
    const ch = toast.channel("notifications");
    act(() => {
      ch.error("Error in channel");
      ch.warning("Warning in channel");
      ch.info("Info in channel");
    });

    const toasts = getToastStore("notifications").getSnapshot();
    expect(toasts).toHaveLength(3);
    const types = toasts.map((t) => t.type);
    expect(types).toContain("error");
    expect(types).toContain("warning");
    expect(types).toContain("info");
  });

  it("toast.channel().dismiss() removes from the named channel only", () => {
    let id: string;
    act(() => {
      id = toast.channel("notifications").info("Will be removed");
      toast("Default stays");
    });

    act(() => {
      toast.channel("notifications").dismiss(id!);
    });

    expect(getToastStore("notifications").getSnapshot()).toHaveLength(0);
    expect(toastStore.getSnapshot()).toHaveLength(1);
  });

  it("toast.channel().update() updates within the named channel", () => {
    let id: string;
    act(() => {
      id = toast.channel("notifications").loading("Uploading…");
    });

    act(() => {
      (toast.channel("notifications") as ReturnType<typeof toast.channel> & { update: typeof toast.update }).update(id!, { message: "Done!", type: "success" });
    });

    const t = getToastStore("notifications").getSnapshot().find((x) => x.id === id!);
    expect(t?.message).toBe("Done!");
    expect(t?.type).toBe("success");
  });

  it("multiple channels are fully independent", () => {
    act(() => {
      toast.channel("a").success("In A");
      toast.channel("b").error("In B");
      toast("In default");
    });

    expect(getToastStore("a").getSnapshot()).toHaveLength(1);
    expect(getToastStore("b").getSnapshot()).toHaveLength(1);
    expect(toastStore.getSnapshot()).toHaveLength(1);
  });
});
