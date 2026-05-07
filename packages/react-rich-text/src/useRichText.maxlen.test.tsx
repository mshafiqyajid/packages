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

function makeBeforeInput(opts: { inputType: string; data?: string }) {
  return {
    inputType: opts.inputType,
    data: opts.data ?? "",
    preventDefault: vi.fn(),
  };
}

describe("useRichText maxChars / maxWords", () => {
  it("prevents insertText that would exceed maxChars and fires onMaxReached('chars')", () => {
    const onMaxReached = vi.fn();
    const { result } = renderHook(() =>
      useRichText({ defaultValue: "hello", maxChars: 5, onMaxReached }),
    );
    const div = document.createElement("div");
    div.innerHTML = "hello";
    Object.defineProperty(result.current.editorProps.ref, "current", {
      value: div,
      writable: true,
      configurable: true,
    });
    const ev = makeBeforeInput({ inputType: "insertText", data: "x" });
    act(() => {
      result.current.editorProps.onBeforeInput(ev);
    });
    expect(ev.preventDefault).toHaveBeenCalled();
    expect(onMaxReached).toHaveBeenCalledWith("chars");
  });

  it("allows deletes regardless of caps", () => {
    const onMaxReached = vi.fn();
    const { result } = renderHook(() =>
      useRichText({ defaultValue: "hello", maxChars: 1, onMaxReached }),
    );
    const div = document.createElement("div");
    div.innerHTML = "hello";
    Object.defineProperty(result.current.editorProps.ref, "current", {
      value: div,
      writable: true,
      configurable: true,
    });
    const ev = makeBeforeInput({ inputType: "deleteContentBackward" });
    act(() => {
      result.current.editorProps.onBeforeInput(ev);
    });
    expect(ev.preventDefault).not.toHaveBeenCalled();
    expect(onMaxReached).not.toHaveBeenCalled();
  });

  it("exposes chars / words counts on the hook", () => {
    const { result } = renderHook(() =>
      useRichText({ defaultValue: "<p>two words</p>" }),
    );
    expect(result.current.words).toBe(2);
    expect(result.current.chars).toBe("two words".length);
  });
});
