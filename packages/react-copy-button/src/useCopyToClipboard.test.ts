import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { useCopyToClipboard } from "./useCopyToClipboard";

describe("useCopyToClipboard", () => {
  let writeText: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    Object.defineProperty(window, "isSecureContext", {
      value: true,
      configurable: true,
    });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test("copies a string and toggles copied state", async () => {
    const { result } = renderHook(() => useCopyToClipboard({ resetAfter: 1000 }));

    expect(result.current.copied).toBe(false);

    await act(async () => {
      await result.current.copy("hello");
    });

    expect(writeText).toHaveBeenCalledWith("hello");
    expect(result.current.copied).toBe(true);
    expect(result.current.error).toBeNull();
  });

  test("resets copied state after the configured timeout", async () => {
    const { result } = renderHook(() => useCopyToClipboard({ resetAfter: 1000 }));

    await act(async () => {
      await result.current.copy("hello");
    });
    expect(result.current.copied).toBe(true);

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.copied).toBe(false);
  });

  test("resolves a function source", async () => {
    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy(() => Promise.resolve("async-text"));
    });

    expect(writeText).toHaveBeenCalledWith("async-text");
    expect(result.current.copied).toBe(true);
  });

  test("captures errors from the clipboard API", async () => {
    const failure = new Error("denied");
    writeText.mockRejectedValueOnce(failure);
    const onError = vi.fn();

    const { result } = renderHook(() => useCopyToClipboard({ onError }));

    let returned: boolean | undefined;
    await act(async () => {
      returned = await result.current.copy("nope");
    });

    expect(returned).toBe(false);
    expect(result.current.copied).toBe(false);
    expect(result.current.error).toBe(failure);
    expect(onError).toHaveBeenCalledWith(failure);
  });

  test("calls onCopy with the resolved text", async () => {
    const onCopy = vi.fn();
    const { result } = renderHook(() => useCopyToClipboard({ onCopy }));

    await act(async () => {
      await result.current.copy("payload");
    });

    expect(onCopy).toHaveBeenCalledWith("payload");
  });

  test("reset() clears copied and error state", async () => {
    const { result } = renderHook(() => useCopyToClipboard({ resetAfter: 5000 }));

    await act(async () => {
      await result.current.copy("hello");
    });
    expect(result.current.copied).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.copied).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
