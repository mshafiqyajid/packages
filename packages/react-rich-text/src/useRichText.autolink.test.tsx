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
    data: opts.data ?? null,
    preventDefault: vi.fn(),
  };
}

describe("useRichText autoLink", () => {
  it("wraps a typed URL in <a> after a space when autoLink is true", async () => {
    const { result } = renderHook(() => useRichText({ autoLink: true }));

    // Build an editor div with the URL + trailing space, place caret at end.
    const div = document.createElement("div");
    document.body.appendChild(div);
    const text = document.createTextNode("see https://example.com ");
    div.appendChild(text);

    Object.defineProperty(result.current.editorProps.ref, "current", {
      value: div,
      writable: true,
      configurable: true,
    });

    const range = document.createRange();
    range.setStart(text, text.data.length);
    range.collapse(true);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);

    const ev = makeBeforeInput({ inputType: "insertText", data: " " });
    act(() => {
      result.current.editorProps.onBeforeInput(ev);
    });

    // queueMicrotask runs the wrap; flush.
    await Promise.resolve();
    await Promise.resolve();

    expect(div.querySelector("a")?.getAttribute("href")).toBe("https://example.com");

    document.body.removeChild(div);
  });

  it("does nothing when autoLink is disabled (default)", async () => {
    const { result } = renderHook(() => useRichText());

    const div = document.createElement("div");
    document.body.appendChild(div);
    const text = document.createTextNode("see https://example.com ");
    div.appendChild(text);

    Object.defineProperty(result.current.editorProps.ref, "current", {
      value: div,
      writable: true,
      configurable: true,
    });

    const range = document.createRange();
    range.setStart(text, text.data.length);
    range.collapse(true);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);

    const ev = makeBeforeInput({ inputType: "insertText", data: " " });
    act(() => {
      result.current.editorProps.onBeforeInput(ev);
    });
    await Promise.resolve();
    await Promise.resolve();
    expect(div.querySelector("a")).toBeNull();
    document.body.removeChild(div);
  });
});
