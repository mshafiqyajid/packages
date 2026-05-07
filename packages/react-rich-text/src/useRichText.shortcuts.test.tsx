import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useRichText } from "./useRichText";

beforeEach(() => {
  Object.defineProperty(document, "execCommand", {
    value: vi.fn().mockReturnValue(true),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(document, "queryCommandState", {
    value: vi.fn().mockReturnValue(false),
    writable: true,
    configurable: true,
  });
});

function makeKeyEvent(opts: {
  key: string;
  meta?: boolean;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
}) {
  return {
    key: opts.key,
    metaKey: !!opts.meta,
    ctrlKey: !!opts.ctrl,
    shiftKey: !!opts.shift,
    altKey: !!opts.alt,
    preventDefault: vi.fn(),
  } as unknown as React.KeyboardEvent<HTMLDivElement>;
}

describe("useRichText shortcuts", () => {
  it("invokes onShortcut + execCommand for Mod+B (Mac)", () => {
    Object.defineProperty(navigator, "platform", { value: "MacIntel", configurable: true });
    const onShortcut = vi.fn();
    const { result } = renderHook(() =>
      useRichText({ shortcuts: { bold: "Mod+B" }, onShortcut }),
    );
    const div = document.createElement("div");
    Object.defineProperty(result.current.editorProps.ref, "current", {
      value: div,
      writable: true,
      configurable: true,
    });
    const ev = makeKeyEvent({ key: "b", meta: true });
    act(() => {
      result.current.editorProps.onKeyDown(ev);
    });
    expect(ev.preventDefault).toHaveBeenCalled();
    expect(onShortcut).toHaveBeenCalledWith("bold", ev);
    expect(document.execCommand).toHaveBeenCalledWith("bold", false, undefined);
  });

  it("does not fire when shortcuts is false", () => {
    const onShortcut = vi.fn();
    const { result } = renderHook(() =>
      useRichText({ shortcuts: false, onShortcut }),
    );
    const ev = makeKeyEvent({ key: "b", meta: true });
    act(() => {
      result.current.editorProps.onKeyDown(ev);
    });
    expect(onShortcut).not.toHaveBeenCalled();
  });

  it("ignores when modifiers don't match", () => {
    Object.defineProperty(navigator, "platform", { value: "MacIntel", configurable: true });
    const onShortcut = vi.fn();
    const { result } = renderHook(() =>
      useRichText({ shortcuts: { bold: "Mod+B" }, onShortcut }),
    );
    const ev = makeKeyEvent({ key: "b" }); // no modifier
    act(() => {
      result.current.editorProps.onKeyDown(ev);
    });
    expect(onShortcut).not.toHaveBeenCalled();
  });
});
